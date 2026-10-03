// The home page film. `tone` tells the header whether the film is dark or light, `previewStart` (seconds)
// is where the silent loop opens, and `captions: '/videos/<name>.vtt'` can be added for speech.
const film = {
  id: 'nument',
  kicker: 'The Nument film',
  title: 'Why we started Nument',
  text: 'Building AI that earns its place in a business.',
  src: '/videos/project-film.mp4',
  poster: '/videos/project-film-poster.webp',
  tone: 'light',
  previewStart: 3,
  cta: { href: '/projects', label: 'ALL PROJECTS' },
};

export default film;
