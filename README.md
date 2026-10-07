# vishnuprasad.design

Next.js 15 (App Router) + Tailwind v4 + MDX. Every page is statically generated.

## First run

```bash
npm install
npm run assets   # one-time: pulls all 70 images from Framer into /public/images
npm run dev
```

After `npm run assets` finishes, commit `public/images/` and `content/assets.json`
(the script writes real image dimensions back into it). From then on nothing
loads from Framer. Fonts are self-hosted by `next/font` at build time.

## Structure

```
app/
  page.tsx                 Home: Hero, LogoMarquee, CaseList
  about/page.tsx           Renders content/pages/about.mdx
  work/[slug]/page.tsx     Any case study in content/cases/
components/
  layout/                  Nav, Footer, BrushCursor (watercolour trail, desktop only)
  home/                    Hero, LogoMarquee, CaseList
  about/                   Gallery, ContactLinks
  case/                    CaseHero, Section, Points/Pillars, Feature, SubProduct,
                           Stats/Stat/Source, Confidential, NextProjects
  ui/                      Img, Media (self-hosted images by id)
  mdx.tsx                  The component set every MDX file can use
content/
  cases/*.mdx              One file per case study (frontmatter + blocks)
  pages/about.mdx
  assets.json              Image manifest: id → file, size, alt, original Framer URL
lib/                       site config, case loader, asset lookup
```

## Adding a case study

1. Add its images to `content/assets.json` (or drop files in `public/images/<slug>/` and add entries by hand).
2. Create `content/cases/<slug>.mdx` — copy an existing one. `order` controls position on the home page and the "Next project" chain.
3. Add the slug to the redirect list in `next.config.mjs` only if it had an old Framer URL.

### Blocks available in MDX

| Block | Use |
|---|---|
| `<Section label title>` | A chapter. Paragraphs keep a readable width; grids go full width |
| `<Points><Point title>` | Problems, roles, reflections |
| `<Pillars><Pillar title>` | A numbered progression (Ask → Configure → Govern) |
| `<Feature title lead note images={[...]}>` | One product surface with its screenshots |
| `<SubProduct index title capabilities image>` | A product inside a multi-product engagement |
| `<Stats><Stat value label>` | Outcome figures |
| `<Source href linkLabel>` | Attribution for figures you didn't measure |
| `<Img id>` / `<Media ids>` | Single image / auto grid (landscape spans full width) |
| `<Confidential />` | "Get in touch" block for NDA projects |

## Mobile

Responsive with a simplified layout under 768px: logos wrap instead of
scrolling, the painting gallery becomes swipeable strips, screenshots stack,
the nav collapses to a menu, and the brush cursor is off on touch devices.

## Redirects

`/about-2` → `/about` and `/<case>` → `/work/<case>`, so links you've already
shared keep working.

## Open TODOs

- `lib/site.ts`: final domain and LinkedIn URL.
- `content/cases/enterprise-search.mdx`: "Personalised Results" needs its own body copy.
- `content/cases/adeo.mdx`: pick one of the two voting paragraphs (alternate is in a comment).
- `site/home-preview` asset is downloaded but unused — it was on the Framer homepage; place it or delete it.
