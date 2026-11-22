import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import './index.css';
import RoomPanels from './components/RoomPanels';
import Terminal from './components/Terminal';
import type { RoomHandle } from './components/RoomScene';

const legacy = new URLSearchParams(location.search).get('legacy') === '1';
const Dorm = lazy(() => import('./components/RoomScene'));
const Legacy = lazy(() => import('./legacy/RoomScene'));

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

type Weather = { temperature_2m: number; weather_code: number } | null;
type NowData = { building: string; reading: string; listening: string; learning: string; status: string } | null;

export default function App() {
  const [simple, setSimple] = useState(location.hash === '#/simple');
  const [status, setStatus] = useState<'loading'|'ready'|'fallback'>('loading');
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [nightMode, setNightMode] = useState(() => {
    const h = new Date().getHours();
    return h < 7 || h >= 19;
  });
  const [soundOn, setSoundOn] = useState(false);
  const [weather, setWeather] = useState<Weather>(null);
  const [now, setNow] = useState<NowData>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [catPurr, setCatPurr] = useState(false);
  const sceneRef = useRef<RoomHandle>(null);
  const failure = useCallback(() => setStatus('fallback'), []);

  useEffect(() => {
    const change = () => { setSimple(location.hash === '#/simple'); setStatus('loading'); setProgress(0); };
    addEventListener('hashchange', change); return () => removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('room-enabled', !simple);
    return () => document.documentElement.classList.remove('room-enabled');
  }, [simple]);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=39.96&longitude=-83.00&current=temperature_2m,weather_code,is_day&timezone=America/New_York')
      .then(r => r.json())
      .then(d => setWeather(d.current ?? null))
      .catch(() => {});
  }, []);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/now.json`)
      .then(r => r.json())
      .then(d => setNow(d))
      .catch(() => {});
  }, []);

  // ambient sound (Web Audio pad)
  useEffect(() => {
    if (!soundOn) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    gain.connect(ctx.destination);
    const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = 110;
    const osc2 = ctx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.value = 165;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 600;
    osc1.connect(filter); osc2.connect(filter); filter.connect(gain);
    osc1.start(); osc2.start();
    // occasional gentle clack
    const clack = () => {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 800;
      const g = ctx.createGain(); g.gain.value = 0.015;
      o.connect(g); g.connect(ctx.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      o.stop(ctx.currentTime + 0.07);
    };
    const interval = window.setInterval(() => { if (Math.random() < 0.3) clack(); }, 4000);
    return () => { window.clearInterval(interval); osc1.stop(); osc2.stop(); ctx.close(); };
  }, [soundOn]);

  // keyboard shortcut for terminal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !terminalOpen && !active) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); setTerminalOpen(true); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [terminalOpen, active]);

  const onHotspot = useCallback((id: string) => {
    setHintVisible(false);
    if (id === 'lightswitch') { setNightMode(v => !v); return; }
    if (id === 'cat') { sceneRef.current?.petCat(); setCatPurr(true); setTimeout(() => setCatPurr(false), 1800); return; }
    if (id === 'monitor') { setTerminalOpen(true); sceneRef.current?.focus('monitor'); return; }
    setActive(id);
    sceneRef.current?.focus(id);
  }, []);

  const closePanel = useCallback(() => {
    setActive(null);
    sceneRef.current?.focus(null);
  }, []);

  if (simple) return null;
  return (
    <main className="portfolio room-stage" data-status={status} data-scene={legacy ? 'legacy' : 'dorm'} aria-label="Aarav’s college dorm room">
      <img className="room-fallback" src={`${import.meta.env.BASE_URL}${legacy ? 'legacy-room-preview.png' : 'room-preview.png'}`} alt="A college dorm with a twin bed, study desk, campus posters, books, and string lights." aria-hidden={status === 'ready'} />
      <SceneBoundary onFailure={failure}><Suspense fallback={null}>
        {legacy ? <Legacy onStatus={setStatus} /> : <Dorm ref={sceneRef} onStatus={setStatus} onProgress={setProgress} onHotspot={onHotspot} focusId={active ?? (terminalOpen ? 'monitor' : null)} nightMode={nightMode} />}
      </Suspense></SceneBoundary>
      {status === 'loading' && <div className="room-loading" role="status"><span>{progress < .45 ? 'Preparing the room' : progress < .85 ? 'Loading artwork' : 'Rendering the room'}</span><progress aria-label="Room loading progress" max={1} value={progress} /></div>}

      {/* Wordmark + links */}
      <div className="room-wordmark">
        <h1>Aarav Kolgaonkar</h1>
        <p>CSE @ Ohio State · Always building.</p>
        <nav aria-label="Profile links">
          <a href="https://github.com/arv20" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/aarav-kolgaonkar-b1264b369/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="mailto:aarav.kolgaonkar@gmail.com">Email</a>
          <a href="mailto:aarav.kolgaonkar@gmail.com?subject=R%C3%A9sum%C3%A9%20request">Résumé</a>
        </nav>
      </div>

      {/* Top-right controls */}
      <div className="room-controls">
        {weather && <span className="weather-badge">{Math.round(weather.temperature_2m)}°C</span>}
        <button className="ctrl-btn" onClick={() => setNightMode(v => !v)} aria-label="Toggle night mode" title="Night mode">{nightMode ? '☾' : '☀'}</button>
        <button className="ctrl-btn" onClick={() => setSoundOn(v => !v)} aria-label="Toggle sound" title="Sound">{soundOn ? '♪' : '♪̸'}</button>
        <button className="ctrl-btn" onClick={() => setTerminalOpen(true)} aria-label="Open terminal" title="Terminal ( / )">⌘</button>
      </div>

      {/* Hint pill */}
      {hintVisible && status === 'ready' && (
        <div className="hint-pill" role="status">
          Drag to look around · hover objects to explore · click to open
          <button onClick={() => setHintVisible(false)} aria-label="Dismiss hint">×</button>
        </div>
      )}

      {catPurr && <div className="purr-toast" role="status">purr~ 🐾</div>}
      <a className="skip-room" href="#/simple">Skip the room <span aria-hidden="true">↗</span></a>
      <p className="sr-only" role="status">{status === 'fallback' ? 'A still view of the dorm room. Use Skip the room for the text portfolio.' : status === 'ready' ? 'Drag to rotate, or focus the room and use arrow keys. Home resets the view.' : ''}</p>

      <RoomPanels id={active} onClose={closePanel} weather={weather} now={now} />
      <Terminal open={terminalOpen} onClose={() => setTerminalOpen(false)} onCommand={(cmd) => {
        if (cmd === 'night') setNightMode(true);
        if (cmd === 'day') setNightMode(false);
      }} weather={weather} />

      {/* grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />
    </main>
  );
}