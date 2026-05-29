import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Activity, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const monthlyData = [
  { month: 'Jan', penjualan: 45000000, distribusi: 38000000 },
  { month: 'Feb', penjualan: 52000000, distribusi: 44000000 },
  { month: 'Mar', penjualan: 48000000, distribusi: 41000000 },
  { month: 'Apr', penjualan: 61000000, distribusi: 52000000 },
  { month: 'Mei', penjualan: 55000000, distribusi: 47000000 },
  { month: 'Jun', penjualan: 67000000, distribusi: 58000000 },
];

const annualData = [
  { month: 'Jan', penjualan: 42000000, distribusi: 36000000 },
  { month: 'Feb', penjualan: 46000000, distribusi: 39000000 },
  { month: 'Mar', penjualan: 49000000, distribusi: 41000000 },
  { month: 'Apr', penjualan: 52000000, distribusi: 44000000 },
  { month: 'Mei', penjualan: 56000000, distribusi: 48000000 },
  { month: 'Jun', penjualan: 59000000, distribusi: 50000000 },
  { month: 'Jul', penjualan: 62000000, distribusi: 53000000 },
  { month: 'Aug', penjualan: 65000000, distribusi: 54000000 },
  { month: 'Sep', penjualan: 68000000, distribusi: 56000000 },
  { month: 'Okt', penjualan: 70000000, distribusi: 59000000 },
  { month: 'Nov', penjualan: 73000000, distribusi: 61000000 },
  { month: 'Des', penjualan: 76000000, distribusi: 64000000 },
];

const recentTransactions = [
  { id: 'TRX-001', date: '2026-05-06', customer: 'Toko Sumber Rejeki', amount: 2500000, region: 'Bogor Utara' },
  { id: 'TRX-002', date: '2026-05-06', customer: 'Warung Maju Jaya', amount: 1800000, region: 'Bogor Selatan' },
  { id: 'TRX-003', date: '2026-05-05', customer: 'CV Berkah Abadi', amount: 4200000, region: 'Cibinong' },
  { id: 'TRX-004', date: '2026-05-05', customer: 'Toko Harapan Baru', amount: 3100000, region: 'Bogor Barat' },
  { id: 'TRX-005', date: '2026-05-04', customer: 'UD Sumber Makmur', amount: 2900000, region: 'Bogor Timur' },
];

const forecastData = [
  { period: 'Jul 2026', predicted: 72000000, confidence: 'High' },
  { period: 'Aug 2026', predicted: 68000000, confidence: 'High' },
  { period: 'Sep 2026', predicted: 75000000, confidence: 'Medium' },
];

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'6M' | '1Y'>('6M');

  const chartData = selectedPeriod === '6M' ? monthlyData : annualData;
  const periodLabel = selectedPeriod === '6M' ? '6 bulan terakhir' : '1 tahun terakhir';

  const handleExportSummary = () => {
    const csvContent = [
      ['Kategori', 'Nilai'],
      ['Total Penjualan', '328M'],
      ['Laba Kotor', '98M'],
      ['Jumlah Transaksi', '1,284'],
      ['Rata-rata Nilai', 'Rp 2.8M'],
      ['Periode', periodLabel],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ringkasan-dashboard.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success('Ringkasan dashboard berhasil diunduh.');
  };

  const handleGenerateInsight = () => {
    toast.success('Insight otomatis siap dibagikan ke tim operasional.');
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+12.5%</span>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Penjualan</h3>
          <p className="text-3xl font-bold text-gray-900">Rp 328M</p>
          <p className="text-xs text-gray-500 mt-2">Bulan ini</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+8.2%</span>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Laba Kotor</h3>
          <p className="text-3xl font-bold text-gray-900">Rp 98M</p>
          <p className="text-xs text-gray-500 mt-2">Margin 29.9%</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <ShoppingCart className="text-purple-600" size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+15.3%</span>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Jumlah Transaksi</h3>
          <p className="text-3xl font-bold text-gray-900">1,284</p>
          <p className="text-xs text-gray-500 mt-2">Bulan ini</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <Activity className="text-orange-600" size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+5.7%</span>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Rata-rata Nilai</h3>
          <p className="text-3xl font-bold text-gray-900">Rp 2.8M</p>
          <p className="text-xs text-gray-500 mt-2">Per transaksi</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-blue-600" size={18} />
            <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat Admin</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Gunakan fitur yang sudah siap untuk mendukung operasi harian.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportSummary}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} />
              Export ringkasan
            </button>
            <button
              type="button"
              onClick={handleGenerateInsight}
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Buat insight otomatis
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-sm p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Status Operasional</p>
          <h3 className="mt-2 text-2xl font-semibold">98.4% sistem aktif</h3>
          <p className="mt-2 text-sm text-blue-100">Koneksi data, forecasting, dan ekspor berjalan normal untuk shift hari ini.</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
            <Activity size={16} />
            12 notifikasi belum dibaca
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tren Distribusi Air</h3>
            <p className="text-sm text-gray-500">Perbandingan penjualan dan distribusi untuk {periodLabel}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedPeriod('6M')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedPeriod === '6M'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              6 Bulan
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('1Y')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedPeriod === '1Y'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              1 Tahun
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip
              formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="penjualan" stroke="#2563eb" strokeWidth={3} name="Penjualan" />
            <Line type="monotone" dataKey="distribusi" stroke="#10b981" strokeWidth={3} name="Distribusi" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Section - Transactions & Forecasting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaksi Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">ID</th>
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">Wilayah</th>
                  <th className="text-right text-xs font-semibold text-gray-600 pb-3">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-600">{transaction.id}</td>
                    <td className="py-3 text-sm text-gray-900">{transaction.customer}</td>
                    <td className="py-3 text-sm text-gray-600">{transaction.region}</td>
                    <td className="py-3 text-sm text-gray-900 text-right font-medium">
                      Rp {(transaction.amount / 1000000).toFixed(1)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Forecasting */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecasting Penjualan</h3>
          <div className="space-y-4">
            {forecastData.map((forecast, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{forecast.period}</p>
                  <p className="text-xs text-gray-500 mt-1">Prediksi berdasarkan tren 6 bulan</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    Rp {(forecast.predicted / 1000000).toFixed(0)}M
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      forecast.confidence === 'High'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {forecast.confidence}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `${value / 1000000}M`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `Rp ${(value / 1000000).toFixed(0)}M`} />
                <Bar dataKey="predicted" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
