import { Component, lazy, Suspense, useCallback, useState, type ReactNode } from 'react';
import { ArrowUpRight, Lightbulb, Moon, RotateCcw } from 'lucide-react';
import { RoomPanel } from './components/RoomPanel';
import { PROFILE, type RoomSection } from './data/room';
import './index.css';

const RoomScene = lazy(() => import('./components/RoomScene'));
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function App() {
  const [section, setSection] = useState<RoomSection | null>(null);
  const [night, setNight] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const select = useCallback((value: RoomSection) => setSection(value), []);
  const failure = useCallback(() => setStatus('fallback'), []);
  return <div className={`portfolio ${night ? 'is-night' : ''}`}>
    <header className="site-header">
      <a className="brand" href={import.meta.env.BASE_URL} aria-label="Aarav Kolgaonkar home"><span className="monogram">ak<span>↗</span></span><span className="brand-caption">A PERSONAL SPACE</span></a>
      <nav className="main-nav" aria-label="Explore the room">
        <button onClick={() => select('work')}>Work</button><button onClick={() => select('about')}>About</button><button onClick={() => select('shelf')}>Shelf</button>
      </nav>
      <a className="contact-link" href={PROFILE.email}>Get in touch <ArrowUpRight size={14} aria-hidden="true" /></a>
    </header>
    <main className="room-stage" data-status={status} data-lighting={night ? 'night' : 'day'} aria-label="Aarav’s interactive room">
      <div className="room-fallback" aria-hidden="true" />
      <SceneBoundary onFailure={failure}><Suspense fallback={null}><RoomScene night={night} resetKey={resetKey} onSelect={select} onStatus={setStatus} /></Suspense></SceneBoundary>
      <div className="room-status" role="status">{status === 'loading' ? 'Opening the room…' : status === 'fallback' ? 'A still view of the room. Explore using Work, About, and Shelf.' : ''}</div>
    </main>
    <footer className="room-footer">
      <div className="room-caption"><div className="eyebrow"><span className="status-dot" /> COLUMBUS, OHIO</div><h1>Make yourself at home.</h1><p>Aarav’s room. A few things I’m into.</p></div>
      <div className="explore-hint"><span className="drag-symbol" aria-hidden="true">↔</span><p>Drag to look around<span>Click an object to explore</span></p></div>
      <div className="footer-right"><div className="scene-controls">
        <button className="control-button" aria-label={night ? 'Turn up the lights' : 'Dim the lights'} aria-pressed={night} disabled={status !== 'ready'} onClick={() => setNight(value => !value)}>{night ? <Moon size={16} /> : <Lightbulb size={16} />}<span>{night ? 'After hours' : 'Lights on'}</span></button>
        <button className="control-button reset-button" aria-label="Reset view" disabled={status !== 'ready'} onClick={() => setResetKey(value => value + 1)}><RotateCcw size={15} /></button>
      </div><div className="social-links"><a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div></div>
    </footer>
    {section && <RoomPanel key={section} section={section} onClose={() => setSection(null)} />}
  </div>;
}
