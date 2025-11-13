/**
 * StatsManager - 統計數據管理
 */
class StatsManager {
    constructor() {
        this.elements = {
            todayCount: null,
            todayMinutes: null,
            todayBreaks: null,
            weekChart: null,
            weekTotal: null,
            weekAverage: null,
            weekBest: null,
            statsTabs: null,
            todayStats: null,
            weekStats: null
        };
        this.chartContext = null;
    }

    /**
     * 初始化 DOM 元素
     */
    init() {
        this.elements.todayCount = document.getElementById('todayCount');
        this.elements.todayMinutes = document.getElementById('todayMinutes');
        this.elements.todayBreaks = document.getElementById('todayBreaks');
        this.elements.weekChart = document.getElementById('weekChart');
        this.elements.weekTotal = document.getElementById('weekTotal');
        this.elements.weekAverage = document.getElementById('weekAverage');
        this.elements.weekBest = document.getElementById('weekBest');
        this.elements.todayStats = document.getElementById('todayStats');
        this.elements.weekStats = document.getElementById('weekStats');

        // 初始化圖表
        if (this.elements.weekChart) {
            this.chartContext = this.elements.weekChart.getContext('2d');
        }

        // 綁定標籤切換事件
        this.bindTabEvents();

        // 載入並顯示統計
        this.updateDisplay();
        this.updateWeekDisplay();

        // 每分鐘檢查是否需要重置今日統計（跨日處理）
        this.checkDayChange();
        setInterval(() => this.checkDayChange(), 60000);
    }

