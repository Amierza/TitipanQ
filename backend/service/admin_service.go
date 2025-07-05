package service

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/Amierza/TitipanQ/backend/dto"
	"github.com/Amierza/TitipanQ/backend/entity"
	"github.com/Amierza/TitipanQ/backend/helpers"
	"github.com/Amierza/TitipanQ/backend/repository"
	"github.com/google/uuid"
)

type (
	IAdminService interface {
		// Authentication
		Login(ctx context.Context, req dto.LoginRequest) (dto.LoginResponse, error)
		RefreshToken(ctx context.Context, req dto.RefreshTokenRequest) (dto.RefreshTokenResponse, error)

		// User
		CreateUser(ctx context.Context, req dto.CreateUserRequest) (dto.UserResponse, error)
		ReadAllUserWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.UserPaginationResponse, error)
		GetDetailUser(ctx context.Context, userID string) (dto.UserResponse, error)
		UpdateUser(ctx context.Context, req dto.UpdateUserRequest) (dto.UserResponse, error)
		DeleteUser(ctx context.Context, req dto.DeleteUserRequest) (dto.UserResponse, error)

		// Package
		CreatePackage(ctx context.Context, req dto.CreatePackageRequest) (dto.PackageResponse, error)
		ReadAllPackageWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.PackagePaginationResponse, error)
		GetDetailPackage(ctx context.Context, pkgID string) (dto.PackageResponse, error)
		UpdatePackage(ctx context.Context, req dto.UpdatePackageRequest) (dto.UpdatePackageResponse, error)
		DeletePackage(ctx context.Context, req dto.DeletePackageRequest) (dto.PackageResponse, error)

		// Company
		CreateCompany(ctx context.Context, req dto.CreateCompanyRequest) (dto.CompanyResponse, error)
		ReadAllCompanyWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.CompanyPaginationResponse, error)
		GetDetailCompany(ctx context.Context, companyID string) (dto.CompanyResponse, error)
		UpdateCompany(ctx context.Context, req dto.UpdateCompanyRequest) (dto.UpdateCompanyResponse, error)
		DeleteCompany(ctx context.Context, companyID string) (dto.CompanyResponse, error)
	}

	AdminService struct {
		adminRepo  repository.IAdminRepository
		jwtService IJWTService
	}
)

func NewAdminService(adminRepo repository.IAdminRepository, jwtService IJWTService) *AdminService {
	return &AdminService{
		adminRepo:  adminRepo,
		jwtService: jwtService,
	}
}

// Authentication
func (as *AdminService) Login(ctx context.Context, req dto.LoginRequest) (dto.LoginResponse, error) {
	if !helpers.IsValidEmail(req.Email) {
		return dto.LoginResponse{}, dto.ErrInvalidEmail
	}

	if len(req.Password) < 8 {
		return dto.LoginResponse{}, dto.ErrInvalidPassword
	}

	user, flag, err := as.adminRepo.GetUserByEmail(ctx, nil, req.Email)
	if !flag || err != nil {
		return dto.LoginResponse{}, dto.ErrEmailNotFound
	}

	if user.Role.Name != "admin" {
		return dto.LoginResponse{}, dto.ErrDeniedAccess
	}

	checkPassword, err := helpers.CheckPassword(user.Password, []byte(req.Password))
	if err != nil || !checkPassword {
		return dto.LoginResponse{}, dto.ErrPasswordNotMatch
	}

	permissions, _, err := as.adminRepo.GetPermissionsByRoleID(ctx, nil, user.RoleID.String())
	if err != nil {
		return dto.LoginResponse{}, dto.ErrGetPermissionsByRoleID
	}

	accessToken, refreshToken, err := as.jwtService.GenerateToken(user.ID.String(), user.RoleID.String(), permissions)
	if err != nil {
		return dto.LoginResponse{}, err
	}

	return dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}
func (as *AdminService) RefreshToken(ctx context.Context, req dto.RefreshTokenRequest) (dto.RefreshTokenResponse, error) {
	_, err := as.jwtService.ValidateToken(req.RefreshToken)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrValidateToken
	}

	userID, err := as.jwtService.GetUserIDByToken(req.RefreshToken)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrGetUserIDFromToken
	}

	roleID, err := as.jwtService.GetRoleIDByToken(req.RefreshToken)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrGetRoleFromToken
	}

	role, err := as.adminRepo.GetRoleByID(ctx, nil, roleID)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrGetRoleFromID
	}

	if role.Name != "admin" {
		return dto.RefreshTokenResponse{}, dto.ErrDeniedAccess
	}

	permissions, flag, err := as.adminRepo.GetPermissionsByRoleID(ctx, nil, roleID)
	if err != nil || !flag {
		return dto.RefreshTokenResponse{}, dto.ErrGetPermissionsByRoleID
	}

	accessToken, _, err := as.jwtService.GenerateToken(userID, roleID, permissions)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrGenerateAccessToken
	}

	return dto.RefreshTokenResponse{AccessToken: accessToken}, nil
}

