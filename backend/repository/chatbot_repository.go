package repository

import (
	"github.com/Amierza/TitipanQ/backend/entity"
	"gorm.io/gorm"
)

type (
	IChatBotRepository interface {
		FindByID(id string) (*entity.Package, error)
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

func (r *ChatBotRepository) FindByID(id string) (*entity.Package, error) {
	var pkg entity.Package
	if err := r.db.Where("id = ?", id).First(&pkg).Error; err != nil {
		return nil, err
	}
	return &pkg, nil
}
