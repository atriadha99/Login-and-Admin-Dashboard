import { useState } from 'react';
import { Truck, Wrench, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
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

const initialVehicles: Vehicle[] = [
  {
    id: '1',
    plateNumber: 'B 1234 ABC',
    type: 'Truk Tangki 5000L',
    driver: 'Ahmad Suryadi',
    status: 'active',
    lastService: '2026-04-15',
    nextService: '2026-07-15',
    totalTrips: 245,
    mileage: 45820,
  },
  {
    id: '2',
    plateNumber: 'B 5678 DEF',
    type: 'Truk Tangki 3000L',
    driver: 'Budi Santoso',
    status: 'active',
    lastService: '2026-04-20',
    nextService: '2026-07-20',
    totalTrips: 198,
    mileage: 38450,
  },
  {
    id: '3',
    plateNumber: 'B 9012 GHI',
    type: 'Truk Tangki 5000L',
    driver: '-',
    status: 'maintenance',
    lastService: '2026-05-01',
    nextService: '2026-08-01',
    totalTrips: 312,
    mileage: 52300,
  },
  {
    id: '4',
    plateNumber: 'B 3456 JKL',
    type: 'Truk Tangki 3000L',
    driver: 'Dedi Kurniawan',
    status: 'active',
    lastService: '2026-03-28',
    nextService: '2026-06-28',
    totalTrips: 167,
    mileage: 31200,
  },
  {
    id: '5',
    plateNumber: 'B 7890 MNO',
    type: 'Truk Box 2000L',
    driver: '-',
    status: 'idle',
    lastService: '2026-04-10',
    nextService: '2026-07-10',
    totalTrips: 89,
    mileage: 18750,
  },
];

export default function ArmadaPage() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ plateNumber: '', type: '', driver: '' });

  const handleAddVehicle = () => {
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
    setVehicles([...vehicles, vehicle]);
    setShowAddModal(false);
    setNewVehicle({ plateNumber: '', type: '', driver: '' });
    toast.success(`Kendaraan ${vehicle.plateNumber} berhasil ditambahkan.`);
  };

  const handleScheduleService = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              status: 'maintenance',
              lastService: new Date().toISOString().split('T')[0],
              nextService: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }
          : vehicle
      )
    );

    const scheduledVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);
    toast.success(`Jadwal service untuk ${scheduledVehicle?.plateNumber || 'kendaraan'} berhasil dikirim ke bengkel.`);
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
          <p className="text-xs text-gray-500 mt-2">{((activeVehicles / vehicles.length) * 100).toFixed(0)}% dari total</p>
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
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
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
                </tr>
              ))}
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
