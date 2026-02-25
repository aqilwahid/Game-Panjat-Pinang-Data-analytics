// --- OBYEK AUDIO ---
const bgmAudio = document.getElementById('bgm-audio');
const correctAudio = document.getElementById('correct-audio');
const wrongAudio = document.getElementById('wrong-audio');
const winAudio = document.getElementById('win-audio');

bgmAudio.volume = 0.3; // Volume BGM agar tidak terlalu keras
let isBgmPlaying = false;

function toggleBGM() {
    if (isBgmPlaying) {
        bgmAudio.pause();
        isBgmPlaying = false;
        document.getElementById('btn-audio-toggle').innerText = "🔇";
    } else {
        // Harus ada interaksi user baru browser izinkan play()
        bgmAudio.play().catch(e => console.log("Audio autoplay dicegah browser:", e));
        isBgmPlaying = true;
        document.getElementById('btn-audio-toggle').innerText = "🔊";
    }
}

// Mainkan Efek Suara
function playSound(type) {
    if (type === 'correct') {
        correctAudio.currentTime = 0;
        correctAudio.play().catch(e => { });
    } else if (type === 'wrong') {
        wrongAudio.currentTime = 0;
        wrongAudio.play().catch(e => { });
    } else if (type === 'win') {
        winAudio.currentTime = 0;
        winAudio.play().catch(e => { });
    }
}


// --- BANK SOAL ---
const questions = [
    { level: "Mudah", question: "Analitik jenis apakah yang berfokus pada pertanyaan 'Apa yang telah terjadi?' (Meringkas fakta)?", options: ["Prediktif", "Deskriptif", "Preskriptif", "Diagnostik"], correctIndex: 1 },
    { level: "Mudah", question: "Manakah jenis analitik yang bertugas merekomendasikan keputusan atau tindakan terbaik?", options: ["Preskriptif", "Deskriptif", "Diagnostik", "Prediktif"], correctIndex: 0 },
    { level: "Mudah", question: "Analitik yang mencari 'Mengapa sesuatu terjadi?' disebut...", options: ["Diagnostik", "Preskriptif", "Prediktif", "Deskriptif"], correctIndex: 0 },
    { level: "Sedang", question: "Pak Andi melihat dashboard, bulan Agustus turun 15% dibanding Juli. Kegiatan ini termasuk analitik...", options: ["Preskriptif", "Prediktif", "Diagnostik", "Deskriptif"], correctIndex: 3 },
    { level: "Sedang", question: "Sistem Bank menilai prospek kredit peminjam di masa depan berdasarkan histori. Ini adalah analitik...", options: ["Prediktif", "Preskriptif", "Diagnostik", "Sosial"], correctIndex: 0 },
    { level: "Sedang", question: "Mesin merekomenasikan Manajer menempatkan es krim di depan kasir saat suhu panas. Ini analitik...", options: ["Deskriptif", "Preskriptif", "Diagnostik", "Prediktif"], correctIndex: 1 },
    { level: "Susah", question: "Scatter Plot antara 'Tingkat Kemiskinan' & 'Kriminalitas' untuk melihat korelasi adalah...", options: ["Prediktif", "Diagnostik", "Preskriptif", "Deskriptif"], correctIndex: 1 },
    { level: "Susah", question: "Garis putus-putus pada line-chart yang memperpanjang tren masa lalu ke masa depan mewakili analitik...", options: ["Deskriptif", "Prediktif", "Diagnostik", "Preskriptif"], correctIndex: 1 },
    { level: "Susah", question: "Fitur rute alternatif tercepat pada aplikasi Navigator (GPS) mewakili analitik level...", options: ["Preskriptif", "Prediktif", "Diagnostik", "Deskriptif"], correctIndex: 0 },
    { level: "Susah", question: "Metode Linier Programming untuk alokasi budget marketing maksimal profit ada di wilayah...", options: ["Preskriptif", "Diagnostik", "Deskriptif", "Prediktif"], correctIndex: 0 }
];


// --- STATE MANAGEMENT ---
let p1 = { name: "Pemain 1", score: 0, height: 0 };
let p2 = { name: "Pemain 2", score: 0, height: 0 };

let currentQuestionIndex = 0;
let selectedQuestions = [];
let isAnswering = false; // Flag untuk sistem "Rebutan"


// --- CORE FUNCTIONS ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function shuffleArray(array) {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// Inisiasi Pemain & Game
function initiateGame() {
    const input1 = document.getElementById('input-p1-name').value.trim();
    const input2 = document.getElementById('input-p2-name').value.trim();

    p1.name = input1 || "Pemain 1 (Merah)";
    p2.name = input2 || "Pemain 2 (Biru)";

    document.getElementById('display-p1-name').innerText = p1.name;
    document.getElementById('display-p2-name').innerText = p2.name;

    // Pastikan BGM nyala jika user mengeklik mulai
    if (!isBgmPlaying) toggleBGM();

    p1.score = 0; p1.height = 0;
    p2.score = 0; p2.height = 0;
    currentQuestionIndex = 0;

    selectedQuestions = shuffleArray(questions).slice(0, 10);

    updateUI();
    showScreen('screen-game');
    loadQuestion();
}


