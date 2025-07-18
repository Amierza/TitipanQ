package service

import (
	"context"

	"github.com/Amierza/TitipanQ/backend/dto"
	"github.com/Amierza/TitipanQ/backend/entity"
	"github.com/Amierza/TitipanQ/backend/helpers"
	"github.com/Amierza/TitipanQ/backend/repository"
	"github.com/google/uuid"
)

type (
	IUserService interface {
		// Authentication
		Register(ctx context.Context, req dto.CreateUserRequest) (dto.UserResponse, error)
		Login(ctx context.Context, req dto.LoginRequest) (dto.LoginResponse, error)
		RefreshToken(ctx context.Context, req dto.RefreshTokenRequest) (dto.RefreshTokenResponse, error)

		// Company
		ReadAllCompany(ctx context.Context) ([]dto.CompanyResponse, error)

		// User
		GetDetailUser(ctx context.Context) (dto.UserResponse, error)
		UpdateUser(ctx context.Context, req dto.UpdateUserRequest) (dto.UserResponse, error)

		// Package
		ReadAllPackage(ctx context.Context) ([]dto.PackageResponse, error)
		GetDetailPackage(ctx context.Context, pkgID string) (dto.PackageResponse, error)
		ReadAllPackageHistory(ctx context.Context, pkgID string) ([]dto.PackageHistoryResponse, error)
	}

	UserService struct {
		userRepo   repository.IUserRepository
		jwtService IJWTService
	}
)

func NewUserService(userRepo repository.IUserRepository, jwtService IJWTService) *UserService {
	return &UserService{
		userRepo:   userRepo,
		jwtService: jwtService,
	}
}

// Authentication
func (us *UserService) Register(ctx context.Context, req dto.CreateUserRequest) (dto.UserResponse, error) {
	if len(req.Name) < 5 {
		return dto.UserResponse{}, dto.ErrInvalidName
	}

	_, flag, err := us.userRepo.GetUserByEmail(ctx, nil, req.Email)
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

	var company *entity.Company
	if req.CompanyID != nil {
		c, flag, err := us.userRepo.GetCompanyByID(ctx, nil, req.CompanyID.String())
		if err != nil || !flag {
			return dto.UserResponse{}, dto.ErrGetCompanyByID
		}
		company = &c
	}

	role, _, err := us.userRepo.GetRoleByName(ctx, nil, "user")
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
		RoleID:      &role.ID,
		Role:        role,
	}

	if company != nil {
		user.CompanyID = &company.ID
		user.Company = *company
	}

	err = us.userRepo.Register(ctx, nil, user)
	if err != nil {
		return dto.UserResponse{}, dto.ErrRegisterUser
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
func (us *UserService) Login(ctx context.Context, req dto.LoginRequest) (dto.LoginResponse, error) {
	if !helpers.IsValidEmail(req.Email) {
		return dto.LoginResponse{}, dto.ErrInvalidEmail
	}

	if len(req.Password) < 8 {
		return dto.LoginResponse{}, dto.ErrInvalidPassword
	}

	user, flag, err := us.userRepo.GetUserByEmail(ctx, nil, req.Email)
	if !flag || err != nil {
		return dto.LoginResponse{}, dto.ErrEmailNotFound
	}

	checkPassword, err := helpers.CheckPassword(user.Password, []byte(req.Password))
	if err != nil || !checkPassword {
		return dto.LoginResponse{}, dto.ErrPasswordNotMatch
	}

	if user.Role.Name != "user" {
		return dto.LoginResponse{}, dto.ErrDeniedAccess
	}

	permissions, _, err := us.userRepo.GetPermissionsByRoleID(ctx, nil, user.RoleID.String())
	if err != nil {
		return dto.LoginResponse{}, dto.ErrGetPermissionsByRoleID
	}

	accessToken, refreshToken, err := us.jwtService.GenerateToken(user.ID.String(), user.RoleID.String(), permissions)
	if err != nil {
		return dto.LoginResponse{}, err
	}

	return dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}
func (us *UserService) RefreshToken(ctx context.Context, req dto.RefreshTokenRequest) (dto.RefreshTokenResponse, error) {
	_, err := us.jwtService.ValidateToken(req.RefreshToken)

	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrValidateToken
	}

	userID, err := us.jwtService.GetUserIDByToken(req.RefreshToken)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrGetUserIDFromToken
	}

	roleID, err := us.jwtService.GetRoleIDByToken(req.RefreshToken)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrGetRoleFromToken
	}

	role, _, err := us.userRepo.GetRoleByID(ctx, nil, roleID)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrGetRoleFromID
	}

	if role.Name != "user" {
		return dto.RefreshTokenResponse{}, dto.ErrDeniedAccess
	}

	endpoints, _, err := us.userRepo.GetPermissionsByRoleID(ctx, nil, roleID)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrGetPermissionsByRoleID
	}

	accessToken, _, err := us.jwtService.GenerateToken(userID, roleID, endpoints)
	if err != nil {
		return dto.RefreshTokenResponse{}, dto.ErrGenerateAccessToken
	}

	return dto.RefreshTokenResponse{AccessToken: accessToken}, nil
}

// Company
func (us *UserService) ReadAllCompany(ctx context.Context) ([]dto.CompanyResponse, error) {
	companies, err := us.userRepo.GetAllCompany(ctx, nil)
	if err != nil {
		return []dto.CompanyResponse{}, dto.ErrGetAllCompanyWithPagination
	}

	var datas []dto.CompanyResponse
	for _, company := range companies {
		datas = append(datas, dto.CompanyResponse{
			ID:      &company.ID,
			Name:    company.Name,
			Address: company.Address,
		})
	}

	return datas, nil
}

