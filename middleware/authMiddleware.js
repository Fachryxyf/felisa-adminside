const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        // Jika tidak ada token, paksa kembali ke halaman login
        return res.redirect('/login');
    }

    try {
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Simpan data admin di object request untuk digunakan oleh controller lain
        req.admin = decoded; 
        
        next(); // Lanjutkan ke rute yang diminta
    } catch (error) {
        // Jika token tidak valid (kadaluwarsa, dll)
        console.error('Token verification failed:', error);
        res.clearCookie('token'); // Hapus cookie yang tidak valid
        return res.redirect('/login');
    }
};

module.exports = { protect };