// User
func (as *AdminService) CreateUser(ctx context.Context, req dto.CreateUserRequest) (dto.UserResponse, error) {
	if len(req.Name) < 5 {
		return dto.UserResponse{}, dto.ErrInvalidName
	}

	_, flag, err := as.adminRepo.GetUserByEmail(ctx, nil, req.Email)
	if flag || err == nil {
		return dto.UserResponse{}, dto.ErrEmailAlreadyExists
	}

	if !helpers.IsValidEmail(req.Email) {
		return dto.UserResponse{}, dto.ErrInvalidEmail
	}

	if len(req.Password) < 8 {
		return dto.UserResponse{}, dto.ErrInvalidPassword
	}

	phoneNumberFormatted, err := helpers.StandardizePhoneNumber(req.PhoneNumber, true)
	if err != nil {
		return dto.UserResponse{}, dto.ErrFormatPhoneNumber
	}

	company, flag, err := as.adminRepo.GetCompanyByID(ctx, nil, req.CompanyID.String())
	if err != nil || !flag {
		return dto.UserResponse{}, dto.ErrGetCompanyByID
	}

	role, _, err := as.adminRepo.GetRoleByName(ctx, nil, "user")
	if err != nil {
		return dto.UserResponse{}, dto.ErrGetRoleFromName
	}

	user := entity.User{
		ID:          uuid.New(),
		Name:        req.Name,
		Email:       req.Email,
		Password:    req.Password,
		PhoneNumber: phoneNumberFormatted,
		Address:     req.Address,
		CompanyID:   &company.ID,
		Company:     company,
		RoleID:      &role.ID,
		Role:        role,
	}

	err = as.adminRepo.CreateUser(ctx, nil, user)
	if err != nil {
		return dto.UserResponse{}, dto.ErrRegisterUser
	}

	res := dto.UserResponse{
		ID:          user.ID,
		Name:        user.Name,
		Email:       user.Email,
		Password:    user.Password,
		PhoneNumber: user.PhoneNumber,
		Address:     user.Address,
		Company: dto.CompanyResponse{
			ID:      user.CompanyID,
			Name:    user.Company.Name,
			Address: user.Company.Address,
		},
		Role: dto.RoleResponse{
			ID:   user.RoleID,
			Name: user.Role.Name,
		},
	}

	return res, nil
}
func (as *AdminService) ReadAllUserWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.UserPaginationResponse, error) {
	dataWithPaginate, err := as.adminRepo.GetAllUserWithPagination(ctx, nil, req)
	if err != nil {
		return dto.UserPaginationResponse{}, dto.ErrGetAllUserWithPagination
	}

	var datas []dto.UserResponse
	for _, user := range dataWithPaginate.Users {
		data := dto.UserResponse{
			ID:          user.ID,
			Name:        user.Name,
			Email:       user.Email,
			Password:    user.Password,
			PhoneNumber: user.PhoneNumber,
			Address:     user.Address,
		}

		data.Company = dto.CompanyResponse{
			ID:      user.CompanyID,
			Name:    user.Company.Name,
			Address: user.Company.Address,
		}
		data.Role = dto.RoleResponse{
			ID:   user.RoleID,
			Name: user.Role.Name,
		}

		datas = append(datas, data)
	}

	return dto.UserPaginationResponse{
		Data: datas,
		PaginationResponse: dto.PaginationResponse{
			Page:    dataWithPaginate.Page,
			PerPage: dataWithPaginate.PerPage,
			MaxPage: dataWithPaginate.MaxPage,
			Count:   dataWithPaginate.Count,
		},
	}, nil
}
func (as *AdminService) GetDetailUser(ctx context.Context, userID string) (dto.UserResponse, error) {
	user, _, err := as.adminRepo.GetUserByID(ctx, nil, userID)
	if err != nil {
		return dto.UserResponse{}, dto.ErrUserNotFound
	}

	return dto.UserResponse{
		ID:          user.ID,
		Name:        user.Name,
		Email:       user.Email,
		Password:    user.Password,
		PhoneNumber: user.PhoneNumber,
		Address:     user.Address,
		Company: dto.CompanyResponse{
			ID:      user.CompanyID,
			Name:    user.Company.Name,
			Address: user.Company.Address,
		},
		Role: dto.RoleResponse{
			ID:   user.RoleID,
			Name: user.Role.Name,
		},
	}, nil
}
func (as *AdminService) UpdateUser(ctx context.Context, req dto.UpdateUserRequest) (dto.UserResponse, error) {
	user, _, err := as.adminRepo.GetUserByID(ctx, nil, req.ID)
	if err != nil {
		return dto.UserResponse{}, dto.ErrGetUserByID
	}

	if req.Name != "" {
		if len(req.Name) < 5 {
			return dto.UserResponse{}, dto.ErrInvalidName
		}

		user.Name = req.Name
	}

	if req.Email != "" {
		if !helpers.IsValidEmail(req.Email) {
			return dto.UserResponse{}, dto.ErrInvalidEmail
		}

		_, flag, err := as.adminRepo.GetUserByEmail(ctx, nil, req.Email)
		if flag || err == nil {
			return dto.UserResponse{}, dto.ErrEmailAlreadyExists
		}

		user.Email = req.Email
	}

	if req.Password != "" {
		if checkPassword, err := helpers.CheckPassword(user.Password, []byte(req.Password)); checkPassword || err == nil {
			return dto.UserResponse{}, dto.ErrPasswordSame
		}

		hashP, err := helpers.HashPassword(req.Password)
		if err != nil {
			return dto.UserResponse{}, dto.ErrHashPassword
		}

		user.Password = hashP
	}

	if req.PhoneNumber != "" {
		phoneNumberFormatted, err := helpers.StandardizePhoneNumber(req.PhoneNumber, true)
		if err != nil {
			return dto.UserResponse{}, dto.ErrFormatPhoneNumber
		}

		user.PhoneNumber = phoneNumberFormatted
	}

	if req.Address != "" {
		user.Address = req.Address
	}

	if req.CompanyID != nil {
		company, flag, err := as.adminRepo.GetCompanyByID(ctx, nil, req.CompanyID.String())
		if err != nil || !flag {
			return dto.UserResponse{}, dto.ErrGetCompanyByID
		}

		user.CompanyID = &company.ID
		user.Company = company
	}

	err = as.adminRepo.UpdateUser(ctx, nil, user)
	if err != nil {
		return dto.UserResponse{}, dto.ErrUpdateUser
	}

	res := dto.UserResponse{
		ID:          user.ID,
		Name:        user.Name,
		Email:       user.Email,
		Password:    user.Password,
		PhoneNumber: user.PhoneNumber,
		Address:     user.Address,
		Company: dto.CompanyResponse{
			ID:      user.CompanyID,
			Name:    user.Company.Name,
			Address: user.Company.Address,
		},
		Role: dto.RoleResponse{
			ID:   user.RoleID,
			Name: user.Role.Name,
		},
	}

	return res, nil
}
func (as *AdminService) DeleteUser(ctx context.Context, req dto.DeleteUserRequest) (dto.UserResponse, error) {
	deletedUser, _, err := as.adminRepo.GetUserByID(ctx, nil, req.UserID)
	if err != nil {
		return dto.UserResponse{}, dto.ErrGetUserByID
	}

	err = as.adminRepo.DeleteUserByID(ctx, nil, req.UserID)
	if err != nil {
		return dto.UserResponse{}, dto.ErrDeleteUserByID
	}

	res := dto.UserResponse{
		ID:          deletedUser.ID,
		Name:        deletedUser.Name,
		Email:       deletedUser.Email,
		Password:    deletedUser.Password,
		PhoneNumber: deletedUser.PhoneNumber,
		Address:     deletedUser.Address,
		Company: dto.CompanyResponse{
			ID:      deletedUser.CompanyID,
			Name:    deletedUser.Company.Name,
			Address: deletedUser.Company.Address,
		},
		Role: dto.RoleResponse{
			ID:   deletedUser.RoleID,
			Name: deletedUser.Role.Name,
		},
	}

	return res, nil
}

