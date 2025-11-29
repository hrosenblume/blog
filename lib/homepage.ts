// ============================================
// ✏️  EDIT YOUR HOMEPAGE CONTENT HERE
// ============================================

type TextSegment = { text: string; href?: string }
type FooterLink = { label: string; href?: string; type?: 'email' }

export const HOMEPAGE = {
  // Author info
  name: 'Hunter Rosenblume',
  bio: [
    // Paragraph 1
    [
      { text: 'I started as a ' },
      { text: 'Thiel Fellow', href: 'https://thielfellowship.org' },
      { text: ' and software engineer. More recently, I am the co-founder and CEO of ' },
      { text: 'Ordo', href: 'https://ordo.com' },
      { text: ', a school lunch company. This year we\'re serving over 3 million meals in 15 states.' },
    ],
    // Paragraph 2
    [
      /*KEEP COMMENTS BELOW FOR FUTURE USE !IMPORTANT*/
      /*{ text: 'After a decade of building, I\'m writing about it.' },*/
      /*{ text: 'Ten years into building. Writing about it now.' },*/
      /*{ text: 'A decade into building, I'm writing about it.' },*/
      /*{ text: 'Ten years into building, I\'m writing about it too.' },*/
      /*{ text: 'Ten years into building, I\'m sharing my Notes app.' },*/
      { text: "Ten years into building, I'm sharing my notes." },
    ],
    // Paragraph 3
    [
      { text: 'The journey is the reward.' },
    ],
  ] as TextSegment[][],

  // Notes section
  notes: {
    title: 'Recent Notes',
    maxItems: null as number | null, // null = show all
    emptyMessage: 'No notes yet.',
  },

  // Footer links
  footerLinks: [
    { label: 'Twitter', href: 'https://x.com/hrosenblume' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hrosenblume/' },
    { label: 'Email', type: 'email' },
  ] as FooterLink[],
}

