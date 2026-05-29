import { DollarSign, TrendingUp, ShoppingBag, Package } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

export default function PenjualanPage() {
  const totalSales = monthlyData.reduce((acc, item) => acc + item.penjualan, 0);
  const avgSales = totalSales / monthlyData.length;
  const growth = ((monthlyData[monthlyData.length - 1].penjualan - monthlyData[0].penjualan) / monthlyData[0].penjualan) * 100;

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
    </div>
  );
}
