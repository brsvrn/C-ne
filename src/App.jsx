import React, { useState, useEffect, useRef } from "react";
import { C } from "./utils/theme";
import { LS } from "./utils/storage";

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
`;

export default function App() {
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [history, setHistory] = useState(() => LS.get("cineai_history", []));
  const [watchlist, setWatchlist] = useState(() => LS.get("cineai_watchlist", []));

  useEffect(() => { LS.set("cineai_history", history); }, [history]);
  useEffect(() => { LS.set("cineai_watchlist", watchlist); }, [watchlist]);

  const watchedIds = new Set(history.map(x => x.id));
  const watchlistIds = new Set(watchlist.map(x => x.id));

  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Merhaba! Bugün ne izlemek istersin?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          })),
          systemPrompt: "Sen CineAI'sın, kısa ve emoji ile cevap ver."
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";
      setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        botResponse += chunk;
        setChatMessages(prev => {
          const arr = [...prev];
          arr[arr.length - 1].content = botResponse;
          return arr;
        });
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Bir hata oluştu." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth: 520, margin: "0 auto", background: C.bg, minHeight: "100vh" }}>
        <div style={{ padding: "20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}><span style={{ color: C.accent }}>Cine</span>AI</div>
        </div>
        
        {tab === "home" && <HomeScreen onCard={setModal} watchedIds={watchedIds} />}
        {tab === "search" && <SearchScreen onCard={setModal} watchedIds={watchedIds} />}
        {tab === "library" && <LibraryScreen history={history} watchlist={watchlist} onCard={setModal} />}
        
        <BottomNav tab={tab} setTab={setTab} onChat={() => setShowChat(true)} />
      </div>

      {modal && (
        <DetailModal
          item={modal}
          onClose={() => setModal(null)}
          onWatch={(item) => setHistory(prev => [{...item}, ...prev])}
          onWatchlist={(item) => setWatchlist(prev => [{...item}, ...prev])}
          watched={watchedIds.has(modal.id)}
          inWatchlist={watchlistIds.has(modal.id)}
        />
      )}
    </>
  );
}
