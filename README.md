# Energy Flow Card

A custom Home Assistant Lovelace card that displays an animated energy flow over a custom SVG background. Energy values are shown as configurable pills with animated flow lines, and daily totals are displayed in a grid below.

<img width="992" height="742" alt="Preview3" src="https://github.com/user-attachments/assets/42c1ef46-6764-4ece-beed-d40827449b7b" />

<img width="976" height="742" alt="Preview3b" src="https://github.com/user-attachments/assets/f919f6a3-8608-401a-9eeb-7d1a2838c9bf" />

## Features

- Animated SVG flow lines per energy source (positive & negative direction)
- Up to 8 configurable energy value pills in a 3×3 grid
- Only SVG flow also possible
- Up to 10 daily entity values with optional secondary entity
- Per-entity column width: half width (1-col) or full tile width (2-col)
- Configurable grid breakpoint that controls the 2-column → 1-column layout switch
- Day/night SVG backgrounds with auto-switching via sun entity
- Fully configurable via the visual editor (no YAML required)
- Touch-compatible drag & drop sorting in the editor
- YAML editor fallback per entry

<img width="1090" height="468" alt="preview" src="https://github.com/user-attachments/assets/750df14f-44b0-4750-b282-6887e4cdd46a" />


---

## Installation

### Option A — HACS (recommended)

1. Open HACS in Home Assistant
2. Go to **Frontend → ⋮ → Custom repositories**
3. Add this repository URL and select type **Lovelace**
4. Click **Install**
5. Reload your browser
6. Use settings from example below to start

### Option B — Manual

1. Copy `energy-flow-card.js`, `isometric.svg` and `isometric_night.svg` into `/config/www/energyflow/` on your Home Assistant instance
2. Go to **Settings → Dashboards → ⋮ → Resources → Add**
3. Set URL to `/local/energyflow/energy-flow-card.js?v=1.20.5` and type to **JavaScript module**
4. Reload your browser
5. Use settings from example below to start

---

## Configuration

Add the card to your dashboard via the visual editor, or paste the YAML manually.

### Minimal example

```yaml
type: custom:energy-flow-card
svg_day: /local/energyflow/isometric.svg
svg_night: /local/energyflow/isometric_night.svg
mode: day
energy_values: []
daily_entities: []
```

### Full example (please find example with all flows for generic houses within the gh folder)

```yaml
type: custom:energy-flow-card
svg_day: /local/energyflow/isometric.svg
svg_night: /local/energyflow/isometric_night.svg
mode: auto
entity_sun: sun.sun
daily_entities:
  - entity: sensor.daily_grid_consumption
    label: Grid
    icon: mdi:transmission-tower
    secondary_entity: sensor.daily_grid_feed
    secondary_icon: mdi:arrow-top-right
    col_span: 1-col
    secondary_no_unit: true
    color: "#64B7F6"
  - entity: sensor.daily_solar_production
    label: Solar
    icon: mdi:solar-power
    col_span: 1-col
    color: "#FFD724"
  - entity: sensor.daily_heat_consumption
    label: Heating
    icon: mdi:fire
    col_span: 1-col
    color: "#FF6B35"
  - entity: sensor.daily_battery_consumption
    label: Battery
    icon: mdi:battery-50
    col_span: 1-col
    color: "#97EA63"
energy_values:
  - entity: sensor.battery_power
    position: top-left
    label: Battery
    color_positive: "#97EA63"
    path_positive: >-
      M163.503 1071.5L163.503 646.494C163.503 646.494 162 631.489 170.499
      618.991C178.999 606.493 189.503 603.494 189.503 603.494L259.064 569
  - entity: sensor.solar_power
    position: top-right
    label: Solar
    color_positive: "#FFD724"
    path_positive: >-
      M328.409 425.054L328.425 411.899C328.425 411.899 326.887 396.319 335.692
      383.331C344.497 370.342 355.365 367.217 355.365 367.217L643.064 224.783
    delay_positive: "-0.8s"
  - entity: sensor.grid_power
    position: bottom-left
    label: Grid
    color_positive: "#64B7F6"
    path_positive: >-
      M163.822 1193.5V1331.13C163.822 1331.13 165.088 1346.15 156.392
      1358.52C147.695 1370.88 136.564 1374 136.564 1374C105.564 1385.5 112.064
      1407 112.064 1407C112.064 1407 110.564 1413 126.564 1426.5C142.564 1440
      177.441 1455.53 177.441 1455.53L834.576 1788.22L318.041 2051.41
    color_negative: "#D650DC"
    path_negative: >-
      M318.041 2051.41L834.576 1788.22L177.441 1455.53C177.441 1455.53 142.564
      1440 126.564 1426.5C110.564 1413 112.064 1407 112.064 1407C112.064 1407
      105.564 1385.5 136.564 1374C136.564 1374 147.695 1370.88 156.392
      1358.52C165.088 1346.15 163.822 1331.13 163.822 1331.13V1193.5
    delay_positive: "0s"
    delay_negative: "1.7s"
  - entity: sensor.house_consumption
    position: bottom-right
    label: Consumption
    color_positive: "#64B7F6"
    path_positive: >-
      M413.96 1219.65C413.96 1219.65 402.284 1230.08 386.602 1230.62C370.92
      1231.17 361.987 1224.24 361.987 1224.24L206.065 1149.5
    delay_positive: "0.4s"
minmax_min_width: 175px
flow_height: 265px
gradient_day: "linear-gradient(to bottom,#2A75F6 0%,#FFFFFF 67%,#D5D5D5 100%)"
gradient_night: "linear-gradient(to bottom,#0A1929 0%,#1A2332 67%,#2C3440 100%)"
viewbox_width: "1676"
viewbox_height: "2058"
animation_pause: 3.5s
show_border: false
```

