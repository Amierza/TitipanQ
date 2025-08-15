package whatsapp

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Amierza/TitipanQ/backend/internal/openai"
	"github.com/Amierza/TitipanQ/backend/repository"
	_ "github.com/mattn/go-sqlite3"
	"google.golang.org/protobuf/proto"

	qrcodeTerminal "github.com/Baozisoftware/qrcode-terminal-go"
	_ "github.com/lib/pq"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	waEvents "go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
)

var (
	chatbotRepo       repository.IChatBotRepository
	chatbotNLPService openai.IChatbotNLPService
	Client            *whatsmeow.Client
)

// ========== INJECT ==========

func InjectRepository(repo repository.IChatBotRepository) {
	chatbotRepo = repo
}

func InjectNLPService(s openai.IChatbotNLPService) {
	chatbotNLPService = s
}

// ========== INIT CLIENT ==========

func InitClient() error {
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	// DSN untuk lib/pq
	connString := fmt.Sprintf(
		"host=%v user=%v password=%v dbname=%v port=%v sslmode=disable",
		dbHost, dbUser, dbPass, dbName, dbPort,
	)

	dbLog := waLog.Stdout("DB", "INFO", true)
	container, err := sqlstore.New(context.Background(), "postgres", connString, dbLog)
	if err != nil {
		return fmt.Errorf("failed to create DB container: %w", err)
	}

	device, err := container.GetFirstDevice(context.Background())
	if err != nil {
		return fmt.Errorf("failed to get device: %w", err)
	}

	Client = whatsmeow.NewClient(device, waLog.Stdout("Client", "INFO", true))
	Client.AddEventHandler(eventHandler)

	if Client.Store.ID == nil {
		qrChan, _ := Client.GetQRChannel(context.Background())
		err = Client.Connect()
		if err != nil {
			return fmt.Errorf("failed to connect: %w", err)
		}
		for evt := range qrChan {
			if evt.Event == "code" {
				fmt.Println("🔑 Scan QR code:", evt.Code)
				qrcodeTerminal.New().Get(evt.Code).Print()
			} else {
				fmt.Println("🔔 QR event:", evt.Event)
			}
		}
	} else {
		err = Client.Connect()
		if err != nil {
			return fmt.Errorf("failed to connect (logged-in): %w", err)
		}
	}

	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM)
		<-c
		Client.Disconnect()
	}()

	return nil
}

// ========== EVENT HANDLER ==========

func eventHandler(evt interface{}) {
	switch v := evt.(type) {
	case *waEvents.Message:
		msg := v.Message.GetConversation()
		if msg != "" {
			fmt.Println("📩 Pesan masuk:", msg)
			go handleIncomingMessage(v.Info.Sender.User, msg)
		}
	case *waEvents.Disconnected, *waEvents.LoggedOut:
		fmt.Println("🔌 WhatsApp disconnected/logged out, reconnecting...")
		go reconnectClient()
	}
}

func reconnectClient() {
	if Client != nil {
		Client.Disconnect()
	}
	err := Client.Connect()
	if err != nil {
		fmt.Println("⚠️ Gagal reconnect:", err)
	} else {
		fmt.Println("✅ Reconnect berhasil")
	}
}

// ========== HANDLER LOGIC ==========

