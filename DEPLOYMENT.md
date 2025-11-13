# 🚀 番茄鐘部署指南

這份指南將幫助您將番茄鐘應用部署到 GitHub Pages，讓任何人都能通過網址訪問使用。

---

## 📋 前置準備

- [x] Git 已初始化 ✅
- [x] 文件已提交到 Git ✅
- [ ] GitHub 帳號（如果沒有，請到 https://github.com 註冊）

---

## 🎯 部署步驟

### 步驟 1：在 GitHub 創建新的 Repository

1. 登入 GitHub（https://github.com）
2. 點擊右上角的 **+** 號，選擇 **New repository**
3. 填寫以下資訊：
   - **Repository name**：`pomodoro-timer`（或任何您喜歡的名稱）
   - **Description**：`🍅 一個美觀的番茄鐘工具 - Pomodoro Timer`
   - **Public/Private**：選擇 **Public**（公開才能使用免費的 GitHub Pages）
   - ⚠️ **不要**勾選 "Add a README file"（因為我們已經有了）
4. 點擊 **Create repository**

### 步驟 2：將本地代碼推送到 GitHub

在終端機中執行以下命令（請替換 `YOUR_USERNAME` 為您的 GitHub 用戶名）：

```bash
# 添加遠端 repository
git remote add origin https://github.com/YOUR_USERNAME/pomodoro-timer.git

# 推送代碼到 GitHub
git push -u origin main
```

**如果遇到錯誤**（branch 名稱問題），執行：
```bash
git branch -M main
git push -u origin main
```

### 步驟 3：啟用 GitHub Pages

1. 在 GitHub 的 repository 頁面，點擊 **Settings**（設定）
2. 在左側選單中找到 **Pages**
3. 在 **Source** 部分：
   - Branch: 選擇 **main**
   - Folder: 選擇 **/ (root)**
4. 點擊 **Save**
5. 等待幾分鐘，頁面會顯示：
   ```
   Your site is live at https://YOUR_USERNAME.github.io/pomodoro-timer/
   ```

### 步驟 4：訪問您的番茄鐘

打開瀏覽器，訪問：
```
https://YOUR_USERNAME.github.io/pomodoro-timer/
```

🎉 **完成！** 現在任何人都可以通過這個網址使用您的番茄鐘了！

---

## 📱 分享給朋友

您可以直接分享以下網址給任何人：
```
https://YOUR_USERNAME.github.io/pomodoro-timer/
```

他們只需要打開網址，就能立即使用番茄鐘，無需安裝任何東西！

---

## 🔄 未來更新

當您修改代碼後，只需執行：

```bash
git add .
git commit -m "更新說明"
git push
```

等待幾分鐘，GitHub Pages 會自動更新！

---

## 💡 進階選項

### 使用自訂網域名稱

如果您有自己的網域（例如 `pomodoro.example.com`）：

1. 在 repository 根目錄創建 `CNAME` 文件
2. 文件內容填入您的網域名稱：
   ```
   pomodoro.example.com
   ```
3. 在您的網域提供商設置 DNS：
   - 類型：CNAME
   - 名稱：pomodoro（或您想要的子網域）
   - 值：YOUR_USERNAME.github.io
4. 在 GitHub Pages 設定中填入您的自訂網域

### 縮短網址

如果覺得 GitHub Pages 網址太長，可以使用：
- **Bit.ly**（https://bitly.com）
- **TinyURL**（https://tinyurl.com）
- **Reurl**（https://reurl.cc）

---

## ❓ 常見問題

**Q: 為什麼訪問網址顯示 404？**
A: 剛部署時需要等待 3-5 分鐘，GitHub 需要時間建置網站。

**Q: 更新代碼後，網站沒有變化？**
A: 等待幾分鐘，或清除瀏覽器快取（Ctrl/Cmd + Shift + R）。

**Q: 可以改成 HTTPS 嗎？**
A: GitHub Pages 預設就是 HTTPS，自動提供 SSL 證書。

**Q: 流量有限制嗎？**
A: GitHub Pages 有軟限制（每月 100GB 流量），對個人使用綽綽有餘。

---

## 📞 需要幫助？

如果在部署過程中遇到問題：
1. 檢查 GitHub 的狀態頁面：https://www.githubstatus.com
2. 查看 GitHub Pages 官方文檔：https://docs.github.com/en/pages
3. 確認所有命令都沒有錯誤訊息

---

**祝您部署順利！🎉**
