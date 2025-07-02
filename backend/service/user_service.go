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
		CreateUser(ctx context.Context, req dto.CreateUserRequest) (dto.UserResponse, error)
		ReadAllUserWithPagination(ctx context.Context, req dto.UserPaginationRequest) (dto.UserPaginationResponse, error)
		UpdateUser(ctx context.Context, req dto.UpdateUserRequest) (dto.UserResponse, error)
		DeleteUser(ctx context.Context, req dto.DeleteUserRequest) (dto.UserResponse, error)
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

func (us *UserService) CreateUser(ctx context.Context, req dto.CreateUserRequest) (dto.UserResponse, error) {
	if len(req.Name) < 5 {
		return dto.UserResponse{}, dto.ErrInvalidName
	}

	if !helpers.IsValidEmail(req.Email) {
		return dto.UserResponse{}, dto.ErrInvalidEmail
	}

	_, flag, err := us.userRepo.GetUserByEmail(ctx, nil, req.Email)
	if flag || err == nil {
		return dto.UserResponse{}, dto.ErrEmailAlreadyExists
	}

	if len(req.Password) < 8 {
		return dto.UserResponse{}, dto.ErrInvalidPassword
	}

	user := entity.User{
		ID:       uuid.New(),
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	err = us.userRepo.CreateUser(ctx, nil, user)
	if err != nil {
		return dto.UserResponse{}, dto.ErrRegisterUser
	}

	res := dto.UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	return res, nil
}

func (us *UserService) ReadAllUserWithPagination(ctx context.Context, req dto.UserPaginationRequest) (dto.UserPaginationResponse, error) {
	dataWithPaginate, err := us.userRepo.GetAllUserWithPagination(ctx, nil, req)
	if err != nil {
		return dto.UserPaginationResponse{}, dto.ErrGetAllUserWithPagination
	}

	var datas []dto.UserResponse
	for _, user := range dataWithPaginate.Users {
		data := dto.UserResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
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

func (us *UserService) UpdateUser(ctx context.Context, req dto.UpdateUserRequest) (dto.UserResponse, error) {
	user, _, err := us.userRepo.GetUserByID(ctx, nil, req.ID)
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

	err = us.userRepo.UpdateUser(ctx, nil, user)
	if err != nil {
		return dto.UserResponse{}, dto.ErrUpdateUser
	}

	res := dto.UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	return res, nil
}

func (us *UserService) DeleteUser(ctx context.Context, req dto.DeleteUserRequest) (dto.UserResponse, error) {
	deletedUser, _, err := us.userRepo.GetUserByID(ctx, nil, req.UserID)
	if err != nil {
		return dto.UserResponse{}, dto.ErrGetUserByID
	}

	err = us.userRepo.DeleteUserByID(ctx, nil, req.UserID)
	if err != nil {
		return dto.UserResponse{}, dto.ErrDeleteUserByID
	}

	res := dto.UserResponse{
		ID:    deletedUser.ID,
		Name:  deletedUser.Name,
		Email: deletedUser.Email,
	}

	return res, nil
}
