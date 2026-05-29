import { useState } from 'react';
import { Database, FileSpreadsheet, Globe, CheckCircle, XCircle, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type DataSource = {
  id: string;
  name: string;
  type: 'mysql' | 'csv' | 'api';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  records?: number;
};

export default function DataConnectionPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: '1',
      name: 'MySQL Production DB',
      type: 'mysql',
      status: 'connected',
      lastSync: '2026-05-06 10:30',
      records: 12845,
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

  const handleConnect = (id: string) => {
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
    setDataSources(
      dataSources.map((source) =>
        source.id === id ? { ...source, status: 'disconnected' } : source
      )
    );
    toast.info('Koneksi diputus.');
  };

  const handleSync = (id: string) => {
    setDataSources(
      dataSources.map((source) =>
        source.id === id
          ? { ...source, lastSync: new Date().toLocaleString('id-ID'), records: (source.records || 0) + Math.floor(Math.random() * 100) }
          : source
      )
    );
    toast.success('Sinkronisasi data selesai.');
  };

  const handleRefreshAll = () => {
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
    </div>
  );
}
