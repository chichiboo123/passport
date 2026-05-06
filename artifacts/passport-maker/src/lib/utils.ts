import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePassportNo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nums = '0123456789';
  let result = '';
  for (let i = 0; i < 2; i++) result += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 7; i++) result += nums[Math.floor(Math.random() * nums.length)];
  return result;
}

export function generateMRZ(name: string, nationality: string, birthdate: string, passportNo: string): [string, string] {
  const clean = (s: string, maxLen: number) =>
    s.toUpperCase().replace(/[^A-Z0-9]/g, '<').padEnd(maxLen, '<').slice(0, maxLen);
  const pad = (s: string, len: number) => s.padEnd(len, '<').slice(0, len);

  const nameParts = name.split(' ');
  const surname = clean(nameParts[0] ?? 'CHARACTER', 15);
  const givenName = clean(nameParts.slice(1).join(' ') || 'TRAVELER', 14);
  const nameField = `${surname}<<${givenName}`;

  const line1 = `P<${clean(nationality || 'CHR', 3)}${pad(nameField, 39)}`.slice(0, 44);

  const pNo = clean(passportNo, 9);
  const nat = clean(nationality || 'CHR', 3);
  const dob = birthdate ? birthdate.replace(/-/g, '').slice(2) : '000000';
  const exp = '991231';
  const line2 = `${pNo}<${nat}${dob}0F${exp}0<<<<<<<<<<<<<<<0`.slice(0, 44);

  return [line1, line2];
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const STAMP_COLORS = ['#1a56db', '#c0392b', '#1e7e34', '#7d5a3c', '#6d28d9'];

export function randomStampProps(): { x: number; y: number; rotation: number; color: string } {
  const margin = 10;
  const x = margin + Math.random() * (80 - margin * 2);
  const y = margin + Math.random() * (80 - margin * 2);
  const rotation = (Math.random() - 0.5) * 50;
  const color = STAMP_COLORS[Math.floor(Math.random() * STAMP_COLORS.length)];
  return { x, y, rotation, color };
}
