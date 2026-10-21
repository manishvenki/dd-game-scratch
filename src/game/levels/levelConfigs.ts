import { type LevelConfig, type LevelId } from './levelTypes'

export const LEVEL_1_CONFIG: LevelConfig = {
  id: 'level-1',
  stageNumber: 'STAGE 01',
  title: 'College Street Encounter',
  subtitle: 'Bengaluru City College Gate',
  setting: 'Morning avenue outside the college main gate',
  objectiveText: 'Defeat the 3 blocking boys, then outrun Manish, Sathish & Rahul to the Bus Stop!',
  stageWidth: 2400,
  playerSpawnX: 420,
  exitGoalX: 2320,
  exitGoalLabel: 'BMTC BUS STOP',
  blockers: [
    {
      id: 'blocker-1',
      name: 'Ajay',
      initialX: 760,
      maxHp: 2,
      shirtColorHex: 0xdc2626, // Crimson red
      pantsColorHex: 0x1e293b,
      hairstyle: 'spiky',
      badgeLabel: 'AJAY [BLOCKER]',
    },
    {
      id: 'blocker-2',
      name: 'Vijay',
      initialX: 830,
      maxHp: 2,
      shirtColorHex: 0x7c3aed, // Violet
      pantsColorHex: 0x334155,
      hairstyle: 'parted',
      badgeLabel: 'VIJAY [BLOCKER]',
    },
    {
      id: 'blocker-3',
      name: 'Sanjay',
      initialX: 900,
      maxHp: 2,
      shirtColorHex: 0x0284c7, // Sky Blue
      pantsColorHex: 0x1e293b,
      hairstyle: 'crew',
      badgeLabel: 'SANJAY [BLOCKER]',
    },
  ],
  chasers: [
    { chaserId: 'sathish', spawnX: 200, speed: 185 },
    { chaserId: 'manish', spawnX: 130, speed: 175 },
    { chaserId: 'rahul', spawnX: 60, speed: 165 },
  ],
  hasChaseSequence: true,
}

export const LEVEL_2_CONFIG: LevelConfig = {
  id: 'level-2',
  stageNumber: 'STAGE 02',
  title: 'Commercial Lane Confrontation',
  subtitle: 'Two-Boy Street Bottleneck',
  setting: 'Avenue corridor near the roadside market',
  objectiveText: 'Deal with the two blocking boys blocking the corridor, then reach the avenue crossroad!',
  stageWidth: 2200,
  playerSpawnX: 280,
  exitGoalX: 2120,
  exitGoalLabel: 'AVENUE CROSSROAD',
  blockers: [
    {
      id: 'blocker-2-1',
      name: 'Vikram',
      initialX: 720,
      maxHp: 3,
      shirtColorHex: 0x16a34a, // Emerald green
      pantsColorHex: 0x1e293b,
      hairstyle: 'spiky',
      badgeLabel: 'VIKRAM [BLOCKER]',
    },
    {
      id: 'blocker-2-2',
      name: 'Kiran',
      initialX: 1120,
      maxHp: 3,
      shirtColorHex: 0xea580c, // Bright orange
      pantsColorHex: 0x334155,
      hairstyle: 'parted',
      badgeLabel: 'KIRAN [BLOCKER]',
    },
  ],
  chasers: [],
  hasChaseSequence: false,
}

export const ALL_LEVELS: Record<LevelId, LevelConfig> = {
  'level-1': LEVEL_1_CONFIG,
  'level-2': LEVEL_2_CONFIG,
}

export function getLevelConfig(id: LevelId): LevelConfig {
  return ALL_LEVELS[id] ?? LEVEL_1_CONFIG
}
