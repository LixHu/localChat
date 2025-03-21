# Chat API 项目

## 项目概述
基于Gin框架实现的智能对话API服务，集成Ollama大模型能力，提供流式聊天接口和角色管理功能。

## 功能特性
- 支持流式对话交互
- 可配置的对话角色模板
- RESTful API接口管理
- 基于Gin的高性能路由

## 技术栈
- Golang 1.20+
- Gin Web框架
- Ollama本地大模型

## 安装运行
```bash
# 安装依赖
go mod tidy

# 启动服务
go run main.go

# 确保Ollama服务运行在默认端口（11434）
ollama serve
```

## API接口示例

### 流式聊天
```curl
POST /api/chat
{
  "message": "你好",
  "role": "通用助手"
}
```

### 角色管理
```curl
# 获取所有角色
GET /api/roles

# 创建新角色
POST /api/roles
{
  "name": "翻译助手",
  "template": "你擅长中英互译，保持专业术语准确性"
}
```

## 角色配置
角色模板存储在`/api/controller/role.go`中，支持通过API动态添加新的对话角色模板。