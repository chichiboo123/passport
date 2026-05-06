import { useState, useRef, useCallback, useEffect } from 'react';
import { t } from '@/lib/i18n';
import { generatePassportNo, generateMRZ, formatDate, todayStr, randomStampProps } from '@/lib/utils';
import type { AppState, Stamp, Theme, Lang, View } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import PassportProfile from '@/components/PassportProfile';
import PassportStamps from '@/components/PassportStamps';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
  hiding: boolean;
}

function PassportMaker() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<AppState>({
    theme: 'blue',
    lang: 'ko',
    view: 'profile',
    character: {
      photo: '',
      name: '',
      birthdate: '',
      nationality: '',
      favorites: '',
    },
    stamps: [],
    passportNo: generatePassportNo(),
    issueDate: todayStr(),
  });

  const [stampForm, setStampForm] = useState({ emoji: '', place: '', date: todayStr() });
  const [stampError, setStampError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [newStampId, setNewStampId] = useState<string | undefined>(undefined);

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

  const update = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const updateCharacter = useCallback((partial: Partial<AppState['character']>) => {
    setState(prev => ({ ...prev, character: { ...prev.character, ...partial } }));
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
    if (!stampForm.emoji.trim()) { setStampError(t(state.lang, 'emojiRequired')); return; }
    if (!stampForm.place.trim()) { setStampError(t(state.lang, 'placeRequired')); return; }
    const id = Date.now().toString();
    const newStamp: Stamp = {
      id,
      emoji: stampForm.emoji.trim(),
      place: stampForm.place.trim(),
      date: stampForm.date || todayStr(),
      ...randomStampProps(),
    };
    setState(prev => ({ ...prev, stamps: [...prev.stamps, newStamp], view: 'stamp' }));
    setStampForm(prev => ({ ...prev, emoji: '', place: '' }));
    setNewStampId(id);
    setTimeout(() => setNewStampId(undefined), 600);
    showToast(`${newStamp.emoji} ${t(state.lang, 'stampAdded')}`);
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
  };

  const saveImage = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const el = canvasRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#e8ecf1',
        scale: 2,
      });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 26 }}>travel_explore</span>
          <span style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 18, letterSpacing: '0.02em' }}>
            {t(state.lang, 'appTitle')}
          </span>
        </div>
        <select
          data-testid="select-language"
          className="lang-select"
          value={state.lang}
          onChange={e => update({ lang: e.target.value as Lang })}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="id">Bahasa Indonesia</option>
        </select>
      </header>

      {/* Body */}
      <div className="app-body">
        <Sidebar
          state={state}
          stampForm={stampForm}
          stampError={stampError}
          saving={saving}
          onThemeChange={(theme: Theme) => update({ theme })}
          onCharacterChange={updateCharacter}
          onPhotoClick={() => fileInputRef.current?.click()}
          onStampFormChange={(partial) => setStampForm(prev => ({ ...prev, ...partial }))}
          onAddStamp={addStamp}
          onSaveJson={saveJson}
          onLoadJson={loadJson}
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
            {/* View toggle */}
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

            {/* Save image */}
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
                <PassportProfile
                  state={state}
                  mrz={mrz}
                  lang={state.lang}
                />
              ) : (
                <PassportStamps
                  state={state}
                  lang={state.lang}
                  onDeleteStamp={deleteStamp}
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
    </div>
  );
}

export default PassportMaker;
