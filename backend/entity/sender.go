package entity

import "github.com/google/uuid"

type Sender struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"sender_id"`
	Name        string    `gorm:"not null" json:"sender_name"`
	PhoneNumber string    `gorm:"not null" json:"sender_phone_number"`
	Address     string    `gorm:"type:text" json:"sender_address"`

	TimeStamp

	Packages []Package `gorm:"foreignKey:SenderID"`
}
