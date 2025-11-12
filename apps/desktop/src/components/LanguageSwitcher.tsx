'use client'

import React from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from 'next-intl'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const t = useTranslations('settings.interface')

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  ]

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('language')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('languageDescription')}
        </p>
      </div>

      <div className="space-y-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all
              ${
                locale === lang.code
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {lang.name}
              </span>
            </div>
            {locale === lang.code && (
              <svg
                className="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
