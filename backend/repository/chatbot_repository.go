package repository

import (
	"time"

	"github.com/Amierza/TitipanQ/backend/entity"
	"gorm.io/gorm"
)

type (
	IChatBotRepository interface {
		FindByTrackingCode(trackingCode string, tx *gorm.DB) (*entity.Package, error)
		FindByPhone(phone string, tx *gorm.DB) (*entity.User, error)
		FindAllPackagesByUserPhone(userPhone string, tx *gorm.DB) ([]entity.Package, error)
		FindTodayPackagesByUserPhone(userPhone string, tx *gorm.DB) ([]entity.Package, error)
		CountTotalAllPackagesByUserPhone(phone string, tx *gorm.DB) (int64, error)
	}

	ChatBotRepository struct {
		db *gorm.DB
	}
)

func NewChatBotRepository(db *gorm.DB) *ChatBotRepository {
	return &ChatBotRepository{
		db: db,
	}
}

func (cr *ChatBotRepository) FindByTrackingCode(trackingCode string, tx *gorm.DB) (*entity.Package, error) {
	if tx == nil {
		tx = cr.db
	}

	var pkg entity.Package
	if err := tx.Where("tracking_code = ?", trackingCode).First(&pkg).Error; err != nil {
		return nil, err
	}
	return &pkg, nil
}
func (cr *ChatBotRepository) FindByPhone(phone string, tx *gorm.DB) (*entity.User, error) {
	if tx == nil {
		tx = cr.db
	}

	var user entity.User
	err := tx.Where("phone_number = ?", phone).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
func (cr *ChatBotRepository) FindAllPackagesByUserPhone(userPhone string, tx *gorm.DB) ([]entity.Package, error) {
	if tx == nil {
		tx = cr.db
	}

	var packages []entity.Package

	err := tx.
		Joins("JOIN users ON users.id = packages.user_id").
		Where("users.phone_number = ?", userPhone).
		Order("packages.created_at DESC").
		Find(&packages).Error

	return packages, err
}
func (cr *ChatBotRepository) FindTodayPackagesByUserPhone(userPhone string, tx *gorm.DB) ([]entity.Package, error) {
	if tx == nil {
		tx = cr.db
	}

	var packages []entity.Package

	today := time.Now().Format("2006-01-02")

	err := tx.
		Joins("JOIN users ON users.id = packages.user_id").
		Where("users.phone_number = ? AND DATE(packages.created_at) = ?", userPhone, today).
		Order("packages.created_at DESC").
		Find(&packages).Error

	return packages, err
}
func (cr *ChatBotRepository) CountTotalAllPackagesByUserPhone(phone string, tx *gorm.DB) (int64, error) {
	if tx == nil {
		tx = cr.db
	}

	var count int64

	err := tx.
		Model(&entity.Package{}).
		Joins("JOIN users ON users.id = packages.user_id").
		Where("users.phone_number = ?", phone).
		Count(&count).
		Error

	if err != nil {
		return 0, err
	}

	return count, nil
}
