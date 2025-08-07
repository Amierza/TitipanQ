package service

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/Amierza/TitipanQ/backend/dto"
	"github.com/Amierza/TitipanQ/backend/entity"
	"github.com/Amierza/TitipanQ/backend/helpers"
	"github.com/Amierza/TitipanQ/backend/internal/whatsapp"
	"github.com/Amierza/TitipanQ/backend/repository"
	"github.com/Amierza/TitipanQ/backend/utils"
	"github.com/google/uuid"
)

type (
	IAdminService interface {
		// Authentication
		Login(ctx context.Context, req dto.LoginRequest) (dto.LoginResponse, error)
		RefreshToken(ctx context.Context, req dto.RefreshTokenRequest) (dto.RefreshTokenResponse, error)

		// User
		CreateUser(ctx context.Context, req dto.CreateUserRequest) (dto.UserResponse, error)
		ReadAllUserNoPagination(ctx context.Context) ([]dto.UserResponse, error)
		ReadAllUserWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.UserPaginationResponse, error)
		GetDetailUser(ctx context.Context, userID string) (dto.UserResponse, error)
		UpdateUser(ctx context.Context, req dto.UpdateUserRequest) (dto.UserResponse, error)
		DeleteUser(ctx context.Context, req dto.DeleteUserRequest) (dto.UserResponse, error)

		// cron
		AutoExpirePackages() error
		AutoSoftDeletePackages() error

		// Package
		CreatePackage(ctx context.Context, req dto.CreatePackageRequest) (dto.PackageResponse, error)
		ReadAllPackageNoPagination(ctx context.Context, userID, pkgType string) ([]dto.PackageResponse, error)
		ReadAllPackageWithPagination(ctx context.Context, req dto.PaginationRequest, userIDStr, pkgType string) (dto.PackagePaginationResponse, error)
		GetDetailPackage(ctx context.Context, identifier string) (dto.PackageResponse, error)
		ReadAllPackageHistory(ctx context.Context, pkgID string) ([]dto.PackageHistoryResponse, error)
		UpdatePackage(ctx context.Context, req dto.UpdatePackageRequest) (dto.UpdatePackageResponse, error)
		UpdateStatusPackages(ctx context.Context, req dto.UpdateStatusPackages) error
		DeletePackage(ctx context.Context, req dto.DeletePackageRequest) (dto.PackageResponse, error)

		// Company
		CreateCompany(ctx context.Context, req dto.CreateCompanyRequest) (dto.CompanyResponse, error)
		ReadAllCompanyNoPagination(ctx context.Context) ([]dto.CompanyResponse, error)
		ReadAllCompanyWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.CompanyPaginationResponse, error)
		GetDetailCompany(ctx context.Context, companyID string) (dto.CompanyResponse, error)
		UpdateCompany(ctx context.Context, req dto.UpdateCompanyRequest) (dto.UpdateCompanyResponse, error)
		DeleteCompany(ctx context.Context, companyID string) (dto.CompanyResponse, error)

		// Recipient
		CreateRecipient(ctx context.Context, req dto.CreateRecipientRequest) (dto.RecipientResponse, error)
		GetAllRecipient(ctx context.Context) ([]dto.RecipientResponse, error)
		GetRecipientByID(ctx context.Context, recipientID string) (dto.RecipientResponse, error)
		GetAllRecipientsWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.RecipientPaginationResponse, error)
		UpdateRecipient(ctx context.Context, req dto.UpdateRecipientRequest) (dto.RecipientResponse, error)
		DeleteRecipient(ctx context.Context, req dto.DeleteRecipientRequest) (dto.RecipientResponse, error)

		// Locker
		CreateLocker(ctx context.Context, req dto.CreateLockerRequest) (dto.LockerResponse, error)
		GetAllLocker(ctx context.Context) ([]dto.LockerResponse, error)
		GetAllLockerWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.LockerPaginationResponse, error)
		GetLockerByID(ctx context.Context, lockerID string) (dto.LockerResponse, error)
		UpdateLocker(ctx context.Context, req dto.UpdateLockerRequest) (dto.LockerResponse, error)
		DeleteLocker(ctx context.Context, req dto.DeleteLockerRequest) (dto.LockerResponse, error)

		// Sender
		CreateSender(ctx context.Context, req dto.CreateSenderRequest) (dto.SenderResponse, error)
		GetAllSender(ctx context.Context) ([]dto.SenderResponse, error)
		GetAllSenderWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.SenderPaginationResponse, error)
		GetSenderByID(ctx context.Context, senderID string) (dto.SenderResponse, error)
		UpdateSender(ctx context.Context, req dto.UpdateSenderRequest) (dto.SenderResponse, error)
		DeleteSender(ctx context.Context, req dto.DeleteSenderRequest) (dto.SenderResponse, error)
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

	phoneNumberFormatted, err := helpers.StandardizePhoneNumber(req.PhoneNumber)
	if err != nil {
		return dto.UserResponse{}, dto.ErrFormatPhoneNumber
	}

	var company *entity.Company
	if req.CompanyID != nil {
		c, flag, err := as.adminRepo.GetCompanyByID(ctx, nil, req.CompanyID.String())
		if err != nil || !flag {
			return dto.UserResponse{}, dto.ErrGetCompanyByID
		}
		company = &c
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
		RoleID:      &role.ID,
		Role:        role,
	}

	if company != nil {
		user.CompanyID = &company.ID
		user.Company = *company
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
func (as *AdminService) ReadAllUserNoPagination(ctx context.Context) ([]dto.UserResponse, error) {
	users, err := as.adminRepo.GetAllUser(ctx)
	if err != nil {
		return nil, err
	}

	var datas []dto.UserResponse
	for _, user := range users {
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

	return datas, nil
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
		phoneNumberFormatted, err := helpers.StandardizePhoneNumber(req.PhoneNumber)
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

	if req.Description == "" || req.Type == "" || req.TrackingCode == "" || req.Quantity <= 0 {
		return dto.PackageResponse{}, dto.ErrMissingRequiredField
	}

	locker, found, err := as.adminRepo.GetLockerByID(ctx, nil, req.LockerID.String())
	if err != nil || !found {
		return dto.PackageResponse{}, dto.ErrLockerNotFound
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

	user, flag, err := as.adminRepo.GetUserByID(ctx, nil, req.UserID.String())
	if !flag || err != nil {
		return dto.PackageResponse{}, dto.ErrUserNotFound
	}

	pkg := entity.Package{
		ID:           uuid.New(),
		TrackingCode: req.TrackingCode,
		Description:  req.Description,
		Image:        req.Image,
		Type:         req.Type,
		Status:       entity.Received,
		Quantity:     req.Quantity,
		SenderID:     req.SenderID,
		UserID:       &user.ID,
		LockerID:     req.LockerID,
		RecipientID:  nil,
		TimeStamp: entity.TimeStamp{
			CreatedAt: now,
			UpdatedAt: now,
		},
	}

	if err := as.adminRepo.CreatePackage(ctx, nil, pkg); err != nil {
		return dto.PackageResponse{}, dto.ErrCreatePackage
	}

	sender, found, err := as.adminRepo.GetSenderByID(ctx, nil, req.SenderID.String())
	if err != nil || !found {
		return dto.PackageResponse{}, dto.ErrSenderNotFound
	}

	message := utils.BuildReceivedMessage(&pkg)
	if err := whatsapp.SendTextMessage(user.PhoneNumber, message); err != nil {
		log.Println("Failed to send WhatsApp notification:", err)
	}

	history := entity.PackageHistory{
		ID:          uuid.New(),
		Status:      entity.Received,
		Description: "package received",
		PackageID:   &pkg.ID,
		ChangedBy:   &IDChanger,
	}

	if err := as.adminRepo.CreatePackageHistory(ctx, nil, history); err != nil {
		return dto.PackageResponse{}, dto.ErrCreatePackageHistory
	}

	return dto.PackageResponse{
		ID:           pkg.ID,
		TrackingCode: pkg.TrackingCode,
		Description:  pkg.Description,
		Image:        pkg.Image,
		Type:         pkg.Type,
		Status:       pkg.Status,
		Quantity:     pkg.Quantity,
		CompletedAt:  pkg.CompletedAt,
		ExpiredAt:    pkg.ExpiredAt,
		Sender: dto.SenderResponse{
			ID:          sender.ID,
			Name:        sender.Name,
			PhoneNumber: sender.PhoneNumber,
			Address:     sender.Address,
		},
		Locker: dto.LockerResponse{
			ID:         locker.ID,
			LockerCode: locker.LockerCode,
			Location:   locker.Location,
		},
		User: dto.UserResponse{
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
		},
		TimeStamp: entity.TimeStamp{
			CreatedAt: now,
			UpdatedAt: now,
		},
	}, nil
}

func (as *AdminService) ReadAllPackageNoPagination(ctx context.Context, userID, pkgType string) ([]dto.PackageResponse, error) {
	packages, err := as.adminRepo.GetAllPackage(ctx, nil, userID, pkgType)
	if err != nil {
		return nil, err
	}

	var datas []dto.PackageResponse
	for _, pkg := range packages {
		var recipient *dto.RecipientResponse
		if pkg.RecipientID != nil {
			recipient = &dto.RecipientResponse{
				ID:          *pkg.RecipientID,
				Name:        pkg.Recipient.Name,
				Email:       pkg.Recipient.Email,
				PhoneNumber: pkg.Recipient.PhoneNumber,
			}
		}

		data := dto.PackageResponse{
			ID:           pkg.ID,
			TrackingCode: pkg.TrackingCode,
			Description:  pkg.Description,
			Image:        pkg.Image,
			Type:         pkg.Type,
			Status:       pkg.Status,
			Quantity:     pkg.Quantity,
			CompletedAt:  pkg.CompletedAt,
			ExpiredAt:    pkg.ExpiredAt,
			Sender: dto.SenderResponse{
				ID:          pkg.Sender.ID,
				Name:        pkg.Sender.Name,
				Address:     pkg.Sender.Address,
				PhoneNumber: pkg.Sender.PhoneNumber,
			},
			Locker: dto.LockerResponse{
				ID:         pkg.LockerID,
				LockerCode: pkg.Locker.LockerCode,
				Location:   pkg.Locker.Location,
			},
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
			Recipient: recipient,
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

func (as *AdminService) ReadAllPackageWithPagination(ctx context.Context, req dto.PaginationRequest, userID, pkgType string) (dto.PackagePaginationResponse, error) {
	dataWithPaginate, err := as.adminRepo.GetAllPackageWithPagination(ctx, nil, req, userID, pkgType)
	if err != nil {
		return dto.PackagePaginationResponse{}, dto.ErrGetAllPackageWithPagination
	}

	var datas []dto.PackageResponse

	for _, pkg := range dataWithPaginate.Packages {
		// default nil
		var recipient *dto.RecipientResponse
		if pkg.RecipientID != nil {
			recipient = &dto.RecipientResponse{
				ID:          *pkg.RecipientID,
				Name:        pkg.Recipient.Name,
				Email:       pkg.Recipient.Email,
				PhoneNumber: pkg.Recipient.PhoneNumber,
			}
		}

		data := dto.PackageResponse{
			ID:           pkg.ID,
			TrackingCode: pkg.TrackingCode,
			Description:  pkg.Description,
			Image:        pkg.Image,
			Type:         pkg.Type,
			Status:       pkg.Status,
			Quantity:     pkg.Quantity,
			CompletedAt:  pkg.CompletedAt,
			ExpiredAt:    pkg.ExpiredAt,
			Sender: dto.SenderResponse{
				ID:          pkg.Sender.ID,
				Name:        pkg.Sender.Name,
				Address:     pkg.Sender.Address,
				PhoneNumber: pkg.Sender.PhoneNumber,
			},
			Locker: dto.LockerResponse{
				ID:         pkg.LockerID,
				LockerCode: pkg.Locker.LockerCode,
				Location:   pkg.Locker.Location,
			},
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
			Recipient: recipient, // bisa null
			TimeStamp: entity.TimeStamp{
				CreatedAt: pkg.CreatedAt,
				UpdatedAt: pkg.UpdatedAt,
				DeletedAt: pkg.DeletedAt,
			},
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

func (as *AdminService) GetDetailPackage(ctx context.Context, identifier string) (dto.PackageResponse, error) {
	var pkg entity.Package
	var err error

	if _, parseErr := uuid.Parse(identifier); parseErr == nil {
		pkg, _, err = as.adminRepo.GetPackageByID(ctx, nil, identifier)
	} else {
		pkg, _, err = as.adminRepo.GetPackageByTrackingCode(ctx, nil, identifier)
	}

	if err != nil {
		return dto.PackageResponse{}, dto.ErrPackageNotFound
	}

	// default recipient nil
	var recipient *dto.RecipientResponse
	if pkg.RecipientID != nil {
		recipient = &dto.RecipientResponse{
			ID:          *pkg.RecipientID,
			Name:        pkg.Recipient.Name,
			Email:       pkg.Recipient.Email,
			PhoneNumber: pkg.Recipient.PhoneNumber,
		}
	}

	return dto.PackageResponse{
		ID:           pkg.ID,
		TrackingCode: pkg.TrackingCode,
		Description:  pkg.Description,
		Image:        pkg.Image,
		Type:         pkg.Type,
		Status:       pkg.Status,
		Quantity:     pkg.Quantity,
		CompletedAt:  pkg.CompletedAt,
		ExpiredAt:    pkg.ExpiredAt,
		Sender: dto.SenderResponse{
			ID:          pkg.Sender.ID,
			Name:        pkg.Sender.Name,
			Address:     pkg.Sender.Address,
			PhoneNumber: pkg.Sender.PhoneNumber,
		},
		Locker: dto.LockerResponse{
			ID:         pkg.LockerID,
			LockerCode: pkg.Locker.LockerCode,
			Location:   pkg.Locker.Location,
		},
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
		Recipient: recipient,
		TimeStamp: entity.TimeStamp{
			CreatedAt: pkg.CreatedAt,
			UpdatedAt: pkg.UpdatedAt,
			DeletedAt: pkg.DeletedAt,
		},
	}, nil
}

func (as *AdminService) ReadAllPackageHistory(ctx context.Context, pkgID string) ([]dto.PackageHistoryResponse, error) {
	dataWithPaginate, err := as.adminRepo.GetAllPackageHistory(ctx, nil, pkgID)
	if err != nil {
		return []dto.PackageHistoryResponse{}, dto.ErrGetAllPackageHistory
	}

	var datas []dto.PackageHistoryResponse
	for _, pkgH := range dataWithPaginate {
		data := dto.PackageHistoryResponse{
			ID:          pkgH.ID,
			Status:      pkgH.Status,
			Description: pkgH.Description,
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

	changer, flag, err := as.adminRepo.GetUserByID(ctx, nil, IDChanger.String())
	if err != nil || !flag {
		return dto.UpdatePackageResponse{}, dto.ErrUserNotFound
	}

	p, flag, err := as.adminRepo.GetPackageByID(ctx, nil, req.ID)
	if err != nil || !flag {
		return dto.UpdatePackageResponse{}, dto.ErrPackageNotFound
	}

	now := time.Now()
	var descriptionChanges []string

	if req.TrackingCode != "" {
		if p.TrackingCode != req.TrackingCode {
			descriptionChanges = append(descriptionChanges, "package code changed")
			p.TrackingCode = req.TrackingCode
		}
	}

	if req.Description != "" {
		if len(req.Description) < 5 {
			return dto.UpdatePackageResponse{}, dto.ErrDescriptionPackageToShort
		}

		if p.Description != req.Description {
			descriptionChanges = append(descriptionChanges, "package description changed")
			p.Description = req.Description
		}
	}

	if req.FileReader != nil && req.FileHeader != nil {
		ext := strings.TrimPrefix(filepath.Ext(req.FileHeader.Filename), ".")
		ext = strings.ToLower(ext)
		if ext != "jpg" && ext != "jpeg" && ext != "png" {
			return dto.UpdatePackageResponse{}, dto.ErrInvalidExtensionPhoto
		}

		if p.Image != "" {
			oldPath := filepath.Join("assets/package", p.Image)
			if err := os.Remove(oldPath); err != nil && !os.IsNotExist(err) {
				return dto.UpdatePackageResponse{}, dto.ErrDeleteOldImage
			}
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

		if p.Image != fileName {
			descriptionChanges = append(descriptionChanges, "package image changed")
			p.Image = fileName
		}
	}

	if req.Type != "" {
		if !entity.IsValidType(req.Type) {
			return dto.UpdatePackageResponse{}, dto.ErrInvalidPackageType
		}

		if p.Type != req.Type {
			descriptionChanges = append(descriptionChanges, "package type changed")
			p.Type = req.Type
		}
	}

	if req.Quantity != nil {
		if *req.Quantity < 0 {
			return dto.UpdatePackageResponse{}, dto.ErrInvalidQuantityPackage
		}

		descriptionChanges = append(descriptionChanges, "quantity changed")
		p.Quantity = *req.Quantity
	}

	if len(descriptionChanges) > 0 {
		message := fmt.Sprintf(
			"🙏 Mohon maaf, terdapat pembaruan data pada paket Anda dengan kode paket *%s* karena kesalahan input sebelumnya.\n\nPerubahan yang dilakukan:\n- %s\n\nSilakan cek aplikasi untuk melihat detail terbaru. Terima kasih atas pengertiannya.",
			p.TrackingCode,
			strings.Join(descriptionChanges, "\n- "),
		)

		if err := whatsapp.SendTextMessage(p.User.PhoneNumber, message); err != nil {
			log.Println("Failed to send WhatsApp notification:", err)
		}
	}

	var validStatusOrder = map[entity.Status]entity.Status{
		entity.Received: entity.Completed,
	}

	if req.Status != "" {
		if !entity.IsValidStatus(entity.Status(req.Status)) {
			return dto.UpdatePackageResponse{}, dto.ErrInvalidPackageStatus
		}

		if entity.Status(req.Status) == entity.Expired {
			return dto.UpdatePackageResponse{}, dto.ErrCannotChangeStatusToExpired
		}

		if p.Status != entity.Status(req.Status) {
			expectedNext, ok := validStatusOrder[p.Status]
			if !ok || expectedNext != entity.Status(req.Status) {
				return dto.UpdatePackageResponse{}, dto.ErrInvalidStatusTransition
			}

			descriptionChanges = append(descriptionChanges, "package status changed")

			if entity.Status(req.Status) == entity.Completed {
				p.CompletedAt = &now
			}

			p.Status = entity.Status(req.Status)
		}
	}

	sender, found, err := as.adminRepo.GetSenderByID(ctx, nil, req.SenderID)
	if err != nil || !found {
		return dto.UpdatePackageResponse{}, dto.ErrSenderNotFound
	}

	if p.SenderID != sender.ID {
		descriptionChanges = append(descriptionChanges, "sender changed")
		p.SenderID = sender.ID
	}

	if err := as.adminRepo.UpdatePackage(ctx, nil, p); err != nil {
		return dto.UpdatePackageResponse{}, dto.ErrUpdatePackage
	}

	var message string

	switch req.Status {
	case entity.Completed:
		message = utils.BuildCompletedMessage(&p)
	case entity.Expired:
		message = utils.BuildExpiredMessage(&p)
	}

	if message != "" {
		if err := whatsapp.SendTextMessage(p.User.PhoneNumber, message); err != nil {
			log.Println("Failed to send WhatsApp notification:", err)
		}
	}

	descriptionPkgH := strings.Join(descriptionChanges, ", ")

	history := entity.PackageHistory{
		ID:          uuid.New(),
		Status:      p.Status,
		Description: descriptionPkgH,
		PackageID:   &p.ID,
		ChangedBy:   &IDChanger,
	}

	if err := as.adminRepo.CreatePackageHistory(ctx, nil, history); err != nil {
		return dto.UpdatePackageResponse{}, dto.ErrCreatePackageHistory
	}

	client := dto.UserResponseCustom{
		ID:    *p.UserID,
		Name:  p.User.Name,
		Email: p.User.Email,
	}

	admin := dto.UserResponseCustom{
		ID:    changer.ID,
		Name:  changer.Name,
		Email: changer.Email,
	}

	return dto.UpdatePackageResponse{
		ID:           p.ID,
		TrackingCode: p.TrackingCode,
		Description:  p.Description,
		Image:        p.Image,
		Type:         p.Type,
		Status:       p.Status,
		Quantity:     p.Quantity,
		CompletedAt:  p.CompletedAt,
		ExpiredAt:    p.ExpiredAt,
		Sender: dto.SenderResponse{
			ID: p.SenderID,
			Name: p.Sender.Name,
			Address: p.Sender.Address,
			PhoneNumber: p.Sender.PhoneNumber,
		},
		User:         client,
		Locker: dto.LockerResponse{
			ID:         p.LockerID,
			LockerCode: p.Locker.LockerCode,
			Location:   p.Locker.Location,
		},
		ChangedBy: admin,
		TimeStamp: entity.TimeStamp{
			CreatedAt: p.CreatedAt,
			UpdatedAt: p.UpdatedAt,
			DeletedAt: p.DeletedAt,
		},
	}, nil
}

func (as *AdminService) UpdateStatusPackages(ctx context.Context, req dto.UpdateStatusPackages) error {
	token := ctx.Value("Authorization").(string)

	idChangerStr, err := as.jwtService.GetUserIDByToken(token)
	if err != nil {
		return dto.ErrGetUserIDFromToken
	}

	idChanger, err := uuid.Parse(idChangerStr)
	if err != nil {
		return dto.ErrParseUUID
	}

	now := time.Now()
	var proofImagePath string
	if req.FileReader != nil && req.FileHeader != nil {
		ext := strings.TrimPrefix(filepath.Ext(req.FileHeader.Filename), ".")
		ext = strings.ToLower(ext)
		if ext != "jpg" && ext != "jpeg" && ext != "png" {
			return dto.ErrInvalidExtensionPhoto
		}

		fileName := fmt.Sprintf("proof_%d_%s", now.Unix(), req.FileHeader.Filename)
		_ = os.MkdirAll("assets/proof", os.ModePerm)
		savePath := fmt.Sprintf("assets/proof/%s", fileName)

		out, err := os.Create(savePath)
		if err != nil {
			return dto.ErrCreateFile
		}
		defer out.Close()

		if _, err := io.Copy(out, req.FileReader); err != nil {
			return dto.ErrSaveFile
		}

		proofImagePath = fileName
	}

	recipient, _, err := as.adminRepo.GetRecipientByID(ctx, nil, req.RecipientID.String())
	if err != nil {
		return dto.ErrRecipientNotFound
	}

	for _, pkgID := range req.PackageIDs {
		p, _, err := as.adminRepo.GetPackageByID(ctx, nil, pkgID.String())
		if err != nil {
			return dto.ErrPackageNotFound
		}

		err = as.adminRepo.UpdateStatusPackage(
			ctx, nil,
			pkgID.String(),
			req.RecipientID,
			string(entity.Completed),
			proofImagePath,
		)
		if err != nil {
			return dto.ErrUpdateStatusPackage
		}

		p.CompletedAt = &now

		message := utils.BuildCompletedMessage(&p)
		if message != "" {
			if err := whatsapp.SendTextMessage(p.User.PhoneNumber, message); err != nil {
				log.Println("Failed to send WhatsApp notification:", err)
			}
		}

		history := entity.PackageHistory{
			ID:          uuid.New(),
			Status:      entity.Completed,
			Description: fmt.Sprintf("package status changed, taken by %s", recipient.Name),
			PackageID:   &pkgID,
			ChangedBy:   &idChanger,
		}
		if err := as.adminRepo.CreatePackageHistory(ctx, nil, history); err != nil {
			return dto.ErrCreatePackageHistory
		}
	}

	return nil
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

	var recipient *dto.RecipientResponse
	if deletedPackage.RecipientID != nil {
		recipient = &dto.RecipientResponse{
			ID:          *deletedPackage.RecipientID,
			Name:        deletedPackage.Recipient.Name,
			Email:       deletedPackage.Recipient.Email,
			PhoneNumber: deletedPackage.Recipient.PhoneNumber,
		}
	}

	res := dto.PackageResponse{
		ID:                deletedPackage.ID,
		TrackingCode:      deletedPackage.TrackingCode,
		Description:       deletedPackage.Description,
		Image:             deletedPackage.Image,
		Type:              deletedPackage.Type,
		Status:            deletedPackage.Status,
		Quantity:          deletedPackage.Quantity,
		CompletedAt:       deletedPackage.CompletedAt,
		ExpiredAt:         deletedPackage.ExpiredAt,
		Sender: dto.SenderResponse{
			ID: deletedPackage.Sender.ID,
			Name: deletedPackage.Sender.Name,
			Address: deletedPackage.Sender.Address,
			PhoneNumber: deletedPackage.Sender.PhoneNumber,
		},
		Locker: dto.LockerResponse{
			ID:         deletedPackage.LockerID,
			LockerCode: deletedPackage.Locker.LockerCode,
			Location:   deletedPackage.Locker.Location,
		},
		User: dto.UserResponse{
			ID:          deletedPackage.User.ID,
			Name:        deletedPackage.User.Name,
			Email:       deletedPackage.User.Email,
			Password:    deletedPackage.User.Password,
			PhoneNumber: deletedPackage.User.PhoneNumber,
			Address:     deletedPackage.User.Address,
			Company: dto.CompanyResponse{
				ID:      deletedPackage.User.CompanyID,
				Name:    deletedPackage.User.Company.Name,
				Address: deletedPackage.User.Company.Address,
			},
			Role: dto.RoleResponse{
				ID:   deletedPackage.User.RoleID,
				Name: deletedPackage.User.Role.Name,
			},
		},
		Recipient: recipient,
		TimeStamp: entity.TimeStamp{
			CreatedAt: deletedPackage.CreatedAt,
			UpdatedAt: deletedPackage.UpdatedAt,
			DeletedAt: deletedPackage.DeletedAt,
		},
	}

	return res, nil
}

// Cron
func (as *AdminService) AutoExpirePackages() error {
	now := time.Now()

	var packages []entity.Package
	err := as.adminRepo.GetAllExpiredPackages(now, &packages)
	if err != nil {
		return err
	}

	for _, pkg := range packages {
		err := as.adminRepo.UpdatePackageStatusToExpired(pkg.ID, entity.Expired)
		if err != nil {
			log.Printf("[AutoExpire] failed to update package %s: %v", pkg.ID, err)
			continue
		}

		history := entity.PackageHistory{
			ID:          uuid.New(),
			Status:      entity.Expired,
			Description: "package expired automatically",
			PackageID:   &pkg.ID,
			ChangedBy:   nil,
			TimeStamp: entity.TimeStamp{
				CreatedAt: now,
				UpdatedAt: now,
			},
		}
		_ = as.adminRepo.CreatePackageHistory(nil, nil, history)
	}

	return nil
}
func (as *AdminService) AutoSoftDeletePackages() error {
	now := time.Now()
	cutoff := now.AddDate(0, 0, -14)

	var expiredPackages []entity.Package
	err := as.adminRepo.GetAllExpiredPackagesBefore(cutoff, &expiredPackages)
	if err != nil {
		return err
	}

	for _, pkg := range expiredPackages {
		err := as.adminRepo.UpdateSoftDeletePackage(pkg.ID, now)
		if err != nil {
			log.Printf("[AutoExpire] failed to update package %s: %v", pkg.ID, err)
			continue
		}

		history := entity.PackageHistory{
			ID:          uuid.New(),
			Status:      entity.Deleted,
			Description: "package auto soft-deleted after 14 days of expiration",
			PackageID:   &pkg.ID,
			ChangedBy:   nil,
			TimeStamp: entity.TimeStamp{
				CreatedAt: now,
				UpdatedAt: now,
			},
		}
		_ = as.adminRepo.CreatePackageHistory(nil, nil, history)
	}

	return nil
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
func (as *AdminService) ReadAllCompanyNoPagination(ctx context.Context) ([]dto.CompanyResponse, error) {
	companies, err := as.adminRepo.GetAllCompany(ctx, nil)
	if err != nil {
		return nil, dto.ErrGetAllCompany
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

// Recipient
func (as *AdminService) CreateRecipient(ctx context.Context, req dto.CreateRecipientRequest) (dto.RecipientResponse, error) {
	if len(req.Name) < 3 {
		return dto.RecipientResponse{}, dto.ErrInvalidCompanyName
	}
	_, flag, err := as.adminRepo.GetRecipientByEmail(ctx, nil, req.Email)
	if flag || err == nil {
		return dto.RecipientResponse{}, dto.ErrEmailAlreadyExists
	}

	if !helpers.IsValidEmail(req.Email) {
		return dto.RecipientResponse{}, dto.ErrInvalidEmail
	}

	phoneNumberFormatted, err := helpers.StandardizePhoneNumber(req.PhoneNumber)
	if err != nil {
		return dto.RecipientResponse{}, dto.ErrFormatPhoneNumber
	}

	recipient := entity.Recipient{
		ID:          uuid.New(),
		Name:        req.Name,
		Email:       req.Email,
		PhoneNumber: phoneNumberFormatted,
	}

	if err := as.adminRepo.CreateRecipient(ctx, nil, recipient); err != nil {
		return dto.RecipientResponse{}, dto.ErrCreateRecipient
	}

	return dto.RecipientResponse{
		ID:          recipient.ID,
		Name:        recipient.Name,
		Email:       recipient.Email,
		PhoneNumber: recipient.PhoneNumber,
	}, nil
}

func (as *AdminService) GetAllRecipient(ctx context.Context) ([]dto.RecipientResponse, error) {
	recipients, err := as.adminRepo.GetAllRecipient(ctx, nil)
	if err != nil {
		return nil, dto.ErrGetAllRecipients
	}

	var datas []dto.RecipientResponse
	for _, recipients := range recipients {
		datas = append(datas, dto.RecipientResponse{
			ID:          recipients.ID,
			Name:        recipients.Name,
			Email:       recipients.Email,
			PhoneNumber: recipients.PhoneNumber,
		})
	}

	return datas, nil
}

func (as *AdminService) GetRecipientByID(ctx context.Context, recipientID string) (dto.RecipientResponse, error) {
	recipient, flag, err := as.adminRepo.GetRecipientByID(ctx, nil, recipientID)
	if err != nil || !flag {
		return dto.RecipientResponse{}, dto.ErrRecipientNotFound
	}

	return dto.RecipientResponse{
		ID:          recipient.ID,
		Name:        recipient.Name,
		Email:       recipient.Email,
		PhoneNumber: recipient.PhoneNumber,
	}, nil
}

func (as *AdminService) UpdateRecipient(ctx context.Context, req dto.UpdateRecipientRequest) (dto.RecipientResponse, error) {
	recipient, _, err := as.adminRepo.GetRecipientByID(ctx, nil, req.ID)
	if err != nil {
		return dto.RecipientResponse{}, dto.ErrGetRecipientByID
	}

	if req.Name != "" {
		if len(req.Name) < 3 {
			return dto.RecipientResponse{}, dto.ErrInvalidName
		}
		recipient.Name = req.Name
	}

	if req.Email != "" {
		if !helpers.IsValidEmail(req.Email) {
			return dto.RecipientResponse{}, dto.ErrInvalidEmail
		}

		_, flag, err := as.adminRepo.GetRecipientByEmail(ctx, nil, req.Email)
		if flag || err == nil {
			return dto.RecipientResponse{}, dto.ErrEmailAlreadyExists
		}
		recipient.Email = req.Email
	}

	if req.PhoneNumber != "" {
		phoneNumberFormatted, err := helpers.StandardizePhoneNumber(req.PhoneNumber)
		if err != nil {
			return dto.RecipientResponse{}, dto.ErrFormatPhoneNumber
		}

		recipient.PhoneNumber = phoneNumberFormatted
	}

	err = as.adminRepo.UpdateRecipient(ctx, nil, recipient)
	if err != nil {
		return dto.RecipientResponse{}, dto.ErrUpdateRecipient
	}

	res := dto.RecipientResponse{
		ID:          recipient.ID,
		Name:        recipient.Name,
		Email:       recipient.Email,
		PhoneNumber: recipient.PhoneNumber,
	}

	return res, nil
}
func (as *AdminService) DeleteRecipient(ctx context.Context, req dto.DeleteRecipientRequest) (dto.RecipientResponse, error) {
	deletedRecipient, flag, err := as.adminRepo.GetRecipientByID(ctx, nil, req.RecipientID)
	if err != nil || !flag {
		return dto.RecipientResponse{}, dto.ErrRecipientNotFound
	}

	err = as.adminRepo.DeleteRecipientByID(ctx, nil, req.RecipientID)
	if err != nil {
		return dto.RecipientResponse{}, dto.ErrDeletedRecipient
	}

	res := dto.RecipientResponse{
		ID:          deletedRecipient.ID,
		Name:        deletedRecipient.Name,
		Email:       deletedRecipient.Email,
		PhoneNumber: deletedRecipient.PhoneNumber,
	}

	return res, nil
}

func (as *AdminService) GetAllRecipientsWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.RecipientPaginationResponse, error) {
	dataWithPaginate, err := as.adminRepo.GetAllRecipientWithPagination(ctx, nil, req)
	if err != nil {
		return dto.RecipientPaginationResponse{}, dto.ErrGetAllRecipientsWithPagination
	}

	var datas []dto.RecipientResponse
	for _, recipient := range dataWithPaginate.Recipients {
		datas = append(datas, dto.RecipientResponse{
			ID:          recipient.ID,
			Name:        recipient.Name,
			Email:       recipient.Email,
			PhoneNumber: recipient.PhoneNumber,
		})
	}

	return dto.RecipientPaginationResponse{
		Data: datas,
		PaginationResponse: dto.PaginationResponse{
			Page:    dataWithPaginate.Page,
			PerPage: dataWithPaginate.PerPage,
			MaxPage: dataWithPaginate.MaxPage,
			Count:   dataWithPaginate.Count,
		},
	}, nil
}

// Locker
func (as *AdminService) CreateLocker(ctx context.Context, req dto.CreateLockerRequest) (dto.LockerResponse, error) {
	_, flag, err := as.adminRepo.GetLockerByLockerCode(ctx, nil, req.LockerCode)
	if flag || err == nil {
		return dto.LockerResponse{}, dto.ErrLockerCodeAlreadyExists
	}

	locker := entity.Locker{
		ID:         uuid.New(),
		LockerCode: req.LockerCode,
		Location:   req.Location,
	}

	if err := as.adminRepo.CreateLocker(ctx, nil, locker); err != nil {
		return dto.LockerResponse{}, dto.ErrCreateLocker
	}

	return dto.LockerResponse{
		ID:         locker.ID,
		LockerCode: locker.LockerCode,
		Location:   locker.Location,
	}, nil
}
func (as *AdminService) GetAllLocker(ctx context.Context) ([]dto.LockerResponse, error) {
	lockers, err := as.adminRepo.GetAllLocker(ctx, nil)
	if err != nil {
		return nil, dto.ErrGetAllLocker
	}

	var datas []dto.LockerResponse
	for _, lockers := range lockers {
		datas = append(datas, dto.LockerResponse{
			ID:         lockers.ID,
			LockerCode: lockers.LockerCode,
			Location:   lockers.Location,
		})
	}

	return datas, nil
}
func (as *AdminService) GetAllLockerWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.LockerPaginationResponse, error) {
	dataWithPaginate, err := as.adminRepo.GetAllLockerWithPagination(ctx, nil, req)
	if err != nil {
		return dto.LockerPaginationResponse{}, dto.ErrGetAllLockerWithPagination
	}

	var datas []dto.LockerResponse
	for _, locker := range dataWithPaginate.Lockers {
		datas = append(datas, dto.LockerResponse{
			ID:         locker.ID,
			LockerCode: locker.LockerCode,
			Location:   locker.Location,
		})
	}

	return dto.LockerPaginationResponse{
		Data: datas,
		PaginationResponse: dto.PaginationResponse{
			Page:    dataWithPaginate.Page,
			PerPage: dataWithPaginate.PerPage,
			MaxPage: dataWithPaginate.MaxPage,
			Count:   dataWithPaginate.Count,
		},
	}, nil
}
func (as *AdminService) GetLockerByID(ctx context.Context, lockerID string) (dto.LockerResponse, error) {
	locker, flag, err := as.adminRepo.GetLockerByID(ctx, nil, lockerID)
	if err != nil || !flag {
		return dto.LockerResponse{}, dto.ErrLockerNotFound
	}

	return dto.LockerResponse{
		ID:         locker.ID,
		LockerCode: locker.LockerCode,
		Location:   locker.Location,
	}, nil
}
func (as *AdminService) UpdateLocker(ctx context.Context, req dto.UpdateLockerRequest) (dto.LockerResponse, error) {
	locker, _, err := as.adminRepo.GetLockerByID(ctx, nil, req.ID)
	if err != nil {
		return dto.LockerResponse{}, dto.ErrGetLockerByID
	}

	if req.LockerCode != "" {
		existing, _, err := as.adminRepo.GetLockerByLockerCode(ctx, nil, req.LockerCode)
		if err == nil && existing.ID != locker.ID {
			return dto.LockerResponse{}, dto.ErrLockerCodeAlreadyExists
		}
		locker.LockerCode = req.LockerCode
	}

	if req.Location != "" {
		locker.Location = req.Location
	}

	if err := as.adminRepo.UpdateLocker(ctx, nil, locker); err != nil {
		return dto.LockerResponse{}, dto.ErrUpdateLocker
	}

	res := dto.LockerResponse{
		ID:         locker.ID,
		LockerCode: locker.LockerCode,
		Location:   locker.Location,
	}

	return res, nil
}

func (as *AdminService) DeleteLocker(ctx context.Context, req dto.DeleteLockerRequest) (dto.LockerResponse, error) {
	deletedSender, flag, err := as.adminRepo.GetLockerByID(ctx, nil, req.LockerID)
	if err != nil || !flag {
		return dto.LockerResponse{}, dto.ErrLockerNotFound
	}

	err = as.adminRepo.DeleteLockerByID(ctx, nil, req.LockerID)
	if err != nil {
		return dto.LockerResponse{}, dto.ErrDeleteLocker
	}

	res := dto.LockerResponse{
		ID:         deletedSender.ID,
		LockerCode: deletedSender.LockerCode,
		Location:   deletedSender.Location,
	}

	return res, nil
}

// Sender
func (as *AdminService) CreateSender(ctx context.Context, req dto.CreateSenderRequest) (dto.SenderResponse, error) {
	if len(req.Name) < 3 {
		return dto.SenderResponse{}, dto.ErrInvalidSenderName
	}
	if len(req.Address) < 3 {
		return dto.SenderResponse{}, dto.ErrInvalidAddressName
	}
	phoneNumberFormatted, err := helpers.StandardizePhoneNumber(req.PhoneNumber)
	if err != nil {
		return dto.SenderResponse{}, dto.ErrFormatPhoneNumber
	}

	sender := entity.Sender{
		ID:          uuid.New(),
		Name:        req.Name,
		Address:     req.Address,
		PhoneNumber: phoneNumberFormatted,
	}

	if err := as.adminRepo.CreateSender(ctx, nil, sender); err != nil {
		return dto.SenderResponse{}, dto.ErrCreateSender
	}

	return dto.SenderResponse{
		ID:          sender.ID,
		Name:        sender.Name,
		Address:     sender.Address,
		PhoneNumber: sender.PhoneNumber,
	}, nil
}

func (as *AdminService) GetSenderByID(ctx context.Context, senderID string) (dto.SenderResponse, error) {
	recipient, flag, err := as.adminRepo.GetSenderByID(ctx, nil, senderID)
	if err != nil || !flag {
		return dto.SenderResponse{}, dto.ErrSenderNotFound
	}

	return dto.SenderResponse{
		ID:          recipient.ID,
		Name:        recipient.Name,
		Address:     recipient.Address,
		PhoneNumber: recipient.PhoneNumber,
	}, nil
}
func (as *AdminService) GetAllSender(ctx context.Context) ([]dto.SenderResponse, error) {
	senders, err := as.adminRepo.GetAllSender(ctx, nil)
	if err != nil {
		return nil, dto.ErrGetAllRecipients
	}

	var datas []dto.SenderResponse
	for _, senders := range senders {
		datas = append(datas, dto.SenderResponse{
			ID:          senders.ID,
			Name:        senders.Name,
			Address:     senders.Address,
			PhoneNumber: senders.PhoneNumber,
		})
	}

	return datas, nil
}

func (as *AdminService) GetAllSenderWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.SenderPaginationResponse, error) {
	dataWithPaginate, err := as.adminRepo.GetAllSenderWithPagination(ctx, nil, req)
	if err != nil {
		return dto.SenderPaginationResponse{}, dto.ErrGetAllSendersWithPagination
	}

	var datas []dto.SenderResponse
	for _, sender := range dataWithPaginate.Senders {
		datas = append(datas, dto.SenderResponse{
			ID:          sender.ID,
			Name:        sender.Name,
			Address:     sender.Address,
			PhoneNumber: sender.PhoneNumber,
		})
	}

	return dto.SenderPaginationResponse{
		Data: datas,
		PaginationResponse: dto.PaginationResponse{
			Page:    dataWithPaginate.Page,
			PerPage: dataWithPaginate.PerPage,
			MaxPage: dataWithPaginate.MaxPage,
			Count:   dataWithPaginate.Count,
		},
	}, nil
}
func (as *AdminService) UpdateSender(ctx context.Context, req dto.UpdateSenderRequest) (dto.SenderResponse, error) {
	sender, _, err := as.adminRepo.GetSenderByID(ctx, nil, req.ID)
	if err != nil {
		return dto.SenderResponse{}, dto.ErrGetSenderByID
	}

	if req.Name != "" {
		if len(req.Name) < 3 {
			return dto.SenderResponse{}, dto.ErrInvalidName
		}
		sender.Name = req.Name
	}

	if req.PhoneNumber != "" {
		phoneNumberFormatted, err := helpers.StandardizePhoneNumber(req.PhoneNumber)
		if err != nil {
			return dto.SenderResponse{}, dto.ErrFormatPhoneNumber
		}

		sender.PhoneNumber = phoneNumberFormatted
	}

	err = as.adminRepo.UpdateSender(ctx, nil, sender)
	if err != nil {
		return dto.SenderResponse{}, dto.ErrUpdateSender
	}

	res := dto.SenderResponse{
		ID:          sender.ID,
		Name:        sender.Name,
		Address:     sender.Address,
		PhoneNumber: sender.PhoneNumber,
	}

	return res, nil
}
func (as *AdminService) DeleteSender(ctx context.Context, req dto.DeleteSenderRequest) (dto.SenderResponse, error) {
	deletedSender, flag, err := as.adminRepo.GetSenderByID(ctx, nil, req.SenderID)
	if err != nil || !flag {
		return dto.SenderResponse{}, dto.ErrSenderNotFound
	}

	err = as.adminRepo.DeleteRecipientByID(ctx, nil, req.SenderID)
	if err != nil {
		return dto.SenderResponse{}, dto.ErrDeletedSender
	}

	res := dto.SenderResponse{
		ID:          deletedSender.ID,
		Name:        deletedSender.Name,
		Address:     deletedSender.Address,
		PhoneNumber: deletedSender.PhoneNumber,
	}

	return res, nil
}
