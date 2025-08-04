package entity

import "github.com/google/uuid"

type Sender struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"sender_id"`
	Name        string    `gorm:"not null" json:"sender_name"`
	Email       string    `gorm:"unique;not null" json:"sender_email"`
	PhoneNumber string    `gorm:"not null" json:"sender_phone_number"`

	TimeStamp
}
