# 🎬 CineAI — Kişisel Film & Dizi Asistanı

Netflix + Letterboxd + AI sohbet asistanı kombinasyonu. Tamamen kişisel, hesap gerektirmez.

---

## 🚀 Vercel'e Deploy Etme (Adım Adım)

### 1. GitHub'a Yükle

```bash
git init
git add .
git commit -m "CineAI ilk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/cineai.git
git push -u origin main
```

### 2. Vercel'e Bağla

1. [vercel.com](https://vercel.com) → "New Project"
2. GitHub reposunu seç → "Import"
3. **Framework Preset:** Vite
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`

### 3. Environment Variables Ekle (ÖNEMLİ!)

Vercel dashboard → Project Settings → **Environment Variables**

| Key | Value | Ne İçin |
|-----|-------|---------|
| `GEMINI_API_KEY` | `AIza...` | AI sohbet asistanı |
| `VITE_TMDB_KEY` | `abc123...` | Film veritabanı (opsiyonel) |

**GEMINI_API_KEY nereden alınır?**
→ https://aistudio.google.com/app/apikey (ücretsiz)

**VITE_TMDB_KEY nereden alınır?**
→ https://www.themoviedb.org/settings/api (ücretsiz)

### 4. Redeploy

Environment variable ekledikten sonra:
Vercel → Deployments → "Redeploy"

---

## 💻 Lokal Çalıştırma

```bash
npm install
```

`.env.local` dosyası oluştur:
```
GEMINI_API_KEY=senin_anahtarin
VITE_TMDB_KEY=senin_tmdb_anahtarin
```

```bash
npm run dev
```

---

## 📱 PWA Olarak Telefona Ekle

Deploy ettikten sonra telefondan siteye gir:
- **Android Chrome:** Menü → "Ana ekrana ekle"
- **iOS Safari:** Paylaş → "Ana Ekrana Ekle"

Artık uygulama gibi açılır, tam ekran çalışır!

---

## 🏗️ Proje Yapısı

```
cineai/
├── api/
│   └── chat.js          # Vercel serverless — Gemini API proxy
├── public/
│   └── manifest.json    # PWA manifest
├── src/
│   ├── main.jsx         # React giriş noktası
│   └── App.jsx          # Tüm uygulama (tek dosya)
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## ✅ Özellikler

- 🏠 **Ana Sayfa** — TMDB'den canlı trendler, yeni filmler, diziler
- 🔍 **Arama** — Gerçek zamanlı film/dizi/oyuncu arama
- 🎬 **Detay Sayfası** — Poster, fragman, oyuncular, benzer içerikler
- 📚 **Kütüphane** — İzlenenler + izleme listesi (localStorage)
- 🤖 **AI Asistan** — Gemini ile Türkçe film öneri sohbeti
- 📱 **PWA** — Telefona uygulama gibi kurulabilir
