import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Globe } from 'lucide-react';
import Analytics from '@/lib/analytics';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export interface Language {
  code: string;
  name: string;
}

// ISO 639-1 language codes supported by Whisper
const getLanguages = (t: any): Language[] => [
  { code: 'auto', name: t('auto') },
  { code: 'auto-translate', name: t('autoTranslate') },
  { code: 'en', name: t('en') },
  { code: 'zh', name: t('zh') },
  { code: 'de', name: t('de') },
  { code: 'es', name: t('es') },
  { code: 'ru', name: t('ru') },
  { code: 'ko', name: t('ko') },
  { code: 'fr', name: t('fr') },
  { code: 'ja', name: t('ja') },
  { code: 'pt', name: t('pt') },
  { code: 'tr', name: t('tr') },
  { code: 'pl', name: t('pl') },
  { code: 'ca', name: t('ca') },
  { code: 'nl', name: t('nl') },
  { code: 'ar', name: t('ar') },
  { code: 'sv', name: t('sv') },
  { code: 'it', name: t('it') },
  { code: 'id', name: t('id') },
  { code: 'hi', name: t('hi') },
  { code: 'fi', name: t('fi') },
  { code: 'vi', name: t('vi') },
  { code: 'he', name: t('he') },
  { code: 'uk', name: t('uk') },
  { code: 'el', name: t('el') },
  { code: 'ms', name: t('ms') },
  { code: 'cs', name: t('cs') },
  { code: 'ro', name: t('ro') },
  { code: 'da', name: t('da') },
  { code: 'hu', name: t('hu') },
  { code: 'ta', name: t('ta') },
  { code: 'no', name: t('no') },
  { code: 'th', name: t('th') },
  { code: 'ur', name: t('ur') },
  { code: 'hr', name: t('hr') },
  { code: 'bg', name: t('bg') },
  { code: 'lt', name: t('lt') },
  { code: 'la', name: t('la') },
  { code: 'mi', name: t('mi') },
  { code: 'ml', name: t('ml') },
  { code: 'cy', name: t('cy') },
  { code: 'sk', name: t('sk') },
  { code: 'te', name: t('te') },
  { code: 'fa', name: t('fa') },
  { code: 'lv', name: t('lv') },
  { code: 'bn', name: t('bn') },
  { code: 'sr', name: t('sr') },
  { code: 'az', name: t('az') },
  { code: 'sl', name: t('sl') },
  { code: 'kn', name: t('kn') },
  { code: 'et', name: t('et') },
  { code: 'mk', name: t('mk') },
  { code: 'br', name: t('br') },
  { code: 'eu', name: t('eu') },
  { code: 'is', name: t('is') },
  { code: 'hy', name: t('hy') },
  { code: 'ne', name: t('ne') },
  { code: 'mn', name: t('mn') },
  { code: 'bs', name: t('bs') },
  { code: 'kk', name: t('kk') },
  { code: 'sq', name: t('sq') },
  { code: 'sw', name: t('sw') },
  { code: 'gl', name: t('gl') },
  { code: 'mr', name: t('mr') },
  { code: 'pa', name: t('pa') },
  { code: 'si', name: t('si') },
  { code: 'km', name: t('km') },
  { code: 'sn', name: t('sn') },
  { code: 'yo', name: t('yo') },
  { code: 'so', name: t('so') },
  { code: 'af', name: t('af') },
  { code: 'oc', name: t('oc') },
  { code: 'ka', name: t('ka') },
  { code: 'be', name: t('be') },
  { code: 'tg', name: t('tg') },
  { code: 'sd', name: t('sd') },
  { code: 'gu', name: t('gu') },
  { code: 'am', name: t('am') },
  { code: 'yi', name: t('yi') },
  { code: 'lo', name: t('lo') },
  { code: 'uz', name: t('uz') },
  { code: 'fo', name: t('fo') },
  { code: 'ht', name: t('ht') },
  { code: 'ps', name: t('ps') },
  { code: 'tk', name: t('tk') },
  { code: 'nn', name: t('nn') },
  { code: 'mt', name: t('mt') },
  { code: 'sa', name: t('sa') },
  { code: 'lb', name: t('lb') },
  { code: 'my', name: t('my') },
  { code: 'bo', name: t('bo') },
  { code: 'tl', name: t('tl') },
  { code: 'mg', name: t('mg') },
  { code: 'as', name: t('as') },
  { code: 'tt', name: t('tt') },
  { code: 'haw', name: t('haw') },
  { code: 'ln', name: t('ln') },
  { code: 'ha', name: t('ha') },
  { code: 'ba', name: t('ba') },
  { code: 'jw', name: t('jw') },
  { code: 'su', name: t('su') },
];

