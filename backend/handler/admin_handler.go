package handler

import (
	"net/http"
	"strconv"

	"github.com/Amierza/TitipanQ/backend/dto"
	"github.com/Amierza/TitipanQ/backend/entity"
	"github.com/Amierza/TitipanQ/backend/service"
	"github.com/Amierza/TitipanQ/backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type (
	IAdminHandler interface {
		// Authentication
		Login(ctx *gin.Context)
		RefreshToken(ctx *gin.Context)

		// User
		CreateUser(ctx *gin.Context)
		ReadAllUser(ctx *gin.Context)
		GetDetailUser(ctx *gin.Context)
		UpdateUser(ctx *gin.Context)
		DeleteUser(ctx *gin.Context)

		// Package & Package History & Company
		CreatePackage(ctx *gin.Context)
		ReadAllPackage(ctx *gin.Context)
		GetDetailPackage(ctx *gin.Context)
		GetAllPackageHistory(ctx *gin.Context)
		UpdatePackage(ctx *gin.Context)
		UpdateStatusPackages(ctx *gin.Context)
		DeletePackage(ctx *gin.Context)

		// Cron
		TriggerExpire(ctx *gin.Context)

		// Company
		CreateCompany(ctx *gin.Context)
		ReadAllCompany(ctx *gin.Context)
		GetDetailCompany(ctx *gin.Context)
		UpdateCompany(ctx *gin.Context)
		DeleteCompany(ctx *gin.Context)
	}

	AdminHandler struct {
		adminService service.IAdminService
	}
)

func NewAdminHandler(adminService service.IAdminService) *AdminHandler {
	return &AdminHandler{
		adminService: adminService,
	}
}

// Authentication
func (ah *AdminHandler) Login(ctx *gin.Context) {
	var payload dto.LoginRequest
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.Login(ctx, payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_LOGIN_USER, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_LOGIN_USER, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) RefreshToken(ctx *gin.Context) {
	var payload dto.RefreshTokenRequest
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.RefreshToken(ctx, payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_REFRESH_TOKEN, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_REFRESH_TOKEN, result)
	ctx.AbortWithStatusJSON(http.StatusOK, res)
}

// User
func (ah *AdminHandler) CreateUser(ctx *gin.Context) {
	var payload dto.CreateUserRequest
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.CreateUser(ctx, payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_USER, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_USER, result)
	ctx.AbortWithStatusJSON(http.StatusOK, res)
}
func (ah *AdminHandler) ReadAllUser(ctx *gin.Context) {
	paginationParam := ctx.DefaultQuery("pagination", "true")
	usePagination := paginationParam != "false"

	if !usePagination {
		// Tanpa pagination
		result, err := ah.adminService.ReadAllUserNoPagination(ctx.Request.Context())
		if err != nil {
			res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_LIST_USER, err.Error(), nil)
			ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
			return
		}

		res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_LIST_USER, result)
		ctx.JSON(http.StatusOK, res)
		return
	}

	var payload dto.PaginationRequest
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.ReadAllUserWithPagination(ctx.Request.Context(), payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_LIST_USER, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.Response{
		Status:   true,
		Messsage: dto.MESSAGE_SUCCESS_GET_LIST_USER,
		Data:     result.Data,
		Meta:     result.PaginationResponse,
	}

	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) GetDetailUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	result, err := ah.adminService.GetDetailUser(ctx, idStr)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DETAIL_USER, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_DETAIL_USER, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) UpdateUser(ctx *gin.Context) {
	idStr := ctx.Param("id")

	var payload dto.UpdateUserRequest
	payload.ID = idStr
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.UpdateUser(ctx.Request.Context(), payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_USER, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_USER, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) DeleteUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	var payload dto.DeleteUserRequest
	payload.UserID = idStr
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.DeleteUser(ctx.Request.Context(), payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_DELETE_USER, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_DELETE_USER, result)
	ctx.JSON(http.StatusOK, res)
}

// Cron
func (ah *AdminHandler) TriggerExpire(ctx *gin.Context) {
	err := ah.adminService.AutoExpirePackages()
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DETAIL_USER, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_AUTO_CHANGE_STATUS, nil)
	ctx.JSON(http.StatusOK, res)
}

