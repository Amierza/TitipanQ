package whatsapp

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

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

var chatbotRepo repository.IChatBotRepository

func InjectRepository(repo repository.IChatBotRepository) {
	chatbotRepo = repo
}

var Client *whatsmeow.Client

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
		// Belum login, generate QR
		qrChan, _ := Client.GetQRChannel(context.Background())
		err = Client.Connect()
		if err != nil {
			return fmt.Errorf("failed to connect: %w", err)
		}

		for evt := range qrChan {
			if evt.Event == "code" {
				fmt.Println("🔑 Scan QR code to login:", evt.Code)
				qrcodeTerminal.New().Get(evt.Code).Print()
			} else {
				fmt.Println("🔔 QR event:", evt.Event)
			}
		}
	} else {
		// Sudah login, langsung connect
		err = Client.Connect()
		if err != nil {
			return fmt.Errorf("failed to connect (logged-in): %w", err)
		}
	}

	// Optional: menangani CTRL+C agar disconnect dengan baik
	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM)
		<-c
		Client.Disconnect()
	}()

	return nil
}

func eventHandler(evt interface{}) {
	switch v := evt.(type) {
	case *waEvents.Message:
		msg := v.Message.GetConversation()
		if msg != "" {
			fmt.Println("📩 Pesan masuk:", msg)
			if strings.HasPrefix(strings.ToLower(msg), "cek paket") {
				parts := strings.Split(msg, " ")
				if len(parts) >= 3 {
					packageID := parts[2]
					go handlePackageCheck(v.Info.Sender.User, packageID)
				} else {
					go SendTextMessage(v.Info.Sender.User+"@s.whatsapp.net", "❌ Format salah. Contoh: cek paket <id>")
				}
			}
		}
	case *waEvents.Disconnected:
		fmt.Println("❌ WhatsApp disconnected, mencoba reconnect...")
		go reconnectClient()

	case *waEvents.LoggedOut:
		fmt.Println("🔌 WhatsApp logged out, mencoba reconnect...")
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
		fmt.Println("✅ Berhasil reconnect WhatsApp")
	}
}

func handlePackageCheck(userPhone, packageID string) {
	fmt.Println("[ChatBot] Mencari paket:", packageID, "dari", userPhone)

	if chatbotRepo == nil {
		fmt.Println("[ChatBot] Repository belum di-inject")
		SendTextMessage(userPhone+"@s.whatsapp.net", "❌ Sistem belum siap.")
		return
	}

	pkg, err := chatbotRepo.FindByID(packageID)
	if err != nil {
		fmt.Println("[ChatBot] ERROR saat cari paket:", err)
		SendTextMessage(userPhone+"@s.whatsapp.net", "❌ Paket tidak ditemukan.")
		return
	}
	if pkg == nil {
		fmt.Println("[ChatBot] Paket tidak ditemukan.")
		SendTextMessage(userPhone+"@s.whatsapp.net", "❌ Paket tidak ditemukan.")
		return
	}

	msg := fmt.Sprintf(
		"📦 Paket *%s* berstatus *%s*.\nDeskripsi: %s\nDiterima: %s",
		pkg.ID,
		pkg.Status,
		pkg.Description,
		pkg.TimeStamp.CreatedAt.Format("02 Jan 2006"),
	)
	fmt.Println("[ChatBot] Kirim balasan ke:", userPhone)
	err = SendTextMessage(userPhone, msg)
	if err != nil {
		fmt.Println("[ChatBot] Gagal kirim pesan:", err)
	}
}

func SendTextMessage(phoneNumber string, message string) error {
	if Client == nil {
		return fmt.Errorf("WhatsApp client not initialized")
	}

	jid := types.NewJID(phoneNumber, "s.whatsapp.net")
	msg := &waE2E.Message{
		Conversation: &message,
	}

	fmt.Println("[WA] Kirim pesan ke", jid.String(), "dengan isi:", message)

	resp, err := Client.SendMessage(context.Background(), jid, msg)
	if err != nil {
		fmt.Println("[WA] Kirim gagal:", err)
		fmt.Println("[WA] Coba reconnect...")
		reconnectClient()

		// Retry setelah reconnect
		time.Sleep(2 * time.Second)
		resp2, retryErr := Client.SendMessage(context.Background(), jid, msg)
		if retryErr != nil {
			fmt.Println("[WA] Gagal retry:", retryErr)
			return fmt.Errorf("failed to send message after reconnect: %w", retryErr)
		}
		fmt.Println("[WA] Retry berhasil:", resp2)
		return nil
	}

	fmt.Println("[WA] Pesan terkirim:", resp)
	return nil
}
