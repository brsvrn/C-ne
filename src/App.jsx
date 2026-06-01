import React, { useState, useEffect, useRef } from "react";
import { C } from "./utils/theme.js";
import { LS } from "./utils/storage.js";

// Bileşenlerimiz
import HomeScreen from "./components/HomeScreen";
import SearchScreen from "./components/SearchScreen";
import LibraryScreen from "./components/LibraryScreen";
import BottomNav from "./components/BottomNav";
import DetailModal from "./components/DetailModal";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";

const GLOBAL_CSS = `
  @import url('${FONT_LINK}');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  .shelf-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .shelf-scroll::-webkit-scrollbar { display: none; }
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
`;

export default function App() {
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [showChat, setShowChat] = useState(false);
  
  // Storage (Hafıza) işlemleri
  const [history, setHistory] = useState(() => LS.get("cineai_history", []));
  const [watchlist, setWatchlist] = useState(() => LS.get("cineai_watchlist", []));

  useEffect(() => { LS.set("cineai_history", history); }, [history]);
  useEffect(() => { LS.set("cineai_watchlist", watchlist); }, [watchlist]);

  const watchedIds = new Set(history.map(x => x.id));
  const watchlistIds = new Set(watchlist.map(x => x.id));

  const markWatched = (item) => {
    if (watchedIds.has(item.id)) {
      setHistory(prev => prev.filter(x => x.id !== item.id));
    } else {
      setHistory(prev => [{ ...item, addedAt: Date.now() }, ...prev]);
    }
  };

  const toggleWatchlist = (item) => {
    if (watchlistIds.has(item.id)) {
      setWatchlist(prev => prev.filter(x => x.id !== item.id));
    } else {
      setWatchlist(prev => [{ ...item, addedAt: Date.now() }, ...prev]);
    }
  };

  // Chat State İşlemleri
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Merhaba! Bugün ne izlemek istersin? Dizi mi, film mi arıyorsun?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    
    // Mesaj dizisine kullanıcının mesajını ekliyoruz
    const newMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    const systemPrompt = "Sen 'CineAI' adlı dost canlısı, Netflix veya Letterboxd benzeri bir asistan, film ve dizi önerileri yapan bir AI'sın. Türkçe cevap vereceksin. Çok kısa, eğlenceli ve emoji kullanarak konuş. İzleyicinin moduna göre spesifik film/dizi tavsiyeleri ver.";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          })),
          systemPrompt: systemPrompt
        }),
      });

      if (!res.ok) throw new Error("API Hatası");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botResponse = "";

      setChatMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        const lines = chunk.split('\\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                botResponse += parsed.text;
                setChatMessages(prev => {
                  const arr = [...prev];
                  arr[arr.length - 1].content = botResponse;
                  return arr;
                });
              }
            } catch (e) {
              // Parse hatası yok sayılıyor
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: "assistant", content: "Üzgünüm, şu an bağlantıda bir sorun var. 🎬" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth: 520, margin: "0 auto", background: C.bg, minHeight: "100vh", position: "relative" }}>
        
        {/* Header */}
        <div
          style={{
            position: "sticky", top: 0, zIndex: 10,
            background: "rgba(8,8,16,0.8)", backdropFilter: "blur(12px)",
            padding: "20px 16px 12px",
            borderBottom: "1px solid " + C.border,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            <span style={{ color: C.accent }}>Cine</span>AI
          </div>
          <div style={{ fontSize: 12, color: C.muted, background: C.card, border: "1px solid " + C.border, borderRadius: 20, padding: "4px 10px" }}>
            {history.length} İzlendi
          </div>
        </div>

        {/* Ekrana Göre Gösterilecek Bileşenler */}
        <div style={{ paddingTop: 4 }}>
          {tab === "home" && <HomeScreen onCard={setModal} watchedIds={watchedIds} />}
          {tab === "search" && <SearchScreen onCard={setModal} watchedIds={watchedIds} />}
          {tab === "library" && <LibraryScreen history={history} watchlist={watchlist} onCard={setModal} />}
        </div>

        <BottomNav tab={tab} setTab={setTab} onChat={() => setShowChat(true)} />
      </div>

      {/* Detay Modalı */}
      {modal && (
        <DetailModal
          item={modal}
          onClose={() => setModal(null)}
          onWatch={markWatched}
          onWatchlist={toggleWatchlist}
          watched={watchedIds.has(modal.id)}
          inWatchlist={watchlistIds.has(modal.id)}
        />
      )}

      {/* Yapay Zeka Sohbet Ekranı */}
      {showChat && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200, background: C.bg,
          display: "flex", flexDirection: "column", maxWidth: 520, margin: "0 auto"
        }}>
          {/* Sohbet Başlığı */}
          <div style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid " + C.border, background: C.surface }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "linear-gradient(135deg, " + C.accent + ", " + C.red + ")", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>CineAI</div>
                <div style={{ fontSize: 11, color: C.muted }}>Asistanınız çevrimiçi</div>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 24, cursor: "pointer" }}>×</button>
          </div>

          {/* Mesajlaşma Alanı */}
          <div ref={chatScrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="fade-up" style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? C.accent : C.card,
                color: msg.role === "user" ? "#0a0806" : C.text,
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "18px 18px 0 18px" : "18px 18px 18px 0",
                maxWidth: "85%",
                fontSize: 14,
                lineHeight: 1.5,
                border: msg.role === "user" ? "none" : "1px solid " + C.border
              }}>
                {msg.content}
              </div>
            ))}
            {isChatLoading && (
               <div style={{ alignSelf: "flex-start", background: C.card, padding: "12px 16px", borderRadius: "18px 18px 18px 0", border: "1px solid " + C.border, fontSize: 14, color: C.muted }}>
                 Yazıyor...
               </div>
            )}
          </div>

          {/* Mesaj Gönderme Çubuğu */}
          <form onSubmit={handleChatSubmit} style={{ padding: "16px", borderTop: "1px solid " + C.border, background: C.surface, display: "flex", gap: 10 }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Bir film veya dizi önerisi iste..."
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 24, border: "1px solid " + C.border,
                background: C.card, color: C.text, fontSize: 14, outline: "none"
              }}
            />
            <button type="submit" disabled={isChatLoading || !chatInput.trim()} style={{
              background: chatInput.trim() ? C.accent : C.border, color: "#0a0806", border: "none", width: 44, height: 44, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: chatInput.trim() ? "pointer" : "not-allowed", transition: "all 0.2s"
            }}>
              <span style={{ transform: "rotate(-45deg)", marginLeft: 2, marginTop: -2 }}>➤</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
