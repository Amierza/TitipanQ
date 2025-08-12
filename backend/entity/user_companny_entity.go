package entity

import "github.com/google/uuid"

type UserCompany struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    *uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	CompanyID *uuid.UUID `gorm:"type:uuid;not null" json:"company_id"`

	User    User    `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Company Company `gorm:"foreignKey:CompanyID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	TimeStamp
}