<img width="400" height="380" alt="animation" src="https://github.com/user-attachments/assets/411ce819-53e1-41c4-95b4-193736ce7f06" />

---

## Configuration options

### Top level

| Option | Type | Default | Description |
|---|---|---|---|
| `svg_day` | string | | Path to the SVG background for daytime |
| `svg_night` | string | | Path to the SVG background for nighttime |
| `mode` | `auto` / `day` / `night` | `day` | Display mode. `auto` switches based on `entity_sun` |
| `entity_sun` | entity | | Any entity whose state is `below_horizon` for night detection |
| `energy_values` | list | `[]` | Up to 8 energy pills including energy flow animations (see below) |
| `daily_entities` | list | `[]` | Daily total values shown below the SVG (see below) |
| `general settings` | additional hidden settings | `[]` | Basic settings (see below) |

### `energy_values` entry

| Option | Type | Description |
|---|---|---|
| `entity` | entity | Sensor entity to read the value from |
| `position` | string | Pill position: `hidden`, `top-left`, `top-center`, `top-right`, `middle-left`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`. Each visible position can only be used once. Use `hidden` (default) to run the flow animation without showing a pill. |
| `label` | string | Label shown above the value in the pill |
| `color_positive` | string | Hex color for positive flow animation (e.g. `#64B7F6`) |
| `path_positive` | string | SVG path `d` attribute for positive flow direction |
| `delay_positive` | string | CSS animation delay for positive flow (e.g. `0s`, `-0.8s`) |
| `color_negative` | string | Hex color for negative flow (leave empty to reuse positive color) |
| `path_negative` | string | SVG path `d` attribute for negative flow direction |
| `delay_negative` | string | CSS animation delay for negative flow |

### `daily_entities` entry

| Option | Type | Description |
|---|---|---|
| `entity` | entity | Sensor entity for the daily value |
| `label` | string | Display label (leave empty to use friendly name) |
| `icon` | string | Icon (e.g. `mdi:solar-power`). If omitted, the entity's own icon is used automatically |
| `color` | string | Icon color (hex) |
| `secondary_entity` | entity | Optional second value shown small beside the main value |
| `secondary_icon` | string | Icon for the secondary value |
| `secondary_no_unit` | boolean | Hide the unit of the secondary value |
| `col_span` | `1-col` / `2-col` | `1-col` | `1-col` places the tile in one grid column; `2-col` stretches it across the full card width |

### general settings

| Option | Type | Default | Description |
|---|---|---|---|
| `minmax_min_width` | string | `175px` | Minimum tile width before the grid collapses from 2 columns to 1 (e.g. `175px`, `200px`, `50%`) |
| `flow_height` | string | `265px` | Height of the SVG flow area, this changes also the height of the card (e.g. `265px`, `300px`) |
| `svg_height` | string | | Fixed height for the SVG, background image and energy flows. When set, both are centered vertically within the flow area. Leave empty to fill the full flow height (e.g. `220px`) |
| `gradient_day` | string | `linear-gradient(to bottom,#2A75F6 0%,#FFFFFF 67%,#D5D5D5 100%)` | CSS background gradient for day mode |
| `gradient_night` | string | `linear-gradient(to bottom,#0A1929 0%,#1A2332 67%,#2C3440 100%)` | CSS background gradient for night mode |
| `viewbox_width` | string | `1676` | SVG viewBox width — change when using a custom SVG with different dimensions. |
| `viewbox_height` | string | `2058` | SVG viewBox height — change when using a custom SVG with different dimensions |
| `animation_pause` | string | `3.5s` | Total animation cycle length (comet + pause). Higher values = longer pause between loops (e.g. `1s`, `3.5s`, `5s`) |
| `show_border` | boolean | `false` | Show a 1 px card border. Set via the "Card Border" dropdown in General Settings (`true` = show, `false` = hide). Uses `--ha-card-border-color` / `--divider-color` from the active theme. |