interface LanguageSelectionProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
  provider?: 'localWhisper' | 'parakeet' | 'deepgram' | 'elevenLabs' | 'groq' | 'openai';
}

export function LanguageSelection({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
  provider = 'localWhisper'
}: LanguageSelectionProps) {
  const t = useTranslations('settings.language');
  const tLang = useTranslations('languages');
  const [saving, setSaving] = useState(false);

  // Get languages with translations
  const LANGUAGES = getLanguages(tLang);

  // Parakeet only supports auto-detection (doesn't support manual language selection)
  const isParakeet = provider === 'parakeet';
  const availableLanguages = isParakeet
    ? LANGUAGES.filter(lang => lang.code === 'auto' || lang.code === 'auto-translate')
    : LANGUAGES;

  const handleLanguageChange = async (languageCode: string) => {
    setSaving(true);
    try {
      // Save language preference to backend
      await invoke('set_language_preference', { language: languageCode });
      onLanguageChange(languageCode);
      console.log('Language preference saved:', languageCode);

      // Track language selection analytics
      const selectedLang = LANGUAGES.find(lang => lang.code === languageCode);
      await Analytics.track('language_selected', {
        language_code: languageCode,
        language_name: selectedLang?.name || 'Unknown',
        is_auto_detect: (languageCode === 'auto').toString(),
        is_auto_translate: (languageCode === 'auto-translate').toString()
      });

      // Show success toast
      const languageName = selectedLang?.name || languageCode;
      toast.success(t('languagePreferenceSaved'), {
        description: t('transcriptionLanguageSet', { language: languageName })
      });
    } catch (error) {
      console.error('Failed to save language preference:', error);
      toast.error(t('failedToSaveLanguage'), {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setSaving(false);
    }
  };

  // Find the selected language name for display
  const selectedLanguageName = LANGUAGES.find(
    lang => lang.code === selectedLanguage
  )?.name || tLang('auto');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-900">{t('title')}</h4>
        </div>
      </div>

      <div className="space-y-2">
        <select
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={disabled || saving}
          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        >
          {availableLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
              {language.code !== 'auto' && language.code !== 'auto-translate' && ` (${language.code})`}
            </option>
          ))}
        </select>

        {/* Parakeet language limitation warning */}
        {isParakeet && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
            <p className="font-medium">{t('parakeetLanguageSupport')}</p>
            <p className="mt-1 text-xs">{t('parakeetLimitation')}</p>
          </div>
        )}

        {/* Info text */}
        <div className="text-xs space-y-2 pt-2">
          <p className="text-gray-600">
            <strong>{t('current')}</strong> {selectedLanguageName}
          </p>
          {selectedLanguage === 'auto' && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              <p className="font-medium">{t('autoDetectWarning')}</p>
              <p className="mt-1">{t('autoDetectMessage')}</p>
            </div>
          )}
          {selectedLanguage === 'auto-translate' && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
              <p className="font-medium">{t('translationModeActive')}</p>
              <p className="mt-1">{t('translationModeMessage')}</p>
            </div>
          )}
          {selectedLanguage !== 'auto' && selectedLanguage !== 'auto-translate' && (
            <p className="text-gray-600">
              {t('optimizedFor', { language: selectedLanguageName })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
