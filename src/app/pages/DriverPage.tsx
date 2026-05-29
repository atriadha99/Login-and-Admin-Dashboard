import { useState } from 'react';
import { User, Star, TrendingUp, Award, Phone, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: 'available' | 'on-trip' | 'off-duty';
  rating: number;
  totalTrips: number;
  completedTrips: number;
  revenue: number;
  joinDate: string;
};

const initialDrivers: Driver[] = [
  {
    id: '1',
    name: 'Ahmad Suryadi',
    phone: '+62 812-3456-7890',
    vehicle: 'B 1234 ABC',
    status: 'on-trip',
    rating: 4.8,
    totalTrips: 245,
    completedTrips: 243,
    revenue: 98500000,
    joinDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Budi Santoso',
    phone: '+62 813-4567-8901',
    vehicle: 'B 5678 DEF',
    status: 'available',
    rating: 4.6,
    totalTrips: 198,
    completedTrips: 195,
    revenue: 76200000,
    joinDate: '2024-03-20',
  },
  {
    id: '3',
    name: 'Dedi Kurniawan',
    phone: '+62 814-5678-9012',
    vehicle: 'B 3456 JKL',
    status: 'on-trip',
    rating: 4.9,
    totalTrips: 167,
    completedTrips: 167,
    revenue: 68900000,
    joinDate: '2024-05-10',
  },
  {
    id: '4',
    name: 'Eko Prasetyo',
    phone: '+62 815-6789-0123',
    vehicle: '-',
    status: 'off-duty',
    rating: 4.5,
    totalTrips: 134,
    completedTrips: 131,
    revenue: 52400000,
    joinDate: '2024-06-15',
  },
  {
    id: '5',
    name: 'Firman Hidayat',
    phone: '+62 816-7890-1234',
    vehicle: '-',
    status: 'available',
    rating: 4.7,
    totalTrips: 89,
    completedTrips: 88,
    revenue: 34600000,
    joinDate: '2025-01-08',
  },
];

const performanceData = [
  { month: 'Jan', trips: 42, revenue: 16800000 },
  { month: 'Feb', trips: 38, revenue: 15200000 },
  { month: 'Mar', trips: 45, revenue: 18000000 },
  { month: 'Apr', trips: 51, revenue: 20400000 },
  { month: 'Mei', trips: 48, revenue: 19200000 },
];

export default function DriverPage() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicle: '' });

  const handleAddDriver = () => {
    if (!newDriver.name.trim() || !newDriver.phone.trim()) {
      toast.error('Nama lengkap dan nomor HP wajib diisi.');
      return;
    }

    const driver: Driver = {
      id: Math.random().toString(36).substring(2, 9),
      name: newDriver.name.trim(),
      phone: newDriver.phone.trim(),
      vehicle: newDriver.vehicle.trim() || '-',
      status: 'available',
      rating: 5.0,
      totalTrips: 0,
      completedTrips: 0,
      revenue: 0,
      joinDate: new Date().toISOString().split('T')[0],
    };
    setDrivers((prev) => [driver, ...prev]);
    setShowAddModal(false);
    setNewDriver({ name: '', phone: '', vehicle: '' });
    toast.success(`Driver ${driver.name} berhasil ditambahkan.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
            Tersedia
          </span>
        );
      case 'on-trip':
        return (
          <span className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
            Dalam Perjalanan
          </span>
        );
      case 'off-duty':
        return (
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            Off Duty
          </span>
        );
      default:
        return null;
    }
  };

  const availableDrivers = drivers.filter((d) => d.status === 'available').length;
  const onTripDrivers = drivers.filter((d) => d.status === 'on-trip').length;
  const totalRevenue = drivers.reduce((acc, d) => acc + d.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Driver</h2>
          <p className="text-gray-600 mt-1">Manajemen driver dan performa pengiriman</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Tambah Driver
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <User className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Driver</h3>
          <p className="text-3xl font-bold text-gray-900">{drivers.length}</p>
          <p className="text-xs text-gray-500 mt-2">Driver terdaftar</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <MapPin className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Driver Tersedia</h3>
          <p className="text-3xl font-bold text-gray-900">{availableDrivers}</p>
          <p className="text-xs text-gray-500 mt-2">Siap bertugas</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Dalam Perjalanan</h3>
          <p className="text-3xl font-bold text-gray-900">{onTripDrivers}</p>
          <p className="text-xs text-gray-500 mt-2">Sedang beroperasi</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <Award className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Pendapatan</h3>
          <p className="text-3xl font-bold text-gray-900">Rp {(totalRevenue / 1000000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-500 mt-2">Dari semua driver</p>
        </div>
      </div>

      {/* Driver Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performa Driver (5 Bulan Terakhir)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return `Rp ${(value / 1000000).toFixed(1)}M`;
                return value;
              }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Bar dataKey="trips" fill="#2563eb" radius={[8, 8, 0, 0]} name="Total Trip" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Driver List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Driver</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Driver</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Kontak</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Kendaraan</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Rating</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Total Trip</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Selesai</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                        <p className="text-xs text-gray-500">Bergabung: {driver.joinDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      {driver.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {driver.vehicle || <span className="text-gray-400">Tidak ada</span>}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(driver.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
                      <span className="text-sm font-medium text-gray-900">{driver.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    {driver.totalTrips}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    {driver.completedTrips}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    Rp {(driver.revenue / 1000000).toFixed(1)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award className="text-yellow-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Driver Terbaik Bulan Ini</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drivers
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3)
            .map((driver, index) => (
              <div key={driver.id} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{driver.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                        <span className="text-xs font-medium text-gray-700">{driver.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>Total Trip: <span className="font-medium text-gray-900">{driver.totalTrips}</span></p>
                  <p>Pendapatan: <span className="font-medium text-gray-900">Rp {(driver.revenue / 1000000).toFixed(1)}M</span></p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Tambah Driver</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor HP</label>
                <input
                  type="text"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  placeholder="+62 8..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kendaraan (Opsional)</label>
                <input
                  type="text"
                  value={newDriver.vehicle}
                  onChange={(e) => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                  placeholder="B 1234 ABC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddDriver}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
