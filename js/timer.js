/**
 * PomodoroTimer - 番茄鐘核心計時器
 */
class PomodoroTimer {
    constructor() {
        // 計時器狀態
        this.isRunning = false;
        this.isPaused = false;
        this.currentMode = 'work'; // 'work', 'shortBreak', 'longBreak'
        this.pomodoroCount = 0;

        // 時間設定（分鐘）
        this.durations = {
            work: 25,
            shortBreak: 5,
            longBreak: 15
        };

        // 當前時間（秒）
        this.timeLeft = this.durations.work * 60;
        this.totalTime = this.durations.work * 60;

        // 計時器 ID
        this.intervalId = null;

        // 回調函數
        this.onTick = null;
        this.onComplete = null;
        this.onModeChange = null;

        // 載入設定
        this.loadSettings();
    }

    /**
     * 載入儲存的設定
     */
    loadSettings() {
        const settings = storage.getSettings();
        if (settings) {
            this.durations.work = settings.workDuration;
            this.durations.shortBreak = settings.shortBreakDuration;
            this.durations.longBreak = settings.longBreakDuration;
            this.autoStartBreaks = settings.autoStartBreaks;
            this.autoStartPomodoros = settings.autoStartPomodoros;

            // 更新當前時間
            if (!this.isRunning) {
                this.timeLeft = this.durations[this.currentMode] * 60;
                this.totalTime = this.timeLeft;
            }
        }
    }

    /**
     * 開始計時
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;

        // 使用 setInterval 每秒更新
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);

        console.log(`計時器開始: ${this.currentMode} 模式`);
    }

    /**
     * 暫停計時
     */
    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.isPaused = true;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('計時器暫停');
    }

    /**
     * 重置計時器
     */
    reset() {
        this.pause();
        this.timeLeft = this.durations[this.currentMode] * 60;
        this.totalTime = this.timeLeft;
        this.isPaused = false;

        if (this.onTick) {
            this.onTick(this.timeLeft, this.totalTime);
        }

        console.log('計時器重置');
    }

    /**
     * 每秒更新
     */
    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;

            // 觸發 tick 回調
            if (this.onTick) {
                this.onTick(this.timeLeft, this.totalTime);
            }

            // 更新頁面標題顯示剩餘時間
            this.updatePageTitle();

        } else {
            // 時間到
            this.complete();
        }
    }

    /**
     * 計時完成
     */
    complete() {
        this.pause();

        // 儲存完成記錄
        const duration = Math.floor(this.totalTime / 60);
        storage.savePomodoroSession(this.currentMode, duration, true);

        // 更新番茄鐘計數
        if (this.currentMode === 'work') {
            this.pomodoroCount++;
        }

        // 觸發完成回調
        if (this.onComplete) {
            this.onComplete(this.currentMode, this.pomodoroCount);
        }

        // 顯示通知
        if (this.currentMode === 'work') {
            notificationManager.notifyWorkComplete(this.pomodoroCount);
        } else {
            notificationManager.notifyBreakComplete(this.currentMode === 'longBreak');
        }

        // 自動切換模式
        this.autoSwitchMode();

        console.log(`${this.currentMode} 完成！番茄鐘計數: ${this.pomodoroCount}`);
    }

    /**
     * 自動切換模式
     */
    autoSwitchMode() {
        let nextMode;
        let shouldAutoStart = false;

        if (this.currentMode === 'work') {
            // 工作完成後，每 4 個番茄鐘進行長休息
            if (this.pomodoroCount % 4 === 0) {
                nextMode = 'longBreak';
            } else {
                nextMode = 'shortBreak';
            }
            shouldAutoStart = this.autoStartBreaks;
        } else {
            // 休息完成後回到工作
            nextMode = 'work';
            shouldAutoStart = this.autoStartPomodoros;
        }

        this.switchMode(nextMode);

        // 自動開始下一階段
        if (shouldAutoStart) {
            setTimeout(() => {
                this.start();
            }, 1000);
        }
    }

    /**
     * 切換模式
     */
    switchMode(mode) {
        if (!['work', 'shortBreak', 'longBreak'].includes(mode)) {
            console.error('無效的模式:', mode);
            return;
        }

        // 停止當前計時器
        if (this.isRunning) {
            this.pause();
        }

        this.currentMode = mode;
        this.timeLeft = this.durations[mode] * 60;
        this.totalTime = this.timeLeft;

        // 觸發模式切換回調
        if (this.onModeChange) {
            this.onModeChange(mode);
        }

        // 更新顯示
        if (this.onTick) {
            this.onTick(this.timeLeft, this.totalTime);
        }

        console.log(`切換到 ${mode} 模式`);
    }

    /**
     * 更新頁面標題
     */
    updatePageTitle() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        let modeText = '';
        if (this.currentMode === 'work') {
            modeText = '🍅 工作中';
        } else if (this.currentMode === 'shortBreak') {
            modeText = '☕ 短休息';
        } else {
            modeText = '🌟 長休息';
        }

        document.title = this.isRunning ? `${timeString} - ${modeText}` : '🍅 番茄鐘';
    }

    /**
     * 取得格式化的時間
     */
    getFormattedTime() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        return {
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            total: this.timeLeft
        };
    }

    /**
     * 取得進度百分比（用於進度環）
     */
    getProgress() {
        return ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
    }

    /**
     * 設定時長
     */
    setDuration(mode, minutes) {
        this.durations[mode] = minutes;

        // 如果當前是這個模式且未運行，更新時間
        if (this.currentMode === mode && !this.isRunning) {
            this.timeLeft = minutes * 60;
            this.totalTime = this.timeLeft;
            if (this.onTick) {
                this.onTick(this.timeLeft, this.totalTime);
            }
        }
    }

    /**
     * 取得當前狀態
     */
    getState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            currentMode: this.currentMode,
            pomodoroCount: this.pomodoroCount,
            timeLeft: this.timeLeft,
            totalTime: this.totalTime,
            progress: this.getProgress()
        };
    }

    /**
     * 重置番茄鐘計數
     */
    resetPomodoroCount() {
        this.pomodoroCount = 0;
    }
}

// 建立全域實例
const timer = new PomodoroTimer();
