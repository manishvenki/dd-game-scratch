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
  title: 'Thatha Tea Encounter',
  subtitle: 'Opposite Rajkumar Park • Kalyan Nagar',
  setting: 'Iconic tea stall opposite Rajkumar Park in the Kalyan Nagar / Kammanahalli area',
  objectiveText: 'The trio is closing in! Knock through Vikram & Kiran at Thatha Tea and sprint to the Kammanahalli crossroad!',
  stageWidth: 2200,
  playerSpawnX: 280,
  exitGoalX: 2120,
  exitGoalLabel: 'KAMMANAHALLI CROSSROAD',
  theme: 'thatha-tea',
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
  chasers: [
    { chaserId: 'sathish', spawnX: 140, speed: 175 },
    { chaserId: 'manish', spawnX: 80, speed: 165 },
    { chaserId: 'rahul', spawnX: 20, speed: 155 },
  ],
  hasChaseSequence: true,
}

export const LEVEL_3_CONFIG: LevelConfig = {
  id: 'level-3',
  stageNumber: 'STAGE 03',
  title: 'MG Road / Brigade Road',
  subtitle: 'Downtown Neon Corridor',
  setting: 'Central city retail & nightlife hub with Namma Metro viaduct',
  objectiveText: 'Run through MG Road, uncover the drama group, defeat the rehearsal blocker, and reach the Metro Station!',
  stageWidth: 2600,
  playerSpawnX: 380,
  exitGoalX: 2500,
  exitGoalLabel: 'NAMMA METRO STATION',
  theme: 'commercial-mg',
  blockers: [
    {
      id: 'drama-raghu',
      name: 'Raghu',
      initialX: 980,
      maxHp: 2,
      shirtColorHex: 0x0d9488, // Teal
      pantsColorHex: 0x1e293b,
      hairstyle: 'spiky',
      badgeLabel: 'RAGHU [DRAMA LEAD]',
    },
  ],
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
  title: 'Dr. Rajkumar Park, Bengaluru',
  subtitle: 'Green Canopy & Walking Trails',
  setting: 'Lush park boundary with ornate gates, walking trails, benches & neighborhood avenue',
  objectiveText: 'Outrun the trio through Dr. Rajkumar Park! Break through the park blockers and sprint to the Park Main Gate!',
  stageWidth: 2600,
  playerSpawnX: 360,
  exitGoalX: 2500,
  exitGoalLabel: 'PARK MAIN GATE',
  theme: 'park-rajkumar',
  blockers: [
    {
      id: 'blocker-4-1',
      name: 'Chethan',
      initialX: 960,
      maxHp: 3,
      shirtColorHex: 0x0284c7, // Sky blue
      pantsColorHex: 0x1e293b,
      hairstyle: 'crew',
      badgeLabel: 'CHETHAN [BLOCKER]',
    },
    {
      id: 'blocker-4-2',
      name: 'Suresh',
      initialX: 1520,
      maxHp: 3,
      shirtColorHex: 0xd97706, // Amber
      pantsColorHex: 0x334155,
      hairstyle: 'spiky',
      badgeLabel: 'SURESH [BLOCKER]',
    },
  ],
  chasers: [
    { chaserId: 'sathish', spawnX: 130, speed: 190 },
    { chaserId: 'manish', spawnX: 70, speed: 180 },
    { chaserId: 'rahul', spawnX: 10, speed: 170 },
  ],
  hasChaseSequence: true,
  interaction: {
    id: 'park-encounter',
    triggerX: 860,
    triggerRadius: 65,
    label: 'PARK WALKING CORRIDOR',
    dialogueSequenceId: 'level-4-park',
  },
}

export const LEVEL_5_CONFIG: LevelConfig = {
  id: 'level-5',
  stageNumber: 'STAGE 05',
  title: 'Cubbon Park Grand Finale',
  subtitle: 'Lush Green Canopy & Bandstand',
  setting: 'Historic green haven with red-dirt trails, bamboo groves, park benches & the Bandstand',
  objectiveText: 'The trio is right behind you! Knock through the park blockers and sprint to the Cubbon Park Bandstand!',
  stageWidth: 2600,
  playerSpawnX: 340,
  exitGoalX: 2500,
  exitGoalLabel: 'CUBBON PARK BANDSTAND',
  theme: 'park-cubbon',
  blockers: [
    {
      id: 'blocker-5-1',
      name: 'Arun',
      initialX: 980,
      maxHp: 3,
      shirtColorHex: 0x059669, // Forest/Emerald green
      pantsColorHex: 0x1e293b,
      hairstyle: 'crew',
      badgeLabel: 'ARUN [BLOCKER]',
    },
    {
      id: 'blocker-5-2',
      name: 'Deepak',
      initialX: 1560,
      maxHp: 3,
      shirtColorHex: 0xd97706, // Amber
      pantsColorHex: 0x334155,
      hairstyle: 'spiky',
      badgeLabel: 'DEEPAK [BLOCKER]',
    },
  ],
  chasers: [
    { chaserId: 'sathish', spawnX: 130, speed: 195 },
    { chaserId: 'manish', spawnX: 70, speed: 185 },
    { chaserId: 'rahul', spawnX: 10, speed: 175 },
  ],
  hasChaseSequence: true,
}

export const ALL_LEVELS: Record<LevelId, LevelConfig> = {
  'level-1': LEVEL_1_CONFIG,
  'level-2': LEVEL_2_CONFIG,
  'level-3': LEVEL_3_CONFIG,
  'level-4': LEVEL_4_CONFIG,
  'level-5': LEVEL_5_CONFIG,
}

export function getLevelConfig(id: LevelId): LevelConfig {
  return ALL_LEVELS[id] ?? LEVEL_1_CONFIG
}
