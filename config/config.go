package config

import (
	"os"
)

type Config struct {
	OllamaURL string
}

var GlobalConfig Config

func init() {
	// 默认配置
	GlobalConfig = Config{
		OllamaURL: "http://ollama:11434",
	}

	// 从环境变量加载配置
	if ollamaURL := os.Getenv("OLLAMA_URL"); ollamaURL != "" {
		GlobalConfig.OllamaURL = ollamaURL
	}
}
