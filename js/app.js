/**
 * App - 主應用程式控制器
 */
class App {
    constructor() {
        // DOM 元素
        this.elements = {
            // 時間顯示
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),

            // 按鈕
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),

            // 模式按鈕
            modeBtns: document.querySelectorAll('.mode-btn'),

            // 狀態
            statusText: document.querySelector('.status-text'),
            pomodoroCount: document.getElementById('pomodoroCount'),

            // 進度環
            progressCircle: document.querySelector('.progress-ring-circle'),

            // 設定
            settingsToggle: document.getElementById('settingsToggle'),
            settingsPanel: document.getElementById('settingsPanel'),
            saveSettings: document.getElementById('saveSettings'),
            workDuration: document.getElementById('workDuration'),
            shortBreakDuration: document.getElementById('shortBreakDuration'),
            longBreakDuration: document.getElementById('longBreakDuration'),
            soundEnabled: document.getElementById('soundEnabled'),
            notificationEnabled: document.getElementById('notificationEnabled'),
            autoStartBreaks: document.getElementById('autoStartBreaks'),
            autoStartPomodoros: document.getElementById('autoStartPomodoros'),

            // 時長調整按鈕
            decrease5: document.getElementById('decrease5'),
            decrease1: document.getElementById('decrease1'),
            increase1: document.getElementById('increase1'),
            increase5: document.getElementById('increase5')
        };

        // 進度環配置（會根據屏幕尺寸動態調整）
        this.updateProgressCircleRadius();

        this.init();
    }

    /**
     * 更新進度環半徑（根據屏幕尺寸）
     */
    updateProgressCircleRadius() {
        const width = window.innerWidth;

        if (width <= 400) {
            // 極小手機：160px 圓圈
            this.progressCircleRadius = 75;
        } else if (width <= 640) {
            // 一般手機：180px 圓圈
            this.progressCircleRadius = 85;
        } else {
            // 桌面：300px 圓圈
            this.progressCircleRadius = 135;
        }

        this.progressCircleCircumference = 2 * Math.PI * this.progressCircleRadius;
    }

    /**
     * 初始化應用程式
     */
    init() {
        // 設定計時器回調
        timer.onTick = (timeLeft, totalTime) => this.updateDisplay(timeLeft, totalTime);
        timer.onComplete = (mode, count) => this.onTimerComplete(mode, count);
        timer.onModeChange = (mode) => this.onModeChange(mode);

        // 綁定事件監聽器
        this.bindEvents();

        // 初始化統計管理器
        statsManager.init();

        // 載入設定
        this.loadSettings();

        // 初始化顯示
        this.updateDisplay(timer.timeLeft, timer.totalTime);
        this.updatePomodoroCount();

        // 請求通知權限
        notificationManager.requestPermission();

        // 設定進度環
        this.initProgressCircle();

        // 監聽視窗大小變化
        window.addEventListener('resize', () => {
            this.updateProgressCircleRadius();
            this.initProgressCircle();
            this.updateDisplay(timer.timeLeft, timer.totalTime);
        });

        console.log('番茄鐘應用程式已啟動');
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 開始按鈕
        this.elements.startBtn.addEventListener('click', () => {
            timer.start();
            this.updateButtons();
            this.addButtonAnimation(this.elements.startBtn);
        });

        // 暫停按鈕
        this.elements.pauseBtn.addEventListener('click', () => {
            timer.pause();
            this.updateButtons();
            this.addButtonAnimation(this.elements.pauseBtn);
        });

        // 重置按鈕
        this.elements.resetBtn.addEventListener('click', () => {
            if (timer.isRunning || timer.isPaused) {
                if (confirm('確定要重置計時器嗎？')) {
                    timer.reset();
                    this.updateButtons();
                    this.addButtonAnimation(this.elements.resetBtn);
                }
            } else {
                timer.reset();
                this.addButtonAnimation(this.elements.resetBtn);
            }
        });

        // 模式切換按鈕
        this.elements.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                timer.switchMode(mode);
                this.updateButtons();
                this.updateModeButtons(mode);
            });
        });

        // 設定開關
        this.elements.settingsToggle.addEventListener('click', () => {
            this.elements.settingsPanel.classList.toggle('open');
        });

        // 儲存設定
        this.elements.saveSettings.addEventListener('click', () => {
            this.saveSettings();
        });

        // 時長調整按鈕
        this.elements.decrease5.addEventListener('click', () => {
            this.adjustTime(-5);
        });

        this.elements.decrease1.addEventListener('click', () => {
            this.adjustTime(-1);
        });

        this.elements.increase1.addEventListener('click', () => {
            this.adjustTime(1);
        });

        this.elements.increase5.addEventListener('click', () => {
            this.adjustTime(5);
        });

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            // 空格鍵：開始/暫停
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (timer.isRunning) {
                    timer.pause();
                } else {
                    timer.start();
                }
                this.updateButtons();
            }

            // R 鍵：重置
            if (e.code === 'KeyR' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                timer.reset();
                this.updateButtons();
            }
        });

        // 視窗失去焦點時的處理
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && timer.isRunning) {
                // 視窗重新獲得焦點，更新顯示
                this.updateDisplay(timer.timeLeft, timer.totalTime);
            }
        });
    }

    /**
     * 更新時間顯示
     */
    updateDisplay(timeLeft, totalTime) {
        const time = timer.getFormattedTime();

        this.elements.minutes.textContent = time.minutes;
        this.elements.seconds.textContent = time.seconds;

        // 更新進度環
        this.updateProgressCircle(timeLeft, totalTime);

        // 檢查是否接近結束（最後 1 分鐘）
        if (timeLeft <= 60 && timeLeft > 0 && timer.isRunning) {
            document.querySelector('.time-circle').classList.add('time-warning');
        } else {
            document.querySelector('.time-circle').classList.remove('time-warning');
        }
    }

    /**
     * 更新按鈕狀態
     */
    updateButtons() {
        if (timer.isRunning) {
            this.elements.startBtn.disabled = true;
            this.elements.pauseBtn.disabled = false;
            // 計時器運行時禁用時長調整按鈕
            this.elements.decrease5.disabled = true;
            this.elements.decrease1.disabled = true;
            this.elements.increase1.disabled = true;
            this.elements.increase5.disabled = true;
        } else {
            this.elements.startBtn.disabled = false;
            this.elements.pauseBtn.disabled = true;
            // 計時器停止時啟用時長調整按鈕
            this.elements.decrease5.disabled = false;
            this.elements.decrease1.disabled = false;
            this.elements.increase1.disabled = false;
            this.elements.increase5.disabled = false;
        }
    }

    /**
     * 更新模式按鈕
     */
    updateModeButtons(activeMode) {
        this.elements.modeBtns.forEach(btn => {
            if (btn.dataset.mode === activeMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * 計時器完成回調
     */
    onTimerComplete(mode, count) {
        // 添加完成動畫
        document.querySelector('.time-circle').classList.add('timer-complete');
        setTimeout(() => {
            document.querySelector('.time-circle').classList.remove('timer-complete');
        }, 1500);

        // 更新番茄鐘計數
        this.updatePomodoroCount();

        // 更新統計
        if (mode === 'work') {
            statsManager.onPomodoroComplete();
        } else {
            statsManager.onBreakComplete();
        }

        // 更新按鈕狀態
        this.updateButtons();
    }

    /**
     * 模式切換回調
     */
    onModeChange(mode) {
        // 更新狀態文字
        const statusTexts = {
            work: '工作中',
            shortBreak: '短休息',
            longBreak: '長休息'
        };
        this.elements.statusText.textContent = statusTexts[mode];

        // 更新模式按鈕
        this.updateModeButtons(mode);

        // 更新主題色
        const modeClasses = ['mode-work', 'mode-short-break', 'mode-long-break'];
        modeClasses.forEach(cls => document.body.classList.remove(cls));

        const modeMap = {
            work: 'mode-work',
            shortBreak: 'mode-short-break',
            longBreak: 'mode-long-break'
        };

        document.body.classList.add(modeMap[mode]);

        // 添加過渡動畫
        document.body.classList.add('mode-transition');
        setTimeout(() => {
            document.body.classList.remove('mode-transition');
        }, 500);
    }

    /**
     * 更新番茄鐘計數顯示
     */
    updatePomodoroCount() {
        const oldCount = parseInt(this.elements.pomodoroCount.textContent);
        const newCount = timer.pomodoroCount;

        this.elements.pomodoroCount.textContent = newCount;

        if (newCount > oldCount) {
            this.elements.pomodoroCount.parentElement.classList.add('pomodoro-added');
            setTimeout(() => {
                this.elements.pomodoroCount.parentElement.classList.remove('pomodoro-added');
            }, 500);
        }
    }

    /**
     * 初始化進度環
     */
    initProgressCircle() {
        this.elements.progressCircle.style.strokeDasharray = this.progressCircleCircumference;
        this.elements.progressCircle.style.strokeDashoffset = 0;
    }

    /**
     * 更新進度環
     */
    updateProgressCircle(timeLeft, totalTime) {
        const progress = ((totalTime - timeLeft) / totalTime);
        const offset = this.progressCircleCircumference * (1 - progress);
        this.elements.progressCircle.style.strokeDashoffset = offset;
    }

    /**
     * 調整時長（分鐘）
     */
    adjustTime(minutes) {
        // 只有在計時器停止時才能調整
        if (timer.isRunning) {
            return;
        }

        // 計算新的時長（秒）
        const currentMinutes = Math.floor(timer.timeLeft / 60);
        const newMinutes = Math.max(1, Math.min(120, currentMinutes + minutes)); // 限制在 1-120 分鐘

        // 更新計時器時長
        timer.timeLeft = newMinutes * 60;
        timer.totalTime = newMinutes * 60;

        // 更新顯示
        this.updateDisplay(timer.timeLeft, timer.totalTime);

        // 添加動畫效果
        const buttons = [
            this.elements.decrease5,
            this.elements.decrease1,
            this.elements.increase1,
            this.elements.increase5
        ];

        buttons.forEach(btn => {
            if (!btn.disabled) {
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 100);
            }
        });
    }

    /**
     * 按鈕點擊動畫
     */
    addButtonAnimation(button) {
        button.classList.add('btn-clicked');
        setTimeout(() => {
            button.classList.remove('btn-clicked');
        }, 300);
    }

    /**
     * 載入設定
     */
    loadSettings() {
        const settings = storage.getSettings();
        if (settings) {
            this.elements.workDuration.value = settings.workDuration;
            this.elements.shortBreakDuration.value = settings.shortBreakDuration;
            this.elements.longBreakDuration.value = settings.longBreakDuration;
            this.elements.soundEnabled.checked = settings.soundEnabled;
            this.elements.notificationEnabled.checked = settings.notificationEnabled;
            this.elements.autoStartBreaks.checked = settings.autoStartBreaks || false;
            this.elements.autoStartPomodoros.checked = settings.autoStartPomodoros || false;

            // 應用設定
            notificationManager.setSoundEnabled(settings.soundEnabled);
            notificationManager.setNotificationEnabled(settings.notificationEnabled);
        }
    }

    /**
     * 儲存設定
     */
    saveSettings() {
        const settings = {
            workDuration: parseInt(this.elements.workDuration.value),
            shortBreakDuration: parseInt(this.elements.shortBreakDuration.value),
            longBreakDuration: parseInt(this.elements.longBreakDuration.value),
            soundEnabled: this.elements.soundEnabled.checked,
            notificationEnabled: this.elements.notificationEnabled.checked,
            autoStartBreaks: this.elements.autoStartBreaks.checked,
            autoStartPomodoros: this.elements.autoStartPomodoros.checked
        };

        // 驗證設定
        if (settings.workDuration < 1 || settings.workDuration > 60) {
            alert('工作時長必須在 1-60 分鐘之間');
            return;
        }
        if (settings.shortBreakDuration < 1 || settings.shortBreakDuration > 30) {
            alert('短休息時長必須在 1-30 分鐘之間');
            return;
        }
        if (settings.longBreakDuration < 1 || settings.longBreakDuration > 60) {
            alert('長休息時長必須在 1-60 分鐘之間');
            return;
        }

        // 儲存到 localStorage
        storage.saveSettings(settings);

        // 更新計時器設定
        timer.setDuration('work', settings.workDuration);
        timer.setDuration('shortBreak', settings.shortBreakDuration);
        timer.setDuration('longBreak', settings.longBreakDuration);
        timer.autoStartBreaks = settings.autoStartBreaks;
        timer.autoStartPomodoros = settings.autoStartPomodoros;

        // 更新通知設定
        notificationManager.setSoundEnabled(settings.soundEnabled);
        notificationManager.setNotificationEnabled(settings.notificationEnabled);

        // 如果當前未運行，重置計時器以應用新時長
        if (!timer.isRunning) {
            timer.reset();
        }

        // 顯示成功提示
        this.elements.saveSettings.textContent = '✓ 已儲存';
        this.elements.saveSettings.classList.add('success-flash');

        setTimeout(() => {
            this.elements.saveSettings.textContent = '儲存設定';
            this.elements.saveSettings.classList.remove('success-flash');
        }, 2000);

        // 關閉設定面板
        setTimeout(() => {
            this.elements.settingsPanel.classList.remove('open');
        }, 1000);
    }

}

// 當 DOM 載入完成後啟動應用程式
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
