package dto

import (
	"errors"
	"mime/multipart"
	"time"

	"github.com/Amierza/TitipanQ/backend/entity"
	"github.com/google/uuid"
)

const (
	// ====================================== Failed ======================================
	MESSAGE_FAILED_GET_DATA_FROM_BODY = "failed get data from body"
	// Cron
	MESSAGE_FAILED_AUTO_CHANGE_STATUS = "failed packages expired successfully"
	// File
	MESSAGE_FAILED_READ_PHOTO = "failed read photo"
	MESSAGE_FAILED_OPEN_PHOTO = "failed open photo"
	// PARSE
	MESSAGE_FAILED_PARSE_UUID = "failed parse string to uuid"
	// Authentication
	MESSAGE_FAILED_REGISTER_USER = "failed register user"
	MESSAGE_FAILED_LOGIN_USER    = "failed login user"
	MESSAGE_FAILED_REFRESH_TOKEN = "failed refresh token"
	// Middleware
	MESSAGE_FAILED_PROSES_REQUEST             = "failed proses request"
	MESSAGE_FAILED_ACCESS_DENIED              = "failed access denied"
	MESSAGE_FAILED_TOKEN_NOT_FOUND            = "failed token not found"
	MESSAGE_FAILED_TOKEN_NOT_VALID            = "failed token not valid"
	MESSAGE_FAILED_TOKEN_DENIED_ACCESS        = "failed token denied access"
	MESSAGE_FAILED_INAVLID_ENPOINTS_TOKEN     = "failed invalid endpoints in token"
	MESSAGE_FAILED_INAVLID_ROUTE_FORMAT_TOKEN = "failed invalid route format in token"
	// User
	MESSAGE_FAILED_CREATE_USER     = "failed create user"
	MESSAGE_FAILED_GET_DETAIL_USER = "failed get detail user"
	MESSAGE_FAILED_GET_LIST_USER   = "failed get list user"
	MESSAGE_FAILED_UPDATE_USER     = "failed update user"
	MESSAGE_FAILED_DELETE_USER     = "failed delete user"
	// Package
	MESSAGE_FAILED_CREATE_PACKAGE           = "failed create package"
	MESSAGE_FAILED_GET_DETAIL_PACKAGE       = "failed get detail package"
	MESSAGE_FAILED_GET_LIST_PACKAGE         = "failed get list package"
	MESSAGE_FAILED_GET_LIST_PACKAGE_HISTORY = "failed get list package history"
	MESSAGE_FAILED_UPDATE_PACKAGE           = "failed update package"
	MESSAGE_FAILED_DELETE_PACKAGE           = "failed delete package"
	// Company
	MESSAGE_FAILED_CREATE_COMPANY     = "failed create company"
	MESSAGE_FAILED_GET_DETAIL_COMPANY = "failed get detail company"
	MESSAGE_FAILED_GET_LIST_COMPANY   = "failed get list company"
	MESSAGE_FAILED_UPDATE_COMPANY     = "failed update company"
	MESSAGE_FAILED_DELETE_COMPANY     = "failed delete company"

	// ====================================== Success ======================================
	// Cron
	MESSAGE_SUCCESS_AUTO_CHANGE_STATUS = "success packages expired successfully"
	// Authentication
	MESSAGE_SUCCESS_REGISTER_USER = "success register user"
	MESSAGE_SUCCESS_LOGIN_USER    = "success login user"
	MESSAGE_SUCCESS_REFRESH_TOKEN = "success refresh token"
	// User
	MESSAGE_SUCCESS_CREATE_USER     = "success create user"
	MESSAGE_SUCCESS_GET_DETAIL_USER = "success get detail user"
	MESSAGE_SUCCESS_GET_LIST_USER   = "success get list user"
	MESSAGE_SUCCESS_UPDATE_USER     = "success update user"
	MESSAGE_SUCCESS_DELETE_USER     = "success delete user"
	// Package
	MESSAGE_SUCCESS_CREATE_PACKAGE           = "success create package"
	MESSAGE_SUCCESS_GET_DETAIL_PACKAGE       = "success get detail package"
	MESSAGE_SUCCESS_GET_LIST_PACKAGE         = "success get list package"
	MESSAGE_SUCCESS_GET_LIST_PACKAGE_HISTORY = "success get list package history"
	MESSAGE_SUCCESS_UPDATE_PACKAGE           = "success update package"
	MESSAGE_SUCCESS_DELETE_PACKAGE           = "success delete package"
	// Company
	MESSAGE_SUCCESS_CREATE_COMPANY     = "success create company"
	MESSAGE_SUCCESS_GET_DETAIL_COMPANY = "success get detail company"
	MESSAGE_SUCCESS_GET_LIST_COMPANY   = "success get list company"
	MESSAGE_SUCCESS_UPDATE_COMPANY     = "success update company"
	MESSAGE_SUCCESS_DELETE_COMPANY     = "success delete company"
)

