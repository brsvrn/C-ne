# CineAI 🎬

Bir film ve dizi önerme uygulaması. TMDB API'sı ile film verilerini ve Gemini AI ile akıllı sohbet özelliklerini kullanıyor.

## Gereklilikler

- Node.js 16+
- React 18+
- TMDB API Anahtarı
- Google Gemini API Anahtarı

## Kurulum

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/brsvrn/C-ne.git
cd C-ne
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. API Anahtarlarını Ayarlayın

**`.env` dosyası oluşturun:**
```bash
cp .env.example .env
```

**`.env` dosyasını düzenleyin:**
```
REACT_APP_TMDB_KEY=your_tmdb_api_key_here
REACT_APP_GEMINI_KEY=your_gemini_api_key_here
```

#### API Anahtarlarını Alın:

**TMDB API Anahtarı:**
1. https://www.themoviedb.org/settings/api adresine gidin
2. Ücretsiz API anahtarı için kaydolun
3. API anahtarınızı `.env` dosyasına yapıştırın

**Google Gemini API Anahtarı:**
1. https://aistudio.google.com/apikey adresine gidin
2. "Create API Key" butonuna tıklayın
3. Anahtarı kopyalayıp `.env` dosyasına yapıştırın

### 4. Uygulamayı Başlatın
```bash
npm start
```

Tarayıcı otomatik olarak `http://localhost:3000` adresinde açılacak.

## Özellikler

✨ **Trending Film & Diziler** - Haftanın en popüler içerikleri
🔍 **Arama** - Film, dizi ve oyuncuları ara
📚 **Kütüphane** - İzlediğin ve izleme listeni yönet
🤖 **CineAI Asistan** - Yapay zeka destekli film önerileri
⭐ **Detaylı Bilgiler** - Oyuncular, yönetmenler, fragmanlar

## Teknoloji Stack

- **Frontend:** React + Hooks
- **API:** TMDB (The Movie Database)
- **AI:** Google Gemini 2.5 Flash
- **Storage:** Browser LocalStorage
- **Styling:** Inline CSS + CSS Grid/Flexbox

## Güvenlik

⚠️ **Önemli:** API anahtarlarınızı asla commit etmeyin!

- `.env` dosyası `.gitignore`'a ekli
- `REACT_APP_` prefix'li env variables kullanılıyor
- Production'da backend proxy kullanmayı düşünün

## Hata Giderme

### 404 Hatası Alıyorum
- TMDB API anahtarınızı kontrol edin
- API anahtarınızın geçerliliğini TMDB dashboard'da doğrulayın
- `.env` dosyasının proje kökünde olduğundan emin olun

### Gemini API Hataları
- API anahtarınızın geçerli olduğunu kontrol edin
- Google Cloud Console'da API'nin enable edildiğini doğrulayın
- Rate limiting'i kontrol edin (dakikada 60 request limiti)

## Lisans

MIT

## İletişim

Sorularınız için GitHub issues açabilirsiniz.
