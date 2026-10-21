/**
 * Core character identifiers in DD Game Scratch.
 */
export type CharacterId = 'dennis' | 'manish' | 'sathish' | 'rahul'

export type CharacterRole = 'protagonist' | 'chaser'

export interface VisualIdentity {
  readonly hair: string
  readonly shirt: string
  readonly pants: string
  readonly distinctiveFeature: string
}

export interface CharacterMetadata {
  readonly id: CharacterId
  readonly displayName: string
  readonly role: CharacterRole
  readonly badgeLabel: string
  readonly accentColorHex: number
  readonly description: string
  readonly visualIdentity: VisualIdentity
  readonly initials: string
  readonly uiRoleLabel: string
  readonly visualProfileSummary: string
  readonly mechanicsRole: string
  readonly badgeColorClasses: string
}

/**
 * Authoritative Character Registry for DD Game Scratch.
 * Ensures consistent naming, visual profiles, and roles across the codebase.
 */
export const CHARACTER_REGISTRY: Record<CharacterId, CharacterMetadata> = {
  dennis: {
    id: 'dennis',
    displayName: 'Dennis',
    role: 'protagonist',
    badgeLabel: 'DENNIS [PROTAG]',
    accentColorHex: 0x3b82f6, // Blue
    description: 'Main playable protagonist evading his friends across Bengaluru.',
    visualIdentity: {
      hair: 'Curly dark hair',
      shirt: 'Blue denim shirt with chest pockets',
      pants: 'Blue jeans',
      distinctiveFeature: 'Expressive curly hair silhouette & denim ensemble',
    },
    initials: 'DD',
    uiRoleLabel: 'Main Playable Character',
    visualProfileSummary: 'Curly dark hair, blue denim shirt, and jeans.',
    mechanicsRole:
      'The lead protagonist controlled by the player. Dashes, jumps, and navigates city obstacles to evade pursuers.',
    badgeColorClasses: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  manish: {
    id: 'manish',
    displayName: 'Manish',
    role: 'chaser',
    badgeLabel: 'MANISH [CHASER]',
    accentColorHex: 0xef4444, // Red
    description: 'Persistent pursuer tracking Dennis through street corridors.',
    visualIdentity: {
      hair: 'Dark neat parted hair',
      shirt: 'Black formal/casual shirt',
      pants: 'Dark slate trousers',
      distinctiveFeature: 'Prominent rectangular glasses visible at game scale',
    },
    initials: 'M',
    uiRoleLabel: 'Chaser NPC',
    visualProfileSummary: 'Black shirt and glasses.',
    mechanicsRole:
      'Determined pursuer tracking Dennis closely across level pathways with steady chasing speed.',
    badgeColorClasses: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  sathish: {
    id: 'sathish',
    displayName: 'Sathish',
    role: 'chaser',
    badgeLabel: 'SATHISH [CHASER]',
    accentColorHex: 0xf97316, // Orange
    description: 'Aggressive pursuer closing bottlenecks and flanking Dennis.',
    visualIdentity: {
      hair: 'Dark short textured hair',
      shirt: 'Black Lenovo T-shirt with chest lettering',
      pants: 'Charcoal casual pants',
      distinctiveFeature: 'Readable "Lenovo" text marking on chest',
    },
    initials: 'S',
    uiRoleLabel: 'Chaser NPC',
    visualProfileSummary: 'Black Lenovo T-shirt.',
    mechanicsRole:
      'Aggressive pursuer closing gaps and adding pressure during tricky sidewalk bottlenecks.',
    badgeColorClasses: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  rahul: {
    id: 'rahul',
    displayName: 'Rahul',
    role: 'chaser',
    badgeLabel: 'RAHUL [CHASER]',
    accentColorHex: 0x14b8a6, // Teal
    description: 'Strategic pursuer cutting off escape routes.',
    visualIdentity: {
      hair: 'Dark tousled hair',
      shirt: 'Dark teal shirt with multiple horizontal stripes',
      pants: 'Dark slate pants',
      distinctiveFeature: 'Multiple horizontal stripes clearly visible across chest',
    },
    initials: 'R',
    uiRoleLabel: 'Chaser NPC',
    visualProfileSummary: 'Dark teal striped shirt.',
    mechanicsRole:
      'Strategic pursuer attempting to anticipate Dennis’s movements and cutoff escape routes.',
    badgeColorClasses: 'bg-slate-800 text-slate-300 border-slate-700',
  },
} as const

export function getCharacterMetadata(id: CharacterId): CharacterMetadata {
  return CHARACTER_REGISTRY[id]
}

export function getAllChaserIds(): readonly CharacterId[] {
  return ['manish', 'sathish', 'rahul'] as const
}

export function getAllCharacterIds(): readonly CharacterId[] {
  return ['dennis', 'manish', 'sathish', 'rahul'] as const
}

export function getAllCharacters(): readonly CharacterMetadata[] {
  return [
    CHARACTER_REGISTRY.dennis,
    CHARACTER_REGISTRY.manish,
    CHARACTER_REGISTRY.sathish,
    CHARACTER_REGISTRY.rahul,
  ] as const
}
