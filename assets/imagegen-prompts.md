# Generated mascot artwork

The files under `assets/generated/` are new site artwork. The private
[`wildcat-finance/mascot-imagegen-kit`](https://github.com/wildcat-finance/mascot-imagegen-kit)
was used only as an identity reference. None of its source images are committed
to or displayed by this site.

Generation used Codex's built-in imagegen tool on 2026-08-26. The reference
checkout was at `a17e0c1`; the four inputs were `refimg_003.png`,
`refimg_006.png`, `refimg_007.png`, and `refimg_012.png`. Their roles were,
respectively: full-body proportions, canonical head and expression, full-body
rendering, and desk-scene gesture. Every prompt told the model to ignore and
not reproduce captions, text, backgrounds, interfaces, memes, logos, costumes,
props, and narrative from the source files.

## Shared identity and visual constraints

- One Wildcat mascot: faceted light-grey/white angular head, very tall pointed
  ears, narrow yellow eyes, heavy dark brows, lean proportions, and a reserved,
  intelligent expression.
- Crisp 2D editorial or graphic-novel rendering with restrained paper texture;
  modern institutional fintech, technically credible, slightly irreverent.
- Brand colours: Bunker `#141414`, Black Rock `#30313E`, Ultramarine
  `#3E68FF`, Purple Heart `#4D26BC`, restrained Coral `#FA6F77`, and yellow
  only for the eyes.
- No generated text, letters, numbers, logos, watermarks, bank brands, generic
  cats, foxes, human-cat hybrids, cute furry rendering, glossy 3D, crypto coins,
  token stacks, chains, cubes, circuitry, cyberpunk scenes, crowded dashboards,
  or excessive neon.

## `hero-data-steward.webp`

> Create a vertical 4:5 homepage hero illustration of the Wildcat mascot as a
> careful data steward. Seat the mascot at a compact analyst's desk, studying
> one plain unbranded bank statement. One paw rests on the paper; the other
> guides a slim cobalt data ribbon into an orderly archive tray. Keep the full
> ears, paws, desk, chair, paper, ribbon, tray, legs, and shoes visible in a
> compact silhouette that reads at 240px. Use simple dark clothing and a calm,
> sceptical, competent expression. Render on a uniform edge-to-edge Bunker
> `#141414` field with no panel, room, horizon, texture, or written text.

The first generation asked for real transparency. Two alpha checks found the
export was opaque, so the final targeted edit deliberately replaced the false
checkerboard with the Bunker field used by the site hero.

## `data-layer.webp`

> Create a wide 3:2 editorial illustration of the Wildcat mascot maintaining a
> precise data pipeline. An unruly ribbon of bank-record marks enters from the
> left, passes through three clean transparent archival trays, and emerges as
> a small orderly set of sealed metric cards. A second thin coral timeline of
> onchain outcome marks joins only at the final tray. Show one full mascot on
> the right half carefully aligning the middle tray. Use a warm-white field,
> sparse near-black linework, fine technical guides, clean margins, generous
> negative space, and no labels or interface text.

## `outcomes-ledger.webp`

> Create a wide 3:2 editorial illustration showing that longitudinal history
> joined to outcomes, not raw data, is the defensible asset. A long paper-and-
> light archive ribbon passes through a clear two-year window and continues
> into the distance. Sparse blue cash-flow marks join a restrained coral
> sequence of outcome markers and become compact evidence cards. Put one
> Wildcat mascot on the right third, attaching the final marker with deliberate
> care. Use a deep Bunker-to-plum field with restrained ultramarine light. Do
> not use a literal moat, castle, treasure, lock, pile of data, or written text.

The checked-in WebP files preserve the generated dimensions: the hero is
1127×1396; both landscape illustrations are 1536×1024.
