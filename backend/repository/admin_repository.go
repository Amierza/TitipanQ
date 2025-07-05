package repository

import (
	"context"
	"math"
	"strings"

	"github.com/Amierza/TitipanQ/backend/dto"
	"github.com/Amierza/TitipanQ/backend/entity"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type (
	IAdminRepository interface {
		// Get
		GetRoleByName(ctx context.Context, tx *gorm.DB, roleName string) (entity.Role, bool, error)
		GetRoleByID(ctx context.Context, tx *gorm.DB, roleID string) (entity.Role, error)
		GetPermissionsByRoleID(ctx context.Context, tx *gorm.DB, roleID string) ([]string, bool, error)
		GetUserByEmail(ctx context.Context, tx *gorm.DB, email string) (entity.User, bool, error)
		GetUserByID(ctx context.Context, tx *gorm.DB, userID string) (entity.User, bool, error)
		GetAllUserWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.UserPaginationRepositoryResponse, error)
		GetPackageByID(ctx context.Context, tx *gorm.DB, pkgID string) (entity.Package, bool, error)
		GetAllPackageWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.PackagePaginationRepositoryResponse, error)
		GetCompanyByID(ctx context.Context, tx *gorm.DB, companyID string) (entity.Company, bool, error)
		GetAllCompanyWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.CompanyPaginationRepositoryResponse, error)

		//Create
		CreateUser(ctx context.Context, tx *gorm.DB, user entity.User) error
		CreatePackage(ctx context.Context, tx *gorm.DB, pkg entity.Package) error
		CreatePackageHistory(ctx context.Context, tx *gorm.DB, history entity.PackageHistory) error
		CreateCompany(ctx context.Context, tx *gorm.DB, company entity.Company) error

		// Update
		UpdateUser(ctx context.Context, tx *gorm.DB, user entity.User) error
		UpdatePackage(ctx context.Context, tx *gorm.DB, pkg entity.Package) error
		UpdateCompany(ctx context.Context, tx *gorm.DB, company entity.Company) error

		// Delete
		DeleteUserByID(ctx context.Context, tx *gorm.DB, userID string) error
		DeletePackageByID(ctx context.Context, tx *gorm.DB, pkgID string) error
		DeleteCompanyByID(ctx context.Context, tx *gorm.DB, CompanyID string) error
	}

	AdminRepository struct {
		db *gorm.DB
	}
)

func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{
		db: db,
	}
}

// Get
func (ur *AdminRepository) GetRoleByName(ctx context.Context, tx *gorm.DB, roleName string) (entity.Role, bool, error) {
	if tx == nil {
		tx = ur.db
	}

	var role entity.Role
	if err := tx.WithContext(ctx).Where("name = ?", roleName).Take(&role).Error; err != nil {
		return entity.Role{}, false, err
	}

	return role, true, nil
}
func (ar *AdminRepository) GetRoleByID(ctx context.Context, tx *gorm.DB, roleID string) (entity.Role, error) {
	if tx == nil {
		tx = ar.db
	}

	var role entity.Role
	if err := tx.WithContext(ctx).Where("id = ?", roleID).Take(&role).Error; err != nil {
		return entity.Role{}, err
	}

	return role, nil
}
func (ar *AdminRepository) GetPermissionsByRoleID(ctx context.Context, tx *gorm.DB, roleID string) ([]string, bool, error) {
	if tx == nil {
		tx = ar.db
	}

	var endpoints []string
	if err := tx.WithContext(ctx).Table("permissions").Where("role_id = ?", roleID).Pluck("endpoint", &endpoints).Error; err != nil {
		return []string{}, false, err
	}

	return endpoints, true, nil
}
func (ar *AdminRepository) GetUserByEmail(ctx context.Context, tx *gorm.DB, email string) (entity.User, bool, error) {
	if tx == nil {
		tx = ar.db
	}

	var user entity.User
	if err := tx.WithContext(ctx).Preload("Company").Preload("Role").Where("email = ?", email).Take(&user).Error; err != nil {
		return entity.User{}, false, err
	}

	return user, true, nil
}
func (ar *AdminRepository) GetUserByID(ctx context.Context, tx *gorm.DB, userID string) (entity.User, bool, error) {
	if tx == nil {
		tx = ar.db
	}

	var user entity.User
	if err := tx.WithContext(ctx).Preload("Company").Preload("Role").Where("id = ?", userID).Take(&user).Error; err != nil {
		return entity.User{}, false, err
	}

	return user, true, nil
}
func (ar *AdminRepository) GetCompanyByID(ctx context.Context, tx *gorm.DB, companyID string) (entity.Company, bool, error) {
	if tx == nil {
		tx = ar.db
	}

	var company entity.Company
	if err := tx.WithContext(ctx).Where("id = ?", companyID).Take(&company).Error; err != nil {
		return entity.Company{}, false, err
	}

	return company, true, nil
}
func (ar *AdminRepository) GetAllUserWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.UserPaginationRepositoryResponse, error) {
	if tx == nil {
		tx = ar.db
	}

	var users []entity.User
	var err error
	var count int64

	if req.PerPage == 0 {
		req.PerPage = 10
	}

	if req.Page == 0 {
		req.Page = 1
	}

	var adminIDs []uuid.UUID
	if err := tx.WithContext(ctx).Model(&entity.Role{}).Where("name != ?", "admin").Pluck("id", &adminIDs).Error; err != nil {
		return dto.UserPaginationRepositoryResponse{}, err
	}

	query := tx.WithContext(ctx).Model(&entity.User{}).Where("role_id IN (?)", adminIDs)

	if req.Search != "" {
		searchValue := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(email) LIKE ?", searchValue, searchValue)
	}

	query = query.Preload("Company").Preload("Role")

	if err := query.Count(&count).Error; err != nil {
		return dto.UserPaginationRepositoryResponse{}, err
	}

	if err := query.Order("created_at DESC").Scopes(Paginate(req.Page, req.PerPage)).Find(&users).Error; err != nil {
		return dto.UserPaginationRepositoryResponse{}, err
	}

	totalPage := int64(math.Ceil(float64(count) / float64(req.PerPage)))

	return dto.UserPaginationRepositoryResponse{
		Users: users,
		PaginationResponse: dto.PaginationResponse{
			Page:    req.Page,
			PerPage: req.PerPage,
			MaxPage: totalPage,
			Count:   count,
		},
	}, err
}
func (ar *AdminRepository) GetPackageByID(ctx context.Context, tx *gorm.DB, pkgID string) (entity.Package, bool, error) {
	if tx == nil {
		tx = ar.db
	}

	var user entity.Package
	if err := tx.WithContext(ctx).Where("id = ?", pkgID).Take(&user).Error; err != nil {
		return entity.Package{}, false, err
	}

	return user, true, nil
}
func (ar *AdminRepository) GetAllPackageWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.PackagePaginationRepositoryResponse, error) {
	if tx == nil {
		tx = ar.db
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

	query := tx.WithContext(ctx).Model(&entity.Package{})

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
func (r *AdminRepository) GetAllCompanyWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.CompanyPaginationRepositoryResponse, error) {
	if tx == nil {
		tx = r.db
	}

	var companies []entity.Company
	var count int64

	if req.PerPage == 0 {
		req.PerPage = 10
	}
	if req.Page == 0 {
		req.Page = 1
	}

	query := tx.WithContext(ctx).Model(&entity.Company{})

	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(address) LIKE ?", search, search)
	}

	if err := query.Count(&count).Error; err != nil {
		return dto.CompanyPaginationRepositoryResponse{}, err
	}

	if err := query.Order("created_at DESC").Scopes(Paginate(req.Page, req.PerPage)).Find(&companies).Error; err != nil {
		return dto.CompanyPaginationRepositoryResponse{}, err
	}

	return dto.CompanyPaginationRepositoryResponse{
		Companies: companies,
		PaginationResponse: dto.PaginationResponse{
			Page:    req.Page,
			PerPage: req.PerPage,
			MaxPage: int64(math.Ceil(float64(count) / float64(req.PerPage))),
			Count:   count,
		},
	}, nil
}

