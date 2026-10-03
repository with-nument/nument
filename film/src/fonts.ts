import { continueRender, delayRender, staticFile } from 'remotion';
import interVariable from '../assets/fonts/InterVariable.woff2';

// Inter Display (headlines) comes from the website's public/fonts; Inter (text optical size,
// variable, OFL) is film-only in assets/fonts. App recreations use the system font (SF Pro).
const handle = delayRender('Loading fonts');
const faces: FontFace[] = [
  ...[
    ['InterDisplay-Regular.woff2', '400'],
    ['InterDisplay-Medium.woff2', '500'],
    ['InterDisplay-Bold.woff2', '700'],
  ].map(([file, weight]) => new FontFace('Inter Display', `url(${staticFile(`fonts/${file}`)}) format('woff2')`, { weight })),
  new FontFace('Inter Text', `url(${interVariable}) format('woff2')`, { weight: '100 900' }),
];
Promise.all(faces.map((f) => f.load().then((face) => document.fonts.add(face))))
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
