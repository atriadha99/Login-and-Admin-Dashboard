import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToPDF = (dataDistribusi: any[]) => {
  if (!dataDistribusi || dataDistribusi.length === 0) return alert("Data kosong!");
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFont("helvetica", "bold").setFontSize(16);
  doc.text("PT ANUGERAH BERSAMA BOGOR", 14, 15);
  doc.setFontSize(11).setFont("helvetica", "normal");
  doc.text("Laporan Data Distribusi Operasional Armada", 14, 22);
  doc.line(14, 25, 283, 25);

  const rows = dataDistribusi.map((item, i) => [
    i + 1, item.tanggal, item.noPolisi, item.pelanggan, `${item.volume} L`, item.driver, item.status
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['No', 'Tanggal', 'No Polisi', 'Pelanggan', 'Volume', 'Driver', 'Status']],
    body: rows,
    headStyles: { fillColor: [15, 23, 42] }
  });
  doc.save(`laporan-distribusi-${Date.now()}.pdf`);
};

export const exportToExcel = async (dataDistribusi: any[]) => {
  if (!dataDistribusi || dataDistribusi.length === 0) return;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Distribusi');

  worksheet.columns = [
    { header: 'No Polisi', key: 'platNomor', width: 15 },
    { header: 'Pelanggan', key: 'pelanggan', width: 25 },
    { header: 'Volume (L)', key: 'volume', width: 15 },
    { header: 'Driver', key: 'driver', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  dataDistribusi.forEach((item) => worksheet.addRow(item));
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `laporan_distribusi_${Date.now()}.xlsx`);
};