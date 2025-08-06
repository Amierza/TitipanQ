package entity

import "github.com/google/uuid"

type Recipient struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"recipient_id"`
	Name        string    `gorm:"not null" json:"recipient_name"`
	Email       string    `gorm:"unique;not null" json:"recipient_email"`
	PhoneNumber string    `gorm:"not null" json:"recipient_phone_number"`

	TimeStamp
}
