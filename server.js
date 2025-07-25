// Import packages
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Import rute
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const apiRoutes = require('./routes/apiRoutes');
const sawRoutes = require('./routes/sawRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static('assets'));

// Setup EJS sebagai view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Gunakan Rute
app.use('/api', apiRoutes); 
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', reviewsRoutes);
app.use('/', profileRoutes);
app.use('/', sawRoutes);
app.use('/', settingsRoutes);

// Rute dasar sekarang mengarah ke login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Admin console server berjalan di http://localhost:${PORT}`);
});