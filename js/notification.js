/**
 * NotificationManager - 負責通知和音效管理
 */
class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.soundEnabled = true;
        this.notificationEnabled = true;
        this.audioContext = null;
        this.initializeAudio();
    }

    /**
     * 初始化音效系統
     */
    initializeAudio() {
        // 使用 Web Audio API 生成簡單的提示音
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('無法初始化音效系統:', error);
        }
    }

    /**
     * 請求通知權限
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('此瀏覽器不支援桌面通知');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    /**
     * 顯示桌面通知
     */
    showNotification(title, message, options = {}) {
        if (!this.notificationEnabled) return;

        if (this.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: options.icon || '',
                badge: options.badge || '',
                tag: options.tag || 'pomodoro',
                requireInteraction: options.requireInteraction || false,
                silent: !this.soundEnabled
            });

            // 點擊通知時聚焦到視窗
            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // 自動關閉通知
            setTimeout(() => {
                notification.close();
            }, options.duration || 5000);

            return notification;
        } else {
            // 降級方案：使用瀏覽器標題閃爍
            this.flashTitle(title, message);
        }
    }

    /**
     * 播放音效
     */
    playSound(type = 'complete') {
        if (!this.soundEnabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // 根據類型設定不同的音調
            if (type === 'work-complete') {
                // 工作完成：愉快的雙音
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.15); // E5
            } else if (type === 'break-complete') {
                // 休息完成：提醒的三音
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime); // E5
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime + 0.1); // C5
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.2); // E5
            } else {
                // 預設音效
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            }

            oscillator.type = 'sine';

            // 音量包絡
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('播放音效失敗:', error);
        }
    }

    /**
     * 標題閃爍提醒（當不支援通知時的降級方案）
     */
    flashTitle(message, duration = 5000) {
        const originalTitle = document.title;
        let isOriginal = true;
        let count = 0;
        const maxFlashes = Math.floor(duration / 1000);

        const interval = setInterval(() => {
            document.title = isOriginal ? message : originalTitle;
            isOriginal = !isOriginal;
            count++;

            if (count >= maxFlashes * 2) {
                clearInterval(interval);
                document.title = originalTitle;
            }
        }, 1000);

        // 視窗獲得焦點時停止閃爍
        const stopFlashing = () => {
            clearInterval(interval);
            document.title = originalTitle;
            window.removeEventListener('focus', stopFlashing);
        };

        window.addEventListener('focus', stopFlashing);
    }

    /**
     * 顯示工作完成通知
     */
    notifyWorkComplete(pomodoroCount) {
        this.showNotification(
            '🍅 工作時段完成！',
            `太棒了！你已經完成了 ${pomodoroCount} 個番茄鐘。該休息一下了！`,
            { requireInteraction: true }
        );
        this.playSound('work-complete');
    }

    /**
     * 顯示休息完成通知
     */
    notifyBreakComplete(isLongBreak = false) {
        const message = isLongBreak
            ? '長休息結束了！準備好繼續工作了嗎？'
            : '短休息結束了！讓我們繼續保持專注！';

        this.showNotification(
            '⏰ 休息時間結束',
            message,
            { requireInteraction: true }
        );
        this.playSound('break-complete');
    }

    /**
     * 設定音效開關
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    /**
     * 設定通知開關
     */
    setNotificationEnabled(enabled) {
        this.notificationEnabled = enabled;
        if (enabled && this.permission !== 'granted') {
            this.requestPermission();
        }
    }

    /**
     * 測試通知和音效
     */
    test() {
        this.showNotification('🧪 測試通知', '如果你看到這個，通知功能正常運作！');
        this.playSound('complete');
    }
}

// 建立全域實例
const notificationManager = new NotificationManager();
