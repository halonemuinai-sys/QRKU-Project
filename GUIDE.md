# 🚀 BikinQR: Panduan Pengguna & Pengembang

Selamat datang di **BikinQR**, platform generator QR Code premium dengan estetika **Neo-Brutalist** yang menggabungkan kemudahan penggunaan dengan kustomisasi mendalam.

---

## ✨ Fitur Utama

### 1. vCard QR (Dinamis)
Buat kartu nama digital yang bisa di-scan langsung masuk ke kontak HP. 
- **Dinamis:** Anda bisa mengedit informasi kontak di database tanpa harus mencetak ulang QR Code fisik.
- **Data Lengkap:** Nama, Jabatan, Perusahaan, WhatsApp, Email, hingga Website.

### 2. Smart QR Tools
Generator QR untuk kebutuhan sehari-laki:
- **Link QR:** Untuk website, sosial media, atau portofolio.
- **WiFi QR:** Scan langsung konek WiFi tanpa perlu ngetik password.
- **Maps QR:** Tandai lokasi bisnis atau rumah Anda. Lengkap dengan **Interactive Map Picker** dan **Geolocation**.

### 3. Kustomisasi Gaya (Eksplorasi Tanpa Batas)
Jadikan QR Anda unik dengan kontrol penuh:
- **Dots:** Bentuk titik (Rounded, Dots, Classy, Square) dengan dukungan **Gradient Warna**.
- **Corners:** Ubah bentuk **Frame Pojok** dan **Titik Pojok** secara terpisah.
- **Background & Logo:** Ganti warna latar belakang dan pasang logo brand Anda sendiri.
- **Anti-Clutter:** Fitur otomatis hapus titik QR di belakang logo agar logo terlihat bersih.

### 4. My Gallery (Riwayat & Restore)
Jangan takut kehilangan desain Anda!
- Setiap QR yang dibuat otomatis tersimpan.
- Fitur **Restore** untuk memuat kembali data lama ke editor hanya dengan satu klik.
- Pantau performa tiap QR langsung dari galeri.

### 5. Analytics Dashboard
Monitor jangkauan QR Anda:
- Grafik tren scan harian yang interaktif.
- Statistik total scan dan performa terbaik (Top Performer).
- Laporan data scan secara real-time.

---

## 🛠️ Panduan Teknis (Untuk Pengembang)

### Struktur Proyek
- `/client`: Frontend menggunakan **Next.js 14**, **Tailwind CSS**, **Framer Motion**, dan **Recharts**.
- `/server.js`: Backend menggunakan **Node.js**, **Express**, dan **Supabase**.
- `/uploads`: Folder penyimpanan logo lokal.

### Cara Menjalankan Secara Lokal
1. **Setup Database:** Eksekusi file `supabase_migration.sql` di SQL Editor Supabase Anda.
2. **Environment Variables:** Pastikan file `.env` berisi:
   ```env
   SUPABASE_URL=url_proyek_anda
   SUPABASE_ANON_KEY=key_anon_anda
   PORT=3001
   ```
3. **Install Dependencies:**
   ```bash
   # Di root (Server)
   npm install
   
   # Di folder /client
   cd client
   npm install
   ```
4. **Jalankan Aplikasi:**
   ```bash
   # Terminal 1 (Server)
   node server.js
   
   # Terminal 2 (Client)
   cd client
   npm run dev
   ```

### Endpoint API Penting
- `POST /generate`: Membuat vCard QR dinamis.
- `POST /generate-basic`: Membuat Smart QR (Link, WiFi, Maps).
- `GET /gallery`: Mengambil riwayat QR.
- `GET /analytics`: Mengambil data statistik scan.

---

## 📝 Catatan Rilis v2.0
- Penambahan sistem **Tabbed Navigation**.
- Integrasi **Map Picker Leaflet**.
- Sistem **Scan Logging** mendalam.
- Perombakan UI ke gaya **Neo-Brutalism Premium**.

---
*Dibuat dengan ❤️ oleh Tim BikinQR*
