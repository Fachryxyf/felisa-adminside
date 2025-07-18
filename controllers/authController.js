const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk menampilkan halaman login
const renderLoginPage = (req, res) => {
    res.render('auth/login', { error: null }); // Mengirim error: null awalnya
};

// Fungsi untuk memproses login
const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    // Validasi input sederhana
    if (!email || !password) {
        return res.status(400).render('auth/login', { error: 'Email dan password harus diisi.' });
    }

    try {
        // 1. Cari admin berdasarkan email
        const { rows } = await db.query('SELECT * FROM admins WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(401).render('auth/login', { error: 'Email atau password salah.' });
        }
        const admin = rows[0];

        // 2. Bandingkan password yang diinput dengan hash di database
        const isPasswordMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isPasswordMatch) {
            return res.status(401).render('auth/login', { error: 'Email atau password salah.' });
        }

        // 3. Buat JSON Web Token (JWT)
        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET, // Buat variabel ini di file .env Anda!
            { expiresIn: '1d' } // Token berlaku selama 1 hari
        );

        // 4. Simpan token di cookie (cara yang aman)
        res.cookie('token', token, {
            httpOnly: true, // Mencegah akses dari JavaScript sisi klien
            secure: process.env.NODE_ENV === 'production', // Hanya kirim via HTTPS di production
            maxAge: 24 * 60 * 60 * 1000 // 1 hari
        });

        // 5. Redirect ke dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('auth/login', { error: 'Terjadi kesalahan pada server.' });
    }
};

// Fungsi untuk logout
const handleLogout = (req, res) => {
    res.clearCookie('token'); // Hapus cookie token
    res.redirect('/login'); // Redirect ke halaman login
};

module.exports = {
    renderLoginPage,
    handleLogin,
    handleLogout // Export fungsi baru
};