import { t } from '@/lib/i18n';
import type { AppState, Theme, Lang } from '@/lib/types';

interface SidebarProps {
  state: AppState;
  stampForm: { emoji: string; place: string; date: string };
  stampError: string;
  saving: boolean;
  onThemeChange: (theme: Theme) => void;
  onCharacterChange: (partial: Partial<AppState['character']>) => void;
  onPhotoClick: () => void;
  onStampFormChange: (partial: Partial<{ emoji: string; place: string; date: string }>) => void;
  onAddStamp: () => void;
  onSaveJson: () => void;
  onLoadJson: () => void;
}

const THEMES: { id: Theme; color: string; label: string }[] = [
  { id: 'blue', color: '#1a56db', label: '파랑' },
  { id: 'red', color: '#c0392b', label: '빨강' },
  { id: 'green', color: '#1e7e34', label: '초록' },
  { id: 'brown', color: '#7d5a3c', label: '갈색' },
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
  onSaveJson,
  onLoadJson,
}: SidebarProps) {
  const lang: Lang = state.lang;

  return (
    <aside className="sidebar" role="complementary" aria-label="Editor panel">
      {/* Section: Theme */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">{t(lang, 'themeColor')}</div>
        <div style={{ display: 'flex', gap: 10 }}>
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

      {/* Section: Character info */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">{t(lang, 'characterInfo')}</div>

        {/* Photo */}
        <div className="form-group">
          <label className="form-label">{t(lang, 'photoUpload')}</label>
          <div
            data-testid="area-photo-upload"
            className="photo-upload-area"
            onClick={onPhotoClick}
            role="button"
            tabIndex={0}
            aria-label={t(lang, 'photoUploadHint')}
            onKeyDown={e => e.key === 'Enter' && onPhotoClick()}
            style={{ maxHeight: 140 }}
          >
            {state.character.photo ? (
              <img src={state.character.photo} alt="Character" />
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>add_a_photo</span>
                <span>{t(lang, 'photoUploadHint')}</span>
              </>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="form-group">
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

        {/* Birthdate */}
        <div className="form-group">
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

        {/* Nationality */}
        <div className="form-group">
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

        {/* Favorites */}
        <div className="form-group">
          <label className="form-label" htmlFor="char-fav">{t(lang, 'favorites')}</label>
          <input
            id="char-fav"
            data-testid="input-favorites"
            className="form-input"
            type="text"
            placeholder={t(lang, 'favoritesPlaceholder')}
            value={state.character.favorites}
            onChange={e => onCharacterChange({ favorites: e.target.value })}
          />
        </div>
      </div>

      {/* Section: Stamp form */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">{t(lang, 'addStamp')}</div>

        <div className="form-group">
          <label className="form-label" htmlFor="stamp-emoji">{t(lang, 'stampEmoji')}</label>
          <input
            id="stamp-emoji"
            data-testid="input-stamp-emoji"
            className="form-input"
            type="text"
            placeholder={t(lang, 'emojiPlaceholder')}
            value={stampForm.emoji}
            onChange={e => onStampFormChange({ emoji: e.target.value })}
            style={{ fontSize: 20 }}
          />
        </div>

        <div className="form-group">
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

        <div className="form-group">
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

        {stampError && (
          <p style={{ color: '#c0392b', fontSize: 12, marginBottom: 8 }}>{stampError}</p>
        )}

        <button
          data-testid="btn-add-stamp"
          className="btn btn-primary btn-full"
          onClick={onAddStamp}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>approval</span>
          {t(lang, 'addStampBtn')}
        </button>
      </div>

      {/* Section: Data management */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">{t(lang, 'dataManagement')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            data-testid="btn-save-json"
            className="btn btn-secondary btn-sm"
            onClick={onSaveJson}
            style={{ flex: 1 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>save</span>
            {t(lang, 'saveJson')}
          </button>
          <button
            data-testid="btn-load-json"
            className="btn btn-secondary btn-sm"
            onClick={onLoadJson}
            style={{ flex: 1 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>upload_file</span>
            {t(lang, 'loadJson')}
          </button>
        </div>
      </div>
    </aside>
  );
}
