const multer = require('multer');

// Konfigurasi untuk menyimpan file di memori sementara
const storage = multer.memoryStorage();

const multerUpload = multer({ storage: storage });

module.exports = multerUpload;