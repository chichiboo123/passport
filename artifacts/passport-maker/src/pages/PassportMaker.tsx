import { useState, useRef, useCallback, useEffect } from 'react';
import { t } from '@/lib/i18n';
import { generatePassportNo, generateMRZ, todayStr, randomStampProps } from '@/lib/utils';
import type { AppState, Stamp, Theme, Lang } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import PassportProfile from '@/components/PassportProfile';
import PassportStamps from '@/components/PassportStamps';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
  hiding: boolean;
}

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'id', label: 'Bahasa Indonesia' },
];

function PassportMaker() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jsonMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<AppState>({
    theme: 'blue',
    lang: 'ko',
    view: 'profile',
    character: {
      photo: '',
      name: '',
      birthdate: '',
      nationality: '',
      city: '',
      message: '',
      likes: '',
      caution: '',
    },
    stamps: [],
    passportNo: generatePassportNo(),
    issueDate: todayStr(),
  });

  const [stampForm, setStampForm] = useState({ emoji: '', place: '', date: todayStr(), image: '' });
  const [stampError, setStampError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [newStampId, setNewStampId] = useState<string | undefined>(undefined);
  const [jsonMenuOpen, setJsonMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ id, message, type, hiding: false });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => prev?.id === id ? { ...prev, hiding: true } : prev);
      setTimeout(() => setToast(prev => prev?.id === id ? null : prev), 220);
    }, 2000);
  }, []);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (jsonMenuRef.current && !jsonMenuRef.current.contains(e.target as Node)) {
        setJsonMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const update = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const updateCharacter = useCallback((partial: Partial<AppState['character']>) => {
    setState(prev => ({ ...prev, character: { ...prev.character, ...partial } }));
  }, []);

  const dragStamp = useCallback((id: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      stamps: prev.stamps.map(s => s.id === id ? { ...s, x, y } : s),
    }));
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateCharacter({ photo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addStamp = () => {
    setStampError('');
    if (!stampForm.emoji.trim() && !stampForm.image) { setStampError(t(state.lang, 'emojiRequired')); return; }
    if (!stampForm.place.trim()) { setStampError(t(state.lang, 'placeRequired')); return; }
    const id = Date.now().toString();
    const newStamp: Stamp = {
      id,
      emoji: stampForm.emoji.trim(),
      image: stampForm.image || undefined,
      place: stampForm.place.trim(),
      date: stampForm.date || todayStr(),
      ...randomStampProps(),
    };
    setState(prev => ({ ...prev, stamps: [...prev.stamps, newStamp], view: 'stamp' }));
    setStampForm(prev => ({ ...prev, emoji: '', place: '', image: '' }));
    setNewStampId(id);
    setTimeout(() => setNewStampId(undefined), 600);
    showToast(`${newStamp.image ? '🖼️' : newStamp.emoji} ${t(state.lang, 'stampAdded')}`);
  };

  const deleteStamp = (id: string) => {
    setState(prev => ({ ...prev, stamps: prev.stamps.filter(s => s.id !== id) }));
  };

  const saveJson = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passport-${state.character.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t(state.lang, 'jsonSaved'));
    setJsonMenuOpen(false);
  };

  const loadJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const loaded = JSON.parse(ev.target?.result as string) as AppState;
          setState(loaded);
          showToast(t(state.lang, 'jsonLoaded'));
        } catch {
          showToast(t(state.lang, 'jsonLoadError'), 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
    setJsonMenuOpen(false);
  };

  const saveImage = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const el = canvasRef.current;
      if (!el) return;
      // Remove any CSS zoom so html2canvas captures at 1:1 scale
      const prevZoom = el.style.zoom;
      el.style.zoom = '1';
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#e8ecf1',
        scale: 2,
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });
      el.style.zoom = prevZoom;
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `passport-${state.character.name || 'character'}.png`;
      a.click();
      showToast(t(state.lang, 'imageSaved'));
    } catch (err) {
      console.error('Failed to save image:', err);
      showToast(t(state.lang, 'imageSaveError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const mrz = generateMRZ(state.character.name, state.character.nationality, state.character.birthdate, state.passportNo);

  return (
    <div className={`app-layout theme-${state.theme}`}>
      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, flexShrink: 0 }}>travel_explore</span>
          <span className="app-title">{t(state.lang, 'appTitle')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* JSON diskette button */}
          <div ref={jsonMenuRef} style={{ position: 'relative' }}>
            <button
              data-testid="btn-json-menu"
              className="header-icon-btn"
              onClick={() => setJsonMenuOpen(v => !v)}
              title={t(state.lang, 'jsonSaveLoad')}
              aria-expanded={jsonMenuOpen}
              aria-haspopup="menu"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>save</span>
            </button>
            {jsonMenuOpen && (
              <div className="json-dropdown" role="menu">
                <button
                  data-testid="btn-save-json"
                  className="json-dropdown-item"
                  onClick={saveJson}
                  role="menuitem"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>download</span>
                  {t(state.lang, 'saveJson')}
                </button>
                <button
                  data-testid="btn-load-json"
                  className="json-dropdown-item"
                  onClick={loadJson}
                  role="menuitem"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>upload_file</span>
                  {t(state.lang, 'loadJson')}
                </button>
              </div>
            )}
          </div>

          {/* Language selector icon button */}
          <div ref={langMenuRef} style={{ position: 'relative' }}>
            <button
              data-testid="btn-lang-menu"
              className="header-icon-btn"
              onClick={() => setLangMenuOpen(v => !v)}
              title={t(state.lang, 'howToUse')}
              aria-expanded={langMenuOpen}
              aria-haspopup="menu"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>language</span>
            </button>
            {langMenuOpen && (
              <div className="json-dropdown" role="menu">
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className="json-dropdown-item"
                    onClick={() => { update({ lang: opt.value }); setLangMenuOpen(false); }}
                    role="menuitem"
                  >
                    {state.lang === opt.value && (
                      <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--theme-primary, #1a56db)' }}>check</span>
                    )}
                    {state.lang !== opt.value && (
                      <span style={{ display: 'inline-block', width: 15 }} />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help / About button */}
          <button
            data-testid="btn-help"
            className="header-icon-btn"
            onClick={() => setShowHelp(true)}
            title={t(state.lang, 'howToUse')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>help_outline</span>
          </button>
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="mobile-tab-bar" role="tablist">
        <button
          className={`mobile-tab-btn${mobileTab === 'edit' ? ' active' : ''}`}
          onClick={() => setMobileTab('edit')}
          role="tab"
          aria-selected={mobileTab === 'edit'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span>
          {t(state.lang, 'editTab')}
        </button>
        <button
          className={`mobile-tab-btn${mobileTab === 'preview' ? ' active' : ''}`}
          onClick={() => { setMobileTab('preview'); }}
          role="tab"
          aria-selected={mobileTab === 'preview'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chrome_reader_mode</span>
          {t(state.lang, 'previewTab')}
        </button>
      </div>

      {/* Body */}
      <div className={`app-body mobile-tab-${mobileTab}`}>
        <Sidebar
          state={state}
          stampForm={stampForm}
          stampError={stampError}
          onThemeChange={(theme: Theme) => update({ theme })}
          onCharacterChange={updateCharacter}
          onPhotoClick={() => fileInputRef.current?.click()}
          onStampFormChange={(partial) => setStampForm(prev => ({ ...prev, ...partial }))}
          onAddStamp={addStamp}
        />

        {/* Hidden file input for photo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoUpload}
          data-testid="input-photo-upload"
        />

        {/* Canvas area */}
        <div className="canvas-area">
          <div className="canvas-toolbar">
            <div className="toggle-group" role="group" aria-label="Passport view">
              <button
                data-testid="btn-profile-view"
                className={`toggle-btn${state.view === 'profile' ? ' active' : ''}`}
                onClick={() => update({ view: 'profile' })}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
                {t(state.lang, 'profileView')}
              </button>
              <button
                data-testid="btn-stamp-view"
                className={`toggle-btn${state.view === 'stamp' ? ' active' : ''}`}
                onClick={() => update({ view: 'stamp' })}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>approval</span>
                {t(state.lang, 'stampView')}
                {state.stamps.length > 0 && (
                  <span style={{
                    background: state.view === 'stamp' ? 'rgba(255,255,255,0.3)' : 'var(--theme-primary, #1a56db)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 20,
                    lineHeight: 1.5,
                  }}>
                    {state.stamps.length}
                  </span>
                )}
              </button>
            </div>

            <button
              data-testid="btn-save-image"
              className="btn btn-primary btn-sm"
              onClick={saveImage}
              disabled={saving}
              style={{ marginLeft: 'auto' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {saving ? 'hourglass_empty' : 'download'}
              </span>
              {saving ? t(state.lang, 'savingImage') : t(state.lang, 'saveImage')}
            </button>
          </div>

          <div className="canvas-workspace">
            <div ref={canvasRef} className="passport-view-transition">
              {state.view === 'profile' ? (
                <PassportProfile state={state} mrz={mrz} lang={state.lang} />
              ) : (
                <PassportStamps
                  state={state}
                  lang={state.lang}
                  onDeleteStamp={deleteStamp}
                  onDragStamp={dragStamp}
                  newStampId={newStampId}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="app-footer">
        <a href="https://litt.ly/chichiboo" target="_blank" rel="noreferrer">
          Created by. 교육뮤지컬 꿈꾸는 치수쌤
        </a>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`stamp-toast${toast.hiding ? ' hiding' : ''}`}
          style={toast.type === 'error' ? { background: '#e74c3c' } : undefined}
          role="status"
          aria-live="polite"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Help / About modal */}
      {showHelp && (
        <div
          className="help-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowHelp(false); }}
        >
          <div className="help-modal">
            <div className="help-modal-header">
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--theme-primary, #1a56db)' }}>help_outline</span>
              <span style={{ fontWeight: 800, fontSize: 16 }}>{t(state.lang, 'howToUse')}</span>
              <button
                className="help-close-btn"
                onClick={() => setShowHelp(false)}
                aria-label={t(state.lang, 'howToUseClose')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            <div className="help-modal-body">
              <ul className="help-steps">
                <li>{t(state.lang, 'howToUseStep1')}</li>
                <li>{t(state.lang, 'howToUseStep2')}</li>
                <li>{t(state.lang, 'howToUseStep3')}</li>
                <li>{t(state.lang, 'howToUseStep4')}</li>
              </ul>
              <div className="help-divider" />
              <p className="help-inspiration">
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>auto_stories</span>
                {t(state.lang, 'howToUseInspired')}
              </p>
              <p className="help-developer">
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>person</span>
                {t(state.lang, 'howToUseDeveloper')}
              </p>
            </div>
            <div className="help-modal-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowHelp(false)}
              >
                {t(state.lang, 'howToUseClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PassportMaker;
