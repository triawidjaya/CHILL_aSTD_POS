import React from 'react';
import Card, { CardBody, CardHeader } from '../Common/Card';
import { useTranslation } from '../../context/LanguageContext';

export default function LanguageSettings() {
  const { lang, setLang } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <h3>Language Settings</h3>
      </CardHeader>
      <CardBody>
        <div className="language-toggle">
          <button 
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            🇬🇧 English
          </button>
          <button 
            className={`lang-btn ${lang === 'id' ? 'active' : ''}`}
            onClick={() => setLang('id')}
          >
            🇮🇩 Indonesia
          </button>
        </div>
      </CardBody>
      <style>{`
        .language-toggle {
          display: flex;
          gap: 1rem;
        }
        .lang-btn {
          flex: 1;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          font-weight: 600;
          transition: all 0.2s;
        }
        .lang-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}</style>
    </Card>
  );
}
