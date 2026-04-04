# PMM 2027 — AVM Paul Masiyer Movement Website

**Air Vice Marshal Paul D. Masiyer (Rtd.) — House of Representatives, Mangu/Bokkos Federal Constituency, Plateau State, 2027**

---

## Project Structure

```
pmm-production/           ← ZIP root (deploys directly to Netlify)
├── index.html            ← Homepage
├── about.html            ← Candidate biography & career timeline
├── vision.html           ← 8-Pillar Agenda
├── community.html        ← Join form, volunteer, diaspora channel
├── news.html             ← News grid with article modal
├── poster.html           ← Personalised poster generator
├── 404.html              ← Branded error page
├── netlify.toml          ← Netlify deployment config
├── README.md
├── assets/
│   ├── css/style.css     ← Full design system
│   ├── js/
│   │   ├── main.js       ← Nav, AOS, EN/MW/CH toggle, share buttons
│   │   ├── poster.js     ← Canvas poster generator (uses real poster as base)
│   │   └── ui.js         ← News page rendering and article modal
│   └── img/
│       ├── portraits/
│       │   ├── portrait-apc.png     ← Homepage hero (APC white attire)
│       │   └── portrait-formal.png  ← About page (formal blue Plateau attire)
│       ├── poster/
│       │   └── campaign-poster.jpg  ← APC green campaign poster (SERVICE)
│       └── logo/
│           ├── pmm-logo-wordmark.svg ← Navbar & footer
│           ├── pmm-favicon.svg       ← Browser favicon
│           └── pmm-logo.png          ← PNG fallback
├── components/
│   ├── navbar.html
│   ├── footer.html
│   └── breadcrumb.html
└── data/
    ├── news.json          ← 6 news articles (editable)
    └── config.json        ← Site-wide configuration
```

---

## Deployment — Netlify

### Quickest (Drag & Drop)
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site → Deploy manually**
3. Drag `pmm-production.zip` into the upload zone
4. Site goes live at `random-name.netlify.app`
5. Rename: **Site settings → General → Site name → `pmm2027`**

### Via GitHub (recommended for ongoing updates)
```bash
git init
git add .
git commit -m "PMM 2027 initial deployment"
git remote add origin https://github.com/YOUR_ORG/pmm2027.git
git push -u origin main
```
Then in Netlify: **New site → Import from Git** → select repo → Build command: blank, Publish directory: `.`

---

## Language Toggle

The site supports three languages cycling on one button: **EN → Mwaghavul (Mangu) → Challa (Bokkos) → EN**

Translations live in `assets/js/main.js` in the `translations` object.

To add a translation key:
```javascript
'your-key': { en: 'English text', mw: 'Mwaghavul text', ch: 'Challa text' }
```

To use in HTML:
```html
<span data-t="your-key">Fallback text</span>
```

---

## Form Submissions
- Formspree endpoint: `https://formspree.io/f/mkopqngy`
- View submissions at [formspree.io](https://formspree.io)
- Subject line: "New PMM Movement Supporter" or "New PMM Volunteer/Supporter Sign-Up"

---

## WhatsApp
Campaign WhatsApp: **+234 707 060 9297**

Floating button URL: `https://wa.me/2347070609297?text=I%20want%20to%20Join%20the%20AVM%20Paul%20Masiyer%20Movement.`

---

## Adding News Articles
Edit `data/news.json`. Add a new object at the top of the array:
```json
{
  "id": "007",
  "slug": "article-url-slug",
  "category": "Community",
  "date": "2025-05-01",
  "title": "Article Title Here",
  "excerpt": "One sentence summary shown in the card.",
  "body": "Full article text.\n\nSeparate paragraphs with blank lines.",
  "image": "",
  "featured": false,
  "tags": ["Tag1", "Tag2"]
}
```

---

## Portrait Usage Guide
| File | Used On | Reason |
|---|---|---|
| `portrait-apc.png` | Homepage hero | APC white attire — campaign-facing, communicates party identity |
| `portrait-formal.png` | About page profile card + homepage about strip | Formal Plateau attire — authoritative, biographical context |
| `campaign-poster.jpg` | Homepage feature section + poster generator base | APC green "SERVICE" poster — reinforces campaign brand |

---

*PMM 2027 — AVM Paul Masiyer Movement | Service. Sacrifice. Commitment. — A New Dawn for Mangu/Bokkos*
