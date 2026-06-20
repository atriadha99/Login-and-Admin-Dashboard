import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type DbStatus = {
  tables: number;
  status: string;
  now: string | null;
  database_name?: string;
};

export default function DataConnectionPage() {
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState<DbStatus>({
    tables: 0,
    status: 'disconnected',
    now: null,
  });
  const [lastSync, setLastSync] = useState('Menunggu koneksi...');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getAuthHeaders = () => {
    const token = window.localStorage.getItem('abb-token');
    return token ? { Authorization: `Bearer ${token}` } : null;
  };

  const verifyConnection = async () => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      toast.error('Sesi tidak valid. Silakan login kembali.');
      navigate('/');
      return;
    }

    setIsRefreshing(true);
    try {
      const res = await fetch('/api/db-status', { headers: authHeaders });
      if (!res.ok) throw new Error('Gagal mengambil status database.');
      const result = await res.json();
      setDbStatus(result);
      setLastSync(new Date(result.now).toLocaleString('id-ID'));
      toast.success('Koneksi Neon PostgreSQL aktif.');
    } catch (error) {
      setDbStatus({ tables: 0, status: 'error', now: null });
      setLastSync('Koneksi gagal');
      toast.error('Gagal menghubungkan database Neon.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    verifyConnection();
  }, []);

  const getStatusBadge = () => {
    if (dbStatus.status === 'connected') {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
          <CheckCircle size={14} />
          Connected
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full">
        <XCircle size={14} />
        Disconnected
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Koneksi Database</h2>
          <p className="text-gray-600 mt-1">Monitoring status koneksi Neon PostgreSQL</p>
        </div>
        <button
          onClick={verifyConnection}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Memuat...' : 'Refresh Status'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
            <Database className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Neon PostgreSQL</h3>
              {getStatusBadge()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <span>Database: {dbStatus.database_name || 'Neon Serverless'}</span>
              <span>Last Sync: {lastSync}</span>
              <span>Total Tables: {dbStatus.tables || 0}</span>
              <span>Status Koneksi: {dbStatus.status === 'connected' ? 'Terhubung' : 'Tidak terhubung'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Status Neon PostgreSQL</p>
          <p className="text-3xl font-bold text-gray-900">{dbStatus.status === 'connected' ? 'OK' : 'Error'}</p>
          <p className="text-xs text-gray-500 mt-2">Realtime dari API /api/db-status</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Tables</p>
          <p className="text-3xl font-bold text-gray-900">{dbStatus.tables || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Schema public</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Last Sync</p>
          <p className="text-lg font-bold text-gray-900">{lastSync}</p>
          <p className="text-xs text-gray-500 mt-2">Waktu server database</p>
        </div>
      </div>
    </div>
  );
}