// Create
func (ar *AdminRepository) CreateUser(ctx context.Context, tx *gorm.DB, user entity.User) error {
	if tx == nil {
		tx = ar.db
	}

	return tx.WithContext(ctx).Create(&user).Error
}
func (ar *AdminRepository) CreatePackage(ctx context.Context, tx *gorm.DB, pkg entity.Package) error {
	if tx == nil {
		tx = ar.db
	}

	return tx.WithContext(ctx).Create(&pkg).Error
}
func (ar *AdminRepository) CreatePackageHistory(ctx context.Context, tx *gorm.DB, history entity.PackageHistory) error {
	if tx == nil {
		tx = ar.db
	}

	return tx.WithContext(ctx).Create(&history).Error
}
func (r *AdminRepository) CreateCompany(ctx context.Context, tx *gorm.DB, company entity.Company) error {
	if tx == nil {
		tx = r.db
	}
	return tx.WithContext(ctx).Create(&company).Error
}

// Update
func (ar *AdminRepository) UpdateUser(ctx context.Context, tx *gorm.DB, user entity.User) error {
	if tx == nil {
		tx = ar.db
	}

	return tx.WithContext(ctx).Where("id = ?", user.ID).Updates(&user).Error
}
func (ar *AdminRepository) UpdatePackage(ctx context.Context, tx *gorm.DB, pkg entity.Package) error {
	if tx == nil {
		tx = ar.db
	}

	return tx.WithContext(ctx).Where("id = ?", pkg.ID).Updates(&pkg).Error
}
func (r *AdminRepository) UpdateCompany(ctx context.Context, tx *gorm.DB, company entity.Company) error {
	if tx == nil {
		tx = r.db
	}

	return tx.WithContext(ctx).Where("id = ?", company.ID).Updates(&company).Error
}

// Delete
func (ar *AdminRepository) DeleteUserByID(ctx context.Context, tx *gorm.DB, userID string) error {
	if tx == nil {
		tx = ar.db
	}

	return tx.WithContext(ctx).Where("id = ?", userID).Delete(&entity.User{}).Error
}
func (ar *AdminRepository) DeletePackageByID(ctx context.Context, tx *gorm.DB, pkgID string) error {
	if tx == nil {
		tx = ar.db
	}

	return tx.WithContext(ctx).Where("id = ?", pkgID).Delete(&entity.Package{}).Error
}
func (ar *AdminRepository) DeleteCompanyByID(ctx context.Context, tx *gorm.DB, CompanyID string) error {
	if tx == nil {
		tx = ar.db
	}

	return tx.WithContext(ctx).Where("id = ?", CompanyID).Delete(&entity.Company{}).Error
}
