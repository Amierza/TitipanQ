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

	// Graceful shutdown
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
	case "check_package":
		if intentResult.PackageID == "" {
			SendTextMessage(userPhone, "❌ Mohon sertakan ID paket. Contoh: cek paket 123")
			return
		}
		handlePackageCheck(userPhone, intentResult.PackageID)

	case "greeting":
		SendTextMessage(userPhone, "👋 Halo! Saya adalah asisten TitipanQ. Ketik *cek paket <id>* untuk mengetahui status paketmu.")

	default:
		SendTextMessage(userPhone, "🤔 Maaf, saya tidak mengerti maksud kamu. Coba ketik *cek paket <id>*.")
	}
}

func handlePackageCheck(userPhone, packageID string) {
	fmt.Println("[ChatBot] Mencari paket:", packageID, "dari", userPhone)

	if chatbotRepo == nil {
		fmt.Println("[ChatBot] Repository belum di-inject")
		SendTextMessage(userPhone, "❌ Sistem belum siap.")
		return
	}

	pkg, err := chatbotRepo.FindByID(packageID)
	if err != nil || pkg == nil {
		fmt.Println("[ChatBot] Paket tidak ditemukan")
		SendTextMessage(userPhone, "❌ Paket tidak ditemukan.")
		return
	}

	msg := fmt.Sprintf(
		"📦 Paket *%s* berstatus *%s*.\nDeskripsi: %s\nDiterima: %s",
		pkg.ID,
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
