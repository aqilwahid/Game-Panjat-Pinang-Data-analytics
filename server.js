const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Sajikan file statis web dari folder root repo saat ini
app.use(express.static(__dirname));

// --- BANK SOAL (SERVER SIDE) ---
const bankSoal = [
    { level: "Mudah", question: "Analitik yang hanya fokus merangkum data historis untuk menjawab 'Apa yang telah terjadi?' disebut...", options: ["Analitik Prediktif", "Analitik Deskriptif", "Analitik Preskriptif", "Analitik Diagnostik"], correctIndex: 1 },
    { level: "Mudah", question: "Manakah analitik yang bertugas mencari korelasi untuk menjawab penyebab atau 'Mengapa sesuatu terjadi'?", options: ["Analitik Preskriptif", "Analitik Deskriptif", "Analitik Diagnostik", "Analitik Prediktif"], correctIndex: 2 },
    { level: "Mudah", question: "Analitik yang menggunakan Machine Learning meramalkan tren di masa depan disebut...", options: ["Analitik Diagnostik", "Analitik Preskriptif", "Analitik Prediktif", "Analitik Deskriptif"], correctIndex: 2 },
    { level: "Sedang", question: "Pak Wahid mendapati penjualan produk sabun bulan lalu turun 20%. Mengetahui angka fakta ini adalah kegiatan dari...", options: ["Analitik Preskriptif", "Analitik Prediktif", "Analitik Diagnostik", "Analitik Deskriptif"], correctIndex: 3 },
    { level: "Sedang", question: "Dashboard BI menampilkan grafik batang (Bar Chart) total transaksi kemarin sebanyak 500 transaksi. Ini merupakan visualisasi dari...", options: ["Analitik Deskriptif", "Analitik Preskriptif", "Analitik Diagnostik", "Analitik Prediksi"], correctIndex: 0 },
    { level: "Sedang", question: "Aplikasi Waze memperkirakan Anda akan tiba di kantor pada pukul 08:15 melihat cuaca dan kecepatan saat ini. Fitur estimasi kedatangan (ETA) ini adalah penerapan dari...", options: ["Analitik Deskriptif", "Analitik Preskriptif", "Analitik Diagnostik", "Analitik Prediktif"], correctIndex: 3 },
    { level: "Susah", question: "Setelah diteliti, ternyata penjualan sabun turun karena bertepatan dengan musim hujan. Kegiatan mencari korelasi antara cuaca vs penjualan ini adalah fungsi dari...", options: ["Analitik Prediktif", "Analitik Diagnostik", "Analitik Preskriptif", "Analitik Deskriptif"], correctIndex: 1 },
    { level: "Susah", question: "Garis putus-putus pada line-chart yang dirancang untuk memperpanjang tren masa lalu ke masa depan mewakili analitik...", options: ["Analitik Deskriptif", "Analitik Prediktif", "Analitik Diagnostik", "Analitik Preskriptif"], correctIndex: 1 },
    { level: "Susah", question: "Waze mengarahkan Anda berbelok ke Jalan B untuk menghindari kemacetan dan menghemat bensin. Saran rute alternatif untuk mencari solusi terbaik ini termasuk kategori...", options: ["Analitik Preskriptif", "Analitik Prediktif", "Analitik Diagnostik", "Analitik Deskriptif"], correctIndex: 0 },
    { level: "Susah", question: "Menerapkan metode algoritma optimasi (seperti Linear Programming) pada sistem Traveloka untuk rekomendasi harga tiket pesawat paling *cuan* merupakan tahap tertinggi analitik, yaitu...", options: ["Analitik Preskriptif", "Analitik Diagnostik", "Analitik Deskriptif", "Analitik Prediktif"], correctIndex: 0 }
];

