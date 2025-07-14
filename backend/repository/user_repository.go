package repository

import (
	"context"
	"math"
	"strings"

	"github.com/Amierza/TitipanQ/backend/dto"
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
		GetAllPackageWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest, userID string) (dto.PackagePaginationRepositoryResponse, error)
		GetPackageByID(ctx context.Context, tx *gorm.DB, pkgID string) (entity.Package, bool, error)
		GetAllPackageHistory(ctx context.Context, tx *gorm.DB, pkgID string) ([]entity.PackageHistory, error)

		// Create
		Register(ctx context.Context, tx *gorm.DB, user entity.User) error

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
func (ur *UserRepository) GetAllPackageWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest, userID string) (dto.PackagePaginationRepositoryResponse, error) {
	if tx == nil {
		tx = ur.db
	}

	var packages []entity.Package
	var err error
	var count int64

	if req.PerPage == 0 {
		req.PerPage = 10
	}

	if req.Page == 0 {
		req.Page = 1
	}

	query := tx.WithContext(ctx).Model(&entity.Package{}).Where("user_id = ? ", userID)

	if req.Search != "" {
		searchValue := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where("LOWER(description) LIKE ? ", searchValue)
	}

	if err := query.Count(&count).Error; err != nil {
		return dto.PackagePaginationRepositoryResponse{}, err
	}

	if err := query.Order("created_at DESC").Scopes(Paginate(req.Page, req.PerPage)).Find(&packages).Error; err != nil {
		return dto.PackagePaginationRepositoryResponse{}, err
	}

	totalPage := int64(math.Ceil(float64(count) / float64(req.PerPage)))

	return dto.PackagePaginationRepositoryResponse{
		Packages: packages,
		PaginationResponse: dto.PaginationResponse{
			Page:    req.Page,
			PerPage: req.PerPage,
			MaxPage: totalPage,
			Count:   count,
		},
	}, err
}
func (ur *UserRepository) GetPackageByID(ctx context.Context, tx *gorm.DB, pkgID string) (entity.Package, bool, error) {
	if tx == nil {
		tx = ur.db
	}

	var user entity.Package
	if err := tx.WithContext(ctx).Where("id = ?", pkgID).Take(&user).Error; err != nil {
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
