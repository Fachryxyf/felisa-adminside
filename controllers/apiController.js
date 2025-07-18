const db = require('../config/database');

// Fungsi untuk menerima dan menyimpan ulasan baru
const createReview = async (req, res) => {
    // Ambil semua data yang dikirim oleh script.js dari frontend
    const {
        productId,
        productName,
        reviewerName,
        comment,
        ratings, // Ini adalah objek, contoh: { B1: 5, B2: 4, ... }
        totalScore,
        avatarUrl
    } = req.body;

    // Validasi sederhana, pastikan data penting ada
    if (!productId || !reviewerName || !comment || !ratings) {
        return res.status(400).json({ success: false, message: 'Data yang dikirim tidak lengkap.' });
    }

    try {
        // Query untuk memasukkan data baru ke tabel reviews
        const query = `
            INSERT INTO reviews 
            (product_id, product_name, reviewer_name, comment, ratings, total_score, avatar_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *; 
        `;

        // Parameter untuk query
        const params = [
            productId,
            productName,
            reviewerName,
            comment,
            JSON.stringify(ratings), // Objek ratings perlu diubah menjadi string JSON untuk disimpan di kolom JSONB
            totalScore,
            avatarUrl
        ];

        // Eksekusi query
        const { rows } = await db.query(query, params);

        // Kirim respons berhasil kembali ke frontend
        res.status(201).json({ success: true, message: 'Ulasan berhasil dikirim!', data: rows[0] });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

// --- Fungsi BARU ---
// Fungsi untuk mengambil beberapa ulasan untuk ditampilkan ke publik
const getPublicReviews = async (req, res) => {
    try {
        // Ambil 4 ulasan dengan skor total di atas 80, urutkan dari yang terbaru
        const query = `
            SELECT reviewer_name, comment, total_score, avatar_url 
            FROM reviews 
            WHERE total_score >= 80 
            ORDER BY created_at DESC 
            LIMIT 4;
        `;
        const { rows } = await db.query(query);
        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('Error fetching public reviews:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};


// --- Update exports ---
module.exports = {
    createReview,
    getPublicReviews // Tambahkan fungsi baru
};