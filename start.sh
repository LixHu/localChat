#!/bin/sh
echo "starting ollama"
ollama serve &

sleep 3

ollama pull deepseek-r1

ollama run deepseek-r1

wait
