import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Filter, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function FilterPage() {
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
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/filter?${params}`);
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

  const totalSales = filteredRegionData.reduce((sum, item) => sum + item.value, 0);
  const totalTransactions = filteredRegionData.reduce((sum, item) => sum + item.transactions, 0);
  const topRegion = filteredRegionData.reduce((best, item) => (item.value > best.value ? item : best), filteredRegionData[0] || { region: '-', value: 0 });

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
      const params = new URLSearchParams({ startDate, endDate });
      const [resP, resA, resD, resPg] = await Promise.all([
        fetch(`/api/penjualan?${params}`).catch(() => null),
        fetch(`/api/armada?${params}`).catch(() => null),
        fetch(`/api/driver?${params}`).catch(() => null),
        fetch(`/api/pengiriman?${params}`).catch(() => null)
      ]);

      const penjualan = resP?.ok ? await resP.json() : [];
      const armada = resA?.ok ? await resA.json() : [];
      const driver = resD?.ok ? await resD.json() : [];
      const pengiriman = resPg?.ok ? await resPg.json() : [];

      const doc = new jsPDF();
      let currentY = 15;
      
      doc.setFont("helvetica", "bold").setFontSize(16);
      doc.text("PT Anugerah Bersama Bogor", 14, currentY);
      currentY += 7;
      
      doc.setFontSize(11).setFont("helvetica", "normal");
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, currentY);
      currentY += 5;
      doc.text(`Periode Laporan: ${startDate} sampai ${endDate}`, 14, currentY);
      currentY += 10;

      doc.setFontSize(12).setFont("helvetica", "bold");
      doc.text("Ringkasan Statistik", 14, currentY);
      currentY += 6;
      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text(`Total Armada: ${armada.length}`, 14, currentY);
      currentY += 5;
      doc.text(`Total Driver: ${driver.length}`, 14, currentY);
      currentY += 5;
      doc.text(`Total Pengiriman: ${pengiriman.length}`, 14, currentY);
      currentY += 5;
      doc.text(`Total Penjualan: ${penjualan.length}`, 14, currentY);
      currentY += 10;

      const addDynamicTable = (title: string, data: any[], color: [number, number, number]) => {
        if (data.length === 0) return;
        if (currentY > 250) { doc.addPage(); currentY = 15; }
        doc.setFontSize(12).setFont("helvetica", "bold");
        doc.text(title, 14, currentY);
        const head = [Object.keys(data[0]).map(k => k.toUpperCase().replace(/_/g, ' '))];
        const body = data.map(row => Object.values(row).map(val => String(val || '-')));
        autoTable(doc, {
          startY: currentY + 4,
          head,
          body,
          headStyles: { fillColor: color },
          margin: { bottom: 10 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      };

      addDynamicTable("Data Armada", armada, [16, 185, 129]);
      addDynamicTable("Data Driver", driver, [245, 158, 11]);
      addDynamicTable("Data Pengiriman", pengiriman, [139, 92, 246]);
      addDynamicTable("Data Penjualan", penjualan, [37, 99, 235]);

      doc.save(`Laporan_Periode_${startDate}_${endDate}.pdf`);
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
          <BarChart data={regionData}>
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
              {regionData.map((entry, index) => (
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
                  {detailTransactions.map((transaction) => (
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
                  ))}
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
