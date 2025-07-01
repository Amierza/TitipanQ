package migrations

import (
	"github.com/Amierza/go-boiler-plate/entity"
	"gorm.io/gorm"
)

func Seed(db *gorm.DB) error {
	err := SeedFromJSON[entity.User](db, "./migrations/json/users.json", entity.User{}, "Email")
	if err != nil {
		return err
	}

	return nil
}
