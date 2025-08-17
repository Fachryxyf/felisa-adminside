// public/js/report-base.js
(function (global) {
  const { jsPDF } = window.jspdf;

  async function loadImageAsDataURL(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    const blob = await res.blob();
    return new Promise(resolve => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.readAsDataURL(blob);
    });
  }

  async function createDoc(opts = {}) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.__marginX = opts.marginX ?? 15;
    doc.__startY = opts.startY ?? 12;
    doc.__logoUrl = opts.logoUrl ?? '/assets/logo.png';
    doc.__place = opts.place ?? 'Tanggeran Selatan';
    doc.__dateStr =
      opts.dateStr ??
      new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    return doc;
  }

  async function addHeader(doc, headerInfo = {}) {
    const y0 = doc.__startY;
    const mx = doc.__marginX;
    const logo = await loadImageAsDataURL(doc.__logoUrl);

    // Logo kiri
    doc.addImage(logo, 'PNG', mx, y0, 20, 20);

    // Info usaha tengah
    const usaha = headerInfo.usaha ?? 'Ayud Craft';
    const telp = headerInfo.telp ?? '+62 857-1141-4788';
    const email = headerInfo.email ?? 'Aska.180180@gmail.com';
    const owner = headerInfo.owner ?? 'Grand Serpong Residences Blok A3 No.6A, Sarua, Ciputat, Tangerang Selatan, Banten';

    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text(usaha, mx + 105, y0 + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text(`${owner}`, mx + 105, y0 + 12, { align: 'center' });
    doc.text(`Telp: ${telp}  |  Email: ${email}`, mx + 105, y0 + 18, { align: 'center' });

    // Garis bawah
    doc.setLineWidth(0.6);
    doc.line(mx, y0 + 25, 210 - mx, y0 + 25);

    // Kembalikan y berikutnya
    return y0 + 32;
  }

  function addTitle(doc, title, y) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
    doc.text(title, 105, y, { align: 'center' });
    return y + 6;
  }

  function addTable(doc, head, body, startY, columnStyles = {}) {
    doc.autoTable({
      startY,
      head: [head],
      body,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [230, 230, 230],  // abu-abu muda
        textColor: [0, 0, 0],        // ⟵ tulisan hitam
        fontStyle: 'bold'
      },
      columnStyles
    });
    return doc.lastAutoTable.finalY + 6;
  }

  function addSignature(doc) {
    const mx = doc.__marginX;
    const y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : 250;

    // Titik tengah tanda tangan
    const centerX = 210 - mx - 40; // bisa adjust ± biar pas sesuai layout

    // tanggal & tempat di atas
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`${doc.__place}, ${doc.__dateStr}`, centerX, y, { align: 'center' });

    // garis tanda tangan
    doc.setFont('helvetica', 'normal');
    doc.text('(___________________)', centerX, y + 28, { align: 'center' });

    // nama di tengah garis
    doc.setFont('helvetica', 'bold');
    doc.text('Aska Yudhiantie', centerX, y + 28, { align: 'center' });

    return y + 40;
  }

  function save(doc, filename) {
    doc.save(filename);
  }

  // expose
  global.ReportBase = { createDoc, addHeader, addTitle, addTable, addSignature, save };
})(window);
