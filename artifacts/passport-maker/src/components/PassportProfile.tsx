import { t } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import type { AppState, Lang } from '@/lib/types';

interface Props {
  state: AppState;
  mrz: [string, string];
  lang: Lang;
}

const ORNAMENT_EMOJI: Record<string, string> = {
  blue: '✈️',
  red: '🗺️',
  green: '🌿',
  brown: '🧭',
};

/* Fixed passport page dimensions — both pages must match so the spread is always the same ratio */
const PAGE_W = 330;
const PAGE_H = 480;

export default function PassportProfile({ state, mrz, lang }: Props) {
  const { character, theme, passportNo, issueDate } = state;
  const ornamentEmoji = ORNAMENT_EMOJI[theme] ?? '✈️';

  return (
    <div style={{
      display: 'flex',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
      width: PAGE_W * 2 + 10,
      height: PAGE_H,
    }}>
      {/* ── Left page ── */}
      <div
        className="passport-cover-left"
        style={{ width: PAGE_W, height: PAGE_H, flexShrink: 0, overflow: 'hidden' }}
      >
        {/* Background watermark */}
        <div className="watermark" style={{ opacity: 0.08 }}>
          <div style={{ transform: 'rotate(-45deg)', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#fff', textAlign: 'center', lineHeight: 2 }}>
            NOT AN OFFICIAL DOCUMENT &nbsp; KIDS PLAY PASSPORT &nbsp; NOT AN OFFICIAL DOCUMENT &nbsp; KIDS PLAY PASSPORT &nbsp;
            NOT AN OFFICIAL DOCUMENT &nbsp; KIDS PLAY PASSPORT &nbsp; NOT AN OFFICIAL DOCUMENT &nbsp; KIDS PLAY PASSPORT &nbsp;
          </div>
        </div>

        {/* Ornament circles */}
        <div style={{ position: 'absolute', top: 16, left: 16, width: 40, height: 40, border: '2px solid rgba(255,255,255,0.2)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: 60, right: 16, width: 60, height: 60, border: '2px solid rgba(255,255,255,0.15)', borderRadius: '50%' }} />

        {/* Title block */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{ornamentEmoji}</div>
          <div style={{
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: 14,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}>
            CHARACTER{'\n'}TRAVEL PASSPORT
          </div>
          <div style={{ width: 60, height: 2, background: 'rgba(255,255,255,0.4)', margin: '12px auto' }} />
        </div>

        {/* Travel tag */}
        <div className="travel-tag" style={{ zIndex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: 6 }}>
            Please Look After
          </div>
          <div style={{
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: 13,
            color: '#fff',
            lineHeight: 1.5,
            marginBottom: 10,
          }}>
            THIS TRAVELER
          </div>
          <div style={{
            fontSize: 12,
            color: character.message ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.6)',
            lineHeight: 1.6,
            marginBottom: 10,
            fontStyle: character.message ? 'italic' : 'normal',
            minHeight: 36,
            wordBreak: 'keep-all',
          }}>
            {character.message || t(lang, 'lookAfterSub')}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 8 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>PASSPORT NO.</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#fff', letterSpacing: '0.12em', fontWeight: 700 }}>
              {passportNo}
            </div>
          </div>
        </div>

        {/* Issue date bottom */}
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>ISSUED</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
            {formatDate(issueDate)}
          </div>
        </div>
      </div>

      {/* Spine */}
      <div style={{ width: 10, flexShrink: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 100%)' }} />

      {/* ── Right page ── fixed height column layout */}
      <div style={{
        width: PAGE_W,
        height: PAGE_H,
        background: '#fffef8',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Background watermark */}
        <div className="watermark">
          <div style={{
            transform: 'rotate(-35deg)',
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(0,0,0,0.04)',
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
            lineHeight: 3,
          }}>
            NOT AN OFFICIAL DOCUMENT &nbsp;&nbsp; KIDS PLAY PASSPORT &nbsp;&nbsp;
            NOT AN OFFICIAL DOCUMENT &nbsp;&nbsp; KIDS PLAY PASSPORT &nbsp;&nbsp;
            NOT AN OFFICIAL DOCUMENT &nbsp;&nbsp; KIDS PLAY PASSPORT
          </div>
        </div>

        {/* Header bar */}
        <div style={{
          background: 'var(--theme-passport-cover, #1a3a6b)',
          padding: '7px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 10, color: '#fff', letterSpacing: '0.1em' }}>
            CHARACTER PASSPORT
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
            No. {passportNo}
          </span>
        </div>

        {/* Profile content — flex:1 fills remaining space between header and MRZ */}
        <div style={{ flex: 1, padding: '12px 14px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Photo + basic info row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            {/* Photo */}
            <div style={{
              width: 86,
              height: 106,
              flexShrink: 0,
              border: '2px solid #ddd',
              borderRadius: 4,
              overflow: 'hidden',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {character.photo ? (
                <img src={character.photo} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#ccc' }}>person</span>
              )}
            </div>

            {/* Info rows */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <InfoRow label={t(lang, 'characterName')} value={character.name || '—'} large />
              <InfoRow label={t(lang, 'dateOfBirth')} value={character.birthdate ? formatDate(character.birthdate) : '—'} />
              <InfoRow label={t(lang, 'nationality2')} value={character.nationality || '—'} />
              <InfoRow label={t(lang, 'cityPassport')} value={character.city || '—'} />
            </div>
          </div>

          {/* Likes + Caution section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
            <SubField
              icon="favorite"
              label={t(lang, 'likesPassport')}
              value={character.likes}
              accentColor="var(--theme-primary, #1a56db)"
            />
            <SubField
              icon="warning"
              label={t(lang, 'cautionPassport')}
              value={character.caution}
              accentColor="#e67e22"
            />
          </div>

          {/* Decorative VALID stamp — top-right corner */}
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '2.5px solid var(--theme-primary, #1a56db)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--theme-primary, #1a56db)',
              opacity: 0.22,
            }}>
              <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.3 }}>
                VALID<br />FOR<br />TRAVEL
              </div>
            </div>
          </div>
        </div>

        {/* MRZ section */}
        <div style={{
          borderTop: '1.5px solid #ddd',
          background: '#f8f8f8',
          padding: '6px 10px',
          fontFamily: 'monospace',
          fontSize: 8,
          letterSpacing: '0.04em',
          color: '#444',
          lineHeight: 1.8,
          flexShrink: 0,
        }}>
          <div>{mrz[0]}</div>
          <div>{mrz[1]}</div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase', marginBottom: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: large ? 15 : 11, fontWeight: large ? 700 : 500, color: '#222', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </div>
    </div>
  );
}

function SubField({ icon, label, value, accentColor }: { icon: string; label: string; value: string; accentColor: string }) {
  return (
    <div style={{
      background: '#f5f5f0',
      borderRadius: 6,
      padding: '5px 9px',
      borderLeft: `3px solid ${accentColor}`,
      flex: 1,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 10, color: accentColor }}>
          {icon}
        </span>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', color: '#999', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 10,
        color: value ? '#333' : '#bbb',
        lineHeight: 1.4,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      } as React.CSSProperties}>
        {value || '—'}
      </div>
    </div>
  );
}
