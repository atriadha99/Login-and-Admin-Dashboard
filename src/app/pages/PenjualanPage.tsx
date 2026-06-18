import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DollarSign, TrendingUp, ShoppingBag, Package, Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

// Utility function to parse CSV
const parseCSV = (text: string): string[][] => {
  const lines = text.split('\n').filter((line) => line.trim());
  return lines.map((line) => {
    const regex = /("(?:[^"]|"")*"|[^,]*)/g;
    const matches = line.match(regex) || [];
    return matches.map((field) => {
      let cleaned = field.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1).replace(/""/g, '"');
      }
      return cleaned;
    });
  });
};

const monthlyData = [
  { month: 'Jan', penjualan: 45000000, target: 42000000 },
  { month: 'Feb', penjualan: 52000000, target: 45000000 },
  { month: 'Mar', penjualan: 48000000, target: 47000000 },
  { month: 'Apr', penjualan: 61000000, target: 50000000 },
  { month: 'Mei', penjualan: 55000000, target: 52000000 },
  { month: 'Jun', penjualan: 67000000, target: 55000000 },
];

const productData = [
  { name: 'Galon 19L', value: 65, revenue: 195000000 },
  { name: 'Cup 240ml', value: 20, revenue: 60000000 },
  { name: 'Botol 600ml', value: 10, revenue: 30000000 },
  { name: 'Galon 12L', value: 5, revenue: 15000000 },
];

