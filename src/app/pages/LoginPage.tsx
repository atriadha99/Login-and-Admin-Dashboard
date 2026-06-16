import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Pemimpin'>('Admin');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const credentials: Record<'Admin' | 'Pemimpin', Array<{ email: string; password: string; name: string }>> = {
      Admin: [
        { email: 'admin@ptabb.id', password: 'admin123', name: 'Admin User' },
        { email: 'dosen@unpam.id', password: 'dosenunpam', name: 'Dosen UNPAM' }
      ],
      Pemimpin: [
        { email: 'pemimpin@ptabb.id', password: 'pemimpin123', name: 'Pemimpin' }
      ],
    };

    // Ambil data user yang mendaftar via form Register (jika ada)
    const registeredUsers = JSON.parse(window.localStorage.getItem('abb-registered-users') || '[]');
    
    // Gabungkan user bawaan dengan user hasil register yang rolenya sesuai
    const validUsers = [
      ...credentials[role],
      ...registeredUsers.filter((u: any) => u.role === role)
    ];

    const currentUser = validUsers.find(u => u.email === email.trim().toLowerCase() && u.password === password);
    
    if (!currentUser) {
      toast.error('Email atau password tidak cocok untuk peran yang dipilih.');
      return;
    }

    window.localStorage.setItem('abb-role', role);
    window.localStorage.setItem('abb-user', currentUser.name);
    toast.success('Login berhasil. Mengalihkan ke dashboard...');
    navigate('/dashboard');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password) {
      toast.error('Semua kolom wajib diisi.');
      return;
    }

    const registeredUsers = JSON.parse(window.localStorage.getItem('abb-registered-users') || '[]');
    
    // Cek apakah email sudah terdaftar
    const isEmailExists = registeredUsers.some((u: any) => u.email === email.trim().toLowerCase()) || 
                          email.trim().toLowerCase() === 'admin@ptabb.id' || 
                          email.trim().toLowerCase() === 'dosen@unpam.id';

    if (isEmailExists) {
      toast.error('Email ini sudah terdaftar. Silakan gunakan email lain.');
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role
    };

    window.localStorage.setItem('abb-registered-users', JSON.stringify([...registeredUsers, newUser]));
    toast.success('Registrasi berhasil! Silakan login dengan akun baru Anda.');
    setIsLogin(true); // Kembali ke mode login
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

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                {isLogin ? 'Login Sebagai' : 'Daftar Sebagai'}
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'Admin' | 'Pemimpin')}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Admin">Admin</option>
                <option value="Pemimpin">Pemimpin</option>
              </select>
            </div>

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
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
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