func handleIncomingMessage(userPhone, message string) {
	user, err := chatbotRepo.FindByPhone(userPhone, nil)
	if err != nil || user == nil {
		fmt.Println("[ChatBot] Pengirim tidak terdaftar, abaikan pesan dari:", userPhone)
		return
	}

	if chatbotNLPService == nil {
		SendTextMessage(userPhone, "❌ Sistem belum siap.", "", "")
		return
	}

	intentResult, err := chatbotNLPService.GetIntent(message)
	if err != nil {
		fmt.Println("[ChatBot] Gagal proses NLP:", err)
		SendTextMessage(userPhone, "❌ Maaf, sistem mengalami kendala.", "", "")
		return
	}

	switch intentResult.Intent {
	case "total_all_package":
		handleTotalAllPackage(userPhone)

	case "list_package_today":
		handleListPackageToday(userPhone)

	case "list_package_all":
		handleListPackageAll(userPhone)

	case "check_package":
		if intentResult.TrackingCode == "" {
			SendTextMessage(userPhone, "❌ Mohon sertakan kode paket. Contoh: cek paket PACK123456", "", "")
			return
		}
		handlePackageCheck(userPhone, intentResult.TrackingCode)

	case "greeting", "thanks", "unknown":
		data := map[string]string{
			"intent": intentResult.Intent,
		}
		naturalMsg, err := chatbotNLPService.GenerateNaturalResponse(intentResult.Intent, data)
		if err != nil {
			switch intentResult.Intent {
			case "greeting":
				naturalMsg = "👋 Hai! Aku TitipanQ, asisten kamu untuk cek status paket. Kamu bisa ketik *cek paket <tracking_code>* atau *paket hari ini*."
			case "thanks":
				naturalMsg = "🙏 Sama-sama! Senang bisa bantu. Jangan sungkan kalau mau cek paket lagi ya!"
			default:
				naturalMsg = "🤔 Maaf, aku belum paham maksudmu. Kamu bisa coba ketik *cek paket PACKxxxxx* atau *paket saya hari ini*."
			}
		}
		SendTextMessage(userPhone, naturalMsg, "", "")

	default:
		SendTextMessage(userPhone, "🤔 Maaf, aku belum paham maksud kamu. Coba ketik *cek paket PACKxxxxx*.", "", "")
	}
}

func handleTotalAllPackage(userPhone string) {
	totalPackages, err := chatbotRepo.CountTotalAllPackagesByUserPhone(userPhone, nil)
	if err != nil {
		fmt.Println("[ChatBot] Gagal mengambil jumlah total paket untuk nomor:", userPhone)
		SendTextMessage(userPhone, "❌ Terjadi kesalahan saat memeriksa jumlah paket kamu.", "", "")
		return
	}

	data := map[string]string{
		"total": fmt.Sprintf("%d", totalPackages),
	}
	naturalMsg, err := chatbotNLPService.GenerateNaturalResponse("total_all_package", data)
	if err != nil {
		naturalMsg = fmt.Sprintf("📦 Kamu memiliki total *%d* paket yang tercatat dalam sistem.", totalPackages)
	}
	SendTextMessage(userPhone, naturalMsg, "", "")
}

func handleListPackageAll(userPhone string) {
	packages, err := chatbotRepo.FindAllPackagesByUserPhone(userPhone, nil)
	if err != nil || len(packages) == 0 {
		fmt.Println("[ChatBot] Tidak ada paket ditemukan")
		SendTextMessage(userPhone, "📦 Tidak ada paket yang ditemukan atas nomor ini.", "", "")
		return
	}

	list := ""
	for i, p := range packages {
		list += fmt.Sprintf("%d. %s - %s\n", i+1, p.TrackingCode, p.Description)
	}

	data := map[string]string{
		"count": fmt.Sprintf("%d", len(packages)),
		"list":  list,
	}
	naturalMsg, err := chatbotNLPService.GenerateNaturalResponse("list_package_all", data)
	if err != nil {
		naturalMsg = fmt.Sprintf("📦 Daftar semua paket kamu:\n%s\n\nKetik *cek paket <tracking_code>* untuk lihat detail.", list)
	}

	SendTextMessage(userPhone, naturalMsg, "", "")
}

func handleListPackageToday(userPhone string) {
	packages, err := chatbotRepo.FindTodayPackagesByUserPhone(userPhone, nil)
	if err != nil || len(packages) == 0 {
		SendTextMessage(userPhone, "📦 Tidak ada paket hari ini.", "", "")
		return
	}

	list := ""
	for i, p := range packages {
		list += fmt.Sprintf("%d. %s - %s\n", i+1, p.TrackingCode, p.Description)
	}

	data := map[string]string{
		"count": fmt.Sprintf("%d", len(packages)),
		"list":  list,
	}
	naturalMsg, err := chatbotNLPService.GenerateNaturalResponse("list_package_today", data)
	if err != nil {
		naturalMsg = fmt.Sprintf("📦 Berikut daftar paket kamu hari ini:\n%s\n\nKetik *cek paket <tracking_code>* untuk lihat detail.", list)
	}

	SendTextMessage(userPhone, naturalMsg, "", "")
}

