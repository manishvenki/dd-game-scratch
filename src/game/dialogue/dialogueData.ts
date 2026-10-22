import { type DialogueSequence } from './dialogueTypes'

// 1. Chaser Catch Dialogues
export const CATCH_DIALOGUE_MANISH: DialogueSequence = {
  id: 'catch-manish',
  title: 'CAUGHT BY MANISH!',
  lines: [
    {
      id: 'm1',
      speakerId: 'manish',
      speakerName: 'MANISH',
      text: 'Maattikittiya da Dennis! Enga da ivlo speed-ah pora?! Odi odi kaal vali edukku!',
      badgeColorHex: 0xdc2626, // Red
    },
    {
      id: 'm2',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Dei Manish, konjam pesi settle pannalaama da? Namma SLV-la filter kaapi vaangi tharren!',
      badgeColorHex: 0x0284c7, // Blue
    },
    {
      id: 'm3',
      speakerId: 'sathish',
      speakerName: 'SATHISH',
      text: 'Settle-aa? 3 km engala thadumaara vachittu kaapi kekkuriya?! First engakooda vaa!',
      badgeColorHex: 0x16a34a, // Green
    },
    {
      id: 'm4',
      speakerId: 'rahul',
      speakerName: 'RAHUL',
      text: 'Enakku Bun Maska kooda venum da! Vaanga machas, avana college-ku thookittu povom!',
      badgeColorHex: 0x9333ea, // Purple
    },
  ],
}

export const CATCH_DIALOGUE_SATHISH: DialogueSequence = {
  id: 'catch-sathish',
  title: 'CAUGHT BY SATHISH!',
  lines: [
    {
      id: 's1',
      speakerId: 'sathish',
      speakerName: 'SATHISH',
      text: 'Aha! Kitta vandhu pudichitten da Dennis! Macha, ivana pudichaa dhaan namakku nimmadhi!',
      badgeColorHex: 0x16a34a,
    },
    {
      id: 's2',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Macha Sathish, un running speed-ku Olympic gold medal kudukalaam da! Konjam gap vidu!',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 's3',
      speakerId: 'manish',
      speakerName: 'MANISH',
      text: 'Pazhaya dialogue ellaam venam Dennis! Vandi eri college assignment complete pannu!',
      badgeColorHex: 0xdc2626,
    },
    {
      id: 's4',
      speakerId: 'rahul',
      speakerName: 'RAHUL',
      text: 'Ippo thappikka vazhiye illa da macha... Game over for Dennis!',
      badgeColorHex: 0x9333ea,
    },
  ],
}

export const CATCH_DIALOGUE_RAHUL: DialogueSequence = {
  id: 'catch-rahul',
  title: 'CAUGHT BY RAHUL!',
  lines: [
    {
      id: 'r1',
      speakerId: 'rahul',
      speakerName: 'RAHUL',
      text: 'Dennis! Odu da odu… aana evlo neram dhaan thappippa? Rahul catch misses-ey aagadhu!',
      badgeColorHex: 0x9333ea,
    },
    {
      id: 'r2',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Rahul macha, neeyuma?! Namma best friends illaiya da? Oru second kanna moodiko please!',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'r3',
      speakerId: 'manish',
      speakerName: 'MANISH',
      text: 'Friendship-ah kuppaiyila podu da! HOD kitta unna submit panna dhaan porom!',
      badgeColorHex: 0xdc2626,
    },
    {
      id: 's4',
      speakerId: 'sathish',
      speakerName: 'SATHISH',
      text: 'Va da Dennis, innaiku unakku hostel mess-la nallaa treat irukku!',
      badgeColorHex: 0x16a34a,
    },
  ],
}

