package entity

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Package struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey" json:"package_id"`
	TrackingCode string     `gorm:"unique,not null" json:"package_tracking_code"`
	Description  string     `gorm:"type:text" json:"package_description"`
	Image        string     `gorm:"type:text" json:"package_image"`
	Barcode      string     `gorm:"type:text" json:"package_barcode_image"`
	Type         Type       `gorm:"not null;type:varchar(20)" json:"package_type"`
	Status       Status     `gorm:"not null;type:varchar(20)" json:"package_status"`
	CompletedAt  *time.Time `json:"package_completed_at"`
	DeliveredAt  *time.Time `json:"package_delivered_at"`
	ExpiredAt    *time.Time `json:"package_expired_at"`

	PackageHistories []PackageHistory `gorm:"foreignKey:PackageID"`

	UserID *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	User   User       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	TimeStamp
}

func (p *Package) BeforeCreate(tx *gorm.DB) error {
	if !IsValidType(p.Type) || !IsValidStatus(p.Status) {
		return errors.New("invalid type or status")
	}

	if p.TrackingCode == "" {
		code := fmt.Sprintf("PACK%s", time.Now().Format("060102150405"))
		p.TrackingCode = code
	}
	return nil
}