var (
	// Token
	ErrGenerateAccessToken     = errors.New("failed to generate access token")
	ErrGenerateRefreshToken    = errors.New("failed to generate refresh token")
	ErrUnexpectedSigningMethod = errors.New("unexpected signing method")
	ErrDecryptToken            = errors.New("failed to decrypt token")
	ErrTokenInvalid            = errors.New("token invalid")
	ErrValidateToken           = errors.New("failed to validate token")
	// File
	ErrInvalidExtensionPhoto = errors.New("only jpg/jpeg/png allowed")
	ErrCreateFile            = errors.New("failed create file")
	ErrSaveFile              = errors.New("failed save file")
	// Parse
	ErrParseUUID = errors.New("failed parse uuid")
	// Middleware
	ErrDeniedAccess           = errors.New("denied access")
	ErrGetPermissionsByRoleID = errors.New("failed get all permission by role id")
	// Input Validation
	ErrInvalidName                 = errors.New("failed invalid name")
	ErrInvalidEmail                = errors.New("failed invalid email")
	ErrInvalidPassword             = errors.New("failed invalid password")
	ErrFormatPhoneNumber           = errors.New("failed standarize phone number input")
	ErrMissingRequiredField        = errors.New("failed missing required field")
	ErrDescriptionPackageToShort   = errors.New("failed description package to short (min 5 word)")
	ErrInvalidStatusTransition     = errors.New("failed invalid package status transition")
	ErrCannotChangeStatusToExpired = errors.New("failed cannot change status to expired")
	// Email
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrEmailNotFound      = errors.New("email not found")
	// Password
	ErrPasswordNotMatch = errors.New("password not match")
	// Authentication
	ErrRegisterUser = errors.New("failed to register user")
	// User
	ErrUserNotFound             = errors.New("user not found")
	ErrGetAllUserWithPagination = errors.New("failed get list user with pagination")
	ErrGetUserByID              = errors.New("failed get user by id")
	ErrUpdateUser               = errors.New("failed to update user")
	ErrPasswordSame             = errors.New("failed new password same as old password")
	ErrHashPassword             = errors.New("failed hash password")
	ErrDeleteUserByID           = errors.New("failed delete user by id")
	ErrGetUserIDFromToken       = errors.New("failed get user id from token")
	// Package & Package History
	ErrCreatePackage               = errors.New("failed create package")
	ErrCreatePackageHistory        = errors.New("failed create package history")
	ErrGetAllPackageWithPagination = errors.New("failed get list package with pagination")
	ErrGetAllPackageHistory        = errors.New("failed get list package history")
	ErrPackageNotFound             = errors.New("failed package not found")
	ErrInvalidPackageType          = errors.New("failed invalid package type")
	ErrInvalidPackageStatus        = errors.New("failed invalid package status")
	ErrUpdatePackage               = errors.New("failed update package")
	// Company
	ErrGetCompanyByID              = errors.New("failed get company by id")
	ErrCreateCompany               = errors.New("failed to create company")
	ErrCompanyNotFound             = errors.New("company not found")
	ErrGetAllCompany               = errors.New("failed get all company")
	ErrGetAllCompanyWithPagination = errors.New("failed to get list company with pagination")
	ErrUpdateCompany               = errors.New("failed to update company")
	ErrDeleteCompany               = errors.New("failed to delete company")
	ErrCompanyIDRequired           = errors.New("company ID is required")
	ErrInvalidCompanyName          = errors.New("failed invalid company name")
	ErrInvalidCompanyAddress       = errors.New("failed invalid company address")
	ErrSameCompanyID               = errors.New("failed same company id")
	// Role
	ErrGetRoleFromName  = errors.New("failed get role by name")
	ErrGetRoleFromToken = errors.New("failed get role from token")
	ErrGetRoleFromID    = errors.New("failed get role by role id")
)

