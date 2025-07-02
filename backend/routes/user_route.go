package routes

import (
	"github.com/Amierza/TitipanQ/backend/handler"
	"github.com/Amierza/TitipanQ/backend/service"
	"github.com/gin-gonic/gin"
)

func User(route *gin.Engine, userHandler handler.IUserHandler, jwtService service.IJWTService) {
	routes := route.Group("/api/v1/users")
	{
		routes.POST("/", userHandler.CreateUser)
		routes.GET("/", userHandler.ReadAllUser)
		routes.PATCH("/:id", userHandler.UpdateUser)
		routes.DELETE("/:id", userHandler.DeleteUser)
	}
}
