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
		&entity.User{},
		&entity.Package{},
		&entity.PackageHistory{},
	); err != nil {
		return err
	}

	return nil
}
