import { TrendingUp, AlertTriangle, CheckCircle, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const historicalData = [
  { month: 'Jan', actual: 45000000, predicted: 43000000 },
  { month: 'Feb', actual: 52000000, predicted: 50000000 },
  { month: 'Mar', actual: 48000000, predicted: 49000000 },
  { month: 'Apr', actual: 61000000, predicted: 58000000 },
  { month: 'Mei', actual: 55000000, predicted: 56000000 },
  { month: 'Jun', actual: 67000000, predicted: 65000000 },
];

const forecastData = [
  { month: 'Jul', predicted: 72000000, lower: 68000000, upper: 76000000, confidence: 95 },
  { month: 'Agu', predicted: 69000000, lower: 64000000, upper: 74000000, confidence: 92 },
  { month: 'Sep', predicted: 75000000, lower: 69000000, upper: 81000000, confidence: 88 },
  { month: 'Okt', predicted: 78000000, lower: 71000000, upper: 85000000, confidence: 85 },
  { month: 'Nov', predicted: 82000000, lower: 74000000, upper: 90000000, confidence: 82 },
  { month: 'Des', predicted: 88000000, lower: 78000000, upper: 98000000, confidence: 78 },
];

const seasonalTrends = [
  { quarter: 'Q1 2026', value: 145000000, growth: 8.5 },
  { quarter: 'Q2 2026', value: 183000000, growth: 12.3 },
  { quarter: 'Q3 2026 (Pred)', value: 216000000, growth: 15.2 },
  { quarter: 'Q4 2026 (Pred)', value: 248000000, growth: 14.8 },
];

const keyIndicators = [
  {
    metric: 'Prediksi Penjualan Q3',
    value: 'Rp 216M',
    change: '+18.0%',
    status: 'positive',
    confidence: 'High',
  },
  {
    metric: 'Prediksi Penjualan Q4',
    value: 'Rp 248M',
    change: '+14.8%',
    status: 'positive',
    confidence: 'Medium',
  },
  {
    metric: 'Target Revenue 2026',
    value: 'Rp 792M',
    change: '+12.5%',
    status: 'on-track',
    confidence: 'High',
  },
  {
    metric: 'Pertumbuhan YoY',
    value: '+15.2%',
    change: 'vs 2025',
    status: 'positive',
    confidence: 'High',
  },
];

export default function ForecastingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Forecasting & Prediksi</h2>
        <p className="text-gray-600 mt-1">Proyeksi penjualan dan analisis tren bisnis</p>
      </div>

      {/* Key Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {keyIndicators.map((indicator, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                indicator.status === 'positive' ? 'bg-green-50' :
                indicator.status === 'on-track' ? 'bg-blue-50' :
                'bg-orange-50'
              }`}>
                {indicator.status === 'positive' ? (
                  <TrendingUp className="text-green-600" size={24} />
                ) : indicator.status === 'on-track' ? (
                  <CheckCircle className="text-blue-600" size={24} />
                ) : (
                  <AlertTriangle className="text-orange-600" size={24} />
                )}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                indicator.confidence === 'High' ? 'bg-green-100 text-green-700' :
                indicator.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {indicator.confidence}
              </span>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">{indicator.metric}</h3>
            <p className="text-3xl font-bold text-gray-900">{indicator.value}</p>
            <p className={`text-xs mt-2 ${
              indicator.status === 'positive' ? 'text-green-600' :
              indicator.status === 'on-track' ? 'text-blue-600' :
              'text-orange-600'
            }`}>
              {indicator.change}
            </p>
          </div>
        ))}
      </div>

      {/* Historical vs Predicted */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Akurasi Model Prediksi</h3>
          <p className="text-sm text-gray-600 mt-1">Perbandingan data aktual vs prediksi 6 bulan terakhir</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip
              formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} name="Penjualan Aktual" />
            <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Prediksi Model" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={18} />
            <p className="text-sm text-gray-900">
              <span className="font-semibold">Model Accuracy: 94.2%</span> - Model forecasting menunjukkan akurasi tinggi dengan margin error rata-rata 5.8%
            </p>
          </div>
        </div>
      </div>

      {/* Future Forecast */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Proyeksi Penjualan 6 Bulan Ke Depan</h3>
          <p className="text-sm text-gray-600 mt-1">Prediksi dengan confidence interval</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip
              formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Area type="monotone" dataKey="upper" stroke="none" fill="#e0e7ff" name="Upper Bound" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" name="Lower Bound" />
            <Line type="monotone" dataKey="predicted" stroke="#2563eb" strokeWidth={3} name="Prediksi" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detail Prediksi Bulanan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Bulan</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Prediksi</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Lower Bound</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Upper Bound</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Confidence</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.map((forecast, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-blue-600" size={16} />
                      <span className="text-sm font-medium text-gray-900">{forecast.month} 2026</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    Rp {(forecast.predicted / 1000000).toFixed(0)}M
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    Rp {(forecast.lower / 1000000).toFixed(0)}M
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    Rp {(forecast.upper / 1000000).toFixed(0)}M
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      forecast.confidence >= 90 ? 'bg-green-100 text-green-700' :
                      forecast.confidence >= 80 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {forecast.confidence}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                      Predicted Growth
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seasonal Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tren Seasonal (Quarterly)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {seasonalTrends.map((trend, index) => (
            <div key={index} className={`p-5 rounded-lg border-2 ${
              trend.quarter.includes('Pred') ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">{trend.quarter}</span>
                {trend.quarter.includes('Pred') && (
                  <BarChart3 className="text-blue-600" size={18} />
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                Rp {(trend.value / 1000000).toFixed(0)}M
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="text-green-600" size={14} />
                <span className="text-xs font-medium text-green-600">+{trend.growth}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Proyeksi Positif</h4>
              <p className="text-xs text-gray-600 mb-3">
                Model memprediksi pertumbuhan konsisten 12-15% per kuartal hingga akhir 2026. Momentum penjualan sangat kuat terutama di Q3 dan Q4.
              </p>
              <div className="space-y-1">
                <p className="text-xs text-gray-700">• Target revenue Rp 792M achievable</p>
                <p className="text-xs text-gray-700">• Peak season Q4: siapkan stok ekstra</p>
                <p className="text-xs text-gray-700">• Confidence level tinggi (85-95%)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Rekomendasi Strategis</h4>
              <p className="text-xs text-gray-600 mb-3">
                Berdasarkan analisis forecasting, berikut adalah action items untuk memaksimalkan performa:
              </p>
              <div className="space-y-1">
                <p className="text-xs text-gray-700">• Tingkatkan kapasitas produksi 20% untuk Q3</p>
                <p className="text-xs text-gray-700">• Optimalkan distribusi di wilayah Cibinong</p>
                <p className="text-xs text-gray-700">• Pertimbangkan ekspansi ke 2 wilayah baru</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
