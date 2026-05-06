import { useRef, useState } from 'react';
import { t } from '@/lib/i18n';
import type { AppState, Theme, Lang } from '@/lib/types';

interface SidebarProps {
  state: AppState;
  stampForm: { emoji: string; place: string; date: string; image: string };
  stampError: string;
  onThemeChange: (theme: Theme) => void;
  onCharacterChange: (partial: Partial<AppState['character']>) => void;
  onPhotoClick: () => void;
  onStampFormChange: (partial: Partial<{ emoji: string; place: string; date: string; image: string }>) => void;
  onAddStamp: () => void;
  style?: React.CSSProperties;
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
  style,
}: SidebarProps) {
  const lang: Lang = state.lang;
  const stampCount = state.stamps.length;
  const stampImageInputRef = useRef<HTMLInputElement>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const handleStampImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onStampFormChange({ image: ev.target?.result as string, emoji: '' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <aside className="sidebar" style={style} role="complementary" aria-label="Editor panel">

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

        {/* Photo + Name/Birthdate */}
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

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
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

        {/* Nationality + City in one row */}
        <div className="stamp-form-row" style={{ marginTop: 8, marginBottom: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <label className="form-label" htmlFor="char-city">{t(lang, 'city')}</label>
            <input
              id="char-city"
              data-testid="input-city"
              className="form-input"
              type="text"
              placeholder={t(lang, 'cityPlaceholder')}
              value={state.character.city}
              onChange={e => onCharacterChange({ city: e.target.value })}
            />
          </div>
        </div>

        {/* Likes + Caution in one row */}
        <div className="stamp-form-row" style={{ marginTop: 8, marginBottom: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label className="form-label" htmlFor="char-likes">{t(lang, 'likesLabel')}</label>
            <textarea
              id="char-likes"
              data-testid="input-likes"
              className="form-input form-textarea"
              placeholder={t(lang, 'likesPlaceholder')}
              value={state.character.likes}
              onChange={e => onCharacterChange({ likes: e.target.value })}
              rows={2}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label className="form-label" htmlFor="char-caution">{t(lang, 'cautionLabel')}</label>
            <textarea
              id="char-caution"
              data-testid="input-caution"
              className="form-input form-textarea"
              placeholder={t(lang, 'cautionPlaceholder')}
              value={state.character.caution}
              onChange={e => onCharacterChange({ caution: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        {/* Message: 캐릭터를 만날 사람들에게 */}
        <div className="form-group" style={{ marginTop: 8, marginBottom: 0 }}>
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

        {/* Emoji input + collapsible quick picker */}
        <div className="form-group">
          <label className="form-label">{t(lang, 'stampEmoji')}</label>

          {/* Emoji text input + picker toggle on same line */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              id="stamp-emoji"
              data-testid="input-stamp-emoji"
              className="form-input"
              type="text"
              placeholder={t(lang, 'emojiPlaceholder')}
              value={stampForm.emoji}
              onChange={e => onStampFormChange({ emoji: e.target.value, image: '' })}
              style={{ fontSize: 20, textAlign: 'center', letterSpacing: '0.1em', flex: 1, minWidth: 0 }}
            />
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              style={{ flexShrink: 0, padding: '6px 10px', fontSize: 12, minHeight: 40, whiteSpace: 'nowrap' }}
              onClick={() => setEmojiPickerOpen(v => !v)}
              aria-expanded={emojiPickerOpen}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {emojiPickerOpen ? 'expand_less' : 'expand_more'}
              </span>
              {emojiPickerOpen ? t(lang, 'emojiToggleClose').replace(/[▲▼]\s*/, '') : t(lang, 'quickEmojiSelect').slice(0, 4)}
            </button>
          </div>

          {/* Collapsible emoji grid */}
          {emojiPickerOpen && (
            <div className="emoji-picker-grid" role="group" aria-label={t(lang, 'quickEmojiSelect')} style={{ marginTop: 7 }}>
              {QUICK_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`emoji-pick-btn${stampForm.emoji === emoji && !stampForm.image ? ' selected' : ''}`}
                  onClick={() => { onStampFormChange({ emoji, image: '' }); setEmojiPickerOpen(false); }}
                  aria-label={emoji}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Image upload for stamp */}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>
              {t(lang, 'stampImageLabel')}
            </span>
            {stampForm.image ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img
                  src={stampForm.image}
                  alt="stamp preview"
                  style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--theme-primary, #1a56db)' }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  style={{ padding: '3px 9px', fontSize: 12, minHeight: 26 }}
                  onClick={() => onStampFormChange({ image: '' })}
                >
                  {t(lang, 'stampImageClear')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                style={{ padding: '3px 9px', fontSize: 12, minHeight: 26 }}
                onClick={() => stampImageInputRef.current?.click()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>image</span>
                {t(lang, 'stampImageBtn')}
              </button>
            )}
          </div>
          <input
            ref={stampImageInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleStampImageUpload}
          />
        </div>

        {/* Place + Date */}
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
