export type SpeakerId =
  | 'dennis'
  | 'manish'
  | 'sathish'
  | 'rahul'
  | 'drama_raghu'
  | 'drama_preetham'
  | 'date_ananya'
  | 'blocker_chethan'
  | (string & {})

export interface DialogueLine {
  readonly id: string
  readonly speakerId: SpeakerId
  readonly speakerName: string
  readonly text: string
  readonly badgeColorHex: number
}

export interface DialogueSequence {
  readonly id: string
  readonly title: string
  readonly lines: readonly DialogueLine[]
}
