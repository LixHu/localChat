package controller

import (
	"sync"

	"github.com/gin-gonic/gin"
)

type Role struct {
	Name     string `json:"name"`
	Template string `json:"template"`
}

var (
	roles = []Role{
		{
			Name:     "通用助手",
			Template: "你是一个智能助手，擅长回答各种通用问题",
		},
		{
			Name:     "代码专家",
			Template: "你是一个编程助手，能够帮助解决代码问题",
		},
	}
	roleMux sync.Mutex
)

func ListRoles(c *gin.Context) {
	roleMux.Lock()
	defer roleMux.Unlock()
	c.JSON(200, gin.H{"data": roles})
}

func CreateRole(c *gin.Context) {
	var newRole Role
	if err := c.ShouldBindJSON(&newRole); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	roleMux.Lock()
	defer roleMux.Unlock()
	roles = append(roles, newRole)
	c.JSON(201, gin.H{"message": "role created"})
}
