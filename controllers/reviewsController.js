const db = require('../config/database');

// --- Fungsi yang sudah ada ---
const renderReviewsPage = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
        res.render('reviews', { reviews: rows, activePage: 'reviews' });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};


// --- Fungsi BARU ---
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params; // Ambil ID dari parameter URL, contoh: /reviews/3

        // Jalankan query DELETE
        const deleteQuery = await db.query('DELETE FROM reviews WHERE id = $1', [id]);

        // Cek apakah ada baris yang terhapus
        if (deleteQuery.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan.' });
        }

        // Kirim respons berhasil dalam format JSON
        res.status(200).json({ success: true, message: 'Ulasan berhasil dihapus.' });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};


// --- Update exports ---
module.exports = {
    renderReviewsPage,
    deleteReview // Tambahkan fungsi baru
};