export type LevelId = 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5'

export type EnvironmentTheme =
  | 'college'
  | 'thatha-tea'
  | 'commercial-mg'
  | 'park-rajkumar'
  | 'park-cubbon'
  | 'market'
  | 'cafe-koramangala'

export type EnemyState = 'idle' | 'blocking' | 'hit' | 'defeated'

export interface BlockingEnemyConfig {
  readonly id: string
  readonly name: string
  readonly initialX: number
  readonly maxHp: number
  readonly shirtColorHex: number
  readonly pantsColorHex: number
  readonly hairstyle: 'spiky' | 'parted' | 'crew'
  readonly badgeLabel: string
}

export interface ChaserConfig {
  readonly chaserId: 'manish' | 'sathish' | 'rahul'
  readonly spawnX: number
  readonly speed: number
}

export interface LevelInteractionConfig {
  readonly id: string
  readonly triggerX: number
  readonly triggerRadius: number
  readonly label: string
  readonly dialogueSequenceId: string
}

export interface LevelConfig {
  readonly id: LevelId
  readonly stageNumber: string
  readonly title: string
  readonly subtitle: string
  readonly setting: string
  readonly objectiveText: string
  readonly stageWidth: number
  readonly playerSpawnX: number
  readonly exitGoalX: number
  readonly exitGoalLabel: string
  readonly theme: EnvironmentTheme
  readonly blockers: readonly BlockingEnemyConfig[]
  readonly chasers?: readonly ChaserConfig[]
  readonly hasChaseSequence: boolean
  readonly interaction?: LevelInteractionConfig
}

