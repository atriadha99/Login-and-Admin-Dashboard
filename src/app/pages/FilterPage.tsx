import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Filter, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function FilterPage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-05-06');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [regionData, setRegionData] = useState<any[]>([]);
  const [detailTransactions, setDetailTransactions] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchFilteredData();
  }, [startDate, endDate]);

  const fetchFilteredData = async () => {
    try {
      const token = window.localStorage.getItem('abb-token');
      if (!token) {
        toast.error('Sesi tidak valid. Silakan login kembali.');
        navigate('/');
        return;
      }
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/filter?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRegionData(data.regionData || []);
        setDetailTransactions(data.detailTransactions || []);
      }
    } catch (error) {
      toast.error('Gagal mengambil data dari database.');
    }
  };

  const handleBarClick = (data: any) => {
    setSelectedBar(data.region);
    setShowModal(true);
  };

  const filteredRegionData = regionData.filter((item) => {
    const matchesRegion = !selectedRegion || item.region.toLowerCase().replace(/\s+/g, '-').includes(selectedRegion);
    return matchesRegion;
  });

  const totalSales = filteredRegionData.reduce((sum, item) => sum + (item?.value || 0), 0);
  const totalTransactions = filteredRegionData.reduce((sum, item) => sum + (item?.transactions || 0), 0);
  const topRegion = filteredRegionData.length > 0
    ? filteredRegionData.reduce((best, item) => (item.value > best.value ? item : best), filteredRegionData[0])
    : { region: '-', value: 0 };
  const chartData = regionData.length > 0 ? regionData : [{ region: 'Belum ada data', value: 0, transactions: 0 }];

  const handleApplyFilter = () => {
    fetchFilteredData();
    toast.success(`Filter diterapkan untuk ${selectedRegion || 'semua wilayah'} dan ${selectedProduct || 'semua produk'}.`);
  };

  const handleResetFilter = () => {
    setStartDate('2026-04-01');
    setEndDate('2026-05-06');
    setSelectedRegion('');
    setSelectedProduct('');
    fetchFilteredData();
    toast.info('Filter telah direset ke nilai default.');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const token = window.localStorage.getItem('abb-token');
      if (!token) {
        toast.error('Sesi tidak valid. Silakan login kembali.');
        navigate('/');
        return;
      }

      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/report?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Gagal mengambil data laporan dari database.');
      }

      const report = await res.json();
      const doc = new jsPDF();
      let currentY = 15;

      const formatDateId = (value: string) =>
        new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

      doc.setFont('helvetica', 'bold').setFontSize(16);
      doc.text('PT Anugerah Bersama Bogor', 14, currentY);
      currentY += 8;
      doc.setFontSize(11).setFont('helvetica', 'normal');
      doc.text(`Tanggal Cetak: ${formatDateId(new Date().toISOString())}`, 14, currentY);
      currentY += 6;
      doc.text(`Periode Laporan: ${formatDateId(startDate)} s/d ${formatDateId(endDate)}`, 14, currentY);
      currentY += 10;

      doc.setFont('helvetica', 'bold').setFontSize(12);
      doc.text('Ringkasan', 14, currentY);
      currentY += 6;
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text(`Total Armada: ${report.summary.totalArmada}`, 14, currentY);
      currentY += 5;
      doc.text(`Total Driver: ${report.summary.totalDriver}`, 14, currentY);
      currentY += 5;
      doc.text(`Total Pengiriman: ${report.summary.totalPengiriman}`, 14, currentY);
      currentY += 5;
      doc.text(`Total Penjualan: ${report.summary.totalPenjualan}`, 14, currentY);
      currentY += 5;
      doc.text(`Total Revenue: Rp ${Number(report.summary.totalRevenue || 0).toLocaleString('id-ID')}`, 14, currentY);
      currentY += 10;

      const addTable = (title: string, head: string[], rows: string[][], color: [number, number, number]) => {
        if (currentY > 240) {
          doc.addPage();
          currentY = 15;
        }
        doc.setFont('helvetica', 'bold').setFontSize(12);
        doc.text(title, 14, currentY);
        autoTable(doc, {
          startY: currentY + 4,
          head: [head],
          body: rows.length > 0 ? rows : [['-', '-', '-', '-', '-']],
          headStyles: { fillColor: color },
          margin: { bottom: 10 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 12;
      };

      addTable(
        'Data Armada',
        ['No Polisi', 'Merk', 'Tahun', 'Kapasitas Liter', 'Status'],
        report.armada.map((row: any) => [
          row.noPolisi,
          row.merk,
          String(row.tahun),
          String(row.kapasitasLiter),
          row.status,
        ]),
        [16, 185, 129]
      );

      addTable(
        'Data Driver',
        ['Nama', 'Nomor SIM', 'Telepon', 'Status'],
        report.driver.map((row: any) => [row.nama, row.nomorSim, row.telepon, row.status]),
        [245, 158, 11]
      );

      addTable(
        'Data Pengiriman',
        ['Tanggal', 'Driver', 'Armada', 'Tujuan', 'Volume Liter', 'Status', 'Catatan'],
        report.pengiriman.map((row: any) => [
          row.tanggal,
          row.driver,
          row.armada,
          row.tujuan,
          String(row.volumeLiter),
          row.status,
          row.catatan,
        ]),
        [139, 92, 246]
      );

      addTable(
        'Data Penjualan',
        ['Tanggal', 'Tujuan', 'Volume Liter', 'Harga/Liter', 'Total Harga', 'Status Pembayaran'],
        report.penjualan.map((row: any) => [
          row.tanggal,
          row.tujuan,
          String(row.volumeLiter),
          `Rp ${Number(row.hargaPerLiter || 0).toLocaleString('id-ID')}`,
          `Rp ${Number(row.totalHarga || 0).toLocaleString('id-ID')}`,
          row.statusPembayaran,
        ]),
        [37, 99, 235]
      );

      if (currentY > 250) {
        doc.addPage();
        currentY = 15;
      }
      doc.setFont('helvetica', 'bold').setFontSize(12);
      doc.text('Total Keseluruhan', 14, currentY);
      currentY += 6;
      doc.setFont('helvetica', 'normal').setFontSize(10);
      doc.text(`Total Revenue Periode: Rp ${Number(report.summary.totalRevenue || 0).toLocaleString('id-ID')}`, 14, currentY);

      doc.save(`Laporan_PTBABB_${startDate}_${endDate}.pdf`);
      toast.success('Laporan PDF berhasil diunduh.');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor laporan PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Filter Data</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wilayah Distribusi</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Wilayah</option>
              <option value="bogor-utara">Bogor Utara</option>
              <option value="bogor-selatan">Bogor Selatan</option>
              <option value="bogor-barat">Bogor Barat</option>
              <option value="bogor-timur">Bogor Timur</option>
              <option value="cibinong">Cibinong</option>
              <option value="ciawi">Ciawi</option>
            </select>
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Produk</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Produk</option>
              <option value="galon-19l">Galon 19L</option>
              <option value="cup-240ml">Cup 240ml</option>
              <option value="botol-600ml">Botol 600ml</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleApplyFilter}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Terapkan Filter
          </button>
          <button
            onClick={handleResetFilter}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Chart with Drill-Down */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Penjualan per Wilayah</h3>
            <p className="text-sm text-gray-500">Klik pada bar untuk melihat detail transaksi</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              {isExporting ? 'Mengekspor...' : 'Export PDF'}
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="region" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip
              formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              cursor="pointer"
              onClick={handleBarClick}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={selectedBar === entry.region ? '#1d4ed8' : '#2563eb'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Penjualan (Filtered)</p>
          <p className="text-3xl font-bold text-gray-900">Rp {(totalSales / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-green-600 mt-2">Berdasarkan filter yang aktif</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Jumlah Transaksi</p>
          <p className="text-3xl font-bold text-gray-900">{totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-2">Dari wilayah yang dipilih</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Wilayah Tertinggi</p>
          <p className="text-3xl font-bold text-gray-900">{topRegion.region}</p>
          <p className="text-xs text-gray-500 mt-2">Rp {(topRegion.value / 1000000).toFixed(1)}M dari hasil filter</p>
        </div>
      </div>

      {/* Drill-Down Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Detail Transaksi - {selectedBar}</h3>
                <p className="text-sm text-gray-500 mt-1">Periode: {startDate} - {endDate}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-600 pb-3">ID Transaksi</th>
                    <th className="text-left text-xs font-semibold text-gray-600 pb-3">Tanggal</th>
                    <th className="text-left text-xs font-semibold text-gray-600 pb-3">Customer</th>
                    <th className="text-left text-xs font-semibold text-gray-600 pb-3">Produk</th>
                    <th className="text-right text-xs font-semibold text-gray-600 pb-3">Qty</th>
                    <th className="text-right text-xs font-semibold text-gray-600 pb-3">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {detailTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                        Tidak ada transaksi pada periode filter ini.
                      </td>
                    </tr>
                  ) : (
                  detailTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm font-medium text-blue-600">{transaction.id}</td>
                      <td className="py-3 text-sm text-gray-600">{transaction.date}</td>
                      <td className="py-3 text-sm text-gray-900">{transaction.customer}</td>
                      <td className="py-3 text-sm text-gray-600">{transaction.product}</td>
                      <td className="py-3 text-sm text-gray-600 text-right">{transaction.qty}</td>
                      <td className="py-3 text-sm font-medium text-gray-900 text-right">
                        Rp {(transaction.amount / 1000000).toFixed(2)}M
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
              >
                Export PDF
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
