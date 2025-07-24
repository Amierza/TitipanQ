package utils

import (
	"fmt"
	"time"

	"github.com/Amierza/TitipanQ/backend/entity"
)

type Response struct {
	Status    bool      `json:"status"`
	Messsage  string    `json:"message"`
	Timestamp time.Time `json:"timestamp,omitempty"`
	Data      any       `json:"data,omitempty"`
	Error     any       `json:"error,omitempty"`
	Meta      any       `json:"meta,omitempty"`
}

func BuildResponseSuccess(message string, data any) Response {
	res := Response{
		Status:    true,
		Messsage:  message,
		Timestamp: time.Now().UTC(),
		Data:      data,
	}

	return res
}

func BuildResponseFailed(message string, err string, data any) Response {
	res := Response{
		Status:    false,
		Messsage:  message,
		Error:     err,
		Timestamp: time.Now().UTC(),
		Data:      data,
	}

	return res
}

func BuildReceivedMessage(p *entity.Package) string {
	return fmt.Sprintf(
		`📦 Paket dengan kode *%s* telah diterima oleh kantor TitipanQ pada *%s*.

Deskripsi: %s
Jumlah: %d
Tipe: %s
Pengirim: %s

Kami akan segera memprosesnya.`,
		p.TrackingCode,
		p.CreatedAt.Format("02 Jan 2006"),
		p.Description,
		p.Quantity,
		p.Type,
		p.SenderName,
	)
}

func BuildCompletedMessage(p *entity.Package) string {
	return fmt.Sprintf(
		`✅ Paket dengan kode *%s* telah berhasil diterima oleh pemilik pada *%s*.

Deskripsi: %s
Jumlah: %d
Tipe: %s

Terima kasih telah menggunakan layanan TitipanQ!`,
		p.TrackingCode,
		p.CompletedAt.Format("02 Jan 2006"),
		p.Description,
		p.Quantity,
		p.Type,
	)
}

func BuildExpiredMessage(p *entity.Package) string {
	return fmt.Sprintf(
		`⚠️ Paket dengan kode *%s* telah melewati batas waktu penyimpanan (3 bulan) dan dinyatakan *kedaluwarsa* pada *%s*.

Deskripsi: %s
Jumlah: %d
Tipe: %s
Pengirim: %s

Silakan hubungi kantor TitipanQ untuk informasi lebih lanjut.`,
		p.TrackingCode,
		p.ExpiredAt.Format("02 Jan 2006"),
		p.Description,
		p.Quantity,
		p.Type,
		p.SenderName,
	)
}
