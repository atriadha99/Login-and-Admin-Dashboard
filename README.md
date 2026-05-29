# Admin Dashboard Management System

Sebuah aplikasi web dashboard admin berbasis React untuk memanajemen operasional logistik, armada, driver, serta memantau data penjualan dan distribusi secara *real-time* (dengan studi kasus distribusi air/logistik).

## 🚀 Fitur Utama

- **Dashboard Analitik (`Dashboard.tsx`)**
  - Ringkasan KPI operasional (Total Penjualan, Laba Kotor, Jumlah Transaksi).
  - Grafik tren (6 bulan & 1 tahun) membandingkan Penjualan dan Distribusi.
  - Forecasting/Prediksi performa di masa depan.
  - Ekspor cepat ringkasan operasional.

- **Manajemen Koneksi Data (`DataConnectionPage.tsx`)**
  - Integrasi berbagai sumber data (MySQL, CSV, API eksternal).
  - Sinkronisasi data dan pengecekan status server.
  - Ekspor laporan data ke format PDF, Excel, atau CSV.

- **Manajemen Armada (`ArmadaPage.tsx`)**
  - Pencatatan seluruh unit kendaraan (Truk Tangki, Truk Box).
  - Pelacakan status kendaraan (Aktif, Maintenance, Idle).
  - Penjadwalan *service* atau perawatan kendaraan operasional.

- **Manajemen Driver (`DriverPage.tsx`)**
  - Manajemen data driver terdaftar beserta performa operasional (Total Trip, Selesai, Pendapatan).
  - Pantauan status *real-time* (Tersedia, Dalam Perjalanan, Off Duty).
  - *Leaderboard* driver dengan performa (Rating) terbaik.

## 🛠️ Teknologi yang Digunakan

- **Framework:** React
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Notifications:** Sonner

## 📦 Cara Instalasi dan Penggunaan

1. Pastikan komputer Anda telah terinstal Node.js.
2. Buka terminal, dan masuk ke direktori proyek ini:
   ```bash
   cd "Login and Admin Dashboard"
   ```
3. Instal semua dependensi yang diperlukan menggunakan NPM atau Yarn:
   ```bash
   npm install
   ```
4. Jalankan *development server*:
   ```bash
   npm run dev
   ```
5. Buka tautan lokal (contoh: `http://localhost:5173` atau `http://localhost:3000`) yang ditampilkan di terminal pada browser Anda.