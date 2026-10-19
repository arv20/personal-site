import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { PROFILE, type RoomSection } from '../data/room';

const details = {
  work: { label: 'THE WORKSPACE', title: 'On the desk', intro: 'Software, experiments, and things I’m figuring out along the way.' },
  about: { label: 'THE WALL ARCHIVE', title: 'A little about me', intro: 'A few things that make this room mine.' },
  shelf: { label: 'OFF THE CLOCK', title: 'On the shelf', intro: 'What I reach for when I close the editor.' },
};

function OutsideLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={14} aria-hidden="true" /></a>;
}

function Activity() {
  const [data, setData] = useState<{ total: number; generatedAt: string; contributions: { date: string; count: number }[] } | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/github-contributions.json`, { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error('Activity unavailable'); return res.json(); })
      .then(value => {
        if (!Array.isArray(value.contributions) || !Number.isFinite(value.total) || !value.generatedAt || Number.isNaN(Date.parse(value.generatedAt))) throw new Error('Invalid activity');
        setData({ ...value, contributions: value.contributions.filter((day: { date: string; count: number }) => /^\d{4}-\d{2}-\d{2}$/.test(day.date) && Number.isFinite(day.count) && day.count >= 0) });
      })
      .catch(error => { if (error.name !== 'AbortError') setUnavailable(true); });
    return () => controller.abort();
  }, []);
  return <section className="activity" aria-label="GitHub activity">
    <div className="activity-heading"><h3>Still making things.</h3><span>GITHUB</span></div>
    {data ? <>
      <div className="activity-grid" aria-label="Recent GitHub contributions">{data.contributions.slice(-112).map(day => <span key={day.date} title={`${day.date}: ${day.count} contributions`} style={{ background: day.count === 0 ? '#33382e' : day.count < 3 ? '#62674a' : day.count < 7 ? '#9b9b6c' : '#d5c897' }} />)}</div>
      <p>{data.total.toLocaleString()} contributions in the synced year<br /><span>Updated {new Date(data.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
    </> : <p>{unavailable ? 'Activity is unavailable right now. You can still find my work on GitHub.' : 'Loading GitHub activity…'}</p>}
    <OutsideLink href={PROFILE.github}>Visit my GitHub</OutsideLink>
  </section>;
}

export function RoomPanel({ section, onClose }: { section: RoomSection; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const content = details[section];
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="room-panel" aria-labelledby="panel-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="panel-content">
      <div className="panel-topline"><span>{content.label}</span><button className="icon-button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
      <h2 id="panel-title">{content.title}</h2><p className="panel-intro">{content.intro}</p>
      {section === 'work' && <>
        <div className="section-heading">SELECTED WORK <span>↙ from this desk</span></div>
        <article className="project-item"><div className="project-mark">S<span>↗</span></div><div><h3>Spandrift</h3><p>A local-first trace analyzer for multi-agent AI systems. Following the tools, tokens, and decisions behind a run.</p><div className="tags">PYTHON / OPENTELEMETRY / REACT</div><OutsideLink href={PROFILE.github}>Explore my projects</OutsideLink></div></article>
        <article className="project-item"><div className="project-mark road-mark"><span>↗</span></div><div><h3>The driving experiment</h3><p>An earlier version of this portfolio: a Three.js road, a Ferrari, and a different way to explore the web.</p><div className="tags">THREE.JS / WEBGL / WEB AUDIO</div><OutsideLink href={`${PROFILE.github}/personal-site/blob/main/index.driving-backup.html`}>View the source</OutsideLink></div></article>
        <Activity />
      </>}
      {section === 'about' && <>
        <article className="story-item"><div className="story-poster ohio-mini">O</div><div><span className="eyebrow">COLUMBUS, OHIO</span><h3>Aarav Kolgaonkar</h3><p>Computer Science & Engineering at The Ohio State University. Building software and finding new things to get curious about.</p></div></article>
        <article className="story-item"><div className="story-poster chelsea-mini">CFC<span>1905</span></div><div><span className="eyebrow">MATCHDAY</span><h3>Keep the blue flag flying.</h3><p>Chelsea FC. A permanent place on the wall, through the good seasons and the long ones.</p></div></article>
        <article className="story-item"><div className="story-poster car-mini">2011</div><div><span className="eyebrow">THE DAILY DRIVER</span><h3>Elantra, not exotic.</h3><p>A 2011 Hyundai Elantra Limited. The campus commute deserves a spot in the archive, too.</p></div></article>
        <div className="panel-contact"><p>That’s a bit of my world.<br />Let’s make something.</p><OutsideLink href={PROFILE.linkedin}>Find me on LinkedIn</OutsideLink><a className="text-link" href={PROFILE.email}>Say hello <ArrowUpRight size={14} /></a></div>
      </>}
      {section === 'shelf' && <>
        <article className="shelf-item"><div className="book-cover hades-cover"><span>HADES</span><b>II</b></div><div><span className="eyebrow">ONE MORE RUN</span><h3>Hades II</h3><p>Mythology, beautiful art direction, and the very convincing argument for one more run.</p></div></article>
        <article className="shelf-item"><div className="book-cover jjk-cover"><span>JUJUTSU</span><b>KAISEN</b></div><div><span className="eyebrow">BETWEEN CHAPTERS</span><h3>Jujutsu Kaisen</h3><p>Cursed energy, impossible fights, and plenty to talk about after the next chapter.</p></div></article>
        <div className="shelf-note"><span className="eyebrow">THE SMALL THINGS</span><h3>A space to switch gears.</h3><p>A camera, a few books, a record on the turntable. A room should have somewhere to step away from the screen.</p></div>
      </>}
      <div className="panel-footer"><span>AARAV’S ROOM</span><span>Make yourself at home.</span></div>
    </div>
  </dialog>;
}