const regionSales = [
  { region: 'Bogor Utara', sales: 45000000 },
  { region: 'Cibinong', sales: 52000000 },
  { region: 'Bogor Barat', sales: 42000000 },
  { region: 'Bogor Selatan', sales: 38000000 },
  { region: 'Bogor Timur', sales: 35000000 },
  { region: 'Ciawi', sales: 28000000 },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

interface Transaction {
  id: string;
  date: string;
  customer: string;
  amount: number;
  region: string;
}

export default function PenjualanPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ customer: '', amount: '', date: '', region: '' });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<string[][]>([]);

  useEffect(() => {
    const userRole = window.localStorage.getItem('abb-role');
    if (userRole === 'Pemimpin') {
      toast.error('Anda tidak memiliki akses ke halaman ini.');
      navigate('/dashboard');
    }
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/penjualan');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data penjualan.');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalSales = monthlyData.reduce((acc, item) => acc + item.penjualan, 0);
  const avgSales = totalSales / monthlyData.length;
  const growth = ((monthlyData[monthlyData.length - 1].penjualan - monthlyData[0].penjualan) / monthlyData[0].penjualan) * 100;

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingId(transaction.id);
      setFormData({
        customer: transaction.customer,
        amount: transaction.amount.toString(),
        date: transaction.date,
        region: transaction.region,
      });
    } else {
      setEditingId(null);
      setFormData({ customer: '', amount: '', date: '', region: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ customer: '', amount: '', date: '', region: '' });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.customer || !formData.amount || !formData.date || !formData.region) {
      toast.error('Semua field harus diisi.');
      return;
    }

    if (editingId) {
      const updatedData = {
        customer: formData.customer,
        amount: parseInt(formData.amount),
        date: formData.date,
        region: formData.region,
      };

      try {
        const res = await fetch(`/api/penjualan/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
        if (res.ok) {
          toast.success('Data transaksi berhasil diperbarui.');
          fetchTransactions(); // Refresh data aktual
        } else throw new Error('API Error');
      } catch (error) {
        toast.error('Gagal memperbarui data penjualan.');
      }
    } else {
      const newId = `TRX-${String(transactions.length + 1).padStart(3, '0')}`;
      const newData = {
        id: newId,
        customer: formData.customer,
        amount: parseInt(formData.amount),
        date: formData.date,
        region: formData.region,
      };

      try {
        const res = await fetch('/api/penjualan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newData)
        });
        
        if (res.ok) {
          toast.success('Data transaksi berhasil ditambahkan ke database.');
          fetchTransactions();
        } else {
          throw new Error('API Response Error');
        }
      } catch (error) {
        toast.error('Gagal menambah data penjualan.');
      }
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const res = await fetch(`/api/penjualan/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Data transaksi berhasil dihapus.');
          fetchTransactions();
        } else throw new Error('API Error');
      } catch (error) {
        toast.error('Gagal menghapus data penjualan.');
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const isValidType = validTypes.some((type) => file.type.includes(type)) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isValidType) {
      toast.error('Format file tidak didukung. Gunakan CSV atau Excel.');
      return;
    }

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        toast.error('File kosong atau format tidak valid.');
        return;
      }

      setImportFile(file);
      setImportPreview(data.slice(0, 10));
      toast.success('File berhasil dibaca. Siap untuk diimpor.');
    } catch (error) {
      toast.error('Gagal membaca file. Pastikan format CSV atau Excel.');
    }
  };

  const handleConfirmImport = () => {
    if (!importFile || importPreview.length === 0) {
      toast.error('Tidak ada data untuk diimpor.');
      return;
    }

    // Parse the data starting from row 1 (skip header)
    const importedTransactions: Transaction[] = [];
    for (let i = 1; i < importPreview.length; i++) {
      const row = importPreview[i];
      if (row.length >= 4) {
        const transaction: Transaction = {
          id: `TRX-${Date.now()}-${i}`,
          date: row[0] || new Date().toISOString().split('T')[0],
          customer: row[1] || 'Unknown',
          amount: parseInt(row[2]) || 0,
          region: row[3] || 'Unknown',
        };
        importedTransactions.push(transaction);
      }
    }

    if (importedTransactions.length === 0) {
      toast.error('Tidak ada data yang valid dalam file.');
      return;
    }

    setTransactions((prev) => [...importedTransactions, ...prev]);
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    toast.success(`${importedTransactions.length} transaksi berhasil diimpor.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analisis Penjualan</h2>
        <p className="text-gray-600 mt-1">Dashboard penjualan dan tren bisnis</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+{growth.toFixed(1)}%</span>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Penjualan</h3>
          <p className="text-3xl font-bold text-gray-900">Rp {(totalSales / 1000000).toFixed(0)}M</p>
          <p className="text-xs text-gray-500 mt-2">6 bulan terakhir</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Rata-rata Bulanan</h3>
          <p className="text-3xl font-bold text-gray-900">Rp {(avgSales / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-500 mt-2">Per bulan</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <ShoppingBag className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Pencapaian Target</h3>
          <p className="text-3xl font-bold text-gray-900">112%</p>
          <p className="text-xs text-gray-500 mt-2">Bulan ini</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <Package className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Produk Terjual</h3>
          <p className="text-3xl font-bold text-gray-900">24,580</p>
          <p className="text-xs text-gray-500 mt-2">Unit produk</p>
        </div>
      </div>

      {/* Sales Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tren Penjualan vs Target</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip
              formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="penjualan" stroke="#2563eb" strokeWidth={3} name="Penjualan Aktual" />
            <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product Mix and Regional Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribusi Produk</h3>
          <div className="flex items-center justify-center mb-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {productData.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                </div>
                <span className="text-sm text-gray-600">Rp {(product.revenue / 1000000).toFixed(0)}M</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Sales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Penjualan per Wilayah</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionSales} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" tickFormatter={(value) => `${value / 1000000}M`} />
              <YAxis dataKey="region" type="category" stroke="#6b7280" width={100} />
              <Tooltip formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`} />
              <Bar dataKey="sales" fill="#2563eb" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Transaksi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Data Transaksi</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <Upload size={16} />
              Import Data
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Input Transaksi Baru
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-600 pb-3">ID</th>
                <th className="text-left text-xs font-semibold text-gray-600 pb-3">Tanggal</th>
                <th className="text-left text-xs font-semibold text-gray-600 pb-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-600 pb-3">Wilayah</th>
                <th className="text-right text-xs font-semibold text-gray-600 pb-3">Jumlah</th>
                <th className="text-center text-xs font-semibold text-gray-600 pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-600">{transaction.id}</td>
                  <td className="py-3 text-sm text-gray-600">{transaction.date}</td>
                  <td className="py-3 text-sm text-gray-900">{transaction.customer}</td>
                  <td className="py-3 text-sm text-gray-600">{transaction.region}</td>
                  <td className="py-3 text-sm text-gray-900 text-right font-medium">
                    Rp {(transaction.amount / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Insights */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insight Penjualan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <TrendingUp className="text-blue-600" size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Pertumbuhan Positif</p>
                <p className="text-xs text-gray-600">Penjualan meningkat {growth.toFixed(1)}% dalam 6 bulan terakhir. Tren menunjukkan momentum positif khususnya di wilayah Cibinong.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Package className="text-green-600" size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Produk Unggulan</p>
                <p className="text-xs text-gray-600">Galon 19L mendominasi dengan 65% dari total penjualan. Pertimbangkan untuk meningkatkan stok produk ini.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                <DollarSign className="text-purple-600" size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Target Tercapai</p>
                <p className="text-xs text-gray-600">Target penjualan bulan ini sudah melampaui 112%. Konsistensi performa sangat baik di semua wilayah.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                <ShoppingBag className="text-orange-600" size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Peluang Ekspansi</p>
                <p className="text-xs text-gray-600">Wilayah Ciawi menunjukkan potensi pertumbuhan. Pertimbangkan strategi marketing fokus untuk meningkatkan penetrasi pasar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Input/Edit Transaksi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Transaksi' : 'Input Transaksi Baru'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Customer</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Toko Sumber Rejeki"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Wilayah</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Wilayah</option>
                  <option value="Bogor Utara">Bogor Utara</option>
                  <option value="Bogor Selatan">Bogor Selatan</option>
                  <option value="Bogor Barat">Bogor Barat</option>
                  <option value="Bogor Timur">Bogor Timur</option>
                  <option value="Cibinong">Cibinong</option>
                  <option value="Ciawi">Ciawi</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 2500000"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                {editingId ? 'Perbarui' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Data Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={24} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Import Transaksi dari File</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                }}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {!importFile ? (
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                  <p className="mb-2 text-sm font-medium text-gray-900">Pilih file CSV atau Excel</p>
                  <p className="mb-4 text-xs text-gray-500">Drag & drop atau klik untuk memilih</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      Pilih File
                    </button>
                  </label>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-xs text-blue-800">
                    <strong>Format file:</strong> CSV atau Excel (.xlsx, .xls)<br/>
                    <strong>Kolom:</strong> Tanggal, Customer, Jumlah, Wilayah (dalam urutan tersebut)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Preview Data</label>
                  <div className="max-h-64 overflow-auto rounded-lg border border-gray-200 bg-gray-50">
                    <table className="w-full border-collapse text-xs">
                      <tbody>
                        {importPreview.map((row, rowIdx) => (
                          <tr key={rowIdx} className={rowIdx === 0 ? 'border-b-2 border-gray-300 bg-gray-100' : ''}>
                            {row.map((cell, cellIdx) => (
                              <td
                                key={cellIdx}
                                className="border border-gray-200 px-2 py-1 text-gray-700"
                              >
                                {cell.substring(0, 25)}
                                {cell.length > 25 ? '...' : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Akan mengimpor {Math.max(0, importPreview.length - 1)} transaksi
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImportFile(null);
                      setImportPreview([]);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Pilih File Lain
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Impor Transaksi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
