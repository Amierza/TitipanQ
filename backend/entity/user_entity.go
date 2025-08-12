package entity

import (
	"github.com/Amierza/TitipanQ/backend/helpers"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	Name        string    `gorm:"not null" json:"user_name"`
	Email       string    `gorm:"unique;not null" json:"user_email"`
	Password    string    `gorm:"not null" json:"user_password"`
	PhoneNumber string    `gorm:"not null" json:"user_phone_number"`
	Address     string    `gorm:"type:text" json:"user_address"`

	Packages         []Package        `gorm:"foreignKey:UserID"`
	PackageHistories []PackageHistory `gorm:"foreignKey:ChangedBy"`

	UserCompanies []UserCompany `gorm:"foreignKey:UserID" json:"user_companies"`

	RoleID *uuid.UUID `gorm:"type:uuid" json:"role_id"`
	Role   Role       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	TimeStamp
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	defer func() {
		if err := recover(); err != nil {
			tx.Rollback()
		}
	}()

	var err error
	u.Password, err = helpers.HashPassword(u.Password)
	if err != nil {
		return err
	}

	return nil
}
