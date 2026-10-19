import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import './index.css';
const legacy = new URLSearchParams(location.search).get('legacy') === '1';
const Dorm = lazy(() => import('./components/RoomScene'));
const Legacy = lazy(() => import('./legacy/RoomScene'));
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function App() {
  const [simple, setSimple] = useState(location.hash === '#/simple');
  const [status, setStatus] = useState<'loading'|'ready'|'fallback'>('loading');
  const [progress, setProgress] = useState(0);
  const failure = useCallback(() => setStatus('fallback'), []);
  useEffect(() => {
    const change = () => { setSimple(location.hash === '#/simple'); setStatus('loading'); setProgress(0); };
    addEventListener('hashchange', change); return () => removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('room-enabled', !simple);
    return () => document.documentElement.classList.remove('room-enabled');
  }, [simple]);
  if (simple) return null;
  return <main className="portfolio room-stage" data-status={status} data-scene={legacy ? 'legacy' : 'dorm'} aria-label="Aarav’s college dorm room">
    <img className="room-fallback" src={`${import.meta.env.BASE_URL}${legacy ? 'legacy-room-preview.png' : 'room-preview.png'}`} alt="A college dorm with a twin bed, study desk, campus posters, books, and string lights." aria-hidden={status === 'ready'} />
    <SceneBoundary onFailure={failure}><Suspense fallback={null}>
      {legacy ? <Legacy onStatus={setStatus} /> : <Dorm onStatus={setStatus} onProgress={setProgress} />}
    </Suspense></SceneBoundary>
    {status === 'loading' && <div className="room-loading" role="status"><span>{progress < .45 ? 'Preparing the room' : progress < .85 ? 'Loading artwork' : 'Rendering the room'}</span><progress aria-label="Room loading progress" max={1} value={progress} /></div>}
    <a className="skip-room" href="#/simple">Skip the room <span aria-hidden="true">↗</span></a>
    <p className="sr-only" role="status">{status === 'fallback' ? 'A still view of the dorm room. Use Skip the room for the text portfolio.' : status === 'ready' ? 'Drag to rotate, or focus the room and use arrow keys. Home resets the view.' : ''}</p>
  </main>;
}
