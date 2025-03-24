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
1. 确保你当前有Golang环境
2. 克隆项目到本地
3. 安装Ollama环境，直接到[Ollama](https://ollama.com/)官网下载对应平台的安装包
4. 安装DeepSeek模型，目前现在只支持7b版本，后续会搞成可配置的
5. 运行项目
```bash
# 安装依赖
sh start.sh
```
6. 访问URL_ADDRESS:8080/web 查看效果


## 计划
- 使用docker部署，目前只能本地运行
- 上传文件分析
- 模型改为可配置

看看能不能实现的功能：
- 联网搜索
- 调用本地API