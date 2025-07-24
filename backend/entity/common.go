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

	Received  Status = "received"
	Completed Status = "completed"
	Expired   Status = "expired"
	Deleted   Status = "deleted"
)

func IsValidType(t Type) bool {
	return t == Document || t == Item || t == Other
}

func IsValidStatus(s Status) bool {
	return s == Received || s == Completed || s == Expired || s == Deleted
}
