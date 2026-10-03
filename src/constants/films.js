// The two films on the home page. Replace `src` / `poster` with the final videos when they're ready,
// and add `captions: '/videos/<name>.vtt'` for any film with speech.
const films = [
  {
    id: 'founder',
    kicker: 'A message from our founder',
    title: 'Why we started Nument',
    text: 'Abhigyan, from IIIT Delhi and AI Product Manager at the Times Group, on why he started Nument, building AI that earns its place in a business, and how we partner with the teams we build for.',
    byline: 'Abhigyan · Founder · IIIT Delhi · AI Product Manager, Times Group',
    src: '/videos/founder-message.mp4',
    poster: '/videos/founder-message-poster.webp',
  },
  {
    id: 'project',
    kicker: 'Project film',
    title: 'From idea to production',
    text: 'A closer look at one of the AI products we designed, built and now run in production for a client.',
    src: '/videos/project-film.mp4',
    poster: '/videos/project-film-poster.webp',
    cta: { href: '/projects', label: 'ALL PROJECTS' },
  },
];

export default films;
