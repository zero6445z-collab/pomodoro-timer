/**
 * StorageManager - 負責數據持久化儲存
 */
class StorageManager {
    constructor() {
        this.storageKey = 'pomodoroTimer';
        this.initializeStorage();
    }

    /**
     * 初始化儲存空間
     */
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const defaultData = {
                settings: {
                    workDuration: 25,
                    shortBreakDuration: 5,
                    longBreakDuration: 15,
                    soundEnabled: true,
                    notificationEnabled: true,
                    autoStartBreaks: false,
                    autoStartPomodoros: false,
                    darkMode: false
                },
                sessions: [],
                stats: {
                    totalCount: 0,
                    todayCount: 0,
                    weekCount: 0,
                    todayMinutes: 0,
                    todayBreaks: 0
                }
            };
            this.saveData(defaultData);
        }
    }

    /**
     * 取得所有數據
     */
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('讀取數據失敗:', error);
            return null;
        }
    }

    /**
     * 儲存所有數據
     */
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('儲存數據失敗:', error);
            return false;
        }
    }

    /**
     * 取得設定
     */
    getSettings() {
        const data = this.getData();
        return data ? data.settings : null;
    }

    /**
     * 儲存設定
     */
    saveSettings(settings) {
        const data = this.getData();
        if (data) {
            data.settings = { ...data.settings, ...settings };
            return this.saveData(data);
        }
        return false;
    }

    /**
     * 儲存番茄鐘完成記錄
     */
    savePomodoroSession(type, duration, completed = true) {
        const data = this.getData();
        if (data) {
            const session = {
                timestamp: Date.now(),
                type: type, // 'work', 'shortBreak', 'longBreak'
                duration: duration,
                completed: completed,
                date: new Date().toLocaleDateString('zh-TW')
            };

            data.sessions.push(session);

            // 更新統計
            if (type === 'work' && completed) {
                data.stats.totalCount++;
                data.stats.todayCount++;
                data.stats.todayMinutes += duration;
            } else if ((type === 'shortBreak' || type === 'longBreak') && completed) {
                data.stats.todayBreaks++;
            }

            return this.saveData(data);
        }
        return false;
    }

    /**
     * 取得今日統計
     */
    getTodayStats() {
        const data = this.getData();
        if (!data) return null;

        const today = new Date().toLocaleDateString('zh-TW');
        const todaySessions = data.sessions.filter(session => session.date === today);

        const workSessions = todaySessions.filter(s => s.type === 'work' && s.completed);
        const breakSessions = todaySessions.filter(s => (s.type === 'shortBreak' || s.type === 'longBreak') && s.completed);

        return {
            count: workSessions.length,
            minutes: workSessions.reduce((sum, s) => sum + s.duration, 0),
            breaks: breakSessions.length
        };
    }

    /**
     * 取得本週統計
     */
    getWeekStats() {
        const data = this.getData();
        if (!data) return null;

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weekSessions = data.sessions.filter(session => {
            return new Date(session.timestamp) >= weekAgo && session.type === 'work' && session.completed;
        });

        return {
            count: weekSessions.length,
            minutes: weekSessions.reduce((sum, s) => sum + s.duration, 0)
        };
    }

    /**
     * 取得所有歷史記錄
     */
    getAllSessions() {
        const data = this.getData();
        return data ? data.sessions : [];
    }

    /**
     * 清除今日統計
     */
    resetTodayStats() {
        const data = this.getData();
        if (data) {
            data.stats.todayCount = 0;
            data.stats.todayMinutes = 0;
            data.stats.todayBreaks = 0;
            return this.saveData(data);
        }
        return false;
    }

    /**
     * 清除所有歷史記錄
     */
    clearAllHistory() {
        const data = this.getData();
        if (data) {
            data.sessions = [];
            data.stats = {
                totalCount: 0,
                todayCount: 0,
                weekCount: 0,
                todayMinutes: 0,
                todayBreaks: 0
            };
            return this.saveData(data);
        }
        return false;
    }

    /**
     * 匯出數據（供使用者下載）
     */
    exportData() {
        const data = this.getData();
        return JSON.stringify(data, null, 2);
    }

    /**
     * 匯入數據
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return this.saveData(data);
        } catch (error) {
            console.error('匯入數據失敗:', error);
            return false;
        }
    }
}

// 建立全域實例
const storage = new StorageManager();
