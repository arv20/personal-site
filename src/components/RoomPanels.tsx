import { useEffect } from 'react';

interface Props {
  id: string | null;
  onClose: () => void;
  weather?: { temperature_2m: number; weather_code: number } | null;
  now?: { building: string; reading: string; listening: string; learning: string; status: string } | null;
}

const PANELS: Record<string, { title: string; body: (p: Props) => React.ReactNode }> = {
  posters: {
    title: 'Projects',
    body: () => (
      <>
        <article><h3>Spandrift</h3><p>A local-first trace analyzer for multi-agent AI systems.</p><span>Python / OpenTelemetry / React</span><a href="https://github.com/arv20/spandrift" target="_blank" rel="noreferrer">View →</a></article>
        <article><h3>This room</h3><p>A personal corner of the web, built with Three.js.</p><span>TypeScript / WebGL</span><a href="https://github.com/arv20/personal-site" target="_blank" rel="noreferrer">View →</a></article>
        <article><h3>Trove</h3><p>More to share soon.</p></article>
      </>
    ),
  },
  corkboard: {
    title: 'Experience',
    body: () => (
      <>
        <p>Computer Science & Engineering @ The Ohio State University.</p>
        <ul>
          <li>Building Spandrift — multi-agent tracing.</li>
          <li>Coursework: systems, software engineering, data structures.</li>
          <li>Always building side projects.</li>
        </ul>
        <div className="guestbook">
          <h4>Guestbook</h4>
          <p className="muted">Leave a note on the wall.</p>
          <form onSubmit={e => { e.preventDefault(); const t = (e.currentTarget.elements.namedItem('note') as HTMLTextAreaElement).value; window.location.href = `mailto:aarav.kolgaonkar@gmail.com?subject=Guestbook%20note&body=${encodeURIComponent(t)}`; }}>
            <textarea name="note" rows={3} placeholder="Say hi…" />
            <button type="submit">Send note</button>
          </form>
        </div>
      </>
    ),
  },
  bookshelf: {
    title: 'Reading & now',
    body: (p) => (
      <>
        <p className="muted">From /data/now.json</p>
        <dl>
          <dt>Building</dt><dd>{p.now?.building ?? 'Spandrift'}</dd>
          <dt>Reading</dt><dd>{p.now?.reading ?? '—'}</dd>
          <dt>Listening</dt><dd>{p.now?.listening ?? '—'}</dd>
          <dt>Learning</dt><dd>{p.now?.learning ?? '—'}</dd>
        </dl>
      </>
    ),
  },
  desk: {
    title: 'Résumé',
    body: () => (
      <>
        <p>Résumé available on request.</p>
        <a className="primary" href="mailto:aarav.kolgaonkar@gmail.com?subject=R%C3%A9sum%C3%A9%20request">Request résumé →</a>
        <p className="muted">I'll send a PDF within a day.</p>
      </>
    ),
  },
  phone: {
    title: 'Contact',
    body: () => (
      <>
        <a href="mailto:aarav.kolgaonkar@gmail.com">aarav.kolgaonkar@gmail.com</a>
        <a href="https://github.com/arv20" target="_blank" rel="noreferrer">github.com/arv20</a>
        <a href="https://www.linkedin.com/in/aarav-kolgaonkar-b1264b369/" target="_blank" rel="noreferrer">LinkedIn</a>
      </>
    ),
  },
  window: {
    title: 'Columbus, Ohio',
    body: (p) => (
      <>
        <p>Home base: Columbus, Ohio.</p>
        <p className="muted">
          {p.weather ? `${Math.round(p.weather.temperature_2m)}°C · weather code ${p.weather.weather_code}` : 'weather loading…'}
        </p>
        <p>The window shows the real sky outside.</p>
      </>
    ),
  },
  bed: {
    title: 'Off-hours',
    body: () => (
      <>
        <p>When I'm not shipping: basketball, football (Chelsea), anime (JJK, Hades), and a lot of coffee.</p>
      </>
    ),
  },
  fridge: {
    title: 'Favorites',
    body: () => (
      <>
        <ul>
          <li>Favorite stack: TypeScript, React, Three.js, Python.</li>
          <li>Favorite drink: coffee (black).</li>
          <li>Favorite bug: the one that fixes itself at 2am.</li>
        </ul>
      </>
    ),
  },
  spandrift: {
    title: 'Spandrift',
    body: () => (
      <>
        <p>A local-first trace analyzer for multi-agent AI systems. Built with Python, OpenTelemetry, and React.</p>
        <a href="https://github.com/arv20/spandrift" target="_blank" rel="noreferrer">View on GitHub →</a>
      </>
    ),
  },
  monitor: {
    title: 'About',
    body: () => (
      <>
        <p>Computer Science & Engineering student at The Ohio State University. Always building.</p>
        <p className="muted">Software · Systems · Side projects</p>
      </>
    ),
  },
};

export default function RoomPanels({ id, onClose, weather, now }: Props) {
  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  if (!id) return null;
  const panel = PANELS[id] ?? PANELS.monitor;
  return (
    <aside className="room-panel" role="region" aria-label={panel.title}>
      <header>
        <h2>{panel.title}</h2>
        <button className="panel-close" onClick={onClose} aria-label="Close panel">×</button>
      </header>
      <div className="panel-body">{panel.body({ id, onClose, weather, now })}</div>
    </aside>
  );
}