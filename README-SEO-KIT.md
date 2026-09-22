# Madgrowth SEO kit — 22 September 2026

Drop-in files for the madgrowth.io repo (GitHub Pages). Every file in this folder goes to the
same path in the repo root. Existing files are replaced; new folders are added.

## What's in here

| Path | What changed |
| --- | --- |
| `about/index.html` | New standalone About page (ProfilePage + Person schema, career table, press list, copy-paste bio). **Check the years in the career table before publishing.** |
| `index.html` | Home: new `<title>`/`og:title` (aligned), "Start with a guide" section above the FAQ, About links point to `/about/`, Person/Organization schema extended (sameAs, alumniOf, address, foundingDate). |
| `newsletter/index.html` | Archive section listing 12 past issues + Blog/Person/Organization schema. |
| `newsletter/<slug>/index.html` (12) | Past issues republished as web pages with Article schema, search titles, per-issue OG images. |
| `guides/fractional-executive-rates/` | New: rates data page (US/UK/EU by role, sourced, quarterly refresh). |
| `guides/fractional-while-employed/` | New: contract check, time model, first client. |
| `guides/what-to-do-after-tech-layoff/` | New: decision guide (runway table). |
| `guides/index.html` | Three new cards added at the top. |
| All other pages (`/stack/`, `/startups/`, `/archetypes/*`, `/guides/*`, `/claude-skills/`, `/diagnostic/`) | Same Person/Organization schema patch; `#about` links → `/about/`; guides get their own `og:image` and `dateModified: 2026-09-22`. No copy changes. |
| `assets/img/og/guides/*.jpg`, `assets/img/og/newsletter/*.jpg`, `assets/img/og/about.jpg` | 25 new 1200×630 OG images in the existing style. |
| `sitemap.xml` | 23 → 39 URLs, all `lastmod` 2026-09-22. |
| `llms.txt` | Newsletter archive section, three new guides, About link. |
| `.github/workflows/indexnow.yml` | GitHub Action using the IndexNow key already in the repo that pings Bing/Yandex with every changed HTML page on push to `main`. |
| `tools/kit_archive_backfill.py` | Script to generate the remaining ~59 newsletter issues from the Kit API (needs a Kit v4 API key). |

## Install

1. Copy everything here over the repo root (`cp -R kit/* kit/.github repo/`).
2. `git diff --stat` — expect ~40 changed/new files. Skim `index.html` and `about/index.html`.
3. Fix the About career years if any are off (`about/index.html`, the table under "Career").
4. Commit and push to `main`. GitHub Pages deploys; the IndexNow action fires on the same push.
5. In Search Console → URL inspection, request indexing for `/about/`, the three new guides and `/newsletter/` (5 requests; the daily quota is ~10).
6. Validate one page of each type at https://validator.schema.org/ (about, a guide, a newsletter issue). Expect zero errors.

## Not in the kit (needs your hands)

- LinkedIn headline/About/Featured, Crunchbase person + org, X bio: the exact wording is in the plan doc, Entity section.
- Wikidata items for you and Madgrowth (I can do these if you say yes; they need an account).
- Sending the four Gmail drafts (press bio updates, PWIT/Observador bio, client-story ask, podcast pitch). Add recipients; nothing was sent.
- Kit: paste the one-line bio + `/about/` link into the newsletter footer.
- Newsletter backfill for the other 59 issues: run `tools/kit_archive_backfill.py` with your Kit API key, review titles, add the generated folders + sitemap lines.