// 2. Level 3 MG Road / Brigade Road Comedy Reveal Dialogue
export const LEVEL_3_REVEAL_DIALOGUE: DialogueSequence = {
  id: 'level-3-reveal',
  title: 'BRIGADE ROAD ENCOUNTER',
  lines: [
    {
      id: 'l3_1',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Hey stylish Bengaluru girls! Dennis here... Sema stylish vibe-ah irukkeenga!',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'l3_2',
      speakerId: 'drama_raghu',
      speakerName: 'RAGHU',
      text: 'Dei bro! We are boys da! College drama club rehearsal mudinjadhu, costume maathala!',
      badgeColorHex: 0x0d9488, // Teal
    },
    {
      id: 'l3_3',
      speakerId: 'drama_preetham',
      speakerName: 'PREETHAM',
      text: 'Aama da bro! Annual Day historical drama play! Neenga enna shock-la paakura?',
      badgeColorHex: 0x059669, // Emerald
    },
    {
      id: 'l3_4',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Aiyoyyo! Bro-va?! Mind voice: Sema bulb vaangittom da Dennis! But wait...',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'l3_5',
      speakerId: 'manish',
      speakerName: 'MANISH',
      text: 'DENNIS!! Anga enna kadala podra?! Nillu da! Machas, kitta vandhuttom!',
      badgeColorHex: 0xdc2626,
    },
    {
      id: 'l3_6',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Oh no! The trio is right behind me! Thambi boys, naan escape aaguren, bye!',
      badgeColorHex: 0x0284c7,
    },
  ],
}

// 3. Level 4 Koramangala Café Date Dialogue
export const LEVEL_4_CAFE_DIALOGUE: DialogueSequence = {
  id: 'level-4-cafe',
  title: 'KORAMANGALA CAFÉ DATE',
  lines: [
    {
      id: 'l4_1',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Hey Ananya! Finally on time... You look super pretty today!',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'l4_2',
      speakerId: 'date_ananya',
      speakerName: 'ANANYA',
      text: 'Thanks Dennis! Order pannalaama? Cold brew or warm Bun Maska?',
      badgeColorHex: 0xdb2777, // Pink/Fuchsia
    },
    {
      id: 'l4_3',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Bun Maska double butter please! Bengaluru weather-la café date sema peaceful-ah irukku—',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'l4_4',
      speakerId: 'sathish',
      speakerName: 'SATHISH',
      text: 'DENNIS!! Anga enna café date-aa?! Macha Manish, Rahul, vaLachipudinga da!',
      badgeColorHex: 0x16a34a,
    },
    {
      id: 'l4_5',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Oh God! Enga vandhaalum chase panraangale! Ananya, bill pay pannidu, I gotta RUN!',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'l4_6',
      speakerId: 'date_ananya',
      speakerName: 'ANANYA',
      text: 'Ennadhu?! Bill naanaa?! Dennis wait da... Yaaru da avanga?!',
      badgeColorHex: 0xdb2777,
    },
  ],
}

// 4. Level 5 Cubbon Park Grand Victory Sequence Dialogue
export const LEVEL_5_VICTORY_DIALOGUE: DialogueSequence = {
  id: 'level-5-victory',
  title: 'CUBBON PARK GRAND FINALE',
  lines: [
    {
      id: 'l5_1',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Haaash... Finally Cubbon Park Bandstand vandhaachu! 5 stages sprint panniyum energy kuraiyala!',
      badgeColorHex: 0x0284c7, // Dennis Sky Blue
    },
    {
      id: 'l5_2',
      speakerId: 'manish',
      speakerName: 'MANISH',
      text: 'Pant... pant... Dennis nillu da! Bengaluru muzhukka odiyachu... Enakku breath-ey illa da!',
      badgeColorHex: 0xdc2626, // Manish Red
    },
    {
      id: 'l5_3',
      speakerId: 'sathish',
      speakerName: 'SATHISH',
      text: 'Macha Dennis, un sprint speed vera level! We admit it... Unna pudikka mudiyadhu da. Truce pannalaama?',
      badgeColorHex: 0x16a34a, // Sathish Green
    },
    {
      id: 'l5_4',
      speakerId: 'rahul',
      speakerName: 'RAHUL',
      text: 'Aama da, surrender aayittom! Assignment apram paakalaam... Park gate-la hot Masala Puri & Filter Coffee treat vai!',
      badgeColorHex: 0x9333ea, // Rahul Purple
    },
    {
      id: 'l5_5',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Haha! Deal da machas! Five stages cleared in style! Vaanga hot Masala Puri saapidalaam!',
      badgeColorHex: 0x0284c7,
    },
  ],
}