    /**
     * 綁定標籤切換事件
     */
    bindTabEvents() {
        const tabs = document.querySelectorAll('.stats-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    /**
     * 切換標籤
     */
    switchTab(tabName) {
        // 更新標籤狀態
        const tabs = document.querySelectorAll('.stats-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // 更新內容顯示
        if (tabName === 'today') {
            this.elements.todayStats.classList.add('active');
            this.elements.weekStats.classList.remove('active');
        } else if (tabName === 'week') {
            this.elements.todayStats.classList.remove('active');
            this.elements.weekStats.classList.add('active');
            // 切換到週統計時更新圖表
            this.updateWeekDisplay();
        }
    }

    /**
     * 更新統計顯示
     */
    updateDisplay() {
        const stats = storage.getTodayStats();

        if (stats && this.elements.todayCount) {
            this.animateNumber(this.elements.todayCount, stats.count);
            this.animateNumber(this.elements.todayMinutes, stats.minutes);
            this.animateNumber(this.elements.todayBreaks, stats.breaks);
        }
    }

    /**
     * 數字動畫效果
     */
    animateNumber(element, targetValue) {
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;

        if (currentValue === targetValue) return;

        // 添加更新動畫類別
        element.classList.add('number-update');

        // 使用簡單的計數動畫
        const duration = 500; // 毫秒
        const steps = 20;
        const stepValue = (targetValue - currentValue) / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;

            if (currentStep >= steps) {
                element.textContent = targetValue;
                clearInterval(interval);
                setTimeout(() => {
                    element.classList.remove('number-update');
                }, 300);
            } else {
                const newValue = Math.round(currentValue + (stepValue * currentStep));
                element.textContent = newValue;
            }
        }, stepDuration);
    }

    /**
     * 檢查日期變化（跨日重置）
     */
    checkDayChange() {
        const lastDate = localStorage.getItem('pomodoroLastDate');
        const today = new Date().toLocaleDateString('zh-TW');

        if (lastDate && lastDate !== today) {
            // 新的一天，重置今日統計
            storage.resetTodayStats();
            this.updateDisplay();
            console.log('新的一天，統計已重置');
        }

        localStorage.setItem('pomodoroLastDate', today);
    }

    /**
     * 當完成一個番茄鐘時更新統計
     */
    onPomodoroComplete() {
        this.updateDisplay();

        // 添加成功動畫
        if (this.elements.todayCount) {
            this.elements.todayCount.parentElement.classList.add('success-flash');
            setTimeout(() => {
                this.elements.todayCount.parentElement.classList.remove('success-flash');
            }, 600);
        }
    }

    /**
     * 當完成一個休息時更新統計
     */
    onBreakComplete() {
        this.updateDisplay();

        if (this.elements.todayBreaks) {
            this.elements.todayBreaks.parentElement.classList.add('success-flash');
            setTimeout(() => {
                this.elements.todayBreaks.parentElement.classList.remove('success-flash');
            }, 600);
        }
    }

    /**
     * 取得詳細統計資訊
     */
    getDetailedStats() {
        const todayStats = storage.getTodayStats();
        const weekStats = storage.getWeekStats();
        const allSessions = storage.getAllSessions();

        return {
            today: todayStats,
            week: weekStats,
            total: {
                sessions: allSessions.length,
                completedPomodoros: allSessions.filter(s => s.type === 'work' && s.completed).length
            }
        };
    }

    /**
     * 生成統計報告
     */
    generateReport() {
        const stats = this.getDetailedStats();
        const sessions = storage.getAllSessions();

        // 計算平均每日完成數
        const uniqueDays = [...new Set(sessions.map(s => s.date))];
        const avgPerDay = uniqueDays.length > 0 ?
            (stats.total.completedPomodoros / uniqueDays.length).toFixed(1) : 0;

        // 找出最高產的一天
        const dayStats = {};
        sessions.forEach(session => {
            if (session.type === 'work' && session.completed) {
                dayStats[session.date] = (dayStats[session.date] || 0) + 1;
            }
        });

        const bestDay = Object.keys(dayStats).reduce((a, b) =>
            dayStats[a] > dayStats[b] ? a : b, null);
        const bestDayCount = bestDay ? dayStats[bestDay] : 0;

        return {
            總番茄鐘數: stats.total.completedPomodoros,
            今日完成: stats.today.count,
            本週完成: stats.week.count,
            平均每日: avgPerDay,
            最高產日期: bestDay,
            最高產數量: bestDayCount,
            總工作時數: Math.floor(stats.today.minutes / 60)
        };
    }

    /**
     * 匯出統計為 CSV
     */
    exportToCSV() {
        const sessions = storage.getAllSessions();

        let csv = '日期,時間,類型,時長(分鐘),是否完成\n';

        sessions.forEach(session => {
            const date = new Date(session.timestamp);
            const dateStr = date.toLocaleDateString('zh-TW');
            const timeStr = date.toLocaleTimeString('zh-TW');
            const typeStr = session.type === 'work' ? '工作' :
                           session.type === 'shortBreak' ? '短休息' : '長休息';

            csv += `${dateStr},${timeStr},${typeStr},${session.duration},${session.completed ? '是' : '否'}\n`;
        });

        return csv;
    }

    /**
     * 下載統計報告
     */
    downloadReport() {
        const csv = this.exportToCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pomodoro_stats_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 更新週統計顯示
     */
    updateWeekDisplay() {
        const weekData = this.getWeekData();

        // 更新圖表
        this.drawChart(weekData);

        // 更新摘要數據
        const total = weekData.reduce((sum, day) => sum + day.count, 0);
        const average = (total / 7).toFixed(1);
        const best = Math.max(...weekData.map(d => d.count));

        if (this.elements.weekTotal) {
            this.elements.weekTotal.textContent = `${total} 個`;
        }
        if (this.elements.weekAverage) {
            this.elements.weekAverage.textContent = `${average} 個`;
        }
        if (this.elements.weekBest) {
            this.elements.weekBest.textContent = `${best} 個`;
        }
    }

    /**
     * 獲取過去7天的數據
     */
    getWeekData() {
        const weekData = [];
        const today = new Date();

        // 獲取過去7天（包括今天）
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('zh-TW');

            // 獲取該日的統計
            const dayStats = this.getDayStats(dateStr);

            // 星期幾標籤（簡寫）
            const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
            const dayLabel = weekDays[date.getDay()];

            weekData.push({
                label: dayLabel,
                date: dateStr,
                count: dayStats.count,
                minutes: dayStats.minutes
            });
        }

        return weekData;
    }

    /**
     * 獲取指定日期的統計
     */
    getDayStats(dateStr) {
        const sessions = storage.getAllSessions();

        let count = 0;
        let minutes = 0;

        sessions.forEach(session => {
            if (session.date === dateStr && session.type === 'work' && session.completed) {
                count++;
                minutes += session.duration;
            }
        });

        return { count, minutes };
    }

    /**
     * 繪製週統計圖表
     */
    drawChart(weekData) {
        if (!this.chartContext) return;

        const canvas = this.elements.weekChart;
        const ctx = this.chartContext;

        // 清空畫布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 設定畫布大小
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // 計算最大值
        const maxValue = Math.max(...weekData.map(d => d.count), 5); // 至少顯示到5

        // 獲取當前主題色
        const isDarkMode = document.body.classList.contains('dark-mode');
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-primary').trim() || '#e74c3c';
        const textColor = isDarkMode ? '#eaeaea' : '#2c3e50';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        // 繪製網格線和刻度
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'right';

        // Y軸刻度（5條線）
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            const value = Math.round(maxValue * (1 - i / 5));

            // 刻度值
            ctx.fillText(value.toString(), padding - 10, y + 4);

            // 網格線
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }

        // 繪製長條圖
        const barWidth = chartWidth / weekData.length;
        const barGap = barWidth * 0.2;
        const actualBarWidth = barWidth - barGap;

        weekData.forEach((day, index) => {
            const barHeight = (day.count / maxValue) * chartHeight;
            const x = padding + index * barWidth + barGap / 2;
            const y = padding + chartHeight - barHeight;

            // 繪製長條
            ctx.fillStyle = primaryColor;
            ctx.fillRect(x, y, actualBarWidth, barHeight);

            // 繪製數值（在長條頂部）
            if (day.count > 0) {
                ctx.fillStyle = textColor;
                ctx.textAlign = 'center';
                ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
                ctx.fillText(day.count.toString(), x + actualBarWidth / 2, y - 5);
            }

            // 繪製星期標籤
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.font = '12px system-ui, -apple-system, sans-serif';
            ctx.fillText(day.label, x + actualBarWidth / 2, padding + chartHeight + 20);
        });
    }
}

// 建立全域實例
const statsManager = new StatsManager();
