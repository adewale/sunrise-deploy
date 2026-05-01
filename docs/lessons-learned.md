# Lessons Learned

## 1. A panel is not a section

`panel` should only mean the visual surface: border, radius, background, and shadow.

Spacing and layout rhythm belong to `section`, `masthead`, `hero`, or another structural class.

Bad:

```html
<section class="panel">
  <p class="eyebrow">Table</p>
</section>
```

Good:

```html
<section class="section panel">
  <p class="eyebrow">Table</p>
</section>
```

Why: using `panel` alone caused content to sit against the card edge because it had no internal padding.

## 2. The design page must reuse real components

The public `/design` page exists to reveal drift. When possible, use shared render helpers such as:

- `renderMetric`
- `renderItem`
- `renderSetupGuide` patterns

Avoid hand-writing lookalike markup. If a sample must be custom, it should still use the same structural classes as the production UI.

## 3. Heading hierarchy matters in component samples

Use `h1` for page-level titles only. Component examples should usually use `h2` inside `.section-head`.

The design table sample originally used `h1`, making a small panel feel like a page hero.

## 4. Dark-mode affordance is a system problem

Buttons looking flat in dark mode was not only a button problem. It revealed inconsistent dark surfaces across:

- panels;
- cards;
- chips;
- setup blocks;
- tables;
- buttons.

The fix was to consolidate shared tokens and surface rules instead of adding one-off button styles.

## 5. Theme transitions should not flash

A bright day-to-night wash is painful in dark mode. Theme transitions should be subtle and directional:

- going dark: low-opacity navy dim;
- going light: very faint warm lift;
- always respect `prefers-reduced-motion`.

## 6. Keep visual primitives small

The design language became more consistent after shrinking to shared primitives:

- `--surface`, `--surface-2`, `--surface-3`;
- `--line`, `--line-strong`;
- `--accent`, `--accent-ink`;
- `--shadow`, `--button-shadow`;
- `--radius`, `--inner`.

More tokens and one-off overrides made the UI harder to reason about.

## 7. Fixed header needs reserved space

The fixed `Sunrise` header and theme toggle can overlap unless the header reserves right-side space and truncates safely.

Use:

- `right` offset on `.site-header`;
- `min-width: 0`;
- `overflow: hidden`;
- `text-overflow: ellipsis`.

## 8. Strong grids prevent accidental collisions

Use grid layouts with `minmax(0, 1fr)` for panels, cards, item rows, and config rows. This prevents text and buttons from overlapping when content is long.

Tables should have a minimum width rather than crushing columns into unreadability.
