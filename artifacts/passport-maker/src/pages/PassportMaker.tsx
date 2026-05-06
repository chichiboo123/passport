import { useState, useRef, useCallback } from 'react';
import { t } from '@/lib/i18n';
import { generatePassportNo, generateMRZ, formatDate, todayStr, randomStampProps } from '@/lib/utils';
import type { AppState, Stamp, Theme, Lang, View } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import PassportProfile from '@/components/PassportProfile';
import PassportStamps from '@/components/PassportStamps';

function PassportMaker() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const newStamp: Stamp = {
      id: Date.now().toString(),
      emoji: stampForm.emoji.trim(),
      place: stampForm.place.trim(),
      date: stampForm.date || todayStr(),
      ...randomStampProps(),
    };
    setState(prev => ({ ...prev, stamps: [...prev.stamps, newStamp] }));
    setStampForm(prev => ({ ...prev, emoji: '', place: '' }));
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
        } catch {
          alert('Invalid JSON file');
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
    } catch (err) {
      console.error('Failed to save image:', err);
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
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>travel_explore</span>
          <span style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 17, letterSpacing: '0.02em' }}>
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
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>{' '}
                {t(state.lang, 'profileView')}
              </button>
              <button
                data-testid="btn-stamp-view"
                className={`toggle-btn${state.view === 'stamp' ? ' active' : ''}`}
                onClick={() => update({ view: 'stamp' })}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>approval</span>{' '}
                {t(state.lang, 'stampView')}
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
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
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
    </div>
  );
}

export default PassportMaker;
