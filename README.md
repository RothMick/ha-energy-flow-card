# Energy Flow Card

A custom Home Assistant Lovelace card that displays an animated energy flow over a custom SVG background. Energy values are shown as configurable pills with animated flow lines, and daily totals are displayed in a grid below.

<img width="1090" height="468" alt="preview" src="https://github.com/user-attachments/assets/750df14f-44b0-4750-b282-6887e4cdd46a" />

<a href="[buymeacoffee.com/RothMick](https://buymeacoffee.com/rothmick)"><img width="217" height="50" alt="default-orange" src="https://github.com/user-attachments/assets/0da5dedd-5879-4b2a-9131-cd0ebd751547" /></a>

## Features

- Animated SVG flow lines per energy source (positive & negative direction)
- Up to 8 configurable energy value pills in a 3×3 grid
- Up to 10 daily entity values with optional secondary entity
- Per-entity column width: half width (1-col) or full tile width (2-col)
- Configurable grid breakpoint that controls the 2-column → 1-column layout switch
- Day/night SVG backgrounds with auto-switching via sun entity
- Fully configurable via the visual editor (no YAML required)
- Touch-compatible drag & drop sorting in the editor
- YAML editor fallback per entry

---

## Installation

### Option A — HACS (recommended)

1. Open HACS in Home Assistant
2. Go to **Frontend → ⋮ → Custom repositories**
3. Add this repository URL and select type **Lovelace**
4. Click **Install**
5. Reload your browser

### Option B — Manual

1. Copy `energy-flow-card.js`, `isometric.svg` and `isometric_night.svg` into `/config/www/energyflow/` on your Home Assistant instance
2. Go to **Settings → Dashboards → ⋮ → Resources → Add**
3. Set URL to `/local/energyflow/energy-flow-card.js?v=1.19.3` and type to **JavaScript module**
4. Reload your browser

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

### Full example

```yaml
type: custom:energy-flow-card
svg_day: /local/energyflow/isometric.svg
svg_night: /local/energyflow/isometric_night.svg
minmax_min_width: 175px
entity_grid: sensor.house_power_curr
entity_solar: sensor.curent_solar_production
entity_battery: sensor.curent_battery_production
entity_house: sensor.energy_consumption
mode: day
entity_sun: sun.sun
energy_values:
  - entity: sensor.shellyplus1pm_a8032ab748e0_power
    position: top-left
    label: Batterie
    color_positive: "#97EA63"
    path_positive: >-
      M163.503 1071.5L163.503 646.494C163.503 646.494 162 631.489 170.499
      618.991C178.999 606.493 189.503 603.494 189.503 603.494L259.064 569
    color_negative: ""
    path_negative: ""
  - entity: sensor.combined_solar_current_production
    position: top-right
    label: Solar
    color_positive: "#FFD724"
    path_positive: >-
      M328.409 425.054L328.425 411.899C328.425 411.899 326.887 396.319 335.692
      383.331C344.497 370.342 355.365 367.217 355.365 367.217L643.064 224.783
    color_negative: ""
    path_negative: ""
    delay_positive: "-0.8s"
  - entity: sensor.stromzaehler02_haus_power_curr
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
    delay_positive: "0"
    delay_negative: 1.7s
  - entity: sensor.energy_consumption_new
    position: bottom-right
    label: Verbrauch
    color_positive: "#64B7F6"
    path_positive: >-
      M413.96 1219.65C413.96 1219.65 402.284 1230.08 386.602 1230.62C370.92
      1231.17 361.987 1224.24 361.987 1224.24L206.065 1149.5
    color_negative: ""
    path_negative: ""
    delay_positive: 0.4s
daily_entities:
  - entity: sensor.daily_grid_consumption
    label: Grid
    icon: mdi:transmission-tower
    color: "#64B7F6"
    secondary_entity: sensor.daily_grid_feed
    secondary_icon: mdi:arrow-top-right
    secondary_no_unit: true
  - entity: sensor.daily_solar_production
    label: Solar
    icon: mdi:solar-power
    color: "#FFD724"
  - entity: sensor.daily_heat_consumption
    label: Heizung
    icon: mdi:fire
    color: "#FF6B35"
  - entity: sensor.daily_battery_consumption
    label: Battery
    icon: ios:battery-50percent
    color: "#97EA63"
    secondary_entity: sensor.awtrix_5686f0_battery
    col_span: 2-col
```

---

## Configuration options

### Top level

| Option | Type | Default | Description |
|---|---|---|---|
| `svg_day` | string | | Path to the SVG background for daytime |
| `svg_night` | string | | Path to the SVG background for nighttime |
| `mode` | `auto` / `day` / `night` | `day` | Display mode. `auto` switches based on `entity_sun` |
| `entity_sun` | entity | | Any entity whose state is `below_horizon` for night detection |
| `energy_values` | list | `[]` | Animated energy pills (see below) |
| `daily_entities` | list | `[]` | Daily total values shown below the SVG (see below) |
| `minmax_min_width` | string | `175px` | Minimum tile width before the grid collapses from 2 columns to 1 (e.g. `175px`, `200px`, `50%`) |
| `flow_height` | string | `265px` | Height of the SVG flow area (e.g. `265px`, `300px`) |
| `gradient_day` | string | `linear-gradient(to bottom,#2A75F6 0%,#FFFFFF 67%,#D5D5D5 100%)` | CSS background gradient for day mode |
| `gradient_night` | string | `linear-gradient(to bottom,#0A1929 0%,#1A2332 67%,#2C3440 100%)` | CSS background gradient for night mode |

### `energy_values` entry

| Option | Type | Description |
|---|---|---|
| `entity` | entity | Sensor entity to read the value from |
| `position` | string | Pill position: `top-left`, `top-center`, `top-right`, `middle-left`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right` |
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
| `icon` | string | icon (e.g. `mdi:solar-power`) |
| `color` | string | Icon color (hex) |
| `secondary_entity` | entity | Optional second value shown small beside the main value |
| `secondary_icon` | string | Icon for the secondary value |
| `secondary_no_unit` | boolean | Hide the unit of the secondary value |
| `col_span` | `1-col` / `2-col` | `1-col` | `1-col` places the tile in one grid column; `2-col` stretches it across the full card width |

---

## SVG paths

The flow animation follows SVG `path` elements. To get the correct paths for your own SVG:

1. Open your SVG in a vector editor (e.g. Inkscape or Figma)
2. Trace the desired flow line as a path
3. Copy the `d` attribute value
4. Paste it into `path_positive` / `path_negative` in the card config (a negative path is the positive version but from last to first point)

The SVG viewBox used in this card is `0 0 1676 2058`.

---

## License

MIT
