import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import {
  ExternalLink,
  Terminal,
  Code2,
  Briefcase,
  Tv,
  Trophy,
  Car,
  Gamepad2,
  Camera,
  BookOpen,
  Layers,
  Cpu,
  X,
} from 'lucide-react';
import type { ActiveZone } from '../data/hotspots';

interface ZoneModalsProps {
  activeZone: ActiveZone;
  onClose: () => void;
}

interface ContributionDay {
  date: string;
  count: number;
}

export function ZoneModals({ activeZone, onClose }: ZoneModalsProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    tweenRef.current?.kill();

    if (activeZone === 'overview') {
      if (panelRef.current) {
        tweenRef.current = gsap.to(panelRef.current, {
          opacity: 0,
          y: 24,
          scale: 0.96,
          duration: 0.35,
          ease: 'power3.in',
          onComplete: () => setVisible(false),
        });
      }
    } else {
      setVisible(true);
      // t = 0.6s into the 1.15s zoom timeline
      const timer = setTimeout(() => {
        if (panelRef.current) {
          tweenRef.current = gsap.fromTo(
            panelRef.current,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'expo.out' }
          );
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        tweenRef.current?.kill();
      };
    }
  }, [activeZone]);

  if (!visible && activeZone === 'overview') return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none p-4">
      {/* Backdrop (clicking outside reverses camera to overview) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-auto ${
          activeZone !== 'overview' ? 'bg-black/60 backdrop-blur-xs' : 'bg-transparent'
        }`}
        onClick={onClose}
      />

      {/* Glassmorphic HUD Modal Container */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto
          bg-black/85 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 sm:p-7
          font-mono-hud pointer-events-auto opacity-0 shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
            <span className="text-[11px] text-white/40 tracking-wider ml-2">
              aarav@room-camera:~/spatial/{activeZone}
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-[10px] tracking-wider border border-white/20 hover:border-white/50 bg-white/5 rounded-full px-2.5 py-1"
          >
            <X size={11} /> ESC
          </button>
        </div>

        {activeZone === 'pc-workstation' && <PCWorkstationModal />}
        {activeZone === 'wall-tv' && <WallTVModal />}
        {activeZone === 'wall-posters' && <WallPostersModal />}
        {activeZone === 'corner-shelf' && <CornerShelfModal />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. PC WORKSTATION MODAL (github.dev/arv20)
   ═══════════════════════════════════════════════════════════ */
function PCWorkstationModal() {
  const [tab, setTab] = useState<'terminal' | 'github' | 'stack' | 'resume'>('github');
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [stats, setStats] = useState({ total: 1240, curStreak: 12, bestStreak: 45 });
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Load contribution data
  useEffect(() => {
    fetch('/data/github-contributions.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data.contributions) {
          setContributions(data.contributions);
          const total = typeof data.total === 'number' ? data.total : data.contributions.reduce((s: number, d: ContributionDay) => s + d.count, 0);
          setStats((prev) => ({ ...prev, total }));
        }
      })
      .catch(() => {
        // Fallback: Generate 52 weeks of realistic mock contributions
        const mock: ContributionDay[] = [];
        const now = new Date();
        for (let i = 364; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 86400000);
          const iso = d.toISOString().split('T')[0];
          const count = Math.random() > 0.4 ? Math.floor(Math.random() * 8) : 0;
          mock.push({ date: iso, count });
        }
        setContributions(mock);
      });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal size={15} className="text-green-400" />
          <h2 className="text-sm tracking-[0.2em] uppercase text-white font-bold">
            PC WORKSTATION & TERMINAL
          </h2>
        </div>
        <a
          href="https://github.com/arv20"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
        >
          github.dev/arv20 <ExternalLink size={10} />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {[
          { id: 'github' as const, label: '◆ GitHub Heatmap' },
          { id: 'terminal' as const, label: '◇ CLI Terminal' },
          { id: 'stack' as const, label: '◇ Tech Stack' },
          { id: 'resume' as const, label: '◇ Experience' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1 text-[10px] tracking-[0.14em] uppercase rounded-full border transition-all whitespace-nowrap ${
              tab === t.id
                ? 'border-green-400/80 text-green-400 bg-green-500/10 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
                : 'border-white/10 text-white/50 hover:text-white/80 hover:border-white/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: GITHUB HEATMAP */}
      {tab === 'github' && (
        <div>
          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="block text-lg font-bold text-white tabular-nums">
                {stats.total.toLocaleString()}
              </span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest">
                Total Contributions
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="block text-lg font-bold text-green-400 tabular-nums">
                {stats.curStreak} days
              </span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest">
                Current Streak
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="block text-lg font-bold text-white tabular-nums">
                {stats.bestStreak} days
              </span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest">
                Best Streak
              </span>
            </div>
          </div>

          {/* Interactive Heatmap */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-x-auto">
            <div className="text-[9px] text-white/40 tracking-wider mb-2 uppercase flex items-center justify-between">
              <span>Contribution Activity (Past Year)</span>
              <span className="text-green-400/70">Daily sync enabled</span>
            </div>

            <div className="grid grid-cols-[repeat(52,1fr)] gap-[2.5px] min-w-[500px]">
              {(contributions.length > 0
                ? contributions.slice(-364)
                : Array.from({ length: 364 }, (_, i) => ({
                    date: `2026-${i}`,
                    count: (i * 17) % 7,
                  }))
              ).map((day, idx) => {
                const count = day.count;
                const level =
                  count === 0
                    ? 'bg-white/8 hover:bg-white/20'
                    : count <= 2
                    ? 'bg-green-900/80 hover:bg-green-800'
                    : count <= 5
                    ? 'bg-green-600 hover:bg-green-500'
                    : count <= 9
                    ? 'bg-green-500 hover:bg-green-400'
                    : 'bg-green-400 hover:bg-green-300 shadow-[0_0_6px_#22c55e]';

                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-[2px] cursor-pointer transition-transform hover:scale-125 ${level}`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        text: `${count} contribution${count === 1 ? '' : 's'} on ${day.date}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 28,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-3 text-[9px] text-white/40 uppercase tracking-wider">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-green-900/80" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-green-600" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-green-500" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-green-400" />
              <span>More</span>
            </div>
          </div>

          {tooltip && (
            <div
              className="fixed z-50 px-2.5 py-1 bg-white text-black text-[10px] font-mono-hud font-bold rounded shadow-lg pointer-events-none -translate-x-1/2"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.text}
            </div>
          )}
        </div>
      )}

      {/* TAB: CLI TERMINAL */}
      {tab === 'terminal' && (
        <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono-hud leading-relaxed">
          <div className="text-white/40 mb-2">// Welcome to Aarav's workstation environment</div>
          <div className="text-green-400">$ whoami</div>
          <div className="text-white/80 mb-2">
            Aarav Kolgaonkar — SWE student @ The Ohio State University (CSE)
          </div>

          <div className="text-green-400">$ cat skills.json</div>
          <div className="text-white/70 mb-2">
            {`{
  "focus": ["Multi-Agent AI", "Distributed Systems", "Full-Stack WebGL"],
  "languages": ["Python", "TypeScript", "Java", "GLSL", "C++"],
  "frameworks": ["LangGraph", "FastAPI", "React 19", "Three.js", "Docker"]
}`}
          </div>

          <div className="text-green-400">$ uptime</div>
          <div className="text-white/70">
            up 4 semesters, load average: 18 credits, high velocity 🚀
          </div>
        </div>
      )}

      {/* TAB: TECH STACK */}
      {tab === 'stack' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              name: 'Python',
              icon: '🐍',
              desc: 'LangGraph, FastAPI, PyTorch, OpenTelemetry spans',
              tag: 'Primary',
            },
            {
              name: 'TypeScript & React',
              icon: '⚡',
              desc: 'React 19, Next.js App Router, Vite, Tailwind v4',
              tag: 'Frontend',
            },
            {
              name: 'Java & Spring',
              icon: '☕',
              desc: 'Object-Oriented Design, JUnit, Data Structures & Algos',
              tag: 'OSU CSE',
            },
            {
              name: 'Three.js & WebGL',
              icon: '🎮',
              desc: '3D interactive shaders, Draco compression, GLSL',
              tag: 'Graphics',
            },
            {
              name: 'LangGraph & AI',
              icon: '🧠',
              desc: 'Multi-agent orchestration, state machines, trace debugging',
              tag: 'AI/Agents',
            },
            {
              name: 'Cloud & Infrastructure',
              icon: '☁️',
              desc: 'AWS, Docker, GitHub Actions CI/CD pipelines',
              tag: 'DevOps',
            },
          ].map((item) => (
            <div
              key={item.name}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs text-white font-bold">{item.name}</span>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 uppercase">
                  {item.tag}
                </span>
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB: EXPERIENCE & LEADERSHIP */}
      {tab === 'resume' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-green-400" />
                <h3 className="text-xs text-white font-bold">Dublin Tech Club</h3>
              </div>
              <span className="text-[9px] text-green-400/80 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                Co-President
              </span>
            </div>
            <p className="text-[10px] text-white/60 leading-relaxed mb-2">
              Leading high-impact technology initiatives, organizing student hackathons, and fostering
              a thriving peer-learning culture for CS students across central Ohio.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-blue-400" />
                <h3 className="text-xs text-white font-bold">Software Engineering Intern</h3>
              </div>
              <span className="text-[9px] text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Engineering
              </span>
            </div>
            <p className="text-[10px] text-white/60 leading-relaxed">
              Full-stack application development, API optimization, and CI/CD automation. Shipped
              features to production with automated testing and observability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. WALL TV MODAL (Projects & Matchday Mode)
   ═══════════════════════════════════════════════════════════ */
function WallTVModal() {
  const [matchday, setMatchday] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Tv size={15} className="text-blue-400" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white font-bold">
          FEATURED BUILDS & BROADCAST
        </h2>
      </div>

      <div className="space-y-4">
        {/* Project 1: Spandrift */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition-all group">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e]" />
                <h3 className="text-xs text-white font-bold group-hover:text-green-400 transition-colors">
                  Spandrift
                </h3>
                <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/30 rounded px-1.5 py-0.5">
                  AI Observability
                </span>
              </div>
              <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed">
                Local-first Python OpenTelemetry (OTel) execution trace analyzer designed for complex
                multi-agent LLM systems. Real-time visualization of LangGraph spans, token costs, latency
                bottlenecks, and agent tool calling DAGs.
              </p>
            </div>
            <a
              href="https://github.com/arv20"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors p-1 shrink-0"
              title="View on GitHub"
            >
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="flex gap-1.5 flex-wrap mt-3">
            {['Python', 'OpenTelemetry', 'LangGraph', 'React 19', 'FastAPI'].map((badge) => (
              <span
                key={badge}
                className="px-2 py-0.5 rounded-full text-[9px] bg-white/5 border border-white/10 text-white/60"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Project 2: 3D WebGL Driving Portfolio */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition-all group">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
                <h3 className="text-xs text-white font-bold group-hover:text-blue-400 transition-colors">
                  3D WebGL Driving Experience
                </h3>
                <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded px-1.5 py-0.5">
                  Three.js Engine
                </span>
              </div>
              <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed">
                Hardware-accelerated 3D driving portfolio. Features a 1000-unit Catmull-Rom procedural spline road,
                Draco-compressed Ferrari GLB with realistic tire physics and steering, night headlight rays,
                and real-time Web Audio API engine oscillator synthesis.
              </p>
            </div>
            <a
              href="https://aaravkolgaonkar.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors p-1 shrink-0"
              title="Launch Driving Site"
            >
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="flex gap-1.5 flex-wrap mt-3">
            {['Three.js', 'WebGL', 'GLSL Shaders', 'Web Audio API', 'Draco'].map((badge) => (
              <span
                key={badge}
                className="px-2 py-0.5 rounded-full text-[9px] bg-white/5 border border-white/10 text-white/60"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Feature 3: Matchday Mode (Chelsea FC) */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trophy size={15} className={matchday ? 'text-blue-400' : 'text-white/40'} />
              <div>
                <span className="text-xs text-white font-bold block">Matchday Mode // Chelsea FC</span>
                <span className="text-[9px] text-white/40">Toggle Stamford Bridge live broadcast</span>
              </div>
            </div>

            <button
              onClick={() => setMatchday(!matchday)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                matchday ? 'bg-blue-600' : 'bg-white/20'
              }`}
              aria-label="Toggle Matchday Mode"
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  matchday ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {matchday && (
            <div className="mt-3 p-3 rounded-lg bg-blue-900/40 border border-blue-400/30 flex items-center justify-between animate-fade-in">
              <div>
                <div className="text-xs text-blue-300 font-bold">⚽ CHELSEA MATCHDAY LIVE</div>
                <div className="text-[10px] text-blue-200/70 mt-0.5">
                  Keep The Blue Flag Flying High // Supporter since 2012 🦁
                </div>
              </div>
              <span className="text-lg">💙</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. WALL POSTERS MODAL (Personal Lore)
   ═══════════════════════════════════════════════════════════ */
function WallPostersModal() {
  const [activeLore, setActiveLore] = useState<'osu' | 'chelsea' | 'elantra'>('osu');

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={15} className="text-red-400" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white font-bold">
          WALL ARCHIVE // PERSONAL LORE
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {[
          { id: 'osu' as const, label: '🌰 OSU Buckeyes' },
          { id: 'chelsea' as const, label: '🦁 Chelsea FC' },
          { id: 'elantra' as const, label: '🚗 2011 Elantra Limited' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveLore(item.id)}
            className={`px-3 py-1 text-[10px] tracking-[0.14em] uppercase rounded-full border transition-all ${
              activeLore === item.id
                ? 'border-red-400/80 text-red-400 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'border-white/10 text-white/50 hover:text-white/80'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* OSU TAB */}
      {activeLore === 'osu' && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2.5">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
            <span>The Ohio State University — Computer Science & Engineering</span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Studying CSE at OSU. Accelerated through the College Credit Plus (CCP) pathway,
            taking university-level engineering mathematics and computing fundamentals while still in high school.
          </p>
          <div className="pt-2 border-t border-red-900/30 flex items-center justify-between text-[10px] text-red-300/80">
            <span>Location: Columbus, OH</span>
            <span>Tradition: O-H-I-O 🏈</span>
          </div>
        </div>
      )}

      {/* CHELSEA TAB */}
      {activeLore === 'chelsea' && (
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 space-y-2.5">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <span>Chelsea Football Club — True Blue</span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Fell in love with the club during the 2012 UEFA Champions League miracle in Munich.
            From Didier Drogba's header to Eden Hazard's wizardry, weekend mornings are reserved for
            Premier League matchdays at Stamford Bridge. KTBFFH!
          </p>
          <div className="pt-2 border-t border-blue-900/30 flex items-center justify-between text-[10px] text-blue-300/80">
            <span>Favorite Era: 2012 Champions of Europe</span>
            <span>Crest: The Pride of London 🦁</span>
          </div>
        </div>
      )}

      {/* ELANTRA TAB */}
      {activeLore === 'elantra' && (
        <div className="p-4 rounded-xl bg-neutral-900/70 border border-white/15 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Car size={14} className="text-neutral-400" />
              <span>2011 Hyundai Elantra Limited</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-white/70">
              Daily Driver
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-white/60">
            <div className="p-2 rounded bg-white/5 border border-white/5">
              <span className="text-white/40 block text-[8px] uppercase">Engine</span>
              1.8L 4-Cylinder DOHC
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/5">
              <span className="text-white/40 block text-[8px] uppercase">Horsepower</span>
              148 hp @ 6,500 rpm
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/5">
              <span className="text-white/40 block text-[8px] uppercase">Transmission</span>
              6-Speed Shiftronic
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/5">
              <span className="text-white/40 block text-[8px] uppercase">Efficiency</span>
              29 City / 40 Hwy MPG
            </div>
          </div>
          <p className="text-[10px] text-white/40 italic">
            Reliable chariot navigating the Ohio winters and commute to campus.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. CORNER SHELF MODAL (Rotation & Hardware)
   ═══════════════════════════════════════════════════════════ */
function CornerShelfModal() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Gamepad2 size={15} className="text-purple-400" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white font-bold">
          SHELF // ROTATION & HARDWARE
        </h2>
      </div>

      <div className="space-y-4">
        {/* Media Rotation */}
        <div>
          <h3 className="text-[9px] tracking-[0.2em] text-white/40 uppercase mb-2">
            Current Media Rotation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Hades II */}
            <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-900/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-orange-400 font-bold flex items-center gap-1.5">
                  <Gamepad2 size={13} /> Hades II
                </span>
                <span className="text-[8px] text-orange-300/70 bg-orange-500/10 px-1.5 py-0.5 rounded">
                  Game
                </span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">
                Supergiant Games masterpiece. Melinoë’s descent into the Underworld, witchy boons,
                and impeccable art direction.
              </p>
            </div>

            {/* Jujutsu Kaisen */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-purple-400 font-bold flex items-center gap-1.5">
                  <BookOpen size={13} /> Jujutsu Kaisen
                </span>
                <span className="text-[8px] text-purple-300/70 bg-purple-500/10 px-1.5 py-0.5 rounded">
                  Anime/Manga
                </span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">
                Gege Akutami’s cursed energy battle system, high-velocity choreography, and Gojo vs.
                Sukuna peak storytelling.
              </p>
            </div>
          </div>
        </div>

        {/* Desk Hardware & Gear */}
        <div>
          <h3 className="text-[9px] tracking-[0.2em] text-white/40 uppercase mb-2">
            Desk Hardware & Gear
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Camera & Optics', desc: 'Mirrorless body on shelf mount', icon: Camera },
              { label: 'Dual Displays', desc: 'Ultrawide main + vertical secondary', icon: Tv },
              { label: 'Keyboards', desc: 'Custom mechanical switch boards', icon: Cpu },
              { label: 'Engineering Binders', desc: 'Algorithms & architecture notes', icon: Layers },
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent size={13} className="text-white/60" />
                    <span className="text-[11px] text-white font-medium">{item.label}</span>
                  </div>
                  <p className="text-[9px] text-white/40">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
