export type Theme = 'blue' | 'red' | 'green' | 'brown';
export type Lang = 'ko' | 'en' | 'ja' | 'id';
export type View = 'profile' | 'stamp';

export interface Stamp {
  id: string;
  emoji: string;
  place: string;
  date: string;
  x: number;
  y: number;
  rotation: number;
  color: string;
}

export interface CharacterState {
  photo: string;
  name: string;
  birthdate: string;
  nationality: string;
  favorites: string;
}

export interface AppState {
  theme: Theme;
  lang: Lang;
  view: View;
  character: CharacterState;
  stamps: Stamp[];
  passportNo: string;
  issueDate: string;
}
