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

export default function PassportProfile({ state, mrz, lang }: Props) {
  const { character, theme, passportNo, issueDate } = state;
  const ornamentEmoji = ORNAMENT_EMOJI[theme] ?? '✈️';

  return (
    <div style={{ display: 'flex', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
      {/* Left page — travel tag design */}
      <div className="passport-cover-left" style={{ width: 330, minHeight: 480 }}>
        {/* Background watermark */}
        <div className="watermark" style={{ opacity: 0.08 }}>
          <div style={{ transform: 'rotate(-45deg)', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#fff', textAlign: 'center', lineHeight: 2 }}>
            NOT AN OFFICIAL DOCUMENT &nbsp; KIDS PLAY PASSPORT &nbsp; NOT AN OFFICIAL DOCUMENT &nbsp; KIDS PLAY PASSPORT &nbsp;
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

        {/* Travel tag card */}
        <div className="travel-tag" style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>
            Please Look After
          </div>
          <div style={{
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: 13,
            color: '#fff',
            lineHeight: 1.5,
            marginBottom: 4,
          }}>
            THIS TRAVELER
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
            {t(lang, 'lookAfterSub')}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 10, marginTop: 4 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>PASSPORT NO.</div>
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
      <div style={{ width: 10, background: 'linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 100%)' }} />

      {/* Right page — profile info */}
      <div style={{ width: 330, minHeight: 480, background: '#fffef8', position: 'relative', display: 'flex', flexDirection: 'column' }}>
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
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 10, color: '#fff', letterSpacing: '0.1em' }}>
            CHARACTER PASSPORT
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
            No. {passportNo}
          </span>
        </div>

        {/* Profile content */}
        <div style={{ padding: '16px', flex: 1, position: 'relative', zIndex: 1 }}>
          {/* Photo + basic info */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            {/* Photo box */}
            <div style={{
              width: 90,
              height: 110,
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

            {/* Info */}
            <div style={{ flex: 1 }}>
              <InfoRow label={t(lang, 'characterName')} value={character.name || '—'} large />
              <InfoRow label={t(lang, 'dateOfBirth')} value={character.birthdate ? formatDate(character.birthdate) : '—'} />
              <InfoRow label={t(lang, 'nationality2')} value={character.nationality || '—'} />
            </div>
          </div>

          {/* Favorites */}
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#999',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}>
              {t(lang, 'favoriteThings')}
            </div>
            <div style={{
              fontSize: 13,
              color: '#333',
              background: '#f9f9f7',
              border: '1px solid #eee',
              borderRadius: 4,
              padding: '6px 8px',
              minHeight: 32,
            }}>
              {character.favorites || '—'}
            </div>
          </div>

          {/* Decorative stamp circle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              border: '2.5px solid var(--theme-primary, #1a56db)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--theme-primary, #1a56db)',
              opacity: 0.3,
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.3 }}>
                VALID<br />FOR<br />TRAVEL
              </div>
            </div>
          </div>
        </div>

        {/* MRZ section */}
        <div style={{
          borderTop: '1.5px solid #ddd',
          background: '#f8f8f8',
          padding: '8px 12px',
          fontFamily: 'monospace',
          fontSize: 8.5,
          letterSpacing: '0.04em',
          color: '#444',
          lineHeight: 1.8,
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
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: large ? 15 : 12, fontWeight: large ? 700 : 500, color: '#222', lineHeight: 1.3 }}>
        {value}
      </div>
    </div>
  );
}
