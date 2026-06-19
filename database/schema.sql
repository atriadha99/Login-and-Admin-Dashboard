-- ============================================================
-- PT Anugerah Bersama Bogor - Database Schema (Neon PostgreSQL)
-- Jalankan file ini di Neon SQL Editor sebelum seed.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- USERS (autentikasi login / register)
-- Kolom disesuaikan dengan backend index.js
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nama          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'pemimpin', 'dispatcher')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Jika tabel users sudah ada dari setup lama, jalankan:
-- database/migrate-users-role.sql

-- ------------------------------------------------------------
-- ARMADA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS armada (
  id           TEXT PRIMARY KEY,
  "plateNumber" TEXT NOT NULL,
  type         TEXT NOT NULL,
  driver       TEXT,
  status       TEXT NOT NULL DEFAULT 'idle'
                 CHECK (status IN ('active', 'maintenance', 'idle')),
  "lastService" DATE,
  "nextService" DATE,
  "totalTrips" INTEGER NOT NULL DEFAULT 0,
  mileage      INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_armada_status ON armada (status);

-- ------------------------------------------------------------
-- DRIVER
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS driver (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  vehicle         TEXT,
  status          TEXT NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'on-trip', 'off-duty')),
  rating          NUMERIC(3, 2) NOT NULL DEFAULT 0,
  "totalTrips"    INTEGER NOT NULL DEFAULT 0,
  "completedTrips" INTEGER NOT NULL DEFAULT 0,
  revenue         BIGINT NOT NULL DEFAULT 0,
  "joinDate"      DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_status ON driver (status);

-- ------------------------------------------------------------
-- PENGIRIMAN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pengiriman (
  id         TEXT PRIMARY KEY,
  tanggal    DATE NOT NULL,
  tujuan     TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'in-progress', 'completed', 'delayed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pengiriman_tanggal ON pengiriman (tanggal DESC);

-- ------------------------------------------------------------
-- PENJUALAN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS penjualan (
  id         TEXT PRIMARY KEY,
  customer   TEXT NOT NULL,
  amount     BIGINT NOT NULL,
  date       DATE NOT NULL,
  region     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_penjualan_date ON penjualan (date DESC);
CREATE INDEX IF NOT EXISTS idx_penjualan_region ON penjualan (region);