function shuffleArray(array) {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// --- STATE MANAGEMENT ---
let waitingPlayer = null; // Menampung satu pemain yang sedang menunggu lawan
const activeRooms = {};   // { roomId: { p1: {}, p2: {}, questions: [], currentQ: 0, locked: false } }
let roomCounter = 1;

io.on('connection', (socket) => {
    console.log('Seorang pemain terkoneksi:', socket.id);

    // MATCHMAKING EVENT
    socket.on('find_match', (playerName) => {
        const playerObj = {
            id: socket.id,
            name: playerName || "Anonim",
            score: 0,
            height: 0,
            socket: socket
        };

        if (waitingPlayer && waitingPlayer.id !== socket.id) {
            // Ada lawan! Buat ruangan.
            const roomId = `room_${roomCounter++}`;
            socket.join(roomId);
            waitingPlayer.socket.join(roomId);

            const roomData = {
                roomId: roomId,
                p1: waitingPlayer, // Yang nunggu duluan jadi P1 (Kiri)
                p2: playerObj,     // Yang baru masuk jadi P2 (Kanan)
                questions: shuffleArray(bankSoal).slice(0, 10),
                currentQ: 0,
                locked: false // False artinya tombol soal terbuka
            };

            activeRooms[roomId] = roomData;

            // Beritahu kedua pemain bahwa match dimulai
            const matchInfo = {
                p1Name: roomData.p1.name,
                p2Name: roomData.p2.name
            };

            io.to(roomId).emit('match_found', matchInfo);

            // Bersihkan antrian
            waitingPlayer = null;

            // Kirim soal pertama setelah 2 detik
            setTimeout(() => {
                sendQuestion(roomId);
            }, 2000);

        } else {
            // Belum ada lawan, masukkan ke waitingList
            waitingPlayer = playerObj;
            socket.emit('waiting_for_opponent');
        }
    });

    // ANSWER HANDLING
    socket.on('submit_answer', (answerIndex) => {
        // Cari player ini ada di room mana
        let myRoomId = null;
        let isP1 = false;

        for (let r in activeRooms) {
            if (activeRooms[r].p1.id === socket.id) { myRoomId = r; isP1 = true; break; }
            if (activeRooms[r].p2.id === socket.id) { myRoomId = r; isP1 = false; break; }
        }

        if (!myRoomId) return;

        const room = activeRooms[myRoomId];

        // Cek kalau soal sudah direbut orang lain
        if (room.locked) return;

        // Kunci Rebutan Soal
        room.locked = true;

        const currentQuestion = room.questions[room.currentQ];
        const isCorrect = (answerIndex === currentQuestion.correctIndex);

        const playerRef = isP1 ? room.p1 : room.p2;
        const opponentRef = isP1 ? room.p2 : room.p1;

        if (isCorrect) {
            playerRef.height += 15;
            playerRef.score += 20;
        } else {
            playerRef.height -= 10;
            if (playerRef.height < 0) playerRef.height = 0;
        }

        if (playerRef.height > 100) playerRef.height = 100;

        // Broadcast hasil evaluasi ke KEDUA PEMAIN
        io.to(myRoomId).emit('answer_result', {
            status: isCorrect ? 'correct' : 'wrong',
            answeredBy: isP1 ? 'p1' : 'p2',
            playerName: playerRef.name,
            correctIndex: currentQuestion.correctIndex,
            p1Score: room.p1.score,
            p1Height: room.p1.height,
            p2Score: room.p2.score,
            p2Height: room.p2.height
        });

        // Cek Pemenang
        if (room.p1.height >= 100 || room.p2.height >= 100) {
            setTimeout(() => {
                io.to(myRoomId).emit('game_over', {
                    p1Name: room.p1.name, p1Score: room.p1.score, p1Height: room.p1.height,
                    p2Name: room.p2.name, p2Score: room.p2.score, p2Height: room.p2.height
                });
                delete activeRooms[myRoomId];
            }, 2000);
        } else {
            // Lanjut ke soal berikutnya tanpa peduli salah/benar
            room.currentQ++;
            if (room.currentQ >= room.questions.length) {
                // Kehabisan soal
                setTimeout(() => {
                    io.to(myRoomId).emit('game_over', {
                        p1Name: room.p1.name, p1Score: room.p1.score, p1Height: room.p1.height,
                        p2Name: room.p2.name, p2Score: room.p2.score, p2Height: room.p2.height
                    });
                    delete activeRooms[myRoomId];
                }, 2000);
            } else {
                setTimeout(() => {
                    sendQuestion(myRoomId);
                }, 2000);
            }
        }
    });

    // PENGIRIMAN SOAL TERPUSAT
    function sendQuestion(roomId) {
        if (!activeRooms[roomId]) return;
        const room = activeRooms[roomId];
        room.locked = false; // Buka gerbang rebutan

        const q = room.questions[room.currentQ];
        const payload = {
            qIndex: room.currentQ + 1,
            level: q.level,
            questionText: q.question,
            options: q.options
        };

        io.to(roomId).emit('new_question', payload);
    }

    // DISCONNECT
    socket.on('disconnect', () => {
        if (waitingPlayer && waitingPlayer.id === socket.id) {
            waitingPlayer = null;
        }

        // Hancurkan room jika satu player kabur
        for (let r in activeRooms) {
            if (activeRooms[r].p1.id === socket.id || activeRooms[r].p2.id === socket.id) {
                io.to(r).emit('opponent_disconnected');
                delete activeRooms[r];
            }
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Game Server V3 berjalan di http://localhost:${PORT}`);
});
