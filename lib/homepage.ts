// ============================================
// ✏️  EDIT YOUR HOMEPAGE CONTENT HERE
// ============================================

export type TextSegment = { text: string; href?: string }
export type FooterLink = { label: string; href?: string; type?: 'email' }

export const HOMEPAGE = {
  // Author info
  name: 'Hunter Rosenblume',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  bio: [
    // Paragraph 1
    [
      { text: 'I started as a ' },
      { text: 'Thiel Fellow', href: 'https://thielfellowship.org' },
      { text: ' and engineer. '},],[{text:'More recently, I am the co-founder and CEO of ' },
      { text: 'Ordo', href: 'https://ordo.com' },
      { text: ', a school lunch company. This year we\'re serving 3 million meals in 15+ states.' },
    ],
    // Paragraph 2
    [
      /*KEEP COMMENTS BELOW FOR FUTURE USE !IMPORTANT*/
      /*{ text: 'After a decade of building, I\'m writing about it.' },*/
      { text: "Ten years into building, I'm sharing my thoughts." },
    ],
    // Paragraph 3
    [
      { text: 'The journey is the reward.' },
    ],
  ] as TextSegment[][],

  // Notes section
  notes: {
    title: 'Recent Essays',
    maxItems: 6, // Show max 6 on homepage, then "View all essays" link
    emptyMessage: 'No essays yet.',
  },

  // Footer links
  footerLinks: [
    { label: 'Twitter', href: 'https://x.com/hrosenblume' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hrosenblume/' },
    { label: 'Email', type: 'email' },
  ] as FooterLink[],
}

