import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Truck, Wrench, CheckCircle, AlertTriangle, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Vehicle = {
  id: string;
  plateNumber: string;
  type: string;
  driver: string;
  status: 'active' | 'maintenance' | 'idle';
  lastService: string;
  nextService: string;
  totalTrips: number;
  mileage: number;
};

export default function ArmadaPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ plateNumber: '', type: '', driver: '' });

  useEffect(() => {
    const userRole = window.localStorage.getItem('abb-role');
    if (userRole === 'Pemimpin') {
      toast.error('Anda tidak memiliki akses ke halaman ini.');
      navigate('/dashboard');
    }
  }, [navigate]);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/armada');
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data armada.');
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    if (!newVehicle.plateNumber || !newVehicle.type) {
      toast.error('Nomor polisi dan tipe kendaraan wajib diisi.');
      return;
    }

    const vehicle: Vehicle = {
      id: Math.random().toString(36).substring(2, 9),
      plateNumber: newVehicle.plateNumber,
      type: newVehicle.type,
      driver: newVehicle.driver || '-',
      status: 'idle',
      lastService: new Date().toISOString().split('T')[0],
      nextService: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      totalTrips: 0,
      mileage: 0,
    };

    try {
      const res = await fetch('/api/armada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle)
      });
      if (res.ok) {
        toast.success(`Kendaraan ${vehicle.plateNumber} berhasil ditambahkan ke database.`);
        fetchVehicles();
      } else throw new Error('API Error');
    } catch (error) {
      toast.error('Gagal menambah data armada.');
    }
    
    setShowAddModal(false);
    setNewVehicle({ plateNumber: '', type: '', driver: '' });
  };

  const handleScheduleService = async (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    const updatedVehicle = {
      ...vehicle,
      status: 'maintenance' as const,
      lastService: new Date().toISOString().split('T')[0],
      nextService: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    try {
      const res = await fetch(`/api/armada/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVehicle)
      });
      if (res.ok) {
        toast.success(`Jadwal service untuk ${vehicle.plateNumber} berhasil diupdate ke database.`);
        fetchVehicles();
      } else throw new Error('API Error');
    } catch (error) {
      toast.error('Gagal menjadwalkan service.');
    }
  };

  const handleDeleteVehicle = async (id: string, plateNumber: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kendaraan ${plateNumber}?`)) {
      try {
        const res = await fetch(`/api/armada/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Data kendaraan berhasil dihapus dari database.');
          fetchVehicles();
        } else throw new Error('API Error');
      } catch (error) {
        toast.error('Gagal menghapus data armada.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <CheckCircle size={14} />
            Aktif
          </span>
        );
      case 'maintenance':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
            <Wrench size={14} />
            Maintenance
          </span>
        );
      case 'idle':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            <AlertTriangle size={14} />
            Idle
          </span>
        );
      default:
        return null;
    }
  };

  const activeVehicles = vehicles.filter((v) => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;
  const idleVehicles = vehicles.filter((v) => v.status === 'idle').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Armada</h2>
          <p className="text-gray-600 mt-1">Manajemen kendaraan dan jadwal perawatan</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Tambah Kendaraan
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Truck className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Armada</h3>
          <p className="text-3xl font-bold text-gray-900">{vehicles.length}</p>
          <p className="text-xs text-gray-500 mt-2">Unit kendaraan</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Kendaraan Aktif</h3>
          <p className="text-3xl font-bold text-gray-900">{activeVehicles}</p>
          <p className="text-xs text-gray-500 mt-2">{vehicles.length > 0 ? ((activeVehicles / vehicles.length) * 100).toFixed(0) : 0}% dari total</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <Wrench className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Dalam Perawatan</h3>
          <p className="text-3xl font-bold text-gray-900">{maintenanceVehicles}</p>
          <p className="text-xs text-gray-500 mt-2">Butuh perhatian</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
              <AlertTriangle className="text-gray-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Idle</h3>
          <p className="text-3xl font-bold text-gray-900">{idleVehicles}</p>
          <p className="text-xs text-gray-500 mt-2">Tidak beroperasi</p>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Kendaraan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Nomor Polisi</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Tipe Kendaraan</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Driver</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Service Terakhir</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-6 py-4">Service Berikutnya</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Total Trip</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-6 py-4">Km Tempuh</th>
                <th className="text-center text-xs font-semibold text-gray-600 px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <span>Belum ada data armada. Silakan tambah data baru melalui form.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{vehicle.plateNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{vehicle.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {vehicle.driver || <span className="text-gray-400">Tidak ada</span>}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(vehicle.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {vehicle.lastService}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {vehicle.nextService}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {vehicle.totalTrips}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {vehicle.mileage.toLocaleString('id-ID')} km
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDeleteVehicle(vehicle.id, vehicle.plateNumber)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Jadwal Perawatan Mendatang</h3>
        <div className="space-y-3">
          {vehicles
            .filter((v) => new Date(v.nextService) <= new Date('2026-07-01'))
            .map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Wrench className="text-yellow-700" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vehicle.plateNumber} - {vehicle.type}</p>
                    <p className="text-xs text-gray-600">Service berikutnya: {vehicle.nextService}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleScheduleService(vehicle.id)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  Jadwalkan
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Tambah Kendaraan</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Polisi</label>
                <input
                  type="text"
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                  placeholder="B 1234 ABC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Kendaraan</label>
                <input
                  type="text"
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  placeholder="Truk Tangki 5000L"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver (Opsional)</label>
                <input
                  type="text"
                  value={newVehicle.driver}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driver: e.target.value })}
                  placeholder="Nama Driver"
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
                onClick={handleAddVehicle}
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
