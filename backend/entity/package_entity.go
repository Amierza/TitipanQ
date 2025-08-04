package entity

import (
	"errors"
	"time"

	"github.com/Amierza/TitipanQ/backend/helpers"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Package struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey" json:"package_id"`
	TrackingCode      string     `gorm:"unique,not null" json:"package_tracking_code"`
	Description       string     `gorm:"type:text" json:"package_description"`
	Image             string     `gorm:"type:text" json:"package_image"`
	Type              Type       `gorm:"not null;type:varchar(20)" json:"package_type"`
	Status            Status     `gorm:"not null;type:varchar(20)" json:"package_status"`
	Quantity          int        `gorm:"not null;default:0" json:"package_quantity"`
	CompletedAt       *time.Time `json:"package_completed_at"`
	ExpiredAt         *time.Time `json:"package_expired_at"`
	SenderName        string     `json:"package_sender_name"`
	SenderPhoneNumber string     `json:"package_sender_phone_number"`
	SenderAddress     string     `json:"package_sender_address"`
	ProofImage        *string    `gorm:"type:text" json:"package_proof_Image"`

	PackageHistories []PackageHistory `gorm:"foreignKey:PackageID"`

	UserID *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	User   User       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	LockerID uuid.UUID `gorm:"type:uuid;not null" json:"locker_id"`
	Locker   Locker    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`

	TimeStamp
}

func (p *Package) BeforeCreate(tx *gorm.DB) error {
	p.ExpiredAt = helpers.PtrTime(time.Now().AddDate(0, 3, 0))

	if !IsValidType(p.Type) || !IsValidStatus(p.Status) {
		return errors.New("invalid type or status")
	}
	return nil
}
