package migrations

import (
	"github.com/Amierza/TitipanQ/backend/entity"
	"gorm.io/gorm"
)

func Seed(db *gorm.DB) error {
	err := SeedFromJSON[entity.Role](db, "./migrations/json/roles.json", entity.Role{}, "Name")
	if err != nil {
		return err
	}

	err = SeedFromJSON[entity.Company](db, "./migrations/json/companies.json", entity.Company{}, "Name", "Address")
	if err != nil {
		return err
	}
	err = SeedFromJSON[entity.Locker](db, "./migrations/json/lockers.json", entity.Locker{}, "LockerCode")
	if err != nil {
		return err
	}
	err = SeedFromJSON[entity.Sender](db, "./migrations/json/senders.json", entity.Sender{}, "PhoneNumber")
	if err != nil {
		return err
	}
	err = SeedFromJSON[entity.User](db, "./migrations/json/users.json", entity.User{}, "Email")
	if err != nil {
		return err
	}

	err = SeedFromJSON[entity.Permission](db, "./migrations/json/permissions.json", entity.Permission{}, "RoleID", "Endpoint")
	if err != nil {
		return err
	}

	err = SeedFromJSON[entity.Package](db, "./migrations/json/packages.json", entity.Package{}, "UserID", "Type", "Status", "Description")
	if err != nil {
		return err
	}

	err = SeedFromJSON[entity.PackageHistory](db, "./migrations/json/package_histories.json", entity.PackageHistory{}, "Status", "PackageID", "ChangedBy")
	if err != nil {
		return err
	}

	err = SeedFromJSON[entity.Recipient](db, "./migrations/json/recipients.json", entity.Recipient{}, "Email")
	if err != nil {
		return err
	}

	return nil
}
