package migrations

import (
	"github.com/Amierza/TitipanQ/backend/entity"
	"gorm.io/gorm"
)

func Rollback(db *gorm.DB) error {
	tables := []interface{}{
		&entity.PackageHistory{},
		&entity.Package{},
		&entity.User{},
		&entity.Company{},
		&entity.Locker{},
		&entity.Recipient{},
		&entity.Permission{},
		&entity.Role{},
	}

	for _, table := range tables {
		if err := db.Migrator().DropTable(table); err != nil {
			return err
		}
	}

	return nil
}