// Package
func (ah *AdminHandler) CreatePackage(ctx *gin.Context) {
	var payload dto.CreatePackageRequest
	if err := ctx.Request.ParseMultipartForm(32 << 20); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PARSE_MULTIPART_FORM, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	payload.TrackingCode = ctx.PostForm("package_tracking_code")
	payload.Description = ctx.PostForm("package_description")

	fileHeader, err := ctx.FormFile("package_image")
	if err == nil {
		file, err := fileHeader.Open()
		if err != nil {
			res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_OPEN_PHOTO, err.Error(), nil)
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, res)
			return
		}
		defer file.Close()

		payload.FileHeader = fileHeader
		payload.FileReader = file
	}

	payload.Type = entity.Type(ctx.PostForm("package_type"))

	if quantityStr := ctx.PostForm("package_quantity"); quantityStr != "" {
		if quantity64, err := strconv.ParseInt(quantityStr, 10, 64); err == nil {
			payload.Quantity = int(quantity64)
		} else {
			res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PARSE_QUANTITY, err.Error(), nil)
			ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
			return
		}
	}

	payload.SenderName = ctx.PostForm("package_sender_name")
	payload.SenderPhoneNumber = ctx.PostForm("package_sender_phone_number")
	payload.SenderAddress = ctx.PostForm("package_sender_address")

	userIDStr := ctx.PostForm("user_id")
	payload.UserID, err = uuid.Parse(userIDStr)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PARSE_UUID, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.CreatePackage(ctx, payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_PACKAGE, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_PACKAGE, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) ReadAllPackage(ctx *gin.Context) {
	paginationParam := ctx.DefaultQuery("pagination", "true")
	usePagination := paginationParam != "false"
	userID := ctx.Query("user_id")
	pkgType := ctx.Query("type")

	if !usePagination {
		// Tanpa pagination
		result, err := ah.adminService.ReadAllPackageNoPagination(ctx, userID, pkgType)
		if err != nil {
			res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_LIST_PACKAGE, err.Error(), nil)
			ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
			return
		}

		res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_LIST_PACKAGE, result)
		ctx.JSON(http.StatusOK, res)
		return
	}

	var payload dto.PaginationRequest
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.ReadAllPackageWithPagination(ctx, payload, userID, pkgType)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_LIST_PACKAGE, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.Response{
		Status:   true,
		Messsage: dto.MESSAGE_SUCCESS_GET_LIST_PACKAGE,
		Data:     result.Data,
		Meta:     result.PaginationResponse,
	}

	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) GetDetailPackage(ctx *gin.Context) {
	pkgID := ctx.Param("id")
	result, err := ah.adminService.GetDetailPackage(ctx, pkgID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DETAIL_PACKAGE, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_DETAIL_PACKAGE, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) GetAllPackageHistory(ctx *gin.Context) {
	pkgId := ctx.Param("id")
	result, err := ah.adminService.ReadAllPackageHistory(ctx, pkgId)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_LIST_PACKAGE_HISTORY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_LIST_PACKAGE_HISTORY, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) UpdatePackage(ctx *gin.Context) {
	var payload dto.UpdatePackageRequest
	fileHeader, err := ctx.FormFile("package_image")
	if err == nil {
		file, err := fileHeader.Open()
		if err != nil {
			res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_OPEN_PHOTO, err.Error(), nil)
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, res)
			return
		}
		defer file.Close()

		payload.FileHeader = fileHeader
		payload.FileReader = file
	}
	payload.Description = ctx.PostForm("package_description")
	payload.Type = entity.Type(ctx.PostForm("package_type"))

	pkgIdStr := ctx.Param("id")
	payload.ID = pkgIdStr
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.UpdatePackage(ctx, payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_PACKAGE, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_PACKAGE, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) UpdateStatusPackages(ctx *gin.Context) {
	var payload dto.UpdateStatusPackages
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	err := ah.adminService.UpdateStatusPackages(ctx, payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_STATUS_PACKAGES, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_STATUS_PACKAGES, nil)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) DeletePackage(ctx *gin.Context) {
	idStr := ctx.Param("id")
	var payload dto.DeletePackageRequest
	payload.PackageID = idStr
	if err := ctx.ShouldBind(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.DeletePackage(ctx.Request.Context(), payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_DELETE_PACKAGE, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_DELETE_PACKAGE, result)
	ctx.JSON(http.StatusOK, res)
}

// Company
func (ah *AdminHandler) CreateCompany(ctx *gin.Context) {
	var payload dto.CreateCompanyRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.CreateCompany(ctx, payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_COMPANY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_COMPANY, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) ReadAllCompany(ctx *gin.Context) {
	paginationParam := ctx.DefaultQuery("pagination", "true")
	usePagination := paginationParam != "false"

	if !usePagination {
		// Tanpa pagination
		result, err := ah.adminService.ReadAllCompanyNoPagination(ctx)
		if err != nil {
			res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_LIST_COMPANY, err.Error(), nil)
			ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
			return
		}

		res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_LIST_COMPANY, result)
		ctx.JSON(http.StatusOK, res)
		return
	}

	var payload dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.ReadAllCompanyWithPagination(ctx.Request.Context(), payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_LIST_COMPANY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.Response{
		Status:   true,
		Messsage: dto.MESSAGE_SUCCESS_GET_LIST_COMPANY,
		Data:     result.Data,
		Meta:     result.PaginationResponse,
	}
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) GetDetailCompany(ctx *gin.Context) {
	idStr := ctx.Param("id")
	result, err := ah.adminService.GetDetailCompany(ctx.Request.Context(), idStr)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DETAIL_COMPANY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_DETAIL_COMPANY, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) UpdateCompany(ctx *gin.Context) {
	idStr := ctx.Param("id")
	var payload dto.UpdateCompanyRequest
	payload.ID = idStr

	if err := ctx.ShouldBindJSON(&payload); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := ah.adminService.UpdateCompany(ctx, payload)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_COMPANY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_COMPANY, result)
	ctx.JSON(http.StatusOK, res)
}
func (ah *AdminHandler) DeleteCompany(ctx *gin.Context) {
	idStr := ctx.Param("id")
	result, err := ah.adminService.DeleteCompany(ctx.Request.Context(), idStr)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_DELETE_COMPANY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_DELETE_COMPANY, result)
	ctx.JSON(http.StatusOK, res)
}
