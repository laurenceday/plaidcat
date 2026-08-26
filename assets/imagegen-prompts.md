# Imagegen prompt catalog

Site artwork today is a mix: a hand-built SVG mascot mark, inline SVG
diagrams, and reference images from the mascot-imagegen-kit committed under
`assets/mascot/`. Each entry below records the exact prompt to
regenerate that slot with a full image model (Codex imagegen), following the
Wildcat brand guidelines and the mascot reference images in the
`mascot-imagegen-kit` repository's `./assets` directory. After generation,
drop the file over the named path, keep the stated dimensions, and leave the
copy areas quiet: headlines and the Wildcat logo are applied in HTML, not
baked into the image.

Shared negative prompt for every slot:

> Generic crypto aesthetic, Bitcoin or Ethereum coins, token stacks, chains,
> blockchain cubes, hexagon networks, circuitry, cyberpunk city, hacker
> imagery, holograms, excessive neon, rainbow gradients, lens flares, glossy
> glassmorphism, chrome 3D objects, generic cats, foxes, cute furry mascots,
> human faces with cat ears, stock-photo executives, crowded dashboards,
> illegible UI, generated words, fake logos, captions, or watermarks.

---

## 1. Site hero background

- Path: `assets/hero-bg.jpg` (referenced from `index.html` header)
- Dimensions: 2400x1350 (16:9), displayed cropped to roughly 21:9
- Current placeholder: CSS gradient (no file)

> Create a 16:9 hero background for Wildcat Protocol. Show an abstract
> representation of on-chain credit infrastructure through a subtle receding
> grid and a small number of precise interconnected lines. Dark near-black
> `#141414` and plum edges transition into concentrated ultramarine `#3E68FF`
> and Purple Heart `#4D26BC`, with a restrained red-coral `#FA6F77` glow on
> one side. Sophisticated institutional-finance atmosphere, secure and
> technically credible, soft depth, controlled contrast, and minimal detail.
> Leave the left-center area quiet for a large white headline. No mascot,
> text, logo, coins, chains, cubes, circuitry, or cyberpunk imagery.

## 2. Mascot-led hero (index page, right third)

- Path: `assets/hero-mascot.png` (transparent or dark background)
- Dimensions: 1600x900 (16:9)
- Current placeholder: `assets/mascot.svg` (hand-built SVG head)

> Create a 16:9 Wildcat Protocol hero image featuring the Wildcat mascot. Use
> the images in `./assets` as visual references and preserve the same
> character identity: angular paper-fold head, tall pointed ears, narrow
> yellow eyes, light grey-white colouring, lean proportions, and a restrained,
> intelligent, slightly sceptical expression.
>
> Show the mascot seated at a plain desk, studying a single printed bank
> statement under a desk lamp, one paw resting on the page. Place the
> character on the right third of the composition, leaving a large quiet area
> on the left for a headline. Use a dark plum-to-purple background with
> restrained ultramarine and red-coral light, a subtle perspective grid, and
> minimal financial-network details. Modern institutional DeFi aesthetic,
> technically credible and slightly irreverent.
>
> Ignore captions, text, interfaces, and backgrounds from the reference
> images. Do not redesign the mascot. No generated text, logo, coins,
> blockchain cubes, cyberpunk effects, or glossy cartoon rendering.

## 3. Section spot illustrations (one per explainer page)

- Paths: `assets/spot-technical.png`, `assets/spot-products.png`,
  `assets/spot-coverage.png`, `assets/spot-legal.png`,
  `assets/spot-commercial.png`, `assets/spot-architecture.png`,
  `assets/spot-moat.png`
- Dimensions: 800x800 each, warm-white background
- Current placeholder: `assets/mascot.svg` reused at small scale

Use the mascot illustration scaffold once per page, varying the scenario:

> Create an illustration of the Wildcat mascot explaining [SCENARIO]. Use the
> images in `./assets` as visual references and preserve the established
> facial structure, ears, eyes, proportions, and overall identity.
>
> Render the character as sparse monochrome editorial line art with thin
> near-black outlines and economical construction. The expression should feel
> intelligent, dry, and slightly mischievous rather than cute or childish.
> Place the character on a warm-white or very light-grey background with
> ample negative space. Use one restrained blue or pale-purple technical
> accent if needed.
>
> Ignore captions, backgrounds, clothing, and other characters in the
> reference images unless explicitly requested. No photorealism, fur texture,
> glossy 3D rendering, text, or logo.

Scenarios per file:

| File | [SCENARIO] |
| --- | --- |
| spot-technical.png | tracing a single wire from a bank vault door to a small labelled server rack, holding a magnifying glass over the connector |
| spot-products.png | weighing three folders of different thickness on a balance scale |
| spot-coverage.png | standing at a wall map of banks, placing pins, with a few unreachable banks behind a velvet rope |
| spot-legal.png | reading a very long contract scroll that spills off the desk, one eyebrow raised |
| spot-commercial.png | sliding a coin across a counter toward a teller window |
| spot-architecture.png | stacking three labelled glass shelves: raw, normalized, derived |
| spot-moat.png | leaning on a shovel beside a half-dug moat around a small data castle |

## 4. Data-pipeline diagram backdrop (architecture page)

- Path: `assets/diagram-bg.png`
- Dimensions: 2000x800
- Current placeholder: inline SVG diagram (keep the SVG labels; this is an
  optional atmospheric underlay)

> Create a minimal conceptual diagram backdrop showing staged data flowing
> left to right through four quiet zones. Use faint overlapping blue and
> purple orbital lines, thin near-black guides, white or off-white background,
> precise fintech interface aesthetic, sparse composition, substantial
> negative space. No mascot, labels, numbers, logos, blockchain icons, coins,
> or decorative complexity.

## 5. PDF cover art

- Path: `assets/pdf-cover.png`
- Dimensions: 1700x2200 (portrait US Letter)
- Current placeholder: flat brand-color cover drawn in code

> Create a portrait cover background for a Wildcat Protocol research report.
> Dark near-black field with an atmospheric plum-to-ultramarine gradient
> concentrated in the lower third, one restrained coral accent line, and a
> subtle perspective grid fading toward the top. Leave the upper half
> visually quiet for the report title and the Wildcat logo. Modern
> institutional DeFi aesthetic, secure, minimal. No text, mascot, coins, or
> decorative clutter.