type (
	// Authentication
	LoginRequest struct {
		Email    string `json:"user_email" form:"email"`
		Password string `json:"user_password" form:"password"`
	}
	LoginResponse struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	RefreshTokenRequest struct {
		RefreshToken string `json:"refresh_token"`
	}
	RefreshTokenResponse struct {
		AccessToken string `json:"access_token"`
	}

	// Role
	RoleResponse struct {
		ID   *uuid.UUID `json:"role_id"`
		Name string     `json:"role_name"`
	}

	// User
	UserResponse struct {
		ID          uuid.UUID       `json:"user_id"`
		Name        string          `json:"user_name"`
		Email       string          `json:"user_email"`
		Password    string          `json:"user_password"`
		PhoneNumber string          `json:"user_phone_number"`
		Address     string          `json:"user_address"`
		Company     CompanyResponse `json:"company"`
		Role        RoleResponse    `json:"role"`
	}
	CreateUserRequest struct {
		Name        string     `json:"user_name" form:"user_name"`
		Email       string     `json:"user_email" form:"user_email"`
		Password    string     `json:"user_password" form:"user_password"`
		PhoneNumber string     `json:"user_phone_number" form:"user_phone_number"`
		Address     string     `json:"user_address,omitempty" form:"user_address"`
		CompanyID   *uuid.UUID `json:"company_id" form:"company_id"`
	}
	UpdateUserRequest struct {
		ID          string     `json:"-"`
		Name        string     `json:"user_name,omitempty"`
		Email       string     `json:"user_email,omitempty"`
		Password    string     `json:"user_password,omitempty"`
		PhoneNumber string     `json:"user_phone_number,omitempty"`
		Address     string     `json:"user_address,omitempty"`
		CompanyID   *uuid.UUID `json:"company_id,omitempty"`
	}
	DeleteUserRequest struct {
		UserID string `json:"-"`
	}
	UserPaginationResponse struct {
		PaginationResponse
		Data []UserResponse `json:"data"`
	}
	UserPaginationRepositoryResponse struct {
		PaginationResponse
		Users []entity.User
	}

	// Package
	CreatePackageRequest struct {
		Description string                `json:"package_description" form:"package_description"`
		Image       string                `json:"package_image" form:"package_image"`
		Type        entity.Type           `json:"package_type" form:"package_type"`
		UserID      uuid.UUID             `json:"user_id" form:"user_id"`
		FileHeader  *multipart.FileHeader `json:"fileheader,omitempty"`
		FileReader  multipart.File        `json:"filereader,omitempty"`
	}
	PackageResponse struct {
		ID           uuid.UUID     `json:"package_id"`
		TrackingCode string        `json:"package_tracking_code"`
		Description  string        `json:"package_description"`
		Image        string        `json:"package_image"`
		BarcodeImage string        `json:"package_barcode_image"`
		Type         entity.Type   `json:"package_type"`
		Status       entity.Status `json:"package_status"`
		CompletedAt  *time.Time    `json:"package_completed_at"`
		ExpiredAt    *time.Time    `json:"package_expired_at"`
		User         UserResponse  `json:"user"`
		entity.TimeStamp
	}
	PackagePaginationResponse struct {
		PaginationResponse
		Data []PackageResponse `json:"data"`
	}
	PackagePaginationRepositoryResponse struct {
		PaginationResponse
		Packages []entity.Package
	}
	UpdatePackageRequest struct {
		ID          string                `json:"-"`
		Description string                `json:"package_description,omitempty" form:"package_description"`
		Image       string                `json:"package_image,omitempty" form:"package_image"`
		Type        entity.Type           `json:"package_type,omitempty" form:"package_type"`
		Status      entity.Status         `json:"package_status,omitempty" form:"package_status"`
		CompletedAt *time.Time            `json:"package_completed_at,omitempty" form:"package_completed_at"`
		FileHeader  *multipart.FileHeader `json:"fileheader,omitempty"`
		FileReader  multipart.File        `json:"filereader,omitempty"`
	}
	UserResponseCustom struct {
		ID    uuid.UUID `json:"user_id"`
		Name  string    `json:"user_name"`
		Email string    `json:"user_email"`
	}
	PackageHistoryResponse struct {
		ID        uuid.UUID          `json:"history_id"`
		Status    entity.Status      `json:"history_status"`
		ChangedBy UserResponseCustom `json:"changed_by"`
		CreatedAt time.Time          `json:"created_at"`
	}
	UpdatePackageResponse struct {
		ID           uuid.UUID          `json:"package_id"`
		TrackingCode string             `json:"package_tracking_code"`
		Description  string             `json:"package_description"`
		Image        string             `json:"package_image"`
		BarcodeImage string             `json:"package_barcode_image"`
		Type         entity.Type        `json:"package_type"`
		Status       entity.Status      `json:"package_status"`
		CompletedAt  *time.Time         `json:"package_completed_at"`
		ExpiredAt    *time.Time         `json:"package_expired_at"`
		User         UserResponseCustom `json:"user_id"`
		ChangedBy    UserResponseCustom `json:"changed_by"`
		entity.TimeStamp
	}
	DeletePackageRequest struct {
		PackageID string `json:"-"`
	}

	// Company
	CreateCompanyRequest struct {
		Name    string `json:"company_name" binding:"required"`
		Address string `json:"company_address" binding:"required"`
	}
	CompanyResponse struct {
		ID      *uuid.UUID `json:"company_id"`
		Name    string     `json:"company_name"`
		Address string     `json:"company_address"`
	}
	CompanyPaginationResponse struct {
		PaginationResponse
		Data []CompanyResponse `json:"data"`
	}
	CompanyPaginationRepositoryResponse struct {
		PaginationResponse
		Companies []entity.Company
	}
	UpdateCompanyRequest struct {
		ID      string `json:"-"`
		Name    string `json:"company_name,omitempty"`
		Address string `json:"company_address,omitempty"`
	}
	UpdateCompanyResponse struct {
		ID      *uuid.UUID `json:"company_id"`
		Name    string     `json:"company_name"`
		Address string     `json:"company_address"`
	}
)
