package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Package struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey" json:"package_id"`
	Description string     `gorm:"type:text" json:"package_description"`
	PhotoURL    string     `gorm:"type:text" json:"package_photo"`
	Type        Type       `gorm:"not null;type:varchar(20)" json:"package_type"`
	Status      Status     `gorm:"not null;type:varchar(20)" json:"package_status"`
	ReceivedAt  time.Time  `json:"package_received_at"`
	DeliveredAt *time.Time `json:"package_delivered_at"`
	ExpiredAt   *time.Time `json:"package_expired_at"`

	PackageHistories []PackageHistory `gorm:"foreignKey:PackageID"`

	UserID *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	User   User       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	TimeStamp
}

func (p *Package) BeforeCreate(tx *gorm.DB) error {
	if !isValidType(p.Type) || !isValidStatus(p.Status) {
		return errors.New("invalid type or status")
	}
	return nil
}
