package dto

import (
	"errors"

	"github.com/Amierza/TitipanQ/backend/entity"
	"github.com/google/uuid"
)

const (
	// ====================================== Failed ======================================
	MESSAGE_FAILED_GET_DATA_FROM_BODY = "failed get data from body"
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

	// ====================================== Success ======================================
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
)

var (
	// Token
	ErrGenerateAccessToken     = errors.New("failed to generate access token")
	ErrGenerateRefreshToken    = errors.New("failed to generate refresh token")
	ErrUnexpectedSigningMethod = errors.New("unexpected signing method")
	ErrDecryptToken            = errors.New("failed to decrypt token")
	ErrTokenInvalid            = errors.New("token invalid")
	ErrValidateToken           = errors.New("failed to validate token")
	// Middleware
	ErrDeniedAccess           = errors.New("denied access")
	ErrGetPermissionsByRoleID = errors.New("failed get all permission by role id")
	// Input Validation
	ErrInvalidName       = errors.New("failed invalid name")
	ErrInvalidEmail      = errors.New("failed invalid email")
	ErrInvalidPassword   = errors.New("failed invalid password")
	ErrFormatPhoneNumber = errors.New("failed standarize phone number input")
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
	// Company
	ErrGetCompanyByID = errors.New("failed get company by id")
	// Role
	ErrGetRoleFromName  = errors.New("failed get role by name")
	ErrGetRoleFromToken = errors.New("failed get role from token")
	ErrGetRoleFromID    = errors.New("failed get role by role id")
)

type (
	// Authentication
	RegisterRequest struct {
		Name        string    `json:"user_name" form:"name"`
		Email       string    `json:"user_email" form:"email"`
		Password    string    `json:"user_password" form:"password"`
		PhoneNumber string    `json:"user_phone_number" form:"phone_number"`
		Address     string    `json:"user_address" form:"address"`
		CompanyID   uuid.UUID `json:"company_id" form:"company_id"`
	}
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

	// Company
	CompanyResponse struct {
		ID      *uuid.UUID `json:"company_id"`
		Name    string     `json:"company_name"`
		Address string     `json:"company_address"`
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
	AllUserRepositoryResponse struct {
		PaginationResponse
		Users []entity.User
	}
	CreateUserRequest struct {
		Name        string    `json:"user_name" form:"name"`
		Email       string    `json:"user_email" form:"email"`
		Password    string    `json:"user_password" form:"password"`
		PhoneNumber string    `json:"user_phone_number" form:"phone_number"`
		Address     string    `json:"user_address" form:"address"`
		CompanyID   uuid.UUID `json:"company_id" form:"company_id"`
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
	UserPaginationRequest struct {
		PaginationRequest
		UserID string `form:"user_id"`
	}
	UserPaginationResponse struct {
		PaginationResponse
		Data []UserResponse `json:"data"`
	}
	UserPaginationRepositoryResponse struct {
		PaginationResponse
		Users []entity.User
	}
)
