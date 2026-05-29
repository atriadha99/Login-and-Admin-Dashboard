import { MapPin, TrendingUp, Truck, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const distributionData = [
  { region: 'Bogor Utara', deliveries: 156, onTime: 148, delayed: 8, distance: 45 },
  { region: 'Bogor Selatan', deliveries: 132, onTime: 128, delayed: 4, distance: 38 },
  { region: 'Bogor Barat', deliveries: 145, onTime: 139, delayed: 6, distance: 42 },
  { region: 'Bogor Timur', deliveries: 118, onTime: 112, delayed: 6, distance: 35 },
  { region: 'Cibinong', deliveries: 178, onTime: 172, delayed: 6, distance: 52 },
  { region: 'Ciawi', deliveries: 95, onTime: 89, delayed: 6, distance: 28 },
];

const weeklyTrend = [
  { day: 'Sen', deliveries: 142 },
  { day: 'Sel', deliveries: 138 },
  { day: 'Rab', deliveries: 155 },
  { day: 'Kam', deliveries: 148 },
  { day: 'Jum', deliveries: 162 },
  { day: 'Sab', deliveries: 178 },
  { day: 'Min', deliveries: 95 },
];

const deliverySchedule = [
  { time: '06:00 - 08:00', deliveries: 45, status: 'completed' },
  { time: '08:00 - 10:00', deliveries: 68, status: 'completed' },
  { time: '10:00 - 12:00', deliveries: 52, status: 'in-progress' },
  { time: '12:00 - 14:00', deliveries: 38, status: 'scheduled' },
  { time: '14:00 - 16:00', deliveries: 42, status: 'scheduled' },
  { time: '16:00 - 18:00', deliveries: 28, status: 'scheduled' },
];

export default function DistribusiPage() {
  const totalDeliveries = distributionData.reduce((acc, item) => acc + item.deliveries, 0);
  const totalOnTime = distributionData.reduce((acc, item) => acc + item.onTime, 0);
  const onTimeRate = (totalOnTime / totalDeliveries) * 100;
  const totalDistance = distributionData.reduce((acc, item) => acc + item.distance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analisis Distribusi</h2>
        <p className="text-gray-600 mt-1">Monitoring dan optimasi rute distribusi</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Truck className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Pengiriman</h3>
          <p className="text-3xl font-bold text-gray-900">{totalDeliveries}</p>
          <p className="text-xs text-gray-500 mt-2">Bulan ini</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <Clock className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Excellent</span>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">On-Time Rate</h3>
          <p className="text-3xl font-bold text-gray-900">{onTimeRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-2">{totalOnTime} dari {totalDeliveries} pengiriman</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <MapPin className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Jarak</h3>
          <p className="text-3xl font-bold text-gray-900">{totalDistance} km</p>
          <p className="text-xs text-gray-500 mt-2">Jarak tempuh distribusi</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Wilayah Aktif</h3>
          <p className="text-3xl font-bold text-gray-900">6</p>
          <p className="text-xs text-gray-500 mt-2">Area distribusi</p>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tren Pengiriman Mingguan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyTrend}>
            <defs>
              <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="deliveries" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorDeliveries)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution by Region */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribusi per Wilayah</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="region" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Bar dataKey="onTime" fill="#10b981" radius={[8, 8, 0, 0]} name="Tepat Waktu" stackId="a" />
            <Bar dataKey="delayed" fill="#ef4444" radius={[8, 8, 0, 0]} name="Terlambat" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Regional Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detail Statistik Wilayah</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Wilayah</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Total Pengiriman</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Tepat Waktu</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Terlambat</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">On-Time Rate</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Jarak (km)</th>
              </tr>
            </thead>
            <tbody>
              {distributionData.map((region) => {
                const rate = (region.onTime / region.deliveries) * 100;
                return (
                  <tr key={region.region} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-blue-600" size={16} />
                        <span className="text-sm font-medium text-gray-900">{region.region}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {region.deliveries}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">
                      {region.onTime}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right font-medium">
                      {region.delayed}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        rate >= 95 ? 'bg-green-100 text-green-700' :
                        rate >= 90 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {region.distance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Jadwal Pengiriman Hari Ini</h3>
        <div className="space-y-3">
          {deliverySchedule.map((schedule, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-gray-400" size={20} />
                  <span className="text-sm font-medium text-gray-900">{schedule.time}</span>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <span className="text-sm text-gray-600">{schedule.deliveries} pengiriman</span>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                schedule.status === 'completed' ? 'bg-green-100 text-green-700' :
                schedule.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {schedule.status === 'completed' ? 'Selesai' :
                 schedule.status === 'in-progress' ? 'Berlangsung' :
                 'Terjadwal'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Performa Terbaik</h4>
              <p className="text-xs text-gray-600 mb-2">
                Cibinong mencatat performa terbaik dengan 178 pengiriman dan on-time rate 96.6%. Rute ini sangat efisien.
              </p>
              <span className="text-xs font-medium text-blue-600">Pertahankan strategi ini</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="text-orange-600" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Area Perhatian</h4>
              <p className="text-xs text-gray-600 mb-2">
                Bogor Utara memiliki tingkat keterlambatan tertinggi (5.1%). Evaluasi rute dan jadwal pengiriman untuk wilayah ini.
              </p>
              <span className="text-xs font-medium text-orange-600">Butuh optimasi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
