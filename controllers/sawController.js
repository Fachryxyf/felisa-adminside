const db = require('../config/database');
const SAW_CONFIG = require('../config/sawConfig');

const renderSawPage = async (req, res) => {
    try {
        // AMBIL BOBOT DARI DATABASE
        const { rows: weightsData } = await db.query('SELECT * FROM saw_weights ORDER BY id');
        const weights = weightsData.map(w => parseFloat(w.weight));
        const criteria = {};
        weightsData.forEach(w => {
            criteria[w.criterion_code] = { name: w.criterion_name, weight: w.weight };
        });

        // 1. Ambil semua data ulasan
        const { rows: reviews } = await db.query('SELECT * FROM reviews ORDER BY id');

        if (reviews.length === 0) {
            return res.render('saw-details', {
                activePage: 'saw',
                reviews: [], sawResults: [], config: SAW_CONFIG,
                chartData: JSON.stringify({ labels: [], scores: [] })
            });
        }

        // 2. Buat Matriks Keputusan (X) dari data rating
        const matrix = reviews.map(r => [
            r.ratings.B1, r.ratings.B2, r.ratings.B3, r.ratings.B4, r.ratings.B5
        ]);

        // 3. Cari nilai maksimum untuk setiap kriteria
        const maxValues = Array(5).fill(0);
        matrix.forEach(row => {
            row.forEach((value, i) => {
                if (value > maxValues[i]) maxValues[i] = value;
            });
        });

        // 4. Lakukan Normalisasi Matriks (R)
        const normalizedMatrix = matrix.map(row => 
            row.map((value, i) => parseFloat((value / (maxValues[i] || 1)).toFixed(4))) // Handle divide by zero
        );

        // 5. Hitung Skor Akhir (V)
        const finalScores = normalizedMatrix.map((row, index) => {
            const score = row.reduce((acc, normalizedValue, i) => acc + (normalizedValue * SAW_CONFIG.weights[i]), 0);
            return {
                review: reviews[index],
                normalized: row,
                score: parseFloat(score.toFixed(4))
            };
        });
        
        // Urutkan hasil dari skor tertinggi
        finalScores.sort((a, b) => b.score - a.score);

        // Siapkan data untuk grafik
        const chartData = {
            labels: finalScores.map(item => `${item.review.reviewer_name} (ID: ${item.review.id})`),
            scores: finalScores.map(item => (item.score * 100).toFixed(2)) // Skor dalam skala 100
        };

        res.render('saw-details', {
            activePage: 'saw',
            reviews,
            sawResults: finalScores,
            config: SAW_CONFIG,
            chartData: JSON.stringify(chartData)
        });

    } catch (error) {
        console.error("Error calculating SAW:", error);
        res.status(500).send("Terjadi kesalahan saat memproses data SAW.");
    }
};

module.exports = { renderSawPage };