'use client'
import { useRouter } from 'next/navigation'

const languages = [
  {
    id: 'english',
    name: 'English',
    englishName: 'English',
    flag: '🇬🇧'
  },
  {
    id: 'telugu',
    name: 'తెలుగు',
    englishName: 'Telugu',
    flag: '🇮🇳'
  },
  {
    id: 'hindi',
    name: 'हिंदी',
    englishName: 'Hindi',
    flag: '🇮🇳'
  }
]

export default function SelectLanguage() {
  const router = useRouter()

  const handleLanguageSelect = (languageId: string) => {
    localStorage.setItem('selectedLanguage', languageId)
    router.push(`/dashboard/${languageId}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden animated-gradient">
      {/* Animated gradient backgrounds - z-index 0 */}
      <div className="gradient-1"></div>
      <div className="gradient-2"></div>
      <div className="gradient-3"></div>
      
      {/* Overlay - z-index 10 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-transparent to-red-950/50 z-10"></div>

      {/* Content - z-index 20 */}
      <div className="max-w-md w-full relative z-20 p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">
          Select Your Language
        </h1>
        <p className="text-red-200/80 text-center mb-8">
          Choose your preferred language for content
        </p>

        <div className="space-y-4">
          {languages.map((language) => (
            <button
              key={language.id}
              onClick={() => handleLanguageSelect(language.id)}
              className="w-full bg-gradient-to-br from-red-950/50 to-red-900/50 backdrop-blur-xl p-4 rounded-xl 
                         border border-red-800/20 hover:border-red-500/50 
                         hover:bg-red-900/30 transition-all duration-300
                         flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{language.flag}</span>
                <div className="text-left">
                  <p className="text-lg font-medium text-red-100 group-hover:text-red-300 transition-colors">
                    {language.name}
                  </p>
                  <p className="text-sm text-red-400/70">{language.englishName}</p>
                </div>
              </div>
              <svg 
                className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
} 