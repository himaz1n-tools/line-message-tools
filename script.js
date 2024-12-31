let intervalId; // setIntervalのIDを格納
let sharedCount = 0; // 共有回数のカウント

// ツールを切り替える
function switchTool(tool) {
    document.querySelectorAll('.tool').forEach(t => t.classList.add('hidden'));
    document.getElementById(tool).classList.remove('hidden');

    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tool + 'Button').classList.add('active');
}

// ランダムな数字を生成
function generateRandomNumber(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// ランダムなUnicode文字列を生成
function generateRandomUnicode(length) {
    return Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * (0xD7FF - 0x0020) + 0x0020))).join('');
}

// ランダムな絵文字を生成
function generateRandomEmoji(length) {
    const emojis = ["🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬛", "⬜", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤"];
    return Array.from({ length }, () => emojis[Math.floor(Math.random() * emojis.length)]).join('');
}

// メッセージを生成
function generateDynamicMessage() {
    const activeTool = document.querySelector('.tool:not(.hidden)').id;

    if (activeTool === 'textTool') {
        const message = document.getElementById('message').value.trim();
        const breaks = parseInt(document.getElementById('breaks').value) || 0;
        const lines = parseInt(document.getElementById('lines').value) || 1;
        const format = document.getElementById('format').value;

        if (!message) {
            alert('メッセージを入力してください。');
            return '';
        }

        let dynamicMessage = message;
        for (let i = 0; i < breaks; i++) {
            const randomTag = format === 'binary'
                ? '#' + Array.from({ length: 5 }, () => Math.floor(Math.random() * 2)).join('')
                : '#' + Array.from({ length: 5 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
            
            dynamicMessage += '\n'.repeat(lines) + randomTag;
        }

        return encodeURIComponent(dynamicMessage);
    } else if (activeTool === 'numberTool') {
        const digitCount = parseInt(document.getElementById('digitCount').value) || 5;
        return encodeURIComponent(generateRandomNumber(digitCount));
    } else if (activeTool === 'unicodeTool') {
        const unicodeLength = parseInt(document.getElementById('unicodeLength').value) || 5;
        return encodeURIComponent(generateRandomUnicode(unicodeLength));
    } else if (activeTool === 'emojiTool') {
        const emojiCount = parseInt(document.getElementById('emojiCount').value) || 5;
        const selectedEmoji = document.getElementById('emoji').value;

        if (selectedEmoji === "random") {
            return encodeURIComponent(generateRandomEmoji(emojiCount));
        } else {
            return encodeURIComponent(Array.from({ length: emojiCount }, () => selectedEmoji).join(''));
        }
    }
    return '';
}

// 動的リンクを生成
function generateDynamicLink() {
    const dynamicMessage = generateDynamicMessage();
    return dynamicMessage ? `line://share?text=${dynamicMessage}` : '';
}

// 共有処理を開始
function startSharing() {
    if (intervalId) clearInterval(intervalId);

    const speed = parseInt(document.getElementById('speed').value);
    const countInput = document.getElementById('count').value.trim();
    const isInfinite = countInput.toUpperCase() === 'A';
    const maxCount = isInfinite ? Infinity : parseInt(countInput);

    if (!isInfinite && (isNaN(maxCount) || maxCount <= 0)) {
        alert('有効な共有回数を入力してください (例: 10 または A)。');
        return;
    }

    sharedCount = 0;

    const redirect = () => {
        if (sharedCount >= maxCount) {
            stopSharing();
            alert('指定された回数の共有が完了しました。');
            return;
        }

        const link = generateDynamicLink();
        if (link) {
            window.location.href = link;
            sharedCount++;
        }
    };

    intervalId = setInterval(redirect, speed);

    if (isInfinite) {
        setTimeout(() => {
            if (intervalId) {
                stopSharing();
                alert('無限共有は3分経過したため自動停止しました。');
            }
        }, 180000); // 3分間のタイムアウト
    }
}

// 共有処理を停止
function stopSharing() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        alert('送信を停止しました。');
    }
}

// イベントリスナー設定
document.getElementById('sendButton').addEventListener('click', startSharing);
document.getElementById('stopButton').addEventListener('click', stopSharing);
document.getElementById('textToolButton').addEventListener('click', () => switchTool('textTool'));
document.getElementById('numberToolButton').addEventListener('click', () => switchTool('numberTool'));
document.getElementById('unicodeToolButton').addEventListener('click', () => switchTool('unicodeTool'));
document.getElementById('emojiToolButton').addEventListener('click', () => switchTool('emojiTool'));

// 初期ツール設定
switchTool('textTool');
