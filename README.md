![Nument AI](/public/og.png)

# Nument AI — Website

The website of **Nument AI**, an AI solutions company based in Gurugram, India. We design, build and ship production-grade AI for startups, enterprises and founding teams.

- Website: [nument.in](https://nument.in)
- Email: [contact@nument.in](mailto:contact@nument.in)
- Book a call: [cal.com/abhigyan-numentai/intro-call](https://cal.com/abhigyan-numentai/intro-call)

---

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 14 (pages router)
- **3D:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + drei + rapier (client ID badges, device showcases, About hero)
- **Animation & scroll:** GSAP + ScrollTrigger, Lenis
- **Styling:** SCSS modules
- **Sound:** a small Web Audio engine (`src/sound/`), no audio files
- **Booking:** Cal.com embed (`@calcom/embed-react`)

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (also generates the sitemap)
npm start
```

## Where the content lives

| What | File |
| --- | --- |
| Email, Cal.com link, location | `src/constants/contact.js` |
| Projects / case studies | `src/constants/projects.js` |
| Home films (founder message, project film) | `src/constants/films.js` |
| Clients and their quotes | `src/pages/components/clients/Index.jsx` |
| About hero, story, services, process | `src/pages/about/components/` |
| Footer and social links | `src/components/dom/Footer.jsx`, `src/components/dom/navbar/constants/footerLinks.js` |
| Page titles and SEO | `src/pages/*.page.jsx`, `src/components/dom/CustomHead.jsx` |

## Asset tooling

`scripts/assets/` holds the scripts used to produce the site's images, videos and 3D textures (Gemini image generation, Veo clips, ID-card and cover rendering). They read `GEMINI_API_KEY` from `.env.local`; raw outputs go to `scripts/assets/raw/` (git-ignored).

## License

Copyright (c) 2026 Nument AI. All rights reserved. See `LICENSE`. Third-party notices are in `THIRD_PARTY_NOTICES.md`.
