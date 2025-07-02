package entity

import (
	"time"

	"gorm.io/gorm"
)

type (
	TimeStamp struct {
		CreatedAt time.Time      `json:"created_at"`
		UpdatedAt time.Time      `json:"updated_at"`
		DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	}

	Type   string
	Status string
)

const (
	Document Type = "document"
	Item     Type = "item"
	Other    Type = "other"

	Received   Status = "received"
	Processing Status = "processing"
	Delivered  Status = "delivered"
	Completed  Status = "completed"
	Expired    Status = "expired"
)

func isValidType(t Type) bool {
	return t == Document || t == Item || t == Other
}

func isValidStatus(s Status) bool {
	return s == Received || s == Processing || s == Delivered || s == Completed || s == Expired
}
