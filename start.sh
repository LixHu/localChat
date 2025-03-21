#!/bin/bash
go mod tidy

cd chat-front
pnpm install
pnpm build

sleep 2
#移动并覆盖dist目录下的所有内容到上层dist目录中
cp -r dist/* ../dist/

cd ../

go run main.go 
