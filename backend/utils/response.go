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
		p.Sender.Name,
	)
}

func BuildCompletedMessage(p *entity.Package) string {
	var message string
	if p.RecipientID != nil {
		message = fmt.Sprintf(
			`✅ Paket dengan kode *%s* telah berhasil diterima oleh pemilik pada *%s*.

Deskripsi: %s
Jumlah: %d
Tipe: %s
Nama Penerima: %s
Email Penerima: %s
No Hp Penerima: %s

Terima kasih telah menggunakan layanan TitipanQ!`,
			p.TrackingCode,
			p.CompletedAt.Format("02 Jan 2006"),
			p.Description,
			p.Quantity,
			p.Type,
			p.Recipient.Name,
			p.Recipient.Email,
			p.Recipient.PhoneNumber,
		)
	}

	if p.RecipientUserID != nil {
		message = fmt.Sprintf(
			`✅ Paket dengan kode *%s* telah berhasil diterima oleh pemilik pada *%s*.

Deskripsi: %s
Jumlah: %d
Tipe: %s
Nama Penerima: %s
Email Penerima: %s
No Hp Penerima: %s

Terima kasih telah menggunakan layanan TitipanQ!`,
			p.TrackingCode,
			p.CompletedAt.Format("02 Jan 2006"),
			p.Description,
			p.Quantity,
			p.Type,
			p.RecipientUser.Name,
			p.RecipientUser.Email,
			p.RecipientUser.PhoneNumber,
		)
	}
	return message
}
