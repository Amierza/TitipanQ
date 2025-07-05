package repository

import (
	"context"

	"github.com/Amierza/TitipanQ/backend/entity"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type (
	IUserRepository interface {
		// Get
		GetRoleByName(ctx context.Context, tx *gorm.DB, roleName string) (entity.Role, bool, error)
		GetRoleByID(ctx context.Context, tx *gorm.DB, roleID string) (entity.Role, bool, error)
		GetPermissionsByRoleID(ctx context.Context, tx *gorm.DB, roleID string) ([]string, bool, error)
		GetUserByEmail(ctx context.Context, tx *gorm.DB, email string) (entity.User, bool, error)
		GetUserByID(ctx context.Context, tx *gorm.DB, userID string) (entity.User, bool, error)
		GetCompanyByID(ctx context.Context, tx *gorm.DB, companyID string) (entity.Company, bool, error)
		GetAllCompany(ctx context.Context, tx *gorm.DB) ([]entity.Company, error)

		// Create
		Register(ctx context.Context, tx *gorm.DB, user entity.User) (entity.User, error)

		// Update
		UpdateUser(ctx context.Context, tx *gorm.DB, user entity.User) error
	}

	UserRepository struct {
		db *gorm.DB
	}
)

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// Get
func (ur *UserRepository) GetRoleByName(ctx context.Context, tx *gorm.DB, roleName string) (entity.Role, bool, error) {
	if tx == nil {
		tx = ur.db
	}

	var role entity.Role
	if err := tx.WithContext(ctx).Where("name = ?", roleName).Take(&role).Error; err != nil {
		return entity.Role{}, false, err
	}

	return role, true, nil
}
func (ur *UserRepository) GetRoleByID(ctx context.Context, tx *gorm.DB, roleID string) (entity.Role, bool, error) {
	if tx == nil {
		tx = ur.db
	}

	var role entity.Role
	if err := tx.WithContext(ctx).Where("id = ?", roleID).Take(&role).Error; err != nil {
		return entity.Role{}, false, err
	}

	return role, true, nil
}
func (ur *UserRepository) GetPermissionsByRoleID(ctx context.Context, tx *gorm.DB, roleID string) ([]string, bool, error) {
	if tx == nil {
		tx = ur.db
	}

	var endpoints []string
	if err := tx.WithContext(ctx).Table("permissions").Where("role_id = ?", roleID).Pluck("endpoint", &endpoints).Error; err != nil {
		return []string{}, false, err
	}

	return endpoints, true, nil
}
func (ur *UserRepository) GetUserByEmail(ctx context.Context, tx *gorm.DB, email string) (entity.User, bool, error) {
	if tx == nil {
		tx = ur.db
	}

	var user entity.User
	if err := tx.WithContext(ctx).Preload("Company").Preload("Role").Where("email = ?", email).Take(&user).Error; err != nil {
		return entity.User{}, false, err
	}

	return user, true, nil
}
func (ur *UserRepository) GetUserByID(ctx context.Context, tx *gorm.DB, userID string) (entity.User, bool, error) {
	if tx == nil {
		tx = ur.db
	}

	var user entity.User
	if err := tx.WithContext(ctx).Preload("Company").Preload("Role").Where("id = ?", userID).Take(&user).Error; err != nil {
		return entity.User{}, false, err
	}

	return user, true, nil
}
func (ur *UserRepository) GetCompanyByID(ctx context.Context, tx *gorm.DB, companyID string) (entity.Company, bool, error) {
	if tx == nil {
		tx = ur.db
	}

	var company entity.Company
	if err := tx.WithContext(ctx).Where("id = ?", companyID).Take(&company).Error; err != nil {
		return entity.Company{}, false, err
	}

	return company, true, nil
}
func (ur *UserRepository) GetAllCompany(ctx context.Context, tx *gorm.DB) ([]entity.Company, error) {
	if tx == nil {
		tx = ur.db
	}

	var companies []entity.Company

	if err := tx.WithContext(ctx).Model(&entity.Company{}).Order("created_at DESC").Find(&companies).Error; err != nil {
		return []entity.Company{}, err
	}

	return companies, nil
}

// Create
func (ur *UserRepository) Register(ctx context.Context, tx *gorm.DB, user entity.User) (entity.User, error) {
	if tx == nil {
		tx = ur.db
	}

	user.ID = uuid.New()
	if err := tx.WithContext(ctx).Create(&user).Error; err != nil {
		return entity.User{}, err
	}

	return user, nil
}

// Update
func (ur *UserRepository) UpdateUser(ctx context.Context, tx *gorm.DB, user entity.User) error {
	if tx == nil {
		tx = ur.db
	}

	return tx.WithContext(ctx).Where("id = ?", user.ID).Updates(&user).Error
}