---

## Example configurations (`gh/` folder)

The [`gh/`](gh/) folder contains ready-to-use SVG backgrounds and a matching `EXAMPLE_CONFIG.md` for a generic isometric house. Different variants cover common setups:

| File | Description |
|---|---|
| `gh_solar_nogarage.svg` / `gh_solar_nogarage_battery.svg` | House with solar, no garage, optional battery |
| `gh_solar_garage.svg` / `gh_solar_garage_closed.svg` | House with solar and garage (open / closed door) |
| `gh_car.svg` / `gh_car_battery.svg` | House with car charger, optional battery |
| `gh_solar_car.svg` / `gh_solar_car_battery.svg` | House with solar, car charger, optional battery |
| `gh_bk_car.svg` / `gh_bk2_car.svg` / `gh_bk2_car_battery.svg` | Variants with balcony power station (BK) and car charger |
| `gh_bk_garage_battery.svg` / `gh_bk_garage_closed_battery.svg` | BK variant with garage and battery |
| `gh_bk_nogarage.svg` / `gh_bk_nogarage_battery.svg` | BK variant without garage, optional battery |

The [`gh/EXAMPLE_CONFIG.md`](gh/EXAMPLE_CONFIG.md) contains the corresponding `energy_values` path definitions (SVG strokes, colors, positions) for this house layout.

---

## SVG paths

The flow animation follows SVG `path` elements. To get the correct paths for your own SVG:

1. Draw your isomisometric SVT (e.g. affinity studio, Figma)
2. Trace the desired flow line as a path
3. Copy the `d` attribute value
4. Paste it into `path_positive` / `path_negative` in the card config (a negative path is the positive version but from last to first point)

The default SVG viewBox is `0 0 1676 2058`. If your SVG has different dimensions, set `viewbox_width` and `viewbox_height` in General Settings accordingly.


# SVG Path Extraction – HINTS

These hints apply when extracting paths from SVG files to use as animation paths in your energy flow visualizations.

---

## Filled Areas vs. Stroke Paths

Some paths in an SVG define **filled areas** (closed shapes rendered with `fill`) rather than lines. If you need to use these as animation routes, you need to **convert the filled area path into a true centerline stroke path** — that is, trace the visual midline of the filled shape and use it with a `stroke` and an appropriate `stroke-width`, instead of the original outline that merely encloses a filled region.

---

## Absolute vs. Relative Coordinates

SVG path commands come in two variants: **uppercase = absolute**, **lowercase = relative**.

| Command | Meaning |
|---|---|
| `M 100 200` | Move to absolute position (100, 200) |
| `m 10 20` | Move *by* (10, 20) relative to current position |
| `L`, `H`, `V`, `C`, `Q`, `A` | Absolute line/curve commands |
| `l`, `h`, `v`, `c`, `q`, `a` | Relative versions of the above |

**All path coordinates must be absolute** before use in energy flow animations. Relative commands depend on the current pen position at runtime, which makes path length calculations, progress interpolation, and comet-trail animations unreliable or incorrect.

