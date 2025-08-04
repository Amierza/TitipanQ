package entity

import "github.com/google/uuid"

type Locker struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"locker_id"`
	LockerCode string    `gorm:"not null" json:"locker_code"`
	Location   string    `gorm:"not null" json:"location"`

	Packages []Package `gorm:"foreignKey:LockerID"`

	TimeStamp
}
