package entity

import "github.com/google/uuid"

type Company struct {
	ID      uuid.UUID `gorm:"type:uuid;primaryKey" json:"company_id"`
	Name    string    `gorm:"not null" json:"company_name"`
	Address string    `gorm:"type:text" json:"company_address"`

	Users []User `gorm:"foreignKey:CompanyID"`

	TimeStamp
}
