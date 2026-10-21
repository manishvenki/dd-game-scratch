import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PlayPage from './pages/PlayPage'
import LevelsPage from './pages/LevelsPage'
import CharactersPage from './pages/CharactersPage'
import type { PageId } from './types/navigation'

function getPageFromHash(hash: string): PageId {
  const cleanHash = hash.replace(/^#\/?/, '').trim().toLowerCase()
  const route = cleanHash.split('?')[0]
  if (route === 'play') return 'play'
  if (route === 'levels') return 'levels'
  if (route === 'characters') return 'characters'
  return 'home'
}


export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() =>
    getPageFromHash(window.location.hash)
  )

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash(window.location.hash))
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateTo = (page: PageId) => {
    setCurrentPage(page)
    const targetHash = page === 'home' ? '#/' : `#/${page}`
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderActivePage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />
      case 'play':
        return <PlayPage />
      case 'levels':
        return <LevelsPage />
      case 'characters':
        return <CharactersPage />
      default:
        return <HomePage onNavigate={navigateTo} />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={navigateTo}>
      {renderActivePage()}
    </Layout>
  )
}