func handlePackageCheck(userPhone, trackingCode string) {
	fmt.Println("[ChatBot] Mencari paket:", trackingCode, "dari", userPhone)

	if chatbotRepo == nil {
		fmt.Println("[ChatBot] Repository belum di-inject")
		SendTextMessage(userPhone, "❌ Sistem belum siap.", "", "")
		return
	}

	pkg, err := chatbotRepo.FindByTrackingCode(trackingCode, nil)
	if err != nil || pkg == nil {
		fmt.Println("[ChatBot] Paket tidak ditemukan")
		SendTextMessage(userPhone, "❌ Paket tidak ditemukan.", "", "")
		return
	}

	data := map[string]string{
		"tracking_code": pkg.TrackingCode,
		"description":   pkg.Description,
		"status":        string(pkg.Status),
		"received_at":   pkg.TimeStamp.CreatedAt.Format("02 Jan 2006"),
	}
	naturalMsg, err := chatbotNLPService.GenerateNaturalResponse("check_package", data)
	if err != nil {
		naturalMsg = fmt.Sprintf(
			"📦 Paket *%s* berstatus *%s*.\nDeskripsi: %s\nDiterima: %s",
			pkg.TrackingCode,
			pkg.Status,
			pkg.Description,
			pkg.TimeStamp.CreatedAt.Format("02 Jan 2006"),
		)
	}

	SendTextMessage(userPhone, naturalMsg, "", "")
}

// ========== SEND MESSAGE ==========

func SendTextMessage(jidStr, message, imagePath, mimeType string) error {
	if Client == nil {
		return fmt.Errorf("WhatsApp client not initialized")
	}

	jid := types.NewJID(jidStr, "s.whatsapp.net")
	var msg *waE2E.Message
	msg = &waE2E.Message{
		Conversation: &message,
	}

	// Cek apakah ada gambar yang dikirim
	if imagePath != "" {
		// Baca gambar sebagai byte array
		imageBytes, err := ioutil.ReadFile(imagePath)
		if err != nil {
			return fmt.Errorf("failed to read image file: %w", err)
		}

		// Upload ke WhatsApp
		uploadResp, err := Client.Upload(context.Background(), imageBytes, whatsmeow.MediaImage)
		if err != nil {
			return fmt.Errorf("failed to upload image: %w", err)
		}

		// Buat ImageMessage
		imageMsg := &waE2E.ImageMessage{
			Caption:       proto.String(message),
			Mimetype:      proto.String(mimeType),
			URL:           &uploadResp.URL,
			DirectPath:    &uploadResp.DirectPath,
			MediaKey:      uploadResp.MediaKey,
			FileEncSHA256: uploadResp.FileEncSHA256,
			FileSHA256:    uploadResp.FileSHA256,
			FileLength:    &uploadResp.FileLength,
		}

		msg = &waE2E.Message{
			ImageMessage: imageMsg,
		}
		fmt.Println("[WA] Kirim gambar ke", jid.String(), "dengan caption:", message)
	} else {
		// Kirim pesan teks biasa
		msg = &waE2E.Message{
			Conversation: proto.String(message),
		}
		fmt.Println("[WA] Kirim teks ke", jid.String(), ":", message)
	}

	fmt.Println("[WA] Kirim pesan ke", jid.String(), "dengan isi:", message)
	resp, err := Client.SendMessage(context.Background(), jid, msg)
	if err != nil {
		fmt.Println("[WA] Kirim gagal:", err)
		reconnectClient()
		time.Sleep(2 * time.Second)

		// Retry
		resp2, retryErr := Client.SendMessage(context.Background(), jid, msg)
		if retryErr != nil {
			fmt.Println("[WA] Retry gagal:", retryErr)
			return retryErr
		}
		fmt.Println("[WA] Retry sukses:", resp2)
		return nil
	}

	fmt.Println("[WA] Pesan terkirim:", resp)
	return nil
}
