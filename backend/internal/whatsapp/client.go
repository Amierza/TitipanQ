package whatsapp

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Amierza/TitipanQ/backend/internal/openai"
	"github.com/Amierza/TitipanQ/backend/repository"
	_ "github.com/mattn/go-sqlite3"

	qrcodeTerminal "github.com/Baozisoftware/qrcode-terminal-go"
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
	dbLog := waLog.Stdout("DB", "INFO", true)
	container, err := sqlstore.New(context.Background(), "sqlite3", "file:session.db?_foreign_keys=on", dbLog)
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
		SendTextMessage(userPhone, "❌ Sistem belum siap.")
		return
	}

	intentResult, err := chatbotNLPService.GetIntent(message)
	if err != nil {
		fmt.Println("[ChatBot] Gagal proses NLP:", err)
		SendTextMessage(userPhone, "❌ Maaf, sistem mengalami kendala.")
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
			SendTextMessage(userPhone, "❌ Mohon sertakan kode paket. Contoh: cek paket PACK123456")
			return
		}
		handlePackageCheck(userPhone, intentResult.TrackingCode)

	case "greeting":
		SendTextMessage(userPhone, "👋 Halo! Saya adalah asisten TitipanQ. Ketik *cek paket <id>* untuk mengetahui status paketmu.")

	case "thanks":
		SendTextMessage(userPhone, "🙏 Sama-sama! Senang bisa membantu. Jika kamu ingin cek status paket, ketik saja *cek paket <id>* ya.")

	default:
		SendTextMessage(userPhone, "🤔 Maaf, saya tidak mengerti maksud kamu. Coba ketik *cek paket <id>*.")
	}
}

func handleTotalAllPackage(userPhone string) {
	totalPackages, err := chatbotRepo.CountTotalAllPackagesByUserPhone(userPhone, nil)
	if err != nil {
		fmt.Println("[ChatBot] Gagal mengambil jumlah total paket untuk nomor:", userPhone)
		SendTextMessage(userPhone, "❌ Terjadi kesalahan saat memeriksa jumlah paket kamu.")
		return
	}

	msg := fmt.Sprintf("📦 Kamu memiliki total *%d* paket yang tercatat dalam sistem.", totalPackages)
	SendTextMessage(userPhone, msg)
}

func handleListPackageAll(userPhone string) {
	packages, err := chatbotRepo.FindAllPackagesByUserPhone(userPhone, nil)
	if err != nil || len(packages) == 0 {
		fmt.Println("[ChatBot] Tidak ada paket ditemukan")
		SendTextMessage(userPhone, "📦 Tidak ada paket yang ditemukan atas nomor ini.")
		return
	}

	msg := "📦 Daftar semua paket kamu:\n"
	for i, p := range packages {
		msg += fmt.Sprintf("%d. *%s* - %s\n", i+1, p.TrackingCode, p.Description)
	}
	msg += "\nKetik *cek paket <tracking_code>* untuk melihat detail."
	SendTextMessage(userPhone, msg)
}

func handleListPackageToday(userPhone string) {
	packages, err := chatbotRepo.FindTodayPackagesByUserPhone(userPhone, nil)
	if err != nil || len(packages) == 0 {
		SendTextMessage(userPhone, "📦 Tidak ada paket hari ini.")
		return
	}

	msg := "📦 Berikut paket kamu hari ini:\n"
	for i, p := range packages {
		msg += fmt.Sprintf("%d. %s - %s\n", i+1, p.TrackingCode, p.Description)
	}
	msg += "\nKetik *cek paket <tracking_code>* untuk melihat detail."
	SendTextMessage(userPhone, msg)
}

func handlePackageCheck(userPhone, trackingCode string) {
	fmt.Println("[ChatBot] Mencari paket:", trackingCode, "dari", userPhone)

	if chatbotRepo == nil {
		fmt.Println("[ChatBot] Repository belum di-inject")
		SendTextMessage(userPhone, "❌ Sistem belum siap.")
		return
	}

	pkg, err := chatbotRepo.FindByTrackingCode(trackingCode, nil)
	if err != nil || pkg == nil {
		fmt.Println("[ChatBot] Paket tidak ditemukan")
		SendTextMessage(userPhone, "❌ Paket tidak ditemukan.")
		return
	}

	msg := fmt.Sprintf(
		"📦 Paket *%s* berstatus *%s*.\nDeskripsi: %s\nDiterima: %s",
		pkg.TrackingCode,
		pkg.Status,
		pkg.Description,
		pkg.TimeStamp.CreatedAt.Format("02 Jan 2006"),
	)
	SendTextMessage(userPhone, msg)
}

// ========== SEND MESSAGE ==========

func SendTextMessage(jidStr, message string) error {
	if Client == nil {
		return fmt.Errorf("WhatsApp client not initialized")
	}

	jid := types.NewJID(jidStr, "s.whatsapp.net")
	msg := &waE2E.Message{
		Conversation: &message,
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
