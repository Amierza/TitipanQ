package migrations

import (
	"github.com/Amierza/TitipanQ/backend/entity"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&entity.Role{},
		&entity.Permission{},
		&entity.Company{},
		&entity.Sender{},
		&entity.User{},
		&entity.Locker{},
		&entity.UserCompany{},
		&entity.Package{},
		&entity.PackageHistory{},
		&entity.CronLog{},
	); err != nil {
		return err
	}

	return nil
}
