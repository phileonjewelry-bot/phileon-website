// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Journal manifest (Phase 4 scaffold, empty by design)
//
// Article shape (defined for future authoring, NOT for auto-generated
// placeholder content). Do NOT populate this array with filler AI content —
// each article must be hand-authored to preserve the PHILEON voice.
//
//   {
//     slug: 'gold-karat-guide',
//     title: '10K vs 14K vs 18K Gold',
//     excerpt: '',
//     heroImage: '',
//     author: 'PHILEON Atelier',
//     publishedAt: '2026-03-01',
//     updatedAt: '2026-03-01',
//     tags: ['gold','materials'],
//     relatedProductSlugs: ['drape','bajan-joe'],
//     body: [ { type: 'p', text: '' } ]
//   }
//
// Topic backlog (not published):
//   - 10K vs 14K vs 18K Gold
//   - Lab-Grown vs Natural Diamonds
//   - How to Measure Ring Size
//   - Pavé vs Channel vs Bezel Setting
//   - How Custom Jewelry Is Made
//   - How to Care for Fine Jewelry
//   - Choosing a Men's Statement Ring
//   - Understanding Gold Karats
// ─────────────────────────────────────────────────────────────────────────────

export const journalArticles = [];

export function getArticle(slug) {
  return journalArticles.find((a) => a.slug === slug) || null;
}
