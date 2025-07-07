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
		"📦 Paket dengan kode *%s* telah diterima oleh kantor TitipanQ pada *%s*.\n\nDeskripsi: %s\n\nKami akan segera memprosesnya.",
		p.ID.String(),
		p.TimeStamp.CreatedAt.Format("02 Jan 2006"),
		p.Description,
	)
}

func BuildDeliveredMessage(p *entity.Package) string {
	return fmt.Sprintf(
		"🚚 Paket *%s* telah dikirim ke alamat tujuan pada *%s*.\n\nDeskripsi: %s\n\nPantau terus statusnya ya!",
		p.ID.String(),
		p.DeliveredAt.Format("02 Jan 2006"),
		p.Description,
	)
}

func BuildCompletedMessage(p *entity.Package) string {
	return fmt.Sprintf(
		"✅ Paket *%s* telah sampai dan diterima oleh pemilik pada *%s*.\n\nDeskripsi: %s\n\nTerima kasih telah menggunakan layanan TitipanQ!",
		p.ID.String(),
		p.DeliveredAt.Format("02 Jan 2006"),
		p.Description,
	)
}

func BuildExpiredMessage(p *entity.Package) string {
	return fmt.Sprintf(
		"⚠️ Paket *%s* telah melewati batas waktu penyimpanan (3 bulan) dan dinyatakan *kedaluwarsa*.\n\nDeskripsi: %s\n\nSilakan hubungi kantor TitipanQ untuk informasi lebih lanjut.",
		p.ID.String(),
		p.Description,
	)
}
