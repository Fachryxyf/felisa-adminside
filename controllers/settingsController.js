const db = require('../config/database');

// Menampilkan halaman pengaturan bobot
const renderWeightsPage = async (req, res) => {
    try {
        const { rows: weights } = await db.query('SELECT * FROM saw_weights ORDER BY id');
        res.render('settings/weights', {
            activePage: 'settings',
            weights,
            error: null,
            success: null
        });
    } catch (error) {
        console.error("Error fetching weights:", error);
        res.status(500).send("Gagal memuat halaman pengaturan.");
    }
};

// Memperbarui bobot di database
const updateWeights = async (req, res) => {
    try {
        const newWeights = req.body; // Data dari form: { B1: '0.10', B2: '0.30', ... }
        let totalWeight = 0;
        const queries = [];

        for (const code in newWeights) {
            const weightValue = parseFloat(newWeights[code]);
            if (isNaN(weightValue)) {
                throw new Error("Semua bobot harus berupa angka.");
            }
            totalWeight += weightValue;
            
            queries.push(
                db.query('UPDATE saw_weights SET weight = $1 WHERE criterion_code = $2', [weightValue, code])
            );
        }

        // Validasi: Total bobot harus 1.0
        if (Math.abs(totalWeight - 1.0) > 0.001) { // Toleransi kecil untuk floating point
            const { rows: weights } = await db.query('SELECT * FROM saw_weights ORDER BY id');
            return res.render('settings/weights', {
                activePage: 'settings',
                weights,
                error: 'Total semua bobot harus tepat 1.0',
                success: null
            });
        }

        // Jalankan semua query update
        await Promise.all(queries);

        // Muat ulang halaman dengan pesan sukses
        const { rows: updatedWeights } = await db.query('SELECT * FROM saw_weights ORDER BY id');
        res.render('settings/weights', {
            activePage: 'settings',
            weights: updatedWeights,
            error: null,
            success: 'Bobot berhasil diperbarui!'
        });

    } catch (error) {
        console.error("Error updating weights:", error);
        const { rows: weights } = await db.query('SELECT * FROM saw_weights ORDER BY id');
        res.render('settings/weights', {
            activePage: 'settings',
            weights,
            error: error.message || 'Terjadi kesalahan saat menyimpan.',
            success: null
        });
    }
};

module.exports = { renderWeightsPage, updateWeights };