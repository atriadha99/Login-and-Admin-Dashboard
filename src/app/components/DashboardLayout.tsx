import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, Truck, Users, TrendingUp, MapPin, BarChart3, Database, LogOut, Search, UserCog, Moon, Sun } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Admin User',
    role: 'Administrator',
    email: 'admin@ptabb.id',
  });

  const menuItems = [
    { icon: Home, label: 'Beranda', path: '/dashboard' },
    { icon: Truck, label: 'Data Armada', path: '/dashboard/armada' },
    { icon: Users, label: 'Driver', path: '/dashboard/driver' },
  ];

  const analysisItems = [
    { icon: TrendingUp, label: 'Penjualan', path: '/dashboard/penjualan' },
    { icon: MapPin, label: 'Distribusi', path: '/dashboard/distribusi' },
    { icon: BarChart3, label: 'Forecasting', path: '/dashboard/forecasting' },
  ];

  const searchIndex = [
    { label: 'Beranda', path: '/dashboard' },
    { label: 'Data Armada', path: '/dashboard/armada' },
    { label: 'Driver', path: '/dashboard/driver' },
    { label: 'Penjualan', path: '/dashboard/penjualan' },
    { label: 'Distribusi', path: '/dashboard/distribusi' },
    { label: 'Forecasting', path: '/dashboard/forecasting' },
    { label: 'Filter & Drill-Down', path: '/dashboard/filter' },
    { label: 'Koneksi Data', path: '/dashboard/data' },
  ];

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return searchIndex.filter((item) => item.label.toLowerCase().includes(term));
  }, [searchTerm]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('abb-theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const handleToggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    document.documentElement.classList.toggle('dark', nextMode);
    window.localStorage.setItem('abb-theme', nextMode ? 'dark' : 'light');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleSearchSelect = (path: string) => {
    setSearchTerm('');
    navigate(path);
  };

  return (
    <div className={`size-full flex ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r flex flex-col ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">PT ABB</h1>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Business Intelligence</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>Menu Utama</p>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-200'
                        : darkMode
                          ? 'text-slate-200 hover:bg-slate-800'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>Analisis</p>
            <div className="space-y-1">
              {analysisItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-200'
                        : darkMode
                          ? 'text-slate-200 hover:bg-slate-800'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <button
              onClick={() => navigate('/dashboard/filter')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/dashboard/filter'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-200'
                  : darkMode
                    ? 'text-slate-200 hover:bg-slate-800'
                    : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={20} />
              <span className="text-sm font-medium">Filter & Drill-Down</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/data')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/dashboard/data'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-200'
                  : darkMode
                    ? 'text-slate-200 hover:bg-slate-800'
                    : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Database size={20} />
              <span className="text-sm font-medium">Koneksi Data</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`border-b px-8 py-4 flex items-center justify-between ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Dashboard</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-600" />}
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              <UserCog size={16} className="text-blue-600" />
              Profil
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari menu dashboard..."
                className={`w-72 rounded-lg border py-2 pl-9 pr-3 text-sm outline-none ring-0 transition ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-100 focus:border-blue-400 focus:bg-slate-800' : 'border-gray-200 bg-gray-50 text-gray-700 focus:border-blue-300 focus:bg-white'}`}
              />
              {searchResults.length > 0 && (
                <div className={`absolute right-0 left-0 top-full z-20 mt-2 rounded-xl border p-2 shadow-lg ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
                  {searchResults.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleSearchSelect(item.path)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${darkMode ? 'text-slate-100 hover:bg-slate-800 hover:text-blue-200' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-gray-400">Go</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{profile.name}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{profile.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${darkMode ? 'text-red-300 hover:bg-red-950/60' : 'text-red-600 hover:bg-red-50'}`}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>

        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className={`w-full max-w-md rounded-2xl p-6 shadow-xl ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-gray-900'}`}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Edit Profil</h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Perbarui identitas akun admin Anda.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className={`rounded-lg px-3 py-1 text-sm ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Tutup
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>Nama Lengkap</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-gray-300 bg-white text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>Jabatan</label>
                  <input
                    value={profile.role}
                    onChange={(e) => setProfile((prev) => ({ ...prev, role: e.target.value }))}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-gray-300 bg-white text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>Email</label>
                  <input
                    value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-gray-300 bg-white text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className={`rounded-lg border px-4 py-2 text-sm ${darkMode ? 'border-slate-700 text-slate-100 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Simpan Profil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
