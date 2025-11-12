'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Store } from '@tauri-apps/plugin-store'
import { NextIntlClientProvider } from 'next-intl'

type Locale = 'en' | 'fr'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [messages, setMessages] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load locale from Tauri Store on mount
  useEffect(() => {
    const loadLocale = async () => {
      try {
        const store = await Store.load('settings.json')
        const savedLocale = await store.get<Locale>('locale')
        const initialLocale = (savedLocale || 'en') as Locale

        setLocaleState(initialLocale)

        // Load messages for the locale
        const msgs = await import(`../../messages/${initialLocale}.json`)
        setMessages(msgs.default)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load locale:', error)
        // Fallback to English
        const msgs = await import(`../../messages/en.json`)
        setMessages(msgs.default)
        setIsLoading(false)
      }
    }

    loadLocale()
  }, [])

  const setLocale = async (newLocale: Locale) => {
    try {
      // Save to Tauri Store
      const store = await Store.load('settings.json')
      await store.set('locale', newLocale)
      await store.save()

      // Update state
      setLocaleState(newLocale)

      // Load new messages
      const msgs = await import(`../../messages/${newLocale}.json`)
      setMessages(msgs.default)
    } catch (error) {
      console.error('Failed to set locale:', error)
    }
  }

  if (isLoading || !messages) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
