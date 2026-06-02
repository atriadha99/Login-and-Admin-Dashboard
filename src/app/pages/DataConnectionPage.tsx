import { useEffect, useState } from 'react';
import { Database, FileSpreadsheet, Globe, CheckCircle, XCircle, Download, RefreshCw, Clock, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { testNeonConnection } from '../../lib/neon';

// Utility function to parse CSV
const parseCSV = (text: string): string[][] => {
  const lines = text.split('\n').filter((line) => line.trim());
  return lines.map((line) => {
    // Handle quoted fields
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

// Utility function to parse Excel (simple approach - reads as text)
const parseExcel = (text: string): string[][] => {
  return parseCSV(text);
};

type DataSource = {
  id: string;
  name: string;
  type: 'mysql' | 'csv' | 'api';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  records?: number;
};

type ScheduledRefresh = {
  id: string;
  sourceId: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  time: string;
  enabled: boolean;
  lastRun?: string;
};

export default function DataConnectionPage() {
  const [userRole, setUserRole] = useState<'Admin' | 'Pemimpin'>('Admin');
  const [schedules, setSchedules] = useState<ScheduledRefresh[]>([
    {
      id: '1',
      sourceId: 'env-neon',
      frequency: 'daily',
      time: '02:00',
      enabled: true,
      lastRun: '2026-05-07 02:15',
    },
  ]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    sourceId: 'env-neon',
    frequency: 'daily' as const,
    time: '02:00',
  });
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: 'env-neon',
      name: 'Neon Database (ENV)',
      type: 'mysql',
      status: 'disconnected',
      lastSync: 'Menunggu koneksi...',
      records: 0,
    },
    {
      id: '2',
      name: 'Sales Data CSV',
      type: 'csv',
      status: 'connected',
      lastSync: '2026-05-06 09:15',
      records: 5420,
    },
    {
      id: '3',
      name: 'External API',
      type: 'api',
      status: 'disconnected',
      lastSync: '2026-05-05 14:22',
      records: 0,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [newSourceType, setNewSourceType] = useState<'mysql' | 'csv' | 'api'>('mysql');
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceHost, setNewSourceHost] = useState('');
  const [newSourceDatabase, setNewSourceDatabase] = useState('');
  const [newSourceEndpoint, setNewSourceEndpoint] = useState('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<string[][]>([]);
  const [importSourceName, setImportSourceName] = useState('');

  useEffect(() => {
    let active = true;

    const savedRole = window.localStorage.getItem('abb-role');
    if (savedRole === 'Pemimpin' || savedRole === 'Admin') {
      setUserRole(savedRole);
    }

    const verifyConnection = async () => {
      try {
        const result = await testNeonConnection();
        if (!active) return;

        setDataSources((prev) =>
          prev.map((source) =>
            source.id === 'env-neon'
              ? {
                  ...source,
                  status: 'connected',
                  lastSync: `Connected at ${new Date(result.now_at).toLocaleString('id-ID')}`,
                  records: 1,
                }
              : source
          )
        );
        toast.success(`Database ENV terhubung: ${result.database_name}`);
      } catch (error) {
        if (!active) return;
        setDataSources((prev) =>
          prev.map((source) =>
            source.id === 'env-neon'
              ? { ...source, status: 'error', lastSync: 'Koneksi gagal' }
              : source
          )
        );
        toast.error('Gagal menghubungkan database dari env.');
      }
    };

    verifyConnection();

    return () => {
      active = false;
    };
  }, []);

  const handleAddSchedule = () => {
    if (!scheduleForm.sourceId || !scheduleForm.time) {
      toast.error('Silakan lengkapi semua field.');
      return;
    }

    const newSchedule: ScheduledRefresh = {
      id: `${Date.now()}`,
      sourceId: scheduleForm.sourceId,
      frequency: scheduleForm.frequency,
      time: scheduleForm.time,
      enabled: true,
      lastRun: undefined,
    };

    setSchedules((prev) => [newSchedule, ...prev]);
    toast.success('Scheduled Refresh berhasil ditambahkan.');
    setShowScheduleModal(false);
    setScheduleForm({ sourceId: 'env-neon', frequency: 'daily', time: '02:00' });
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? { ...schedule, enabled: !schedule.enabled } : schedule
      )
    );
    toast.success('Scheduled Refresh diperbarui.');
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    toast.success('Scheduled Refresh berhasil dihapus.');
  };

  const getSourceName = (sourceId: string) => {
    return dataSources.find((s) => s.id === sourceId)?.name || 'Unknown Source';
  };

  const handleConnect = async (id: string) => {
    if (id === 'env-neon') {
      try {
        const result = await testNeonConnection();
        setDataSources((prev) =>
          prev.map((source) =>
            source.id === id
              ? {
                  ...source,
                  status: 'connected',
                  lastSync: `Connected at ${new Date(result.now_at).toLocaleString('id-ID')}`,
                  records: 1,
                }
              : source
          )
        );
        toast.success(`Koneksi sukses ke ${result.database_name}.`);
      } catch (error) {
        setDataSources((prev) =>
          prev.map((source) =>
            source.id === id ? { ...source, status: 'error', lastSync: 'Koneksi gagal' } : source
          )
        );
        toast.error('Gagal menghubungkan database dari env.');
      }
      return;
    }
    setDataSources(
      dataSources.map((source) =>
        source.id === id
          ? { ...source, status: 'connected', lastSync: new Date().toLocaleString('id-ID') }
          : source
      )
    );
    toast.success('Koneksi berhasil diaktifkan.');
  };

  const handleDisconnect = (id: string) => {
    if (id === 'env-neon') {
      setDataSources((prev) =>
        prev.map((source) => (source.id === id ? { ...source, status: 'disconnected', lastSync: 'Terputus dari ENV' } : source))
      );
      toast.info('Koneksi ENV diputus.');
      return;
    }
    setDataSources(
      dataSources.map((source) =>
        source.id === id ? { ...source, status: 'disconnected' } : source
      )
    );
    toast.info('Koneksi diputus.');
  };

  const handleSync = async (id: string) => {
    if (id === 'env-neon') {
      try {
        const result = await testNeonConnection();
        setDataSources((prev) =>
          prev.map((source) =>
            source.id === id
              ? {
                  ...source,
                  lastSync: `Synced at ${new Date(result.now_at).toLocaleString('id-ID')}`,
                  records: (source.records || 0) + 1,
                }
              : source
          )
        );
        toast.success('Sinkronisasi dari Neon ENV selesai.');
      } catch (error) {
        toast.error('Sinkronisasi gagal: database ENV tidak tersedia.');
      }
      return;
    }
    setDataSources(
      dataSources.map((source) =>
        source.id === id
          ? { ...source, lastSync: new Date().toLocaleString('id-ID'), records: (source.records || 0) + Math.floor(Math.random() * 100) }
          : source
      )
    );
    toast.success('Sinkronisasi data selesai.');
  };

  const handleRefreshAll = async () => {
    try {
      const result = await testNeonConnection();
      setDataSources((prev) =>
        prev.map((source) =>
          source.id === 'env-neon'
            ? {
                ...source,
                status: 'connected',
                lastSync: `Refreshed at ${new Date(result.now_at).toLocaleString('id-ID')}`,
                records: (source.records || 0) + 1,
              }
            : source
        )
      );
      toast.success('Koneksi ENV berhasil disegarkan.');
      return;
    } catch (error) {
      setDataSources((prev) =>
        prev.map((source) =>
          source.id === 'env-neon' ? { ...source, status: 'error', lastSync: 'Refresh gagal' } : source
        )
      );
      toast.error('Refresh gagal: database ENV tidak tersedia.');
    }
    setDataSources((prev) =>
      prev.map((source) =>
        source.status === 'connected'
          ? {
              ...source,
              lastSync: new Date().toLocaleString('id-ID'),
              records: (source.records || 0) + Math.floor(Math.random() * 50),
            }
          : source
      )
    );
    toast.success('Semua koneksi aktif berhasil disegarkan.');
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const exportFileExtension = exportFormat === 'csv' ? 'csv' : exportFormat === 'excel' ? 'xlsx' : 'pdf';
      const contentMap = {
        csv: [
          ['Nama Sumber', 'Tipe', 'Status', 'Records'],
          ...dataSources.map((source) => [source.name, source.type.toUpperCase(), source.status, source.records || 0]),
        ]
          .map((row) => row.join(','))
          .join('\n'),
        excel: [
          'Laporan Excel Dashboard',
          `Total sumber data: ${dataSources.length}`,
          `Total records: ${dataSources.reduce((acc, source) => acc + (source.records || 0), 0).toLocaleString('id-ID')}`,
          '---',
          ...dataSources.map((source) => `${source.name}\t${source.type.toUpperCase()}\t${source.status}`),
        ].join('\n'),
        pdf: [
          'Laporan PDF Dashboard',
          `Periode: ${new Date().toLocaleDateString('id-ID')}`,
          `Sumber data aktif: ${dataSources.filter((source) => source.status === 'connected').length}`,
          `Total records: ${dataSources.reduce((acc, source) => acc + (source.records || 0), 0).toLocaleString('id-ID')}`,
        ].join('\n'),
      };

      const blob = new Blob([contentMap[exportFormat]], {
        type: exportFormat === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-data.${exportFileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setIsExporting(false);
      toast.success(`Laporan ${exportFormat.toUpperCase()} berhasil disiapkan.`);
    }, 300);
  };

  const handleAddSource = () => {
    if (!newSourceName.trim()) {
      toast.error('Nama sumber data wajib diisi.');
      return;
    }

    const newSource: DataSource = {
      id: `${Date.now()}`,
      name: newSourceName.trim(),
      type: newSourceType,
      status: 'disconnected',
      lastSync: 'Baru ditambahkan',
      records: 0,
    };

    setDataSources((prev) => [newSource, ...prev]);
    setShowAddModal(false);
    setNewSourceName('');
    setNewSourceHost('');
    setNewSourceDatabase('');
    setNewSourceEndpoint('');
    toast.success(`Sumber data "${newSource.name}" berhasil ditambahkan.`);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const isValidType = validTypes.some((type) => file.type.includes(type)) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isValidType) {
      toast.error('Format file tidak didukung. Gunakan CSV atau Excel.');
      return;
    }

    try {
      const text = await file.text();
      const data = file.name.endsWith('.csv') ? parseCSV(text) : parseExcel(text);

      if (data.length === 0) {
        toast.error('File kosong atau format tidak valid.');
        return;
      }

      setImportFile(file);
      setImportPreview(data.slice(0, 10)); // Show first 10 rows
      setImportSourceName(file.name.replace(/\.[^/.]+$/, '')); // Remove file extension
      toast.success('File berhasil dibaca. Siap untuk diimpor.');
    } catch (error) {
      toast.error('Gagal membaca file. Pastikan format CSV atau Excel.');
    }
  };

  const handleConfirmImport = () => {
    if (!importFile || !importSourceName.trim()) {
      toast.error('Silakan pilih file dan beri nama sumber data.');
      return;
    }

    const newSource: DataSource = {
      id: `${Date.now()}`,
      name: importSourceName.trim(),
      type: 'csv',
      status: 'connected',
      lastSync: new Date().toLocaleString('id-ID'),
      records: Math.max(0, importPreview.length - 1), // Subtract header row
    };

    setDataSources((prev) => [newSource, ...prev]);
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    setImportSourceName('');
    toast.success(`Data dari "${newSource.name}" berhasil diimpor dengan ${newSource.records} record.`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mysql':
        return <Database className="text-blue-600" size={24} />;
      case 'csv':
        return <FileSpreadsheet className="text-green-600" size={24} />;
      case 'api':
        return <Globe className="text-purple-600" size={24} />;
      default:
        return <Database className="text-gray-600" size={24} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <CheckCircle size={14} />
            Connected
          </span>
        );
      case 'disconnected':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            <XCircle size={14} />
            Disconnected
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full">
            <XCircle size={14} />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Koneksi Data & Ekspor</h2>
          <p className="text-gray-600 mt-1">Kelola sumber data dan ekspor laporan</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAll}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh Semua
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Upload size={16} />
            Import Data
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Tambah Sumber Data
          </button>
        </div>
      </div>

      {/* Data Sources */}
      <div className="grid grid-cols-1 gap-4">
        {dataSources.map((source) => (
          <div key={source.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                  {getIcon(source.type)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                    {getStatusBadge(source.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Type: {source.type.toUpperCase()}</span>
                    {source.lastSync && <span>Last Sync: {source.lastSync}</span>}
                    {source.records !== undefined && <span>Records: {source.records.toLocaleString('id-ID')}</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {source.status === 'connected' && (
                  <>
                    <button
                      onClick={() => handleSync(source.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw size={16} />
                      Sync
                    </button>
                    <button
                      onClick={() => handleDisconnect(source.id)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                )}
                {source.status !== 'connected' && (
                  <button
                    onClick={() => handleConnect(source.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Download className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Ekspor Data</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Format Ekspor</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">PDF Document</p>
                  <p className="text-xs text-gray-500">Format laporan untuk presentasi dan arsip</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportFormat"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Excel Spreadsheet</p>
                  <p className="text-xs text-gray-500">Format data yang dapat diedit dan dianalisis</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">CSV File</p>
                  <p className="text-xs text-gray-500">Format universal untuk integrasi dengan sistem lain</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Preview Export</label>
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-center mb-4">
                <Download className="text-gray-400" size={48} />
              </div>
              <p className="text-center text-sm text-gray-600 mb-4">
                Export akan mencakup semua data yang difilter dari dashboard
              </p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span className="font-medium text-gray-900">18,265</span>
                </div>
                <div className="flex justify-between">
                  <span>Date Range:</span>
                  <span className="font-medium text-gray-900">Jan - May 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>File Size (est.):</span>
                  <span className="font-medium text-gray-900">
                    {exportFormat === 'pdf' ? '2.4 MB' : exportFormat === 'excel' ? '1.8 MB' : '850 KB'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isExporting ? 'Mempersiapkan file...' : `Export ${exportFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Data Sources</p>
          <p className="text-3xl font-bold text-gray-900">{dataSources.length}</p>
          <p className="text-xs text-gray-500 mt-2">
            {dataSources.filter((s) => s.status === 'connected').length} active connections
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Records</p>
          <p className="text-3xl font-bold text-gray-900">
            {dataSources.reduce((acc, s) => acc + (s.records || 0), 0).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500 mt-2">Across all data sources</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Last Export</p>
          <p className="text-3xl font-bold text-gray-900">2 hrs ago</p>
          <p className="text-xs text-gray-500 mt-2">Format: PDF, Size: 2.1 MB</p>
        </div>
      </div>

      {/* Scheduled Refresh Section - Admin Only */}
      {userRole === 'Admin' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Refresh</h3>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              + Tambah Jadwal
            </button>
          </div>

          <div className="space-y-3">
            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-gray-500 text-sm">Belum ada jadwal refresh. Klik tombol di atas untuk menambahkan.</p>
              </div>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900">{getSourceName(schedule.sourceId)}</h4>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          schedule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {schedule.enabled ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Frekuensi: {schedule.frequency === 'hourly' ? 'Setiap Jam' : schedule.frequency === 'daily' ? 'Setiap Hari' : 'Setiap Minggu'}</span>
                      <span>Waktu: {schedule.time}</span>
                      {schedule.lastRun && <span>Run terakhir: {schedule.lastRun}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSchedule(schedule.id)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        schedule.enabled
                          ? 'border border-gray-300 text-gray-700 hover:bg-gray-200'
                          : 'border border-blue-300 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {schedule.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Hapus"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Schedule Modal - Admin Only */}
      {userRole === 'Admin' && showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Scheduled Refresh</h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Pilih Sumber Data</label>
                <select
                  value={scheduleForm.sourceId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, sourceId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dataSources.filter((s) => s.status === 'connected').map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Frekuensi</label>
                <select
                  value={scheduleForm.frequency}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">Setiap Jam</option>
                  <option value="daily">Setiap Hari</option>
                  <option value="weekly">Setiap Minggu</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Waktu Eksekusi</label>
                <input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddSchedule}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Data Source Modal */}
      {showAddModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Tambah Sumber Data</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Sumber Data</label>
                <input
                  type="text"
                  placeholder="Masukkan nama sumber data"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Koneksi</label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mysql">MySQL Database</option>
                  <option value="csv">CSV File</option>
                  <option value="api">External API</option>
                </select>
              </div>

              {newSourceType === 'mysql' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Host</label>
                    <input
                      type="text"
                      value={newSourceHost}
                      onChange={(e) => setNewSourceHost(e.target.value)}
                      placeholder="localhost:3306"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Database Name</label>
                    <input
                      type="text"
                      value={newSourceDatabase}
                      onChange={(e) => setNewSourceDatabase(e.target.value)}
                      placeholder="database_name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {newSourceType === 'api' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
                  <input
                    type="text"
                    value={newSourceEndpoint}
                    onChange={(e) => setNewSourceEndpoint(e.target.value)}
                    placeholder="https://api.example.com/data"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddSource}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tambah Sumber Data
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
                <h3 className="text-lg font-semibold text-gray-900">Import Data dari File</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                  setImportSourceName('');
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
                    <strong>Format yang didukung:</strong> CSV dan Excel (.xlsx, .xls). File harus memiliki header di baris pertama.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Nama Sumber Data</label>
                  <input
                    type="text"
                    value={importSourceName}
                    onChange={(e) => setImportSourceName(e.target.value)}
                    placeholder="Contoh: Sales Data 2026"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
                                {cell.substring(0, 30)}
                                {cell.length > 30 ? '...' : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Menampilkan {Math.min(10, importPreview.length)} dari {importPreview.length} baris ({Math.max(0, importPreview.length - 1)} record data)
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImportFile(null);
                      setImportPreview([]);
                      setImportSourceName('');
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
                    Impor Data
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
