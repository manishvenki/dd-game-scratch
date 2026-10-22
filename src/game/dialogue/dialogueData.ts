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
      text: 'Adei! Neenga inga enna panreenga? Sema stylish vibe-ah irukkeenga...',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'l3_2',
      speakerId: 'drama_raghu',
      speakerName: 'RAGHU',
      text: 'Dei bro, naanga girls illa da! Annual Day drama play rehearsal pannitu irukkom!',
      badgeColorHex: 0x0d9488, // Teal
    },
    {
      id: 'l3_3',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Aiyayo! Naan vera nenachitten da! Mind voice: Sema bulb vaangittom da Dennis!',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'l3_4',
      speakerId: 'manish',
      speakerName: 'MANISH',
      text: 'DENNIS!! Anga enna kadala podra?! Nillu da! Machas, kitta vandhuttom!',
      badgeColorHex: 0xdc2626,
    },
    {
      id: 'l3_5',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Oh no! The trio is right behind me! Raghu, vazhiya vidu da, knock panni escape aaguren!',
      badgeColorHex: 0x0284c7,
    },
  ],
}

// 3. Level 4 Dr. Rajkumar Park Encounter Dialogue
export const LEVEL_4_PARK_DIALOGUE: DialogueSequence = {
  id: 'level-4-park',
  title: 'DR. RAJKUMAR PARK ENCOUNTER',
  lines: [
    {
      id: 'l4_1',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Aha! Dr. Rajkumar Park greenery & walking trails... Sema fresh-ah irukku!',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'l4_2',
      speakerId: 'blocker_chethan',
      speakerName: 'CHETHAN',
      text: 'Dei thambi! Idhu park walking track da, ivlo speed-ah odina safety complaint aagidum!',
      badgeColorHex: 0x16a34a, // Green
    },
    {
      id: 'l4_3',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Bro, pinnadi en college gang chase panraanga! Konjam side kudunga please!',
      badgeColorHex: 0x0284c7,
    },
    {
      id: 'l4_4',
      speakerId: 'sathish',
      speakerName: 'SATHISH',
      text: 'DENNIS!! Rajkumar Park gate-kulla maattikitta da! Machas, valachi pudinga da!',
      badgeColorHex: 0x16a34a,
    },
    {
      id: 'l4_5',
      speakerId: 'dennis',
      speakerName: 'DENNIS',
      text: 'Park Main Gate cross panni escape aaga poren! Leave me alone!',
      badgeColorHex: 0x0284c7,
    },
  ],
}

export const LEVEL_4_CAFE_DIALOGUE = LEVEL_4_PARK_DIALOGUE

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
