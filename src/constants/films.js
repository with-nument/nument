// The two films on the home page. `tone` tells the header whether the film is dark or light,
// and `captions: '/videos/<name>.vtt'` can be added for any film with speech.
const films = [
  {
    id: 'founder',
    kicker: 'A message from our founder',
    title: 'Why we started Nument',
    text: 'Building AI that earns its place in a business.',
    byline: 'Abhigyan, Founder',
    affiliation: 'IIIT Delhi · AI Product Manager, Times Group',
    src: '/videos/founder-message.mp4',
    poster: '/videos/founder-message-poster.webp',
    tone: 'dark',
  },
  {
    id: 'project',
    kicker: 'The Nument film',
    title: 'From idea to production',
    text: 'How we take AI from a first idea to a product running in production, in weeks.',
    src: '/videos/project-film.mp4',
    poster: '/videos/project-film-poster.webp',
    tone: 'light',
    previewStart: 3,
    cta: { href: '/projects', label: 'ALL PROJECTS' },
  },
];

export default films;