function loadQuestion() {
    if (currentQuestionIndex >= selectedQuestions.length) {
        endGame();
        return;
    }

    isAnswering = false; // Buka kunci rebutan
    const q = selectedQuestions[currentQuestionIndex];

    document.getElementById('question-number').innerText = currentQuestionIndex + 1;
    document.getElementById('level-badge').innerText = q.level;

    const badge = document.getElementById('level-badge');
    if (q.level === "Mudah") badge.style.background = "#4CAF50";
    else if (q.level === "Sedang") badge.style.background = "#FF9800";
    else badge.style.background = "#F44336";

    document.getElementById('question-container').innerHTML = `<h3>${q.question}</h3>`;

    // Render Ulang Tombol Kedua Pemain
    renderOptions('p1', q);
    renderOptions('p2', q);
}


function renderOptions(playerKey, q) {
    const container = document.getElementById(`options-${playerKey}`);
    container.innerHTML = '';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = `${String.fromCharCode(65 + index)}. ${opt}`;

        // Klik Jawaban
        btn.onclick = () => handleAnswer(playerKey, index, btn, q.correctIndex);
        container.appendChild(btn);
    });
}


function handleAnswer(playerKey, selectedIndex, btnElement, correctIndex) {
    if (isAnswering) return; // Jika sisi lain sudah menekan duluan
    isAnswering = true; // Kunci sistem

    // Disable semua tombol di layar
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    const isCorrect = (selectedIndex === correctIndex);
    const player = playerKey === 'p1' ? p1 : p2;
    const opponent = playerKey === 'p1' ? p2 : p1;

    const charElemId = playerKey === 'p1' ? 'character1' : 'character2';

    if (isCorrect) {
        playSound('correct');
        btnElement.classList.add('correct');
        showToast(`${player.name} Benar! 🚀`, 'correct');

        player.height += 15; // Naik lebih cepat saat rebutan
        player.score += 20;
    } else {
        playSound('wrong');
        btnElement.classList.add('wrong');
        showToast(`${player.name} Salah! 📉`, 'wrong');

        document.getElementById(charElemId).classList.add('shake');
        setTimeout(() => document.getElementById(charElemId).classList.remove('shake'), 400);

        player.height -= 10;
        if (player.height < 0) player.height = 0;
    }

    updateUI();

    // Tunggu sesaat sebelum pindah soal (agar efek & toast terlihat)
    setTimeout(() => {
        if (p1.height >= 100 || p2.height >= 100) {
            endGame(); // Ada yang sampai puncak duluan
        } else {
            currentQuestionIndex++;
            loadQuestion();
        }
    }, 1800);
}


function updateUI() {
    // Batasi maksimum 100%
    if (p1.height > 100) p1.height = 100;
    if (p2.height > 100) p2.height = 100;

    // Pemain 1
    document.getElementById('character1').style.bottom = `calc(${p1.height}% - 20px)`;
    document.getElementById('progress-fill-1').style.width = `${p1.height}%`;
    document.getElementById('height-text-1').innerText = p1.height;
    document.getElementById('score-p1').innerText = p1.score;

    // Pemain 2
    document.getElementById('character2').style.bottom = `calc(${p2.height}% - 20px)`;
    document.getElementById('progress-fill-2').style.width = `${p2.height}%`;
    document.getElementById('height-text-2').innerText = p2.height;
    document.getElementById('score-p2').innerText = p2.score;
}

function showToast(message, type) {
    const toast = document.getElementById('feedback-toast');
    toast.innerText = message;
    toast.className = `feedback-toast ${type}`;

    setTimeout(() => {
        toast.className = 'feedback-toast hidden text-center';
    }, 1500);
}

// Skenario Akhir Permainan
function endGame() {
    playSound('win');
    showScreen('screen-result');

    // Fill Scores
    document.getElementById('result-p1-name').innerText = p1.name;
    document.getElementById('result-p1-score').innerText = p1.score;

    document.getElementById('result-p2-name').innerText = p2.name;
    document.getElementById('result-p2-score').innerText = p2.score;

    const msg = document.getElementById('result-message');

    // Cek siapa Pemenang
    let winnerText = "";
    if (p1.height >= 100 && p2.height < 100) {
        winnerText = `🏆 <strong>${p1.name}</strong> berhasil menyentuh PUNCAK PINANG lebih dulu!`;
    } else if (p2.height >= 100 && p1.height < 100) {
        winnerText = `🏆 <strong>${p2.name}</strong> berhasil menyentuh PUNCAK PINANG lebih dulu!`;
    } else if (p1.score > p2.score) {
        winnerText = `Permainan selesai! Skor tertinggi diraih oleh <strong>${p1.name}</strong>.`;
    } else if (p2.score > p1.score) {
        winnerText = `Permainan selesai! Skor tertinggi diraih oleh <strong>${p2.name}</strong>.`;
    } else {
        winnerText = `Luar Biasa, Pertandingan berakhir <strong>SERI!</strong>`;
    }

    msg.innerHTML = winnerText;
}
