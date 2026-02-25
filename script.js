// --- BANK SOAL ---
const questions = [
    // Level 1: Mudah (Definisi)
    {
        level: "Mudah",
        question: "Analitik jenis apakah yang berfokus pada pertanyaan 'Apa yang telah terjadi?' (Meringkas fakta data historis)?",
        options: ["Analitik Prediktif", "Analitik Deskriptif", "Analitik Preskriptif", "Analitik Diagnostik"],
        correctIndex: 1
    },
    {
        level: "Mudah",
        question: "Manakah jenis analitik yang bertugas merekomendasikan keputusan atau tindakan terbaik?",
        options: ["Analitik Preskriptif", "Analitik Deskriptif", "Analitik Diagnostik", "Analitik Prediktif"],
        correctIndex: 0
    },
    {
        level: "Mudah",
        question: "Analitik yang mencari 'Mengapa sesuatu terjadi?' dengan mencari hubungan kausalitas disebut...",
        options: ["Analitik Diagnostik", "Analitik Preskriptif", "Analitik Prediktif", "Analitik Deskriptif"],
        correctIndex: 0
    },
    // Level 2: Sedang (Studi Kasus Bisnis)
    {
        level: "Sedang",
        question: "Pak Andi melihat dashboard penjualan tokonya dan mendapati bahwa penjualan bulan Agustus turun 15% dibanding Juli. Kegiatan yang dilakukan Pak Andi termasuk level analitik...",
        options: ["Preskriptif", "Prediktif", "Diagnostik", "Deskriptif"],
        correctIndex: 3
    },
    {
        level: "Sedang",
        question: "Sebuah bank menggunakan algoritma Machine Learning untuk menilai apakah seorang nasabah baru berpotensi 'Macet' dalam mencicil kredit di masa depan berdasarkan histori peminjam sebelumnya. Ini adalah contoh dari...",
        options: ["Analitik Prediktif", "Analitik Preskriptif", "Analitik Diagnostik", "Analitik Sentimen"],
        correctIndex: 0
    },
    {
        level: "Sedang",
        question: "Setelah mengetahui penjualan es krim selalu naik saat cuaca panas, manajer mini market mendapat rekomendasi dari sistem komputer untuk selalu menempatkan es krim di dekat kasir setiap kali BMKG meramalkan suhu di atas 30°C. Rekomendasi sistem ini adalah hasil dari...",
        options: ["Analitik Deskriptif", "Analitik Preskriptif", "Analitik Diagnostik", "Analitik Prediktif"],
        correctIndex: 1
    },
    // Level 3: Susah (Visual / Kompleks)
    {
        level: "Susah",
        question: "Anda membuat Scatter Plot antara 'Tingkat Kemiskinan' (Sumbu X) dan 'Tingkat Kriminalitas' (Sumbu Y) untuk melihat apakah ada korelasinya. Analisis apa yang sedang Anda lakukan?",
        options: ["Analitik Prediktif", "Analitik Diagnostik", "Analitik Preskriptif", "Analitik Deskriptif"],
        correctIndex: 1
    },
    {
        level: "Susah",
        question: "Line chart yang menunjukkan tren data historis dari tahun 2020 hingga 2023, ditambah dengan 'garis putus-putus' yang meramalkan tren berlanjut hingga tahun 2025 merupakan kombinasi dari analitik...",
        options: ["Deskriptif dan Diagnostik", "Deskriptif dan Prediktif", "Diagnostik dan Preskriptif", "Prediktif dan Preskriptif"],
        correctIndex: 1
    },
    {
        level: "Susah",
        question: "Aplikasi GPS Waze memberitahu bahwa ada kecelakaan di rute A (Deskriptif), kecepatan rata-rata di sana 5km/jam karena macet (Diagnostik), diperkirakan Anda terlambat 40 menit jika lewat sana (Prediktif), dan akhirnya aplikasi *memberikan rute alternatif tercepat* (Rute B). Fitur rute tercepat Waze ini mewakili analitik level apa?",
        options: ["Analitik Preskriptif", "Analitik Prediktif", "Analitik Diagnostik", "Analitik Deskriptif"],
        correctIndex: 0
    },
    {
        level: "Susah",
        question: "Metode optimasi (seperti Linear Programming atau Simulasi Monte Carlo) untuk memaksimalkan profit dan meminimalkan biaya paling banyak digunakan dalam tahap...",
        options: ["Analitik Preskriptif", "Analitik Diagnostik", "Analitik Deskriptif", "Analitik Prediktif"],
        correctIndex: 0
    }
];

