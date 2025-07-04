package entity

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PackageHistory struct {
	ID     uuid.UUID `gorm:"type:uuid;primaryKey" json:"history_id"`
	Status Status    `gorm:"type:varchar(20);not null" json:"history_status"`

	PackageID     *uuid.UUID `gorm:"type:uuid;not null" json:"package_id"`
	Package       Package    `gorm:"foreignKey:PackageID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	ChangedBy     *uuid.UUID `gorm:"type:uuid;not null" json:"changed_by"`
	ChangedByUser User       `gorm:"foreignKey:ChangedBy;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	TimeStamp
}

func (p *PackageHistory) BeforeCreate(tx *gorm.DB) error {
	if !IsValidStatus(p.Status) {
		return errors.New("invalid status")
	}
	return nil
}
