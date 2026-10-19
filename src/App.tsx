import { Component, lazy, Suspense, useCallback, useState, type ReactNode } from 'react';
import './index.css';

const RoomScene = lazy(() => import('./components/RoomScene'));
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function App() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const failure = useCallback(() => setStatus('fallback'), []);
  return <main className="portfolio room-stage" data-status={status} aria-label="Aarav’s college dorm room">
    <img className="room-fallback" src={`${import.meta.env.BASE_URL}room-preview.png`} alt="A college dorm with a twin bed, study desk, campus posters, books, and string lights." aria-hidden={status === 'ready'} />
    <SceneBoundary onFailure={failure}>
      <Suspense fallback={null}><RoomScene onStatus={setStatus} /></Suspense>
    </SceneBoundary>
    <p className="sr-only" role="status">{status === 'loading' ? 'Loading the dorm room.' : status === 'fallback' ? 'A still view of the dorm room.' : 'Drag to rotate the room, or focus it and use the arrow keys. Press Home to reset the view.'}</p>
  </main>;
}