// Package
func (as *AdminService) CreatePackage(ctx context.Context, req dto.CreatePackageRequest) (dto.PackageResponse, error) {
	token := ctx.Value("Authorization").(string)

	userId, err := as.jwtService.GetUserIDByToken(token)
	if err != nil {
		return dto.PackageResponse{}, dto.ErrGetUserIDFromToken
	}

	IDChanger, err := uuid.Parse(userId)
	if err != nil {
		return dto.PackageResponse{}, dto.ErrParseUUID
	}

	if req.Description == "" || req.Type == "" {
		return dto.PackageResponse{}, dto.ErrMissingRequiredField
	}

	now := time.Now()

	if req.FileReader != nil && req.FileHeader != nil {
		ext := strings.TrimPrefix(filepath.Ext(req.FileHeader.Filename), ".")
		ext = strings.ToLower(ext)
		if ext != "jpg" && ext != "jpeg" && ext != "png" {
			return dto.PackageResponse{}, dto.ErrInvalidExtensionPhoto
		}

		fn := req.FileHeader.Filename
		base := filepath.Base(fn)
		nameOnly := strings.TrimSuffix(base, filepath.Ext(base))
		fileName := fmt.Sprintf("package_%d_%s.%s", now.Unix(), nameOnly, ext)

		_ = os.MkdirAll("assets/package", os.ModePerm)
		savePath := fmt.Sprintf("assets/package/%s", fileName)

		out, err := os.Create(savePath)
		if err != nil {
			return dto.PackageResponse{}, dto.ErrCreateFile
		}
		defer out.Close()

		if _, err := io.Copy(out, req.FileReader); err != nil {
			return dto.PackageResponse{}, dto.ErrSaveFile
		}
		req.Image = fileName
	}

	if !entity.IsValidType(req.Type) {
		return dto.PackageResponse{}, dto.ErrInvalidPackageType
	}

	_, flag, err := as.adminRepo.GetUserByID(ctx, nil, req.UserID.String())
	if !flag || err != nil {
		return dto.PackageResponse{}, dto.ErrUserNotFound
	}

	pkg := entity.Package{
		ID:          uuid.New(),
		Description: req.Description,
		Type:        req.Type,
		Status:      entity.Received,
		Image:       req.Image,
		ExpiredAt:   helpers.PtrTime(now.AddDate(0, 3, 0)),
		UserID:      &req.UserID,
	}

	if err := as.adminRepo.CreatePackage(ctx, nil, pkg); err != nil {
		return dto.PackageResponse{}, dto.ErrCreatePackage
	}

	history := entity.PackageHistory{
		ID:        uuid.New(),
		Status:    entity.Received,
		PackageID: &pkg.ID,
		ChangedBy: &IDChanger,
	}

	if err := as.adminRepo.CreatePackageHistory(ctx, nil, history); err != nil {
		return dto.PackageResponse{}, dto.ErrCreatePackageHistory
	}

	return dto.PackageResponse{
		ID:          pkg.ID,
		Description: pkg.Description,
		Image:       pkg.Image,
		Type:        pkg.Type,
		Status:      pkg.Status,
		DeliveredAt: pkg.DeliveredAt,
		ExpiredAt:   pkg.ExpiredAt,
		UserID:      *pkg.UserID,
	}, nil
}
func (as *AdminService) ReadAllPackageWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.PackagePaginationResponse, error) {
	dataWithPaginate, err := as.adminRepo.GetAllPackageWithPagination(ctx, nil, req)
	if err != nil {
		return dto.PackagePaginationResponse{}, dto.ErrGetAllPackageWithPagination
	}

	var datas []dto.PackageResponse
	for _, pkg := range dataWithPaginate.Packages {
		data := dto.PackageResponse{
			ID:          pkg.ID,
			Description: pkg.Description,
			Image:       pkg.Image,
			Type:        pkg.Type,
			Status:      pkg.Status,
			DeliveredAt: pkg.DeliveredAt,
			ExpiredAt:   pkg.ExpiredAt,
			UserID:      *pkg.UserID,
		}
		datas = append(datas, data)
	}

	return dto.PackagePaginationResponse{
		Data: datas,
		PaginationResponse: dto.PaginationResponse{
			Page:    dataWithPaginate.Page,
			PerPage: dataWithPaginate.PerPage,
			MaxPage: dataWithPaginate.MaxPage,
			Count:   dataWithPaginate.Count,
		},
	}, nil
}
func (as *AdminService) GetDetailPackage(ctx context.Context, pkgID string) (dto.PackageResponse, error) {
	pkg, _, err := as.adminRepo.GetPackageByID(ctx, nil, pkgID)
	if err != nil {
		return dto.PackageResponse{}, dto.ErrPackageNotFound
	}

	return dto.PackageResponse{
		ID:          pkg.ID,
		Description: pkg.Description,
		Image:       pkg.Image,
		Type:        pkg.Type,
		Status:      pkg.Status,
		DeliveredAt: pkg.DeliveredAt,
		ExpiredAt:   pkg.ExpiredAt,
		UserID:      *pkg.UserID,
	}, nil
}
func (as *AdminService) UpdatePackage(ctx context.Context, req dto.UpdatePackageRequest) (dto.UpdatePackageResponse, error) {
	token := ctx.Value("Authorization").(string)

	userId, err := as.jwtService.GetUserIDByToken(token)
	if err != nil {
		return dto.UpdatePackageResponse{}, dto.ErrGetUserIDFromToken
	}

	IDChanger, err := uuid.Parse(userId)
	if err != nil {
		return dto.UpdatePackageResponse{}, dto.ErrParseUUID
	}

	p, flag, err := as.adminRepo.GetPackageByID(ctx, nil, req.ID)
	if err != nil || !flag {
		return dto.UpdatePackageResponse{}, dto.ErrPackageNotFound
	}

	now := time.Now()

	if req.Description != "" {
		if len(req.Description) < 5 {
			return dto.UpdatePackageResponse{}, dto.ErrDescriptionPackageToShort
		}

		p.Description = req.Description
	}

	if req.FileReader != nil && req.FileHeader != nil {
		ext := strings.TrimPrefix(filepath.Ext(req.FileHeader.Filename), ".")
		ext = strings.ToLower(ext)
		if ext != "jpg" && ext != "jpeg" && ext != "png" {
			return dto.UpdatePackageResponse{}, dto.ErrInvalidExtensionPhoto
		}

		fileName := fmt.Sprintf("package_%d_%s.%s", now.Unix(), req.FileHeader.Filename, ext)

		_ = os.MkdirAll("assets/package", os.ModePerm)
		savePath := fmt.Sprintf("assets/package/%s", fileName)

		out, err := os.Create(savePath)
		if err != nil {
			return dto.UpdatePackageResponse{}, dto.ErrCreateFile
		}
		defer out.Close()

		if _, err := io.Copy(out, req.FileReader); err != nil {
			return dto.UpdatePackageResponse{}, dto.ErrSaveFile
		}

		p.Image = fileName
	}

	if req.Type != "" {
		if !entity.IsValidType(req.Type) {
			return dto.UpdatePackageResponse{}, dto.ErrInvalidPackageType
		}

		p.Type = req.Type
	}

	if req.Status != "" {
		if !entity.IsValidStatus(req.Status) {
			return dto.UpdatePackageResponse{}, dto.ErrInvalidPackageStatus
		}

		if req.Status == "delivered" {
			p.DeliveredAt = &now
		}

		p.Status = req.Status
	}

	if req.DeliveredAt != nil {
		p.DeliveredAt = req.DeliveredAt
	}

	if err := as.adminRepo.UpdatePackage(ctx, nil, p); err != nil {
		return dto.UpdatePackageResponse{}, dto.ErrUpdatePackage
	}

	history := entity.PackageHistory{
		ID:        uuid.New(),
		Status:    p.Status,
		PackageID: &p.ID,
		ChangedBy: &IDChanger,
	}

	if err := as.adminRepo.CreatePackageHistory(ctx, nil, history); err != nil {
		return dto.UpdatePackageResponse{}, dto.ErrCreatePackageHistory
	}

	return dto.UpdatePackageResponse{
		ID:          p.ID,
		Description: p.Description,
		Image:       p.Image,
		Type:        p.Type,
		Status:      p.Status,
		DeliveredAt: p.DeliveredAt,
		ExpiredAt:   p.ExpiredAt,
		UserID:      *p.UserID,
		ChangedBy:   *history.ChangedBy,
	}, nil
}
func (as *AdminService) DeletePackage(ctx context.Context, req dto.DeletePackageRequest) (dto.PackageResponse, error) {
	deletedPackage, _, err := as.adminRepo.GetPackageByID(ctx, nil, req.PackageID)
	if err != nil {
		return dto.PackageResponse{}, dto.ErrPackageNotFound
	}

	err = as.adminRepo.DeletePackageByID(ctx, nil, req.PackageID)
	if err != nil {
		return dto.PackageResponse{}, dto.ErrDeleteUserByID
	}

	res := dto.PackageResponse{
		ID:          deletedPackage.ID,
		Description: deletedPackage.Description,
		Image:       deletedPackage.Image,
		Type:        deletedPackage.Type,
		Status:      deletedPackage.Status,
		DeliveredAt: deletedPackage.DeliveredAt,
		ExpiredAt:   deletedPackage.ExpiredAt,
		UserID:      *deletedPackage.UserID,
	}

	return res, nil
}