// User
func (us *UserService) GetDetailUser(ctx context.Context) (dto.UserResponse, error) {
	token := ctx.Value("Authorization").(string)

	userID, err := us.jwtService.GetUserIDByToken(token)
	if err != nil {
		return dto.UserResponse{}, dto.ErrGetUserIDFromToken
	}

	user, _, err := us.userRepo.GetUserByID(ctx, nil, userID)
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
func (us *UserService) UpdateUser(ctx context.Context, req dto.UpdateUserRequest) (dto.UserResponse, error) {
	token := ctx.Value("Authorization").(string)

	userID, err := us.jwtService.GetUserIDByToken(token)
	if err != nil {
		return dto.UserResponse{}, dto.ErrGetUserIDFromToken
	}

	user, _, err := us.userRepo.GetUserByID(ctx, nil, userID)
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

		_, flag, err := us.userRepo.GetUserByEmail(ctx, nil, req.Email)
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
		company, flag, err := us.userRepo.GetCompanyByID(ctx, nil, req.CompanyID.String())
		if err != nil || !flag {
			return dto.UserResponse{}, dto.ErrGetCompanyByID
		}

		if user.CompanyID == &company.ID {
			return dto.UserResponse{}, dto.ErrSameCompanyID
		}

		user.CompanyID = &company.ID
		user.Company = company
	}

	err = us.userRepo.UpdateUser(ctx, nil, user)
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

// Package
func (us *UserService) ReadAllPackage(ctx context.Context) ([]dto.PackageResponse, error) {
	token := ctx.Value("Authorization").(string)

	userID, err := us.jwtService.GetUserIDByToken(token)
	if err != nil {
		return []dto.PackageResponse{}, dto.ErrGetUserIDFromToken
	}

	dataWithPaginate, err := us.userRepo.GetAllPackage(ctx, nil, userID)
	if err != nil {
		return []dto.PackageResponse{}, dto.ErrGetAllPackageWithPagination
	}

	var datas []dto.PackageResponse
	for _, pkg := range dataWithPaginate {
		data := dto.PackageResponse{
			ID:           pkg.ID,
			TrackingCode: pkg.TrackingCode,
			Description:  pkg.Description,
			Image:        pkg.Image,
			BarcodeImage: pkg.Barcode,
			Type:         pkg.Type,
			Status:       pkg.Status,
			DeliveredAt:  pkg.DeliveredAt,
			ExpiredAt:    pkg.ExpiredAt,
			User: dto.UserResponse{
				ID:          pkg.User.ID,
				Name:        pkg.User.Name,
				Email:       pkg.User.Email,
				Password:    pkg.User.Password,
				PhoneNumber: pkg.User.PhoneNumber,
				Address:     pkg.User.Address,
				Company: dto.CompanyResponse{
					ID:      pkg.User.CompanyID,
					Name:    pkg.User.Company.Name,
					Address: pkg.User.Company.Address,
				},
				Role: dto.RoleResponse{
					ID:   pkg.User.RoleID,
					Name: pkg.User.Role.Name,
				},
			},
			TimeStamp: entity.TimeStamp{
				CreatedAt: pkg.CreatedAt,
				UpdatedAt: pkg.UpdatedAt,
				DeletedAt: pkg.DeletedAt,
			},
		}
		datas = append(datas, data)
	}

	return datas, nil
}
func (us *UserService) GetDetailPackage(ctx context.Context, pkgID string) (dto.PackageResponse, error) {
	pkg, _, err := us.userRepo.GetPackageByID(ctx, nil, pkgID)
	if err != nil {
		return dto.PackageResponse{}, dto.ErrPackageNotFound
	}

	return dto.PackageResponse{
		ID:           pkg.ID,
		TrackingCode: pkg.TrackingCode,
		Description:  pkg.Description,
		Image:        pkg.Image,
		BarcodeImage: pkg.Barcode,
		Type:         pkg.Type,
		Status:       pkg.Status,
		DeliveredAt:  pkg.DeliveredAt,
		ExpiredAt:    pkg.ExpiredAt,
		User: dto.UserResponse{
			ID:          pkg.User.ID,
			Name:        pkg.User.Name,
			Email:       pkg.User.Email,
			Password:    pkg.User.Password,
			PhoneNumber: pkg.User.PhoneNumber,
			Address:     pkg.User.Address,
			Company: dto.CompanyResponse{
				ID:      pkg.User.CompanyID,
				Name:    pkg.User.Company.Name,
				Address: pkg.User.Company.Address,
			},
			Role: dto.RoleResponse{
				ID:   pkg.User.RoleID,
				Name: pkg.User.Role.Name,
			},
		},
		TimeStamp: entity.TimeStamp{
			CreatedAt: pkg.CreatedAt,
			UpdatedAt: pkg.UpdatedAt,
			DeletedAt: pkg.DeletedAt,
		},
	}, nil
}
func (us *UserService) ReadAllPackageHistory(ctx context.Context, pkgID string) ([]dto.PackageHistoryResponse, error) {
	dataWithPaginate, err := us.userRepo.GetAllPackageHistory(ctx, nil, pkgID)
	if err != nil {
		return []dto.PackageHistoryResponse{}, dto.ErrGetAllPackageHistory
	}

	var datas []dto.PackageHistoryResponse
	for _, pkgH := range dataWithPaginate {
		data := dto.PackageHistoryResponse{
			ID:     pkgH.ID,
			Status: pkgH.Status,
			ChangedBy: dto.UserResponseCustom{
				ID:    pkgH.ChangedByUser.ID,
				Name:  pkgH.ChangedByUser.Name,
				Email: pkgH.ChangedByUser.Email,
			},
			CreatedAt: pkgH.CreatedAt,
		}

		datas = append(datas, data)
	}

	return datas, nil
}
