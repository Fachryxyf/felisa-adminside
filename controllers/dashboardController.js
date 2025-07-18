// Fungsi untuk menampilkan halaman dashboard
const renderDashboard = (req, res) => {
    // req.admin didapat dari middleware 'protect'
    const adminData = req.admin; 
    
    // Kirim data admin dan halaman aktif ke view
    res.render('dashboard', { admin: adminData, activePage: 'dashboard' });
};

module.exports = {
    renderDashboard
};