// Company
func (as *AdminService) CreateCompany(ctx context.Context, req dto.CreateCompanyRequest) (dto.CompanyResponse, error) {
	if len(req.Name) < 3 {
		return dto.CompanyResponse{}, dto.ErrInvalidCompanyName
	}

	if len(req.Address) < 5 {
		return dto.CompanyResponse{}, dto.ErrInvalidCompanyAddress
	}

	company := entity.Company{
		ID:      uuid.New(),
		Name:    req.Name,
		Address: req.Address,
	}

	if err := as.adminRepo.CreateCompany(ctx, nil, company); err != nil {
		return dto.CompanyResponse{}, dto.ErrCreateCompany
	}

	return dto.CompanyResponse{
		ID:      &company.ID,
		Name:    company.Name,
		Address: company.Address,
	}, nil
}
func (as *AdminService) ReadAllCompanyWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.CompanyPaginationResponse, error) {
	dataWithPaginate, err := as.adminRepo.GetAllCompanyWithPagination(ctx, nil, req)
	if err != nil {
		return dto.CompanyPaginationResponse{}, dto.ErrGetAllCompanyWithPagination
	}

	var datas []dto.CompanyResponse
	for _, company := range dataWithPaginate.Companies {
		datas = append(datas, dto.CompanyResponse{
			ID:      &company.ID,
			Name:    company.Name,
			Address: company.Address,
		})
	}

	return dto.CompanyPaginationResponse{
		Data: datas,
		PaginationResponse: dto.PaginationResponse{
			Page:    dataWithPaginate.Page,
			PerPage: dataWithPaginate.PerPage,
			MaxPage: dataWithPaginate.MaxPage,
			Count:   dataWithPaginate.Count,
		},
	}, nil
}
func (as *AdminService) GetDetailCompany(ctx context.Context, companyID string) (dto.CompanyResponse, error) {
	company, flag, err := as.adminRepo.GetCompanyByID(ctx, nil, companyID)
	if err != nil || !flag {
		return dto.CompanyResponse{}, dto.ErrCompanyNotFound
	}

	return dto.CompanyResponse{
		ID:      &company.ID,
		Name:    company.Name,
		Address: company.Address,
	}, nil
}
func (as *AdminService) UpdateCompany(ctx context.Context, req dto.UpdateCompanyRequest) (dto.UpdateCompanyResponse, error) {
	company, flag, err := as.adminRepo.GetCompanyByID(ctx, nil, req.ID)
	if err != nil || !flag {
		return dto.UpdateCompanyResponse{}, dto.ErrCompanyNotFound
	}

	if req.Name != "" {
		if len(req.Name) < 3 {
			return dto.UpdateCompanyResponse{}, dto.ErrInvalidCompanyName
		}

		company.Name = req.Name
	}

	if req.Address != "" {
		if len(req.Address) < 5 {
			return dto.UpdateCompanyResponse{}, dto.ErrInvalidCompanyAddress
		}

		company.Address = req.Address
	}

	if err := as.adminRepo.UpdateCompany(ctx, nil, company); err != nil {
		return dto.UpdateCompanyResponse{}, dto.ErrUpdateCompany
	}
	return dto.UpdateCompanyResponse{
		ID:      &company.ID,
		Name:    company.Name,
		Address: company.Address,
	}, nil
}
func (as *AdminService) DeleteCompany(ctx context.Context, companyID string) (dto.CompanyResponse, error) {
	deletedCompany, flag, err := as.adminRepo.GetCompanyByID(ctx, nil, companyID)
	if err != nil || !flag {
		return dto.CompanyResponse{}, dto.ErrCompanyNotFound
	}

	err = as.adminRepo.DeleteCompanyByID(ctx, nil, companyID)
	if err != nil {
		return dto.CompanyResponse{}, dto.ErrDeleteCompany
	}

	res := dto.CompanyResponse{
		ID:      &deletedCompany.ID,
		Name:    deletedCompany.Name,
		Address: deletedCompany.Address,
	}

	return res, nil
}