// --- STATE MANAGEMENT ---
let currentQuestionIndex = 0;
let score = 0;
let heightPercentage = 0; // 0 hingga 100
let selectedQuestions = []; // Soal yang akan dimainkan di game ini

// --- CORE FUNCTIONS ---

// Menampilkan Screen Tertentu
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Mengacak Soal
function shuffleArray(array) {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// Memulai Game
function startGame() {
    // Reset State
    score = 0;
    heightPercentage = 0;
    currentQuestionIndex = 0;

    // Siapkan 10 soal acak
    selectedQuestions = shuffleArray(questions).slice(0, 10);

    updateCharacterHeight();
    showScreen('screen-game');
    loadQuestion();
}

// Memuat Pertanyaan ke UI
function loadQuestion() {
    if (currentQuestionIndex >= selectedQuestions.length) {
        // Game Selesai (Menang tapi soal habis)
        endGame(true);
        return;
    }

    const q = selectedQuestions[currentQuestionIndex];
    document.getElementById('question-number').innerText = currentQuestionIndex + 1;
    document.getElementById('level-badge').innerText = q.level;

    // Ubah warna badge level
    const badge = document.getElementById('badge');
    if (q.level === "Mudah") document.getElementById('level-badge').style.background = "#4CAF50";
    else if (q.level === "Sedang") document.getElementById('level-badge').style.background = "#FF9800";
    else document.getElementById('level-badge').style.background = "#F44336";

    // Build Question HTML
    let qHTML = `<p>${q.question}</p>`;
    if (q.image) {
        qHTML += `<img src="${q.image}" class="question-image" alt="Ilustrasi Soal">`;
    }
    document.getElementById('question-container').innerHTML = qHTML;

    // Build Options HTML
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = `${String.fromCharCode(65 + index)}. ${opt}`;
        btn.onclick = () => checkAnswer(index, btn, q.correctIndex);
        optionsContainer.appendChild(btn);
    });
}

// Memeriksa Jawaban
function checkAnswer(selectedIndex, btnElement, correctIndex) {
    // Disable all buttons briefly so user can't spam
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    const isCorrect = (selectedIndex === correctIndex);

    if (isCorrect) {
        btnElement.classList.add('correct');
        showToast('Benar! Terus Memanjat! 🚀', 'correct');
        heightPercentage += 10; // Naik 10%
        score += 10;

    } else {
        btnElement.classList.add('wrong');
        // Tunjukkan yang benar
        buttons[correctIndex].classList.add('correct');

        showToast('Salah! Merosot turun! 📉', 'wrong');

        // Shake animasi
        document.getElementById('character').classList.add('shake');
        setTimeout(() => document.getElementById('character').classList.remove('shake'), 400);

        // Merosot 5% (tetapi tidak kurang dari 0)
        heightPercentage -= 5;
        if (heightPercentage < 0) heightPercentage = 0;
    }

    updateCharacterHeight();

    // Lanjut ke soal berikutnya atau cek kemenangan
    setTimeout(() => {
        if (heightPercentage >= 100) {
            endGame(true); // Puncak tercapai
        } else {
            currentQuestionIndex++;
            loadQuestion();
        }
    }, 1500); // Jeda sebelum soal berganti
}

// Update UI Tinggi Karakter
function updateCharacterHeight() {
    // Pastikan tidak lebih dari 100%
    if (heightPercentage > 100) heightPercentage = 100;

    // Update posisi visual karakter di layar
    document.getElementById('character').style.bottom = `calc(${heightPercentage}% - 20px)`;

    // Update progress bar
    document.getElementById('progress-fill').style.width = `${heightPercentage}%`;
    document.getElementById('height-text').innerText = heightPercentage;
}

// Menampilkan Toast Feedback Sementara
function showToast(message, type) {
    const toast = document.getElementById('feedback-toast');
    toast.innerText = message;
    toast.className = `feedback-toast ${type}`;

    setTimeout(() => {
        toast.className = 'feedback-toast hidden';
    }, 1400);
}

// Akhiri Game
function endGame(isWin) {
    showScreen('screen-result');
    document.getElementById('final-score-text').innerText = score;
    const msg = document.getElementById('result-message');

    if (isWin && heightPercentage >= 100) {
        msg.innerHTML = "Luar Biasa! Kamu berhasil mencapai puncak!<br><br>🎁 Kamu mendapatkan semua hadiah di atas! Pengetahuan Analitik Datamu sudah solid.";
    } else {
        msg.innerHTML = "Waktu permainan habis, namun kamu berjuang dengan baik!<br>Ayo pelajari lagi dan coba kembali.";
    }
}
