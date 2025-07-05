package routes

import (
	"github.com/Amierza/TitipanQ/backend/handler"
	"github.com/Amierza/TitipanQ/backend/middleware"
	"github.com/Amierza/TitipanQ/backend/service"
	"github.com/gin-gonic/gin"
)

func User(route *gin.Engine, userHandler handler.IUserHandler, jwtService service.IJWTService) {
	routes := route.Group("/api/v1/user")
	{
		// Authentiation
		routes.POST("/register", userHandler.Register)
		routes.POST("/login", userHandler.Login)
		routes.POST("/refresh-token", userHandler.RefreshToken)

		routes.GET("/get-all-company", userHandler.ReadAllCompany)

		routes.Use(middleware.Authentication(jwtService), middleware.RouteAccessControl(jwtService))
		{
			// User
			routes.GET("/get-detail-user", userHandler.GetDetailUser)
			routes.PATCH("/update-user", userHandler.UpdateUser)
		}
	}
}
