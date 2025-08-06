package routes

import (
	"github.com/Amierza/TitipanQ/backend/handler"
	"github.com/Amierza/TitipanQ/backend/middleware"
	"github.com/Amierza/TitipanQ/backend/service"
	"github.com/gin-gonic/gin"
)

func Admin(route *gin.Engine, adminHandler handler.IAdminHandler, jwtService service.IJWTService) {
	routes := route.Group("/api/v1/admin")
	{
		// Authentication
		routes.POST("/login", adminHandler.Login)
		routes.POST("/refresh-token", adminHandler.RefreshToken)

		routes.Use(middleware.Authentication(jwtService), middleware.RouteAccessControl(jwtService))
		{
			// User
			routes.POST("/create-user", adminHandler.CreateUser)
			routes.GET("/get-all-user", adminHandler.ReadAllUser)
			routes.GET("/get-detail-user/:id", adminHandler.GetDetailUser)
			routes.PATCH("/update-user/:id", adminHandler.UpdateUser)
			routes.DELETE("/delete-user/:id", adminHandler.DeleteUser)

			// Package & Package History
			routes.POST("/create-package", adminHandler.CreatePackage)
			routes.GET("/get-all-package", adminHandler.ReadAllPackage)
			routes.GET("/get-detail-package/:id", adminHandler.GetDetailPackage)
			routes.GET("/get-all-package-history/:id", adminHandler.GetAllPackageHistory)
			routes.PATCH("/update-package/:id", adminHandler.UpdatePackage)
			routes.PATCH("/update-status-packages", adminHandler.UpdateStatusPackages)
			routes.DELETE("/delete-package/:id", adminHandler.DeletePackage)

			// Cron
			routes.POST("/trigger-expire-packages", adminHandler.TriggerExpire)

			// Company
			routes.POST("/create-company", adminHandler.CreateCompany)
			routes.GET("/get-all-company", adminHandler.ReadAllCompany)
			routes.GET("/get-detail-company/:id", adminHandler.GetDetailCompany)
			routes.PATCH("/update-company/:id", adminHandler.UpdateCompany)
			routes.DELETE("/delete-company/:id", adminHandler.DeleteCompany)

			// recipient
			routes.POST("/create-recipient", adminHandler.CreateRecipient)
			routes.GET("/get-all-recipients", adminHandler.ReadAllRecipient)
			routes.GET("/get-detil-recipient/:id", adminHandler.GetDetailRecipient)
			routes.PATCH("/update-recipient/:id", adminHandler.UpdateRecipient)
			routes.DELETE("/deleted-recipient/:id", adminHandler.DeleteRecipient)

			// locker
			routes.POST("/create-locker", adminHandler.CreateLocker)
			routes.GET("/get-all-locker", adminHandler.ReadAllLocker)
			routes.GET("/get-detail-locker/:id", adminHandler.GetDetailLocker)
			routes.PATCH("/update-locker/:id", adminHandler.UpdateLocker)
			routes.DELETE("/delete-locker/:id", adminHandler.DeleteLocker)
		}
	}
}
