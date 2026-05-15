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
  const textMenuRef = useRef<HTMLDivElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);

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
  const [textMenuOpen, setTextMenuOpen] = useState(false);
  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [sidebarWidth, setSidebarWidth] = useState(320);

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
      if (textMenuRef.current && !textMenuRef.current.contains(e.target as Node)) {
        setTextMenuOpen(false);
      }
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target as Node)) {
        setImageMenuOpen(false);
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

  // Renders the passport element to an HTMLCanvasElement via html2canvas
  const renderPassportCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    const { default: html2canvas } = await import('html2canvas');
    const el = canvasRef.current;
    if (!el) throw new Error('canvas not mounted');
    const prevAnimation = el.style.animation;
    const prevZoom = el.style.zoom;
    el.style.animation = 'none';
    el.style.zoom = '1';
    // Two frames: first applies the style change, second ensures layout/paint is stable
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    try {
      // allowTaint must be false (default) so toDataURL() doesn't throw SecurityError.
      // useCORS handles external images; data-URL images (photo/stamps) are same-origin
      // and load fine without taint. windowWidth/windowHeight are omitted to avoid
      // html2canvas internally triggering the mobile media-query (zoom:0.52).
      return await html2canvas(el, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
    } finally {
      el.style.animation = prevAnimation;
      el.style.zoom = prevZoom;
    }
  }, []);

  const saveImageAsJpg = async () => {
    if (saving) return;
    setSaving(true);
    setImageMenuOpen(false);
    try {
      const canvas = await renderPassportCanvas();
      const url = canvas.toDataURL('image/jpeg', 0.92);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passport-${state.character.name || 'character'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(t(state.lang, 'imageSaved'));
    } catch (err) {
      console.error('Failed to save image:', err);
      showToast(t(state.lang, 'imageSaveError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyImageToClipboard = async () => {
    if (saving) return;
    setSaving(true);
    setImageMenuOpen(false);
    try {
      const canvas = await renderPassportCanvas();
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
      );
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast(t(state.lang, 'imageCopied'));
    } catch (err) {
      console.error('Failed to copy image:', err);
      showToast(t(state.lang, 'imageCopyError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const buildTextContent = (): string => {
    const { character, stamps, passportNo, issueDate } = state;
    const lang = state.lang;
    const lines: string[] = [];
    lines.push(`[${t(lang, 'characterInfo')}]`);
    if (character.name) lines.push(`${t(lang, 'nameLabel')}: ${character.name}`);
    if (character.birthdate) lines.push(`${t(lang, 'birthdate')}: ${character.birthdate}`);
    if (character.nationality) lines.push(`${t(lang, 'nationality')}: ${character.nationality}`);
    if (character.city) lines.push(`${t(lang, 'city')}: ${character.city}`);
    if (character.likes) lines.push(`${t(lang, 'likesLabel')}: ${character.likes}`);
    if (character.caution) lines.push(`${t(lang, 'cautionLabel')}: ${character.caution}`);
    if (character.message) lines.push(`${t(lang, 'favorites')}: ${character.message}`);
    lines.push('');
    lines.push(`[${t(lang, 'characterPassport')}]`);
    lines.push(`${t(lang, 'passportNo')}: ${passportNo}`);
    lines.push(`${t(lang, 'issueDate')}: ${issueDate}`);
    if (stamps.length > 0) {
      lines.push('');
      lines.push(`[${t(lang, 'visasPage')}]`);
      stamps.forEach((s, i) => {
        lines.push(`${i + 1}. ${s.emoji || '🖼️'} ${s.place} (${s.date})`);
      });
    }
    return lines.join('\n');
  };

  const saveTextAsTxt = () => {
    const text = buildTextContent();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passport-${state.character.name || 'character'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t(state.lang, 'textSaved'));
    setTextMenuOpen(false);
  };

  const copyTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(buildTextContent());
      showToast(t(state.lang, 'textCopied'));
    } catch (err) {
      console.error('Failed to copy text:', err);
      showToast(t(state.lang, 'textCopyError'), 'error');
    }
    setTextMenuOpen(false);
  };

  const handleResizerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const onMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.min(600, Math.max(240, startWidth + ev.clientX - startX));
      setSidebarWidth(newWidth);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth]);

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
          style={{ width: sidebarWidth }}
        />
        <div className="sidebar-resizer" onMouseDown={handleResizerMouseDown} />

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

            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              {/* Text save dropdown */}
              <div ref={textMenuRef} style={{ position: 'relative' }}>
                <button
                  data-testid="btn-save-text"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setTextMenuOpen(v => !v)}
                  aria-expanded={textMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>text_snippet</span>
                  {t(state.lang, 'saveText')}
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_drop_down</span>
                </button>
                {textMenuOpen && (
                  <div className="json-dropdown" role="menu">
                    <button className="json-dropdown-item" onClick={saveTextAsTxt} role="menuitem">
                      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>download</span>
                      {t(state.lang, 'saveTxtFile')}
                    </button>
                    <button className="json-dropdown-item" onClick={copyTextToClipboard} role="menuitem">
                      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>content_copy</span>
                      {t(state.lang, 'copyClipboard')}
                    </button>
                  </div>
                )}
              </div>

              {/* Image save dropdown */}
              <div ref={imageMenuRef} style={{ position: 'relative' }}>
                <button
                  data-testid="btn-save-image"
                  className="btn btn-primary btn-sm"
                  onClick={() => !saving && setImageMenuOpen(v => !v)}
                  disabled={saving}
                  aria-expanded={imageMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {saving ? 'hourglass_empty' : 'image'}
                  </span>
                  {saving ? t(state.lang, 'savingImage') : t(state.lang, 'saveImage')}
                  {!saving && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_drop_down</span>}
                </button>
                {imageMenuOpen && (
                  <div className="json-dropdown" role="menu">
                    <button className="json-dropdown-item" onClick={saveImageAsJpg} role="menuitem">
                      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>download</span>
                      {t(state.lang, 'saveJpgFile')}
                    </button>
                    <button className="json-dropdown-item" onClick={copyImageToClipboard} role="menuitem">
                      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>content_copy</span>
                      {t(state.lang, 'copyClipboard')}
                    </button>
                  </div>
                )}
              </div>
            </div>
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
