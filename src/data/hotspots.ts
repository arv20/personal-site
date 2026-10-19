export interface Hotspot {
  id: string;
  label: string;
  subtitle: string;
  x: number; // percentage from left
  y: number; // percentage from top
  scale: number; // zoom level
  key: string; // keyboard shortcut
}

export const HOTSPOTS: Hotspot[] = [
  {
    id: 'pc-workstation',
    label: 'PC WORKSTATION',
    subtitle: 'github.dev/arv20',
    x: 34,
    y: 46,
    scale: 2.8,
    key: '1',
  },
  {
    id: 'wall-tv',
    label: 'TV: PROJECTS & LIVE TELEMETRY',
    subtitle: 'Featured builds',
    x: 72,
    y: 40,
    scale: 2.6,
    key: '2',
  },
  {
    id: 'wall-posters',
    label: 'WALL ARCHIVE',
    subtitle: 'Personal lore',
    x: 29,
    y: 24,
    scale: 3.0,
    key: '3',
  },
  {
    id: 'corner-shelf',
    label: 'SHELF',
    subtitle: 'Rotation & hardware',
    x: 52,
    y: 20,
    scale: 3.0,
    key: '4',
  },
];

export type HotspotId = typeof HOTSPOTS[number]['id'];
export type ActiveZone = 'overview' | HotspotId;
