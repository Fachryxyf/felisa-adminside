const db = require('../config/database');
const cloudinary = require('../config/cloudinary');

// Fungsi untuk menampilkan halaman profil
const renderProfilePage = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { rows } = await db.query('SELECT * FROM admins WHERE id = $1', [adminId]);
        
        if (rows.length === 0) {
            return res.status(404).send('Admin tidak ditemukan');
        }

        res.render('profile', { 
            admin: rows[0], 
            activePage: 'profile' 
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).send('Gagal memuat halaman profil.');
    }
};

// Fungsi untuk memperbarui data profil
const updateProfile = async (req, res) => {
    try {
        const adminId = req.admin.id;
        // req.body sekarang seharusnya sudah ada karena diproses oleh multer
        const { fullName, email, handphoneNumber } = req.body;
        let avatarUrl = req.body.existing_avatar_url; 

        // Cek jika ada file baru yang diunggah
        if (req.file) {
            let fileBase64 = req.file.buffer.toString('base64');
            let file = `data:${req.file.mimetype};base64,${fileBase64}`;
            
            const result = await cloudinary.uploader.upload(file, { folder: 'ayudcraft/avatars' });
            avatarUrl = result.secure_url;
        }
        
        await db.query(
            'UPDATE admins SET full_name = $1, email = $2, handphone_number = $3, avatar_url = $4 WHERE id = $5',
            [fullName, email, handphoneNumber, avatarUrl, adminId]
        );

        res.redirect('/profile');

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Terjadi kesalahan saat memperbarui profil');
    }
};

// --- Fungsi BARU ---

// 1. Fungsi untuk menampilkan halaman ubah password
const renderChangePasswordPage = (req, res) => {
    res.render('change-password', {
        activePage: 'profile', // Agar menu profil tetap aktif
        error: null // Awalnya tidak ada error
    });
};

// 2. Fungsi untuk memproses perubahan password
const handleChangePassword = async (req, res) => {
    const adminId = req.admin.id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    try {
        // Validasi 1: Cek apakah password baru dan konfirmasi cocok
        if (newPassword !== confirmNewPassword) {
            return res.render('change-password', { activePage: 'profile', error: 'Password baru dan konfirmasi tidak cocok.' });
        }
        
        // Validasi 2: Cek kekuatan password baru (minimal 8 karakter)
        if (newPassword.length < 8) {
            return res.render('change-password', { activePage: 'profile', error: 'Password baru harus minimal 8 karakter.' });
        }

        // Ambil hash password lama dari database
        const { rows } = await db.query('SELECT password_hash FROM admins WHERE id = $1', [adminId]);
        const admin = rows[0];

        // Validasi 3: Cek apakah password lama yang dimasukkan benar
        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, admin.password_hash);
        if (!isOldPasswordCorrect) {
            return res.render('change-password', { activePage: 'profile', error: 'Password lama salah.' });
        }

        // Jika semua validasi lolos, hash password baru
        const newPasswordHash = await bcrypt.hash(newPassword, 10); // Angka 10 adalah salt rounds

        // Update password di database
        await db.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [newPasswordHash, adminId]);

        // Redirect ke halaman profil utama dengan pesan sukses (opsional)
        res.redirect('/profile');

    } catch (error) {
        console.error('Error changing password:', error);
        return res.render('change-password', { activePage: 'profile', error: 'Terjadi kesalahan pada server.' });
    }
};


// --- Update exports ---
module.exports = {
    renderProfilePage,
    updateProfile,
    renderChangePasswordPage, // tambahkan fungsi baru
    handleChangePassword      // tambahkan fungsi baru
};