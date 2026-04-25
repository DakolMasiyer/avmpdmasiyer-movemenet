# PMM 2027 — News Article Images

Place all news article images in this folder.

## Naming convention

```
news-{article-slug}-{descriptor}.jpg
```

Examples matching news.json article slugs:

| File name | Article |
|-----------|---------|
| `news-avm-masiyer-declares-2027.jpg` | Declaration announcement |
| `news-christmas-eve-attacks-bokkos-2023.jpg` | Christmas Eve attacks |
| `news-mangu-food-basket-irish-potato.jpg` | Food basket / agriculture crisis |
| `news-operation-safe-haven-stakeholders.jpg` | Operation Safe Haven meeting |
| `news-65000-displaced-plateau-humanitarian.jpg` | Displacement humanitarian crisis |
| `news-bokkos-five-communities-attacked-2025.jpg` | Five communities attacked, March–April 2025 |
| `news-manja-tangur-19-killed-june-2025.jpg` | Manja & Tangur attacks, June 2025 |
| `news-12000-killed-plateau-two-decades.jpg` | 12,000 killed — two decades analysis |
| `news-mushere-nine-killed-church-leader.jpg` | Mushere, nine killed including church leader |
| `news-mwaghavul-association-community-resilience.jpg` | Mwaghavul Development Association |
| `news-who-is-avm-masiyer-biography.jpg` | AVM biography / profile |
| `news-youth-exodus-mangu-bokkos.jpg` | Youth exodus |
| `news-resettlement-governor-mutfwang.jpg` | Resettlement / Governor Mutfwang |
| `news-campaign-promises-eight-pillars.jpg` | Eight-pillar campaign platform |
| `news-join-pmm-support-masiyer.jpg` | Join the movement |

## In news.json

Reference images as:
```json
"image": "assets/img/news/news-{slug-descriptor}.jpg"
```

## Recommended dimensions

- **Aspect ratio**: 16:9 or 3:2
- **Minimum width**: 800px
- **Display width**: ~400px (news card thumbnail)
- **Format**: JPEG at 80–90 quality
