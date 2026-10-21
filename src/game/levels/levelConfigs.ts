import { type LevelConfig, type LevelId } from './levelTypes'

export const LEVEL_1_CONFIG: LevelConfig = {
  id: 'level-1',
  stageNumber: 'STAGE 01',
  title: 'College Street Encounter',
  subtitle: 'Bengaluru City College Gate',
  setting: 'Morning avenue outside the college main gate',
  objectiveText: 'The trio is chasing you! Knock through the 3 blocking boys and sprint to the Bus Stop!',
  stageWidth: 2400,
  playerSpawnX: 420,
  exitGoalX: 2320,
  exitGoalLabel: 'BMTC BUS STOP',
  theme: 'college',
  blockers: [
    {
      id: 'blocker-1',
      name: 'Ajay',
      initialX: 780,
      maxHp: 2,
      shirtColorHex: 0xdc2626, // Crimson red
      pantsColorHex: 0x1e293b,
      hairstyle: 'spiky',
      badgeLabel: 'AJAY [BLOCKER]',
    },
    {
      id: 'blocker-2',
      name: 'Vijay',
      initialX: 860,
      maxHp: 2,
      shirtColorHex: 0x7c3aed, // Violet
      pantsColorHex: 0x334155,
      hairstyle: 'parted',
      badgeLabel: 'VIJAY [BLOCKER]',
    },
    {
      id: 'blocker-3',
      name: 'Sanjay',
      initialX: 940,
      maxHp: 2,
      shirtColorHex: 0x0284c7, // Sky Blue
      pantsColorHex: 0x1e293b,
      hairstyle: 'crew',
      badgeLabel: 'SANJAY [BLOCKER]',
    },
  ],
  chasers: [
    { chaserId: 'sathish', spawnX: 140, speed: 180 },
    { chaserId: 'manish', spawnX: 80, speed: 170 },
    { chaserId: 'rahul', spawnX: 20, speed: 160 },
  ],
  hasChaseSequence: true,
}

export const LEVEL_2_CONFIG: LevelConfig = {
  id: 'level-2',
  stageNumber: 'STAGE 02',
  title: 'Commercial Lane Confrontation',
  subtitle: 'Two-Boy Street Bottleneck',
  setting: 'Avenue corridor near the roadside market',
  objectiveText: 'Neutralize the two blocking boys blocking the corridor, then reach the avenue crossroad!',
  stageWidth: 2200,
  playerSpawnX: 280,
  exitGoalX: 2120,
  exitGoalLabel: 'AVENUE CROSSROAD',
  theme: 'market',
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

export const LEVEL_3_CONFIG: LevelConfig = {
  id: 'level-3',
  stageNumber: 'STAGE 03',
  title: 'MG Road / Brigade Road',
  subtitle: 'Downtown Neon Corridor',
  setting: 'Central city retail & nightlife hub with Namma Metro viaduct',
  objectiveText: 'Run through MG Road, uncover the mystery group, and reach the Metro Station before the trio catches you!',
  stageWidth: 2600,
  playerSpawnX: 380,
  exitGoalX: 2500,
  exitGoalLabel: 'NAMMA METRO STATION',
  theme: 'commercial-mg',
  blockers: [],
  chasers: [
    { chaserId: 'sathish', spawnX: 140, speed: 185 },
    { chaserId: 'manish', spawnX: 80, speed: 175 },
    { chaserId: 'rahul', spawnX: 20, speed: 165 },
  ],
  hasChaseSequence: true,
  interaction: {
    id: 'mg-reveal',
    triggerX: 920,
    triggerRadius: 65,
    label: 'DRAMA CLUB GROUP',
    dialogueSequenceId: 'level-3-reveal',
  },
}

export const LEVEL_4_CONFIG: LevelConfig = {
  id: 'level-4',
  stageNumber: 'STAGE 04',
  title: 'Koramangala Café Date',
  subtitle: 'Outdoor Patio & 80ft Road',
  setting: 'Lively café patio with warm brick facade, string lanterns & wooden tables',
  objectiveText: 'Meet your date at the café patio, then outrun Manish, Sathish & Rahul to the 80ft Road crossroad!',
  stageWidth: 2600,
  playerSpawnX: 360,
  exitGoalX: 2500,
  exitGoalLabel: '80FT ROAD JUNCTION',
  theme: 'cafe-koramangala',
  blockers: [],
  chasers: [
    { chaserId: 'sathish', spawnX: 130, speed: 190 },
    { chaserId: 'manish', spawnX: 70, speed: 180 },
    { chaserId: 'rahul', spawnX: 10, speed: 170 },
  ],
  hasChaseSequence: true,
  interaction: {
    id: 'cafe-date',
    triggerX: 860,
    triggerRadius: 65,
    label: 'CHAI & CHAT CAFÉ PATIO',
    dialogueSequenceId: 'level-4-cafe',
  },
}

export const ALL_LEVELS: Record<LevelId, LevelConfig> = {
  'level-1': LEVEL_1_CONFIG,
  'level-2': LEVEL_2_CONFIG,
  'level-3': LEVEL_3_CONFIG,
  'level-4': LEVEL_4_CONFIG,
}

export function getLevelConfig(id: LevelId): LevelConfig {
  return ALL_LEVELS[id] ?? LEVEL_1_CONFIG
}
