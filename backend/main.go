package main

import (
	"log"
	"os"

	"github.com/Amierza/TitipanQ/backend/cmd"
	"github.com/Amierza/TitipanQ/backend/config/database"
	"github.com/Amierza/TitipanQ/backend/handler"
	"github.com/Amierza/TitipanQ/backend/internal/openai"
	"github.com/Amierza/TitipanQ/backend/internal/whatsapp"
	"github.com/Amierza/TitipanQ/backend/middleware"
	"github.com/Amierza/TitipanQ/backend/repository"
	"github.com/Amierza/TitipanQ/backend/routes"
	"github.com/Amierza/TitipanQ/backend/service"
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron/v3"
)

func main() {
	db := database.SetUpPostgreSQLConnection()
	defer database.ClosePostgreSQLConnection(db)

	if len(os.Args) > 1 {
		cmd.Command(db)
		return
	}

	var (
		jwtService = service.NewJWTService()

		adminRepo    = repository.NewAdminRepository(db)
		adminService = service.NewAdminService(adminRepo, jwtService)
		adminHandler = handler.NewAdminHandler(adminService)
		userRepo     = repository.NewUserRepository(db)
		userService  = service.NewUserService(userRepo, jwtService)
		userHandler  = handler.NewUserHandler(userService)
		// chatbotRepo  = repository.NewChatBotRepository(db)
	)

	c := cron.New()
	c.AddFunc("@daily", func() {
		err := adminService.AutoExpirePackages()
		if err != nil {
			log.Println("[CRON] AutoExpirePackages error:", err)
		} else {
			log.Println("[CRON] AutoExpirePackages success")
		}
	})
	c.Start()

	server := gin.Default()
	server.Use(middleware.CORSMiddleware())

	err := whatsapp.InitClient()
	if err != nil {
		log.Fatalf("failed to initialize WhatsApp client: %v", err)
	}
	whatsapp.InjectRepository(chatbotRepo)

	nlpService := openai.NewChatbotNLPService(os.Getenv("OPENAI_API_KEY"))
	whatsapp.InjectNLPService(nlpService)

	routes.User(server, userHandler, jwtService)
	routes.Admin(server, adminHandler, jwtService)

	server.Static("/assets", "./assets")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	var serve string
	if os.Getenv("APP_ENV") == "localhost" {
		serve = "127.0.0.1:" + port
	} else {
		serve = ":" + port
	}

	if err := server.Run(serve); err != nil {
		log.Fatalf("error running server: %v", err)
	}
}
