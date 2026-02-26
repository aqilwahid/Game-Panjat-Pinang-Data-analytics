const socket = typeof io !== 'undefined' ? io() : null;

// --- OBYEK AUDIO ---
const bgmAudio = document.getElementById('bgm-audio');
const correctAudio = document.getElementById('correct-audio');
const wrongAudio = document.getElementById('wrong-audio');
const winAudio = document.getElementById('win-audio');

bgmAudio.volume = 0.3;
let isBgmPlaying = false;

function toggleBGM() {
    if (isBgmPlaying) {
        bgmAudio.pause();
        isBgmPlaying = false;
        document.getElementById('btn-audio-toggle').innerText = "🔇";
    } else {
        bgmAudio.play().catch(e => console.log("Audio autoplay dicegah browser:", e));
        isBgmPlaying = true;
        document.getElementById('btn-audio-toggle').innerText = "🔊";
    }
}

function playSound(type) {
    if (type === 'correct') { correctAudio.currentTime = 0; correctAudio.play().catch(e => { }); }
    else if (type === 'wrong') { wrongAudio.currentTime = 0; wrongAudio.play().catch(e => { }); }
    else if (type === 'win') { winAudio.currentTime = 0; winAudio.play().catch(e => { }); }
}


// --- CORE FUNCTIONS ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

let myName = "";
let myRole = ""; // "p1" atau "p2"

function startMatchmaking() {
    myName = document.getElementById('input-my-name').value.trim();
    if (!myName) myName = "Anonim";

    if (!isBgmPlaying) toggleBGM();

    if (socket) {
        socket.emit('find_match', myName);
    } else {
        alert("Gagal koneksi ke Server Node.js!");
    }
}

// SOCKET EVENTS PADA KLIEN
if (socket) {
    socket.on('waiting_for_opponent', () => {
        showScreen('screen-waiting');
    });

    socket.on('match_found', (data) => {
        showScreen('screen-game');

        // Identifikasi posisiku
        if (data.p1Name === myName) { myRole = "p1"; }
        else { myRole = "p2"; }

        // Update UI Nama & Coba pudarkan arena
        document.getElementById('display-p1-name').innerText = data.p1Name;
        document.getElementById('display-p2-name').innerText = data.p2Name;
        document.getElementById('multiplayer-arena').style.opacity = "1";
        document.getElementById('multiplayer-arena').style.pointerEvents = "auto";

        showToast("Lawan Ditemukan! Bersiap...", "correct");
    });

    socket.on('new_question', (qPayload) => {
        // qPayload = {qIndex, level, questionText, options}

        document.getElementById('question-number').innerText = qPayload.qIndex;
        document.getElementById('level-badge').innerText = qPayload.level;
        document.getElementById('question-container').innerHTML = `<h3>${qPayload.questionText}</h3>`;

        const badge = document.getElementById('level-badge');
        if (qPayload.level === "Mudah") badge.style.background = "#4CAF50";
        else if (qPayload.level === "Sedang") badge.style.background = "#FF9800";
        else badge.style.background = "#F44336";

        // Render Tombol
        renderOptions('p1', qPayload.options, myRole === 'p1');
        renderOptions('p2', qPayload.options, myRole === 'p2');
    });

    socket.on('answer_result', (data) => {
        // Menerima hasil jawaban
        // data: { status, answeredBy (p1/p2), playerName, correctIndex, p1Score, p1Height, p2Score, p2Height }

        // Disable semua tombol segera
        document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

        // Cari tombol yang tadinya benar untuk disorot (walaupun user salah pilih)
        const correctBtns = document.querySelectorAll(`.option-btn.index-${data.correctIndex}`);
        correctBtns.forEach(b => b.classList.add('correct'));

        if (data.status === 'correct') {
            playSound('correct');
            showToast(`${data.playerName} Benar! 🚀`, 'correct');
        } else {
            playSound('wrong');
            showToast(`${data.playerName} Salah! 📉`, 'wrong');

            // Animasi Goyang
            const charId = data.answeredBy === 'p1' ? 'character1' : 'character2';
            document.getElementById(charId).classList.add('shake');
            setTimeout(() => document.getElementById(charId).classList.remove('shake'), 400);
        }

        // Sinkronisasi Ketinggian & Skor berdasarkan wasit server
        syncStats(1, data.p1Score, data.p1Height);
        syncStats(2, data.p2Score, data.p2Height);
    });

    socket.on('game_over', (data) => {
        playSound('win');
        showScreen('screen-result');

        document.getElementById('result-p1-name').innerText = data.p1Name;
        document.getElementById('result-p1-score').innerText = data.p1Score;
        document.getElementById('result-p2-name').innerText = data.p2Name;
        document.getElementById('result-p2-score').innerText = data.p2Score;

        const msg = document.getElementById('result-message');

        if (data.p1Height >= 100 && data.p2Height < 100) {
            msg.innerHTML = `🏆 <strong>${data.p1Name}</strong> mencapai PUNCAK PINANG lebih dulu!`;
        } else if (data.p2Height >= 100 && data.p1Height < 100) {
            msg.innerHTML = `🏆 <strong>${data.p2Name}</strong> mencapai PUNCAK PINANG lebih dulu!`;
        } else if (data.p1Score > data.p2Score) {
            msg.innerHTML = `Waktu Habis! Poin tertinggi diraih oleh <strong>${data.p1Name}</strong>.`;
        } else if (data.p2Score > data.p1Score) {
            msg.innerHTML = `Waktu Habis! Poin tertinggi diraih oleh <strong>${data.p2Name}</strong>.`;
        } else {
            msg.innerHTML = `Pertandingan Sengit Ini Berakhir <strong>SERI!</strong>`;
        }
    });

    socket.on('opponent_disconnected', () => {
        alert("Yah, Lawanmu Terputus / Kabur. Permainan berakhir!");
        window.location.reload();
    });
}

function renderOptions(playerSlot, optionsArray, isMySlot) {
    const container = document.getElementById(`options-${playerSlot}`);
    container.innerHTML = '';

    optionsArray.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = `option-btn index-${index}`;
        btn.innerText = `${String.fromCharCode(65 + index)}. ${opt}`;

        // Hanya bisa diklik jika slot ini milikku
        if (!isMySlot) {
            btn.disabled = true;
        } else {
            btn.onclick = () => {
                // Begitu diklik, kirim tebakan ke server
                socket.emit('submit_answer', index);
                // Matikan dulu tombolnya agar tidak diklik dua kali
                document.querySelectorAll(`#options-${playerSlot} .option-btn`).forEach(b => b.disabled = true);
            };
        }

        container.appendChild(btn);
    });
}

function syncStats(pNum, score, heightPercent) {
    document.getElementById(`character${pNum}`).style.bottom = `calc(${heightPercent}% - 20px)`;
    document.getElementById(`progress-fill-${pNum}`).style.width = `${heightPercent}%`;
    document.getElementById(`height-text-${pNum}`).innerText = heightPercent;
    document.getElementById(`score-p${pNum}`).innerText = score;
}

function showToast(message, type) {
    const toast = document.getElementById('feedback-toast');
    toast.innerText = message;
    toast.className = `feedback-toast ${type}`;

    setTimeout(() => {
        toast.className = 'feedback-toast hidden text-center';
    }, 1800);
}
