#!/bin/bash

# 番茄鐘應用程式啟動腳本

echo "🍅 啟動番茄鐘應用程式..."

# 切換到專案目錄
cd "$(dirname "$0")"

# 啟動本地伺服器
echo "📡 啟動本地伺服器 (http://localhost:8000)..."
python3 -m http.server 8000 &

# 記錄伺服器 PID
SERVER_PID=$!
echo $SERVER_PID > .server.pid

# 等待伺服器啟動
sleep 2

# 在瀏覽器中開啟
echo "🌐 在瀏覽器中開啟..."
open http://localhost:8000/

echo ""
echo "✅ 番茄鐘已啟動！"
echo "📝 伺服器 PID: $SERVER_PID"
echo "⚠️  關閉此終端視窗將停止伺服器"
echo "🛑 要停止伺服器，請執行: kill $SERVER_PID"
echo ""
echo "按 Ctrl+C 停止伺服器..."

# 等待使用者中斷
wait $SERVER_PID
