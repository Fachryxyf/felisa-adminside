const db = require('../config/database');

// Fungsi untuk mengambil bobot dari database (lebih baik daripada hardcode)
async function getWeightsFromDB() {
    const { rows } = await db.query('SELECT criterion_code, weight FROM saw_weights ORDER BY id');
    const weights = {};
    const weightArray = [];
    const criteria = {};
    rows.forEach(row => {
        weights[row.criterion_code] = parseFloat(row.weight);
        weightArray.push(parseFloat(row.weight));
        criteria[row.criterion_code] = { name: row.criterion_name, weight: row.weight };
    });
    return { weights, weightArray, criteria };
}

const renderSawPage = async (req, res) => {
    try {
        const { weights, weightArray, criteria } = await getWeightsFromDB();

        // 1. Ambil semua data ulasan dari database
        const { rows: allReviews } = await db.query('SELECT * FROM reviews');

        if (allReviews.length === 0) {
            return res.render('saw-details', {
                activePage: 'saw',
                products: [], sawResults: [], config: { criteria },
                chartData: JSON.stringify({ labels: [], scores: [] })
            });
        }

        // 2. Kelompokkan ulasan per produk
        const reviewsByProduct = allReviews.reduce((acc, review) => {
            const productId = review.product_id;
            if (!acc[productId]) {
                acc[productId] = {
                    id: productId,
                    name: review.product_name,
                    reviews: []
                };
            }
            acc[productId].reviews.push(review.ratings);
            return acc;
        }, {});

        // 3. Hitung rata-rata skor kriteria untuk setiap produk
        const productAverages = Object.values(reviewsByProduct).map(product => {
            const numReviews = product.reviews.length;
            const sum = { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0 };
            product.reviews.forEach(rating => {
                sum.B1 += rating.B1;
                sum.B2 += rating.B2;
                sum.B3 += rating.B3;
                sum.B4 += rating.B4;
                sum.B5 += rating.B5;
            });
            return {
                id: product.id,
                name: product.name,
                avgRatings: [
                    sum.B1 / numReviews,
                    sum.B2 / numReviews,
                    sum.B3 / numReviews,
                    sum.B4 / numReviews,
                    sum.B5 / numReviews
                ]
            };
        });

        // 4. Buat Matriks Keputusan dari data rata-rata
        const matrix = productAverages.map(p => p.avgRatings);

        // 5. Cari nilai maksimum untuk setiap kriteria
        const maxValues = Array(5).fill(0);
        matrix.forEach(row => {
            row.forEach((value, i) => {
                if (value > maxValues[i]) maxValues[i] = value;
            });
        });

        // 6. Lakukan Normalisasi Matriks (R)
        const normalizedMatrix = matrix.map(row => 
            row.map((value, i) => parseFloat((value / (maxValues[i] || 1)).toFixed(4)))
        );

        // 7. Hitung Skor Akhir (V) untuk setiap produk
        const finalScores = normalizedMatrix.map((row, index) => {
            const score = row.reduce((acc, normalizedValue, i) => acc + (normalizedValue * weightArray[i]), 0);
            return {
                product: productAverages[index],
                normalized: row,
                score: parseFloat(score.toFixed(4))
            };
        });
        
        // Urutkan hasil dari skor tertinggi
        finalScores.sort((a, b) => b.score - a.score);

        // Siapkan data untuk grafik
        const chartData = {
            labels: finalScores.map(item => item.product.name),
            scores: finalScores.map(item => (item.score * 100).toFixed(2))
        };

        res.render('saw-details', {
            activePage: 'saw',
            products: productAverages, // Kirim data rata-rata produk
            sawResults: finalScores,
            config: { criteria },
            chartData: chartData
        });

    } catch (error) {
        console.error("Error calculating SAW for products:", error);
        res.status(500).send("Terjadi kesalahan saat memproses data SAW.");
    }
};

module.exports = { renderSawPage };