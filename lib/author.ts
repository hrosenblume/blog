// ============================================
// ✏️  EDIT YOUR INFO HERE
// ============================================

type BioSegment = { text: string; href?: string }

export const AUTHOR: { name: string; bio: BioSegment[] } = {
  name: 'Hunter Rosenblume',
  bio: [
    { text: 'I started as a ' },
    { text: 'Thiel Fellow', href: 'https://thielfellowship.org' },
    { text: ' and software engineer. More recently, I am the co-founder and CEO of ' },
    { text: 'Ordo', href: 'https://ordo.com' },
    { text: ', a school lunch company. This year we\'re serving over 3 million meals in 15 states. I write about startups.' },
  ],
}
