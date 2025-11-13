#!/bin/bash

# 番茄鐘啟動腳本
# 雙擊此文件即可在瀏覽器中打開番茄鐘

# 獲取腳本所在目錄
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 在瀏覽器中打開 index.html
open "$DIR/index.html"

echo "✅ 番茄鐘已在瀏覽器中打開！"
echo ""
echo "使用說明："
echo "- 點擊「開始」按鈕開始工作"
echo "- 空格鍵：快速開始/暫停"
echo "- R 鍵：重置計時器"
echo "- 右上角 🌙 按鈕切換夜間模式"
echo ""
echo "祝您工作順利！🍅"
echo ""
echo "（此視窗可以關閉）"

# 等待 3 秒後自動關閉
sleep 3
