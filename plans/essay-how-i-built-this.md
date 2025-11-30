# How I Built This

I didn’t start out wanting to build a blog.  
I wanted a place to think.

For years my “writing environment” was a mess of Google Docs, Notes, emails to myself, and half-finished drafts in random folders. Every time I sat down to write, I had to remember where the writing lived before I could remember what I was trying to say.

This site is my attempt to fix that. The public part is small on purpose. The interesting part is hidden.

---

## Building for One Person

Software feels very different when you build it for one specific person instead of “users.”

In this case, the person was me. I know exactly how I write: late at night, in bursts, with lots of revisions and a constant temptation to tweak fonts instead of sentences.

So I gave myself constraints:

- No templates.
- No comments.
- No growth hacks.
- Just essays.

The homepage is almost aggressively simple: my name, a short bio, a list of essays, and a strange little 3D shape spinning next to each one. If you never look behind the curtain, you’d think that’s all there is.

It isn’t.

---

## The Hidden Application

Behind `/writer` there’s a full application whose only job is to get me from “idea” to “finished essay” with as little friction as possible.

Some of what it does:

- It keeps a list of every essay, with search, filters, and stats (drafts, published, total words).
- It autosaves while I type, so I don’t have to remember to.
- It keeps a revision history, so I can be bold about deleting whole sections.
- It lets me write either in a rich-text editor or directly in Markdown, and switch between the two.

There are keyboard shortcuts for everything that matters.  
`n` for a new essay.  
Arrow keys to jump between drafts.  
`Cmd + /` to jump between reading and writing.

None of this is visible to a reader. But it changes how I write. The difference between “I should write something” and “I’m already halfway through a new draft” is whether the tool disappears fast enough.

---

## The 3D Polyhedra

The rotating wireframe shapes weren’t strictly necessary. They were for me.

I’ve always liked the feeling you get when a piece of math becomes concrete enough to draw. Polyhedra are perfect for that: they sit at the intersection of geometry, symmetry, and art.

Most sites would reach for a 3D library. I decided to write my own small system.

On disk there’s a catalog of shapes: Platonic solids, Archimedean solids, Kepler–Poinsot star polyhedra, Johnson solids, plus a few parametric oddities. Each one is defined by its vertices (points in 3D space) and either faces or edges.

A build script walks through them and does the careful work:

- It derives edges from faces when needed.
- It normalizes each shape so it fits in a unit sphere (same “size” on screen).
- It checks connectivity: no stray vertices, no broken edges.
- It rejects anything with the wrong edge-to-vertex ratio, so the result still feels like a real polyhedron.

On the client, a small renderer does the rest using the Canvas API:

- Rotate every vertex about the x, y, and z axes using rotation matrices.
- Project 3D points down to 2D.
- Sort edges by depth, so the farther ones are drawn first.
- Use a deterministic color shuffle per shape name, so each polyhedron always has the same “personality.”

When you hover, the rotation speeds up smoothly. If your system prefers reduced motion, it slows down. If the shape scrolls off-screen, an observer pauses it.

None of this required a big engine. Just some linear algebra and patience.

---

## The Stack (And Why)

If you strip away the story, the site is built from familiar pieces:

- Next.js 15 with the App Router, running on Node 20.
- React 19 for the UI.
- Prisma talking to a simple SQLite database.
- NextAuth.js v5 for Google login.
- Tailwind CSS for styling, plus a small typography scale so I never have to think about font sizes.
- Tiptap as the rich-text editor, with `marked` and `turndown` to move between HTML and Markdown.
- A tiny Canvas-based 3D system for the polyhedra.

The database is deliberately boring. There are posts, users, and revisions. Posts can be drafts or published. Revisions record what I typed at various points in time.

Authentication is also deliberately boring. You can’t sign up. You either exist in the user table or you don’t. That’s enough for a site whose main audience is its author.

The code lives in a single repo for the whole site. There’s no microservice to manage the word count. There’s no “polyhedra service.” It’s all one codebase, small enough that I can hold it in my head.

---

## Taste, Not Features

When you build something for yourself, “taste” stops being an abstract idea and turns into a series of concrete decisions.

I learned that I prefer:

- Fewer pages, but each one considered.
- A single consistent typography scale instead of sprinkling `text-sm` and `text-lg` everywhere.
- Keyboard shortcuts over menus.
- A single way to do each thing (one editor, one dashboard, one way to publish).

The hidden writer app is a good example. I could have kept adding knobs—tags, series, scheduled posts, A/B tests—but each one would have made the experience slightly worse for the one person who actually uses it.

So I stopped early, on purpose.

---

## Standing on Shoulders

Even though this is a personal tool, it sits on top of a long list of other people’s work.

Technologies and projects I owe a lot to:

- Next.js and Vercel, for making full-stack React feel straightforward.
- Prisma, for turning database schema design into something almost pleasant.
- NextAuth.js, for doing the ugly OAuth work I didn’t want to think about.
- Tailwind CSS, for making “good enough design” fast.
- Tiptap, for a text editor that doesn’t fight me.
- The people who built the math: from the classification of the Platonic and Archimedean solids to the cataloging of the Johnson solids and star polyhedra.

And more abstractly, writers like Paul Graham, who made it feel normal to put long, opinionated essays on the internet with your name on top.

---

## Why This Matters To Me

If you look at the site from the outside, you see a clean homepage and some essays.

What you don’t see is that it changed how much I write.

There’s a narrow window between “I have an idea” and “I got distracted.” Every bit of friction in that window kills essays. I built this system to widen the window: fewer decisions, fewer obstacles, more chances for an idea to turn into a finished piece.

The polyhedra are a reminder of why I like building things. They don’t exist because a product manager asked for them. They exist because I thought, “It would be fun if each essay had its own weird little 3D shape,” and then I went and wrote the math to make that true.

In the end, this site is just a tool. But it’s a tool that fits my hand exactly, and that’s rare enough that it felt worth building.