> **How to convert:** Use [Inkscape](https://inkscape.org/) via *Extensions → Generate from Path → Flatten Beziers*, then export as plain SVG — or use an online SVG path converter to normalize all commands to their absolute equivalents.

---

## ViewBox Normalization

All SVGs used as sources should share a **consistent `viewBox`** (e.g. `0 0 1000 1000`). Mixing different viewBox dimensions across icons or layout elements leads to misaligned paths when they are composited into a single animation canvas.

If you are extracting a path from an SVG with a different viewBox, you need to **scale the coordinates** to match the target viewBox before use. Inkscape's *Transform* dialog or a script-based approach (multiplying all coordinates by a scale factor) can handle this.

---

## Bezier Curves and Path Simplification

Complex paths exported from design tools often contain many redundant anchor points or unnecessary Bezier curves. This can cause:

- Slower `getTotalLength()` / `getPointAtLength()` performance in the browser
- Uneven comet spacing along curved segments
- Harder manual editing

Before using a path in an animation, consider **simplifying it** in Inkscape via *Path → Simplify*. Aim for the fewest anchor points that still accurately represent the visual shape.

---

## Stroke Line Caps and Joins

When defining animation route paths, set explicit values for the following attributes:

| Attribute | Recommended value | Reason |
|---|---|---|
| `stroke-linecap` | `round` | Smooth comet head/tail at endpoints |
| `stroke-linejoin` | `round` | No sharp spikes at direction changes |
| `stroke-width` | match visual design | Consistent with surrounding UI elements |

> These attributes have no effect on the animation math itself (which uses path geometry only), but matter for any visible guide lines or debug overlays rendered during development.

---

## Path Direction and Animation Start Point

The direction a comet travels along a path is determined by the **draw direction** of the path — i.e. where the path starts (`M`) and which way the coordinates proceed.

- If a comet animates in the **wrong direction**, reverse the path rather than inverting the animation logic.
- The starting point (`M x y`) defines where the comet appears at progress `0`.
- For **bidirectional flows** (e.g. grid import vs. export), maintain two separate reversed copies of the same path. Lazy way: Usa an AI tools, and let it rewrite reversed version of the path and to re-calculate the bezier curves.

---

## Compound Paths and Subpaths

Some SVG exports produce **compound paths** — a single `<path>` element containing multiple subpaths, separated by additional `M` (or `m`) commands mid-string. Energy flow animation logic typically expects **one continuous path per route**.

If your source path contains multiple subpaths, split them into individual `<path>` elements before use, or ensure your animation code explicitly handles the subpath you intend to animate.

<img width="935" height="450" alt="example" src="https://github.com/user-attachments/assets/b3548709-04ed-4910-8284-9a71e33dbef9" />


---

## Changelog

### v1.20.5
- **Fix: `animation_pause: 0` was ignored** — setting the animation pause to `0` (no pause between flow cycles) silently fell back to the default `3.5s`, because `0` is falsy in JavaScript and was caught by the fallback meant only for empty/invalid values. Zero is now honored correctly.
- **Fix: Buffered text could be lost when closing the editor** — typing into a buffered text field (Background Day/Night SVG path) and closing the card editor without first leaving the field (no blur) could discard the unsaved input. Buffered changes are now flushed when the editor is removed.

### v1.20.4
- **Editor: Color picker shows dashed pattern when no color is set** — the color swatch in the editor now displays a diagonal stripe pattern (like the Glow Card) when the field is empty, instead of a plain white square. Once a color is picked or typed, the swatch shows the selected color as background.
- **Editor: Scroll position preserved while editing** — the editor panel no longer jumps back to the top when a value change triggers a re-render of the main view (e.g. after modifying General Settings or entity order).
- **Docs: Full example cleaned up** — removed personal sensor names (replaced with generic placeholders), removed redundant empty fields, fixed icon (`mdi:battery-50`), corrected delay format, and switched `mode` to `auto`.

### v1.20.3
- **Editor: Color picker for color fields** — color inputs in the editor now show a clickable color square (native color picker) next to a text field. Applies to `color_positive` and `color_negative` in the Energy Value editor, and `color` in the Daily Entity editor. Picker and text field stay in sync; entering a hex value updates the picker instantly.
- **New: Card Border setting** — added `show_border` to General Settings as a dropdown ("No border" / "Show border"). The border uses the theme's `--ha-card-border-color` / `--divider-color` and updates the card preview live while the settings panel is open.
- **Fix: Pills hidden despite visible position selected** — energy flow entries that still contained the legacy `hide_value: true` field were not showing the pill even after selecting a visible position. `position` is now the sole source of truth for pill visibility. **If you have affected entries:** open the entry in the editor, select the desired position, and save — the legacy field is removed automatically.
- **Fix: Position change silently reverting to hidden** — changing an energy flow from `Hidden` to a visible position was sometimes reverted immediately due to `ha-form` re-firing a stale `value-changed` event after a schema refresh.

### v1.20.2
- **UX: `position: hidden` replaces `hide_value` toggle** — instead of a separate boolean switch, select `Hidden` in the Position dropdown to suppress the pill while keeping the flow animation. `Hidden` is the default for new entries and can be used by multiple flows simultaneously. Existing configs with `hide_value: true` remain compatible.
- **Fix: Hidden flows no longer block positions** — flows with position `Hidden` no longer occupy a slot, so visible flows can freely use all 8 positions.

### v1.20.1
- **New: Animation Duration setting** — configurable cycle length via `animation_pause` in General Settings (default: `3.5s`). Controls the total duration including the pause between loops; comet speed stays constant.
- **Performance: Entity change detection** — `_upd()` now only runs when a card-relevant entity state actually changes, instead of on every Home Assistant state update across the instance.
- **Performance: Day/night guard** — background color and pill styles are only recalculated on an actual day/night transition.
- **Performance: Icon update guard** — `ha-state-icon` only receives new values when the underlying state object reference changes.
- **Performance: Style-tag guard** — animation CSS is only written to the DOM when the content has changed.
- **Visual: Removed `backdrop-filter: blur()`** from pills — eliminates an expensive compositing layer on Safari/iOS. Pills are now opaque.
- **Visual: Removed background transition** — day/night background switches instantly instead of animating over 1 second.

---

## License

MIT

<a href="https://buymeacoffee.com/RothMick"><img width="217" height="50" alt="default-orange" src="https://github.com/user-attachments/assets/0da5dedd-5879-4b2a-9131-cd0ebd751547" /></a>
