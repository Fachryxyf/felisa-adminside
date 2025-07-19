const SAW_CONFIG = {
  criteria: {
    B1: { weight: 0.10, name: 'Kualitas Bahan' },
    B2: { weight: 0.30, name: 'Desain & Kreativitas' },
    B3: { weight: 0.15, name: 'Ketepatan Waktu' },
    B4: { weight: 0.40, name: 'Kepuasan Keseluruhan' },
    B5: { weight: 0.05, name: 'Pelayanan Customer Service' }
  },
  weights: [0.10, 0.30, 0.15, 0.40, 0.05]
};

module.exports = SAW_CONFIG;