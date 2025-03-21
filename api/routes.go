package api

import (
	"aiChat/api/controller"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// 聊天接口
	r.POST("/api/chat", controller.ChatStream)

	// 角色管理接口
	r.GET("/api/roles", controller.ListRoles)
	r.POST("/api/roles", controller.CreateRole)
}
