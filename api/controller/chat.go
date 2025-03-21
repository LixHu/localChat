package controller

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
	"github.com/ollama/ollama/api"
)

type ChatRequest struct {
	Message string `json:"message"`
	Model   string `json:"model"`
}

func ChatStream(c *gin.Context) {
	parsedURL, err := url.Parse("http://0.0.0.0:11434")
	if err != nil {
		fmt.Printf("URL解析失败: %v\n", err)
		c.JSON(500, gin.H{"error": "Ollama连接配置错误"})
		return
	}
	client := api.NewClient(parsedURL, http.DefaultClient)
	var request ChatRequest
	if c.Request.ContentLength == 0 {
		c.JSON(400, gin.H{"error": "请求体不能为空"})
		return
	}

	requestBody, _ := c.GetRawData()
	fmt.Printf("原始请求头: %+v\n", c.Request.Header)
	fmt.Printf("原始请求体: %s\n", string(requestBody))
	c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody)) // 恢复请求体

	if err := c.BindJSON(&request); err != nil {
		fmt.Printf("JSON绑定错误: %v 原始内容: %s\n", err, string(requestBody))
		c.JSON(400, gin.H{"error": fmt.Sprintf("无效的请求格式: %v", err)})
		return
	}
	// fmt.Printf("成功解析请求: %+v\n", request)
	request.Model = "deepseek-r1:7b" // 强制设置模型

	req := &api.ChatRequest{
		Model: request.Model,
		Messages: []api.Message{
			{Role: "user", Content: request.Message},
		},
		Stream: &[]bool{true}[0],
	}
	// fmt.Printf("请求参数：%+v\n", req)
	// fmt.Printf("请求发送时间: %v\n", time.Now().Format(time.RFC3339))
	err = client.Chat(c.Request.Context(), req, func(resp api.ChatResponse) error {
		// fmt.Printf("响应接收时间: %v 内容: %s\n", time.Now().Format(time.RFC3339), resp.Message.Content)
		c.SSEvent("message", gin.H{
			"content": resp.Message.Content,
			"done":    resp.Done,
		})
		c.Writer.Flush()
		return nil
	})
	if err != nil {
		fmt.Printf("Ollama API调用失败: %v\n", err)
		c.SSEvent("error", gin.H{"message": "AI响应失败", "details": err.Error()})
	}
}
