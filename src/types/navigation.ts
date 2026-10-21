export type PageId = 'home' | 'play' | 'levels' | 'characters'

export interface NavItem {
  readonly id: PageId
  readonly label: string
  readonly href: string
  readonly description?: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home', href: '#/' },
  { id: 'play', label: 'Play', href: '#/play' },
  { id: 'levels', label: 'Levels', href: '#/levels' },
  { id: 'characters', label: 'Characters', href: '#/characters' },
] as const
