// controllers/sawController.js
const db = require('../config/database');

// Ambil bobot + nama dari DB sesuai urutan B1..B5
async function getWeightsFromDB() {
  // ambil juga criterion_name (ini yang sebelumnya hilang)
  const { rows } = await db.query(`
    SELECT criterion_code, criterion_name, weight
    FROM saw_weights
    ORDER BY id
  `);

  // fallback kalau id belum rapi: paksa urutan B1..B5
  const order = ['B1','B2','B3','B4','B5'];
  rows.sort((a,b) => order.indexOf(a.criterion_code) - order.indexOf(b.criterion_code));

  const weights = {};        // { B1: 0.1, ... }
  const weightArray = [];    // [0.1, 0.3, 0.15, 0.4, 0.05] (urut B1..B5)
  const criteria = {};       // { B1: {name:'Waktu...', weight:0.1}, ... }

  for (const r of rows) {
    const w = Number(r.weight);
    weights[r.criterion_code] = w;
    weightArray.push(w);
    criteria[r.criterion_code] = { name: r.criterion_name, weight: w };
  }
  return { weights, weightArray, criteria, order };
}

const renderSawPage = async (req, res) => {
  try {
    const { weightArray, criteria, order } = await getWeightsFromDB();

    // 1) Ambil semua review
    const { rows: allReviews } = await db.query('SELECT * FROM reviews');

    // Kalau belum ada review, tetap render tabel bobot dari config.criteria
    if (allReviews.length === 0) {
      return res.render('saw-details', {
        activePage: 'saw',
        products: [],
        sawResults: [],
        config: { criteria },
        chartData: { labels: [], scores: [] }
      });
    }

    // 2) Kelompokkan review per produk
    const reviewsByProduct = allReviews.reduce((acc, review) => {
      const productId = review.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          id: productId,
          name: review.product_name, // pastikan kolom ini ada; jika tidak, join ke tabel products
          reviews: []
        };
      }
      acc[productId].reviews.push(review.ratings); // diasumsikan JSON {B1..B5}
      return acc;
    }, {});

    // 3) Rata-rata per kriteria (urut sesuai order B1..B5)
    const productAverages = Object.values(reviewsByProduct).map(product => {
      const num = product.reviews.length || 1;
      const sum = { B1:0, B2:0, B3:0, B4:0, B5:0 };
      for (const r of product.reviews) {
        sum.B1 += Number(r.B1 || 0);
        sum.B2 += Number(r.B2 || 0);
        sum.B3 += Number(r.B3 || 0);
        sum.B4 += Number(r.B4 || 0);
        sum.B5 += Number(r.B5 || 0);
      }
      return {
        id: product.id,
        name: product.name,
        avgRatings: order.map(k => sum[k] / num)
      };
    });

    // 4) Matriks keputusan & normalisasi (benefit semua)
    const matrix = productAverages.map(p => p.avgRatings);
    const maxValues = matrix[0].map((_, j) =>
      Math.max(...matrix.map(row => row[j]), 1) // minimal 1 untuk hindari /0
    );
    const normalizedMatrix = matrix.map(row =>
      row.map((v, j) => +(v / (maxValues[j] || 1)).toFixed(4))
    );

    // 5) Skor SAW
    const finalScores = normalizedMatrix.map((row, i) => {
      const score = row.reduce((acc, val, j) => acc + val * weightArray[j], 0);
      return {
        product: productAverages[i],
        normalized: row,
        score: +score.toFixed(4)
      };
    }).sort((a,b) => b.score - a.score);

    // 6) Data chart
    const chartData = {
      labels: finalScores.map(x => x.product.name),
      scores: finalScores.map(x => +(x.score * 100).toFixed(2))
    };

    // 7) Render
    res.render('saw-details', {
      activePage: 'saw',
      products: productAverages,
      sawResults: finalScores,
      config: { criteria },
      chartData
    });

  } catch (error) {
    console.error('Error calculating SAW:', error);
    res.status(500).render('saw-details', {
      activePage: 'saw',
      products: [],
      sawResults: [],
      config: { criteria: {} },
      chartData: { labels: [], scores: [] },
      error: error.message
    });
  }
};

module.exports = { renderSawPage };
