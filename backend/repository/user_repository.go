package repository

import (
	"context"

	"github.com/Amierza/TitipanQ/backend/entity"
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
		GetAllPackage(ctx context.Context, tx *gorm.DB, userID string) ([]entity.Package, error)
		GetPackageByID(ctx context.Context, tx *gorm.DB, pkgID string) (entity.Package, bool, error)
		GetAllPackageHistory(ctx context.Context, tx *gorm.DB, pkgID string) ([]entity.PackageHistory, error)

		// Create
		Register(ctx context.Context, tx *gorm.DB, user entity.User) error
		CreateUserCompany(ctx context.Context, tx *gorm.DB, userCompany entity.UserCompany) error

		// Update
		UpdateUser(ctx context.Context, tx *gorm.DB, user entity.User) error
		PreloadUserCompanies(ctx context.Context, tx *gorm.DB, user *entity.User) error

		// delete 
		DeleteUserCompaniesByUserID(ctx context.Context, tx *gorm.DB, userID string) error
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
func (ur *UserRepository) GetAllPackage(ctx context.Context, tx *gorm.DB, userID string) ([]entity.Package, error) {
	if tx == nil {
		tx = ur.db
	}

	var (
		packages []entity.Package
		err      error
	)

	query := tx.WithContext(ctx).Model(&entity.Package{}).Where("user_id = ? ", userID).Preload("User.Company").Preload("User.Role")

	if err := query.Order("created_at DESC").Find(&packages).Error; err != nil {
		return []entity.Package{}, err
	}

	return packages, err
}
func (ur *UserRepository) GetPackageByID(ctx context.Context, tx *gorm.DB, pkgID string) (entity.Package, bool, error) {
	if tx == nil {
		tx = ur.db
	}

	var user entity.Package
	if err := tx.WithContext(ctx).Preload("User.Company").Preload("User.Role").Where("id = ?", pkgID).Take(&user).Error; err != nil {
		return entity.Package{}, false, err
	}

	return user, true, nil
}
func (ur *UserRepository) GetAllPackageHistory(ctx context.Context, tx *gorm.DB, pkgID string) ([]entity.PackageHistory, error) {
	if tx == nil {
		tx = ur.db
	}

	var (
		packageHistories []entity.PackageHistory
		err              error
	)

	query := tx.WithContext(ctx).Model(&entity.PackageHistory{}).Preload("ChangedByUser").Where("package_id = ?", pkgID)

	if err := query.Order("created_at DESC").Find(&packageHistories).Error; err != nil {
		return []entity.PackageHistory{}, err
	}

	return packageHistories, err
}

// Create
func (ur *UserRepository) Register(ctx context.Context, tx *gorm.DB, user entity.User) error {
	if tx == nil {
		tx = ur.db
	}

	return tx.WithContext(ctx).Create(&user).Error
}

// Update
func (ur *UserRepository) UpdateUser(ctx context.Context, tx *gorm.DB, user entity.User) error {
	if tx == nil {
		tx = ur.db
	}

	return tx.WithContext(ctx).Where("id = ?", user.ID).Updates(&user).Error
}


// create 
func (ur *UserRepository) CreateUserCompany(ctx context.Context, tx *gorm.DB, userCompany entity.UserCompany) error {
	if tx == nil {
		tx = ur.db
	}

	return tx.WithContext(ctx).Create(&userCompany).Error
}


func (ur *UserRepository) PreloadUserCompanies(ctx context.Context, tx *gorm.DB, user *entity.User) error {
	if tx == nil {
		tx = ur.db
	}
	return tx.WithContext(ctx).
		Preload("UserCompanies.Company").
		First(user, "id = ?", user.ID).Error
}


func (ur *UserRepository) DeleteUserCompaniesByUserID(ctx context.Context, tx *gorm.DB, userID string) error {
	if tx == nil {
		tx = ur.db
	}

	return tx.WithContext(ctx).
		Where("user_id = ?", userID).
		Delete(&entity.UserCompany{}).
		Error
}



