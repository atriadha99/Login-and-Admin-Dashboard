import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Pemimpin' | 'Dispatcher'>('Dispatcher');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, role })
      });
      
      if (!res.ok) {
        const errorText = await res.text(); // Baca body sebagai teks HANYA SEKALI.
        let errorMessage = `Terjadi kesalahan: ${res.statusText}`;
        try {
          // Coba parse teks yang sudah dibaca sebagai JSON.
          const errJson = JSON.parse(errorText);
          errorMessage = errJson.message || 'Email atau password salah';
        } catch (jsonError) {
          // Jika parsing gagal, gunakan teks mentah sebagai pesan error (jika ada).
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      window.localStorage.setItem('abb-role', data.role);
      window.localStorage.setItem('abb-user', data.name);
      if (data.token) {
        window.localStorage.setItem('abb-token', data.token);
      }
      toast.success('Login berhasil. Mengalihkan ke dashboard...');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Gagal login. Pastikan API backend menyala.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password) {
      toast.error('Semua kolom wajib diisi.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, role: 'Dispatcher' })
      });
      
      if (!res.ok) {
        const errorText = await res.text(); // Baca body sebagai teks HANYA SEKALI.
        let errorMessage = `Terjadi kesalahan: ${res.statusText}`;
        try {
          // Coba parse teks yang sudah dibaca sebagai JSON.
          const errJson = JSON.parse(errorText);
          errorMessage = errJson.message || 'Gagal registrasi';
        } catch (jsonError) {
          // Jika parsing gagal, gunakan teks mentah sebagai pesan error (jika ada).
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      toast.success('Registrasi berhasil! Silakan login dengan akun baru Anda.');
      setIsLogin(true);
    } catch (error: any) {
      toast.error(error.message || 'Registrasi gagal. Pastikan API backend menyala.');
    }
  };

  const handleForgotPassword = () => {
    toast.info('Silakan hubungi administrator untuk reset password akun Anda.');
  };

  return (
    <div className="size-full flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-blue-600">PT Anugerah Bersama Bogor</h1>
            <p className="text-gray-600 mt-2">Business Intelligence System</p>
          </div>

          {/* Dynamic Form: Login / Register */}
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama lengkap Anda"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan alamat email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {isLogin ? 'Password' : 'Buat Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isLogin ? "Masukkan password" : "Minimal 6 karakter"}
                  required
                />
              </div>
            </div>

            {isLogin && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Login Sebagai
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'Admin' | 'Pemimpin' | 'Dispatcher')}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Admin">Admin</option>
                <option value="Pemimpin">Pemimpin</option>
                <option value="Dispatcher">Dispatcher</option>
              </select>
            </div>
            )}

            {!isLogin && (
              <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                Akun baru otomatis terdaftar sebagai <strong>Dispatcher</strong>.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isLogin ? 'Login' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="text-sm text-gray-600">
              {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-medium hover:underline"
              >
                {isLogin ? "Daftar di sini" : "Login di sini"}
              </button>
            </div>
            {isLogin && (
              <button type="button" onClick={handleForgotPassword} className="text-sm text-blue-600 hover:underline block w-full">
                Lupa Password?
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Hero Area */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)' }}
      >
        <div className="text-white max-w-lg">
          <h2 className="text-5xl font-bold mb-6">Welcome Back</h2>
          <p className="text-xl text-blue-100 mb-8">
            Access your business intelligence dashboard to monitor sales, distribution, and forecasting in real-time.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-lg">Real-time Analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-lg">Sales Forecasting</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg">Export Reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
