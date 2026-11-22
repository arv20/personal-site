import { useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onCommand: (cmd: string) => void;
  weather?: { temperature_2m: number; weather_code: number } | null;
}

const COMMANDS: Record<string, string> = {
  help: 'help, about, projects, now, weather, ls, cat <file>, open <github|linkedin|spandrift>, resume, contact, night, day, clear, exit',
  about: 'Aarav Kolgaonkar — CSE student @ Ohio State. Always building.',
  ls: 'room.ts  ideas.md  spandrift/  traces.py  agents.py  README.md',
  'cat room.ts': 'const aarav = { studying: "CSE @ Ohio State", building: ["Spandrift","this room"], curiosity: Infinity };',
  'cat ideas.md': '# ideas\n- make the room explorable\n- ship the terminal\n- pet the cat',
  'sudo hire-me': 'Hiring authorized. Email aarav.kolgaonkar@gmail.com — résumé on request.',
  neofetch: 'OS: dorm-room 1.0\nHost: aaravkolgaonkar.dev\nShell: /bin/aarav\nUptime: since freshman year\nPackages: curiosity (infinity)\nMemory: one small room, fully explored',
  whoami: 'aarav',
  pwd: '/home/aarav/room',
};

export default function Terminal({ open, onClose, onCommand, weather }: Props) {
  const [lines, setLines] = useState<string[]>([
    'aarav / workspace — type `help` to begin. Press Esc to close.',
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setLines(prev => [...prev, `aarav@room:~$ ${cmd}`]);
    setHistory(prev => [cmd, ...prev].slice(0, 50));
    setHistIdx(-1);

    const lower = cmd.toLowerCase();
    if (lower === 'clear') { setLines([]); return; }
    if (lower === 'exit' || lower === 'quit') { onClose(); return; }

    let out: string | null = null;
    if (lower === 'projects') {
      out = 'Spandrift — local-first trace analyzer for multi-agent AI (Python/OTel/React)\nThis room — personal corner of the web (TypeScript/WebGL)\nTrove — more to share soon';
    } else if (lower === 'now') {
      out = 'building: Spandrift\nreading: Designing Data-Intensive Applications\nlistening: lo-fi beats & movie soundtracks';
    } else if (lower.startsWith('open ')) {
      const target = lower.slice(5).trim();
      const urls: Record<string, string> = {
        github: 'https://github.com/arv20',
        linkedin: 'https://www.linkedin.com/in/aarav-kolgaonkar-b1264b369/',
        spandrift: 'https://github.com/arv20/spandrift',
        room: 'https://github.com/arv20/personal-site',
      };
      if (urls[target]) { window.open(urls[target], '_blank', 'noopener'); out = `opened ${target}`; }
      else out = `unknown target: ${target}`;
    } else if (lower === 'resume') {
      window.location.href = 'mailto:aarav.kolgaonkar@gmail.com?subject=R%C3%A9sum%C3%A9%20request';
      out = 'opening mail client…';
    } else if (lower === 'contact') {
      out = 'aarav.kolgaonkar@gmail.com\ngithub.com/arv20\nlinkedin.com/in/aarav-kolgaonkar-b1264b369';
    } else if (lower === 'weather') {
      out = weather ? `Columbus, OH: ${Math.round(weather.temperature_2m)}°C, code ${weather.weather_code}` : 'weather unavailable';
    } else if (lower === 'night') {
      onCommand('night'); out = 'lights out.';
    } else if (lower === 'day') {
      onCommand('day'); out = 'lights on.';
    } else if (lower === 'matrix') {
      out = '01001000 01101001. (just kidding — type `neofetch`)';
    } else if (COMMANDS[lower]) {
      out = COMMANDS[lower];
    } else if (lower.startsWith('cat ')) {
      const f = lower.slice(4).trim();
      out = COMMANDS[`cat ${f}`] ?? `cat: ${f}: No such file`;
    } else {
      out = `command not found: ${cmd}. Type 'help'.`;
    }
    if (out) setLines(prev => [...prev, ...out.split('\n')]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { run(input); setInput(''); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length) {
        const i = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(i); setInput(history[i]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx <= 0) { setHistIdx(-1); setInput(''); }
      else { const i = histIdx - 1; setHistIdx(i); setInput(history[i]); }
    }
  };

  if (!open) return null;
  return (
    <div className="terminal-overlay" role="dialog" aria-label="Terminal">
      <div className="terminal-window">
        <div className="terminal-titlebar">
          <span className="terminal-dots"><i /><i /><i /></span>
          <span>aarav / workspace</span>
          <button className="terminal-close" onClick={onClose} aria-label="Close terminal">×</button>
        </div>
        <div className="terminal-body" ref={scrollRef}>
          {lines.map((l, i) => <div key={i} className="terminal-line">{l}</div>)}
        </div>
        <div className="terminal-input-row">
          <span className="terminal-prompt">aarav@room:~$</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} spellCheck={false} autoComplete="off" />
        </div>
      </div>
    </div>
  );
}