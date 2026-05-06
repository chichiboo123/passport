import { t } from '@/lib/i18n';
import type { AppState, Theme, Lang } from '@/lib/types';

interface SidebarProps {
  state: AppState;
  stampForm: { emoji: string; place: string; date: string };
  stampError: string;
  onThemeChange: (theme: Theme) => void;
  onCharacterChange: (partial: Partial<AppState['character']>) => void;
  onPhotoClick: () => void;
  onStampFormChange: (partial: Partial<{ emoji: string; place: string; date: string }>) => void;
  onAddStamp: () => void;
}

const THEMES: { id: Theme; color: string; label: string }[] = [
  { id: 'blue', color: '#1a56db', label: '파랑' },
  { id: 'red', color: '#c0392b', label: '빨강' },
  { id: 'green', color: '#1e7e34', label: '초록' },
  { id: 'brown', color: '#7d5a3c', label: '갈색' },
];

const QUICK_EMOJIS = [
  '✈️', '🚀', '🌟', '⭐', '🎉', '🎊',
  '🗼', '🗽', '🏯', '🗻', '🌋', '🏖️',
  '🏔️', '🎡', '🎢', '🌈', '🦁', '🐬',
  '🐼', '🦊', '🌸', '🍦', '🎶', '🏆',
];

export default function Sidebar({
  state,
  stampForm,
  stampError,
  onThemeChange,
  onCharacterChange,
  onPhotoClick,
  onStampFormChange,
  onAddStamp,
}: SidebarProps) {
  const lang: Lang = state.lang;
  const stampCount = state.stamps.length;

  return (
    <aside className="sidebar" role="complementary" aria-label="Editor panel">

      {/* Section 1: Theme */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <span className="section-step">1</span>
          <span className="material-symbols-outlined section-icon">palette</span>
          {t(lang, 'themeColor')}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {THEMES.map(th => (
            <button
              key={th.id}
              data-testid={`btn-theme-${th.id}`}
              className={`theme-chip${state.theme === th.id ? ' active' : ''}`}
              style={{ backgroundColor: th.color }}
              onClick={() => onThemeChange(th.id)}
              aria-label={th.label}
              title={th.label}
            />
          ))}
        </div>
      </div>

      {/* Section 2: Character info */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <span className="section-step">2</span>
          <span className="material-symbols-outlined section-icon">person</span>
          {t(lang, 'characterInfo')}
        </div>

        {/* Photo + Name/Birthdate side by side */}
        <div className="photo-name-row">
          <div
            data-testid="area-photo-upload"
            className="photo-upload-compact"
            onClick={onPhotoClick}
            role="button"
            tabIndex={0}
            aria-label={t(lang, 'photoUploadHint')}
            onKeyDown={e => e.key === 'Enter' && onPhotoClick()}
          >
            {state.character.photo ? (
              <img src={state.character.photo} alt="Character" />
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>add_a_photo</span>
                <span className="photo-upload-label">{t(lang, 'photoUpload')}</span>
              </>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <div>
              <label className="form-label" htmlFor="char-name">{t(lang, 'characterName')}</label>
              <input
                id="char-name"
                data-testid="input-character-name"
                className="form-input"
                type="text"
                placeholder={t(lang, 'namePlaceholder')}
                value={state.character.name}
                onChange={e => onCharacterChange({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="char-birth">{t(lang, 'birthdate')}</label>
              <input
                id="char-birth"
                data-testid="input-birthdate"
                className="form-input"
                type="date"
                value={state.character.birthdate}
                onChange={e => onCharacterChange({ birthdate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Nationality */}
        <div className="form-group" style={{ marginTop: 10 }}>
          <label className="form-label" htmlFor="char-nat">{t(lang, 'nationality')}</label>
          <input
            id="char-nat"
            data-testid="input-nationality"
            className="form-input"
            type="text"
            placeholder={t(lang, 'nationalityPlaceholder')}
            value={state.character.nationality}
            onChange={e => onCharacterChange({ nationality: e.target.value })}
          />
        </div>

        {/* Message to those who meet the character */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="char-msg">{t(lang, 'favorites')}</label>
          <textarea
            id="char-msg"
            data-testid="input-favorites"
            className="form-input form-textarea"
            placeholder={t(lang, 'favoritesPlaceholder')}
            value={state.character.message}
            onChange={e => onCharacterChange({ message: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      {/* Section 3: Stamp form */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <span className="section-step">3</span>
          <span className="material-symbols-outlined section-icon">approval</span>
          {t(lang, 'addStamp')}
          {stampCount > 0 && (
            <span className="section-badge">{stampCount}</span>
          )}
        </div>

        {/* Emoji quick picker */}
        <div className="form-group">
          <label className="form-label">{t(lang, 'stampEmoji')}</label>
          <input
            id="stamp-emoji"
            data-testid="input-stamp-emoji"
            className="form-input"
            type="text"
            placeholder={t(lang, 'emojiPlaceholder')}
            value={stampForm.emoji}
            onChange={e => onStampFormChange({ emoji: e.target.value })}
            style={{ fontSize: 20, textAlign: 'center', letterSpacing: '0.1em' }}
          />
          <div className="emoji-picker-grid" role="group" aria-label={t(lang, 'quickEmojiSelect')}>
            {QUICK_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                className={`emoji-pick-btn${stampForm.emoji === emoji ? ' selected' : ''}`}
                onClick={() => onStampFormChange({ emoji })}
                aria-label={emoji}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Place + Date in one row */}
        <div className="stamp-form-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <label className="form-label" htmlFor="stamp-place">{t(lang, 'visitPlace')}</label>
            <input
              id="stamp-place"
              data-testid="input-stamp-place"
              className="form-input"
              type="text"
              placeholder={t(lang, 'placePlaceholder')}
              value={stampForm.place}
              onChange={e => onStampFormChange({ place: e.target.value })}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label className="form-label" htmlFor="stamp-date">{t(lang, 'visitDate')}</label>
            <input
              id="stamp-date"
              data-testid="input-stamp-date"
              className="form-input"
              type="date"
              value={stampForm.date}
              onChange={e => onStampFormChange({ date: e.target.value })}
            />
          </div>
        </div>

        {stampError && (
          <div className="form-error" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>error</span>
            {stampError}
          </div>
        )}

        <button
          data-testid="btn-add-stamp"
          className="btn btn-primary btn-full"
          onClick={onAddStamp}
          style={{ gap: 8 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>approval</span>
          {t(lang, 'addStampBtn')}
        </button>
      </div>
    </aside>
  );
}
