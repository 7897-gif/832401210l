// 后端API地址，部署后替换为线上地址
const API_BASE_URL = "http://localhost:5000/api";

let currentExpression = "";

const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const historyListEl = document.getElementById("historyList");

window.onload = function() {
    fetchHistory();
};

function appendChar(char) {
    currentExpression += char;
    updateDisplay();
}

function clearAll() {
    currentExpression = "";
    resultEl.textContent = "0";
    updateDisplay();
}

function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

function updateDisplay() {
    let displayExpr = currentExpression
        .replace(/\*/g, "×")
        .replace(/\//g, "÷")
        .replace(/-/g, "−");
    expressionEl.textContent = displayExpr;
}

async function calculate() {
    if (!currentExpression.trim()) {
        resultEl.textContent = "0";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/calculate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                expression: currentExpression
            })
        });

        const data = await response.json();

        if (data.success) {
            resultEl.textContent = data.result;
            fetchHistory();
        } else {
            resultEl.textContent = "错误";
            alert(data.message);
        }
    } catch (error) {
        resultEl.textContent = "连接失败";
        alert("无法连接到后端服务，请检查服务是否启动");
        console.error(error);
    }
}

async function fetchHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/history`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            renderHistory(data.data);
        } else {
            historyListEl.innerHTML = '<div class="empty-tip">暂无历史记录</div>';
        }
    } catch (error) {
        console.error("获取历史失败:", error);
    }
}

function renderHistory(historyList) {
    historyListEl.innerHTML = "";
    historyList.forEach(item => {
        const itemEl = document.createElement("div");
        itemEl.className = "history-item";
        
        const displayExpr = item.expression
            .replace(/\*/g, "×")
            .replace(/\//g, "÷")
            .replace(/-/g, "−");

        itemEl.innerHTML = `
            <div class="history-content">
                <div class="history-expression">${displayExpr}</div>
                <div class="history-result">${item.result}</div>
                <div class="history-time">${item.time}</div>
            </div>
            <button class="btn-delete" onclick="deleteHistory(${item.id})">删除</button>
        `;
        historyListEl.appendChild(itemEl);
    });
}

async function deleteHistory(id) {
    if (!confirm("确定删除这条记录吗？")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/history/${id}`, {
            method: "DELETE"
        });
        const data = await response.json();

        if (data.success) {
            fetchHistory();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("删除失败");
        console.error(error);
    }
}

async function clearAllHistory() {
    if (!confirm("确定清空所有历史记录吗？此操作不可恢复！")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/history`, {
            method: "DELETE"
        });
        const data = await response.json();

        if (data.success) {
            fetchHistory();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("清空失败");
        console.error(error);
    }
}

// 键盘快捷键支持（扩展功能）
document.addEventListener("keydown", function(e) {
    const key = e.key;
    if (/[0-9+\-*/().]/.test(key)) {
        appendChar(key);
    } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        backspace();
    } else if (key === "Escape") {
        clearAll();
    }
});
