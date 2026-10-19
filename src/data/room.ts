export type RoomSection = 'work' | 'about' | 'shelf';
export const PROFILE = {
  github: 'https://github.com/arv20',
  linkedin: 'https://www.linkedin.com/in/aarav-kolgaonkar-b1264b369/',
  email: 'mailto:aarav.kolgaonkar@gmail.com',
};
export const ROOM_ANCHORS: { id: RoomSection; label: string; position: [number, number, number] }[] = [
  { id: 'work', label: 'The desk', position: [-1.4, 2.26, -2.12] },
  { id: 'about', label: 'The wall', position: [-2.56, 3.85, -2.96] },
  { id: 'shelf', label: 'The shelf', position: [3.1, 3.1, -2.35] },
];
