/* eslint-disable react-refresh/only-export-components -- context modules intentionally export the provider plus its hook */
import { createContext, useContext, useState, useCallback } from 'react'
import translations from '../translations'

const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en')

  const t = translations[lang] || translations.en

  const switchLang = useCallback((l) => {
    setLang(l)
    localStorage.setItem('lang', l)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, t, switchLang }}>
      {children}
    </LanguageContext.Provider>
  )
}
