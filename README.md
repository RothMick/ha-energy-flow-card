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
3. Set URL to `/local/energyflow/energy-flow-card.js?v=1.20.3` and type to **JavaScript module**
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

### Full example (generic house, all flows)

```yaml
type: custom:energy-flow-card
svg_day: /local/energyflow/gh_solar_car_battery.svg
svg_night: /local/energyflow/isometric_night.svg
entity_grid: sensor.stromzaehler02_haus_power_curr
entity_solar: sensor.aktuelle_soral_produktion_batterien
entity_battery: sensor.shellyplus1pm_a8032ab748e0_power
entity_house: sensor.energy_consumption_new
mode: day
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
    secondary_entity: ""
    secondary_icon: ""
  - entity: sensor.daily_heat_consumption
    label: Heizung
    icon: mdi:fire
    color: "#FF6B35"
    secondary_entity: ""
    secondary_icon: ""
  - entity: sensor.daily_battery_consumption
    label: Battery
    icon: ios:battery-50percent
    color: "#97EA63"
    secondary_entity: ""
    secondary_icon: ""
energy_values:
  - entity: sensor.energy_consumption_new
    position: top-left
    label: bk roof to house
    color_positive: "#ff00ff"
    path_positive: >-
      M1466.01 1387C1466.01 1387 1466.01 1157.5 1466.01 1147.5C1466.01 1137.5
      1466.33 1126.75 1473.77 1114C1480.77 1102.01 1493.01 1093.5 1500.01
      1086.5C1507.01 1079.5 1742.39 848.022 1862.46 731.824
    color_negative: ""
    path_negative: ""
    delay_negative: ""
    delay_positive: 1s
  - entity: sensor.energy_consumption_new
    position: top-center
    label: solar to house
    color_negative: ""
    delay_positive: ""
    delay_negative: ""
    color_positive: "#ff0000"
    path_positive: >-
      M1465.81 1386.42C1465.81 1386.42 1465.81 1147.93 1465.81 1137.12C1465.81
      1126.31 1468.7 1119.51 1470.44 1115.81C1472.19 1112.1 1478.17 1105.3
      1484.04 1099.43C1489.91 1093.56 2013.21 585.088 2013.21 585.088
  - entity: sensor.energy_consumption_new
    position: top-right
    label: grid (both ways)
    color_positive: "#00ff00"
    path_positive: >-
      M1457.5 1502.5C1457.5 1502.5 1457.5 1553.5 1457.5 1557C1457.5 1560.5
      1457.2 1563.9 1455 1567.5C1452.54 1571.53 1449 1573 1445.5 1575C1442 1577
      1376.5 1614.19 1372.5 1616.5C1368.5 1618.81 1367.09 1622.97 1366.5
      1628C1365.89 1633.22 1367.5 1638.78 1372.5 1641.67C1377.5 1644.56 1665
      1790 1665 1790L1382 1935
    color_negative: "#0000ff"
    path_negative: >-
      M1382 1935L1665 1790C1665 1790 1377.5 1644.56 1372.5 1641.67C1367.5
      1638.78 1365.89 1633.22 1366.5 1628C1367.09 1622.97 1368.5 1618.81 1372.5
      1616.5C1376.5 1614.19 1442 1577 1445.5 1575C1449 1573 1452.54 1571.53 1455
      1567.5C1457.2 1563.9 1457.5 1560.5 1457.5 1557C1457.5 1553.5 1457.5 1502.5
      1457.5 1502.5
    delay_positive: ""
    delay_negative: ""
  - entity: sensor.energy_consumption_new
    position: middle-left
    label: battery (both ways)
    color_positive: "#0000ff"
    path_positive: >-
      M1478 1512.5C1478 1512.5 1478 1562.66 1478 1571C1478 1579.34 1482.83
      1585.21 1485.61 1587.99C1488.39 1590.77 1632.01 1662.28 1640.96
      1666.6C1649.92 1670.93 1657.95 1674.22 1665.37 1674.64C1670.31 1674.92
      1679.27 1674.33 1685.76 1670.93C1692.24 1667.53 1711.71 1657.03 1711.71
      1657.03
    color_negative: "#00ff00"
    path_negative: >-
      M1711.71 1657.03C1711.71 1657.03 1692.24 1667.53 1685.76 1670.93C1679.27
      1674.33 1670.31 1674.92 1665.37 1674.64C1657.95 1674.22 1649.92 1670.93
      1640.96 1666.6C1632.01 1662.28 1488.39 1590.77 1485.61 1587.99C1482.83
      1585.21 1478 1579.34 1478 1571C1478 1562.66 1478 1512.5 1478 1512.5
    delay_positive: ""
    delay_negative: ""
  - entity: sensor.energy_consumption_new
    position: middle-right
    label: car charger (both ways)
    color_positive: "#ff0000"
    path_positive: >-
      M1155.2 1360C1155.2 1360 1155.2 1402.48 1155.2 1406.81C1155.2 1411.13
      1157.43 1416.94 1161.41 1421.94C1165.25 1426.77 1170.8 1429.25 1174.19
      1431.21C1177.59 1433.17 1410.01 1551.29 1413.41 1553.25C1416.8 1555.21
      1421.72 1558.13 1427.31 1557.27C1431.79 1556.57 1437 1552.94 1437
      1548C1437 1543.06 1437 1493.32 1437 1493.32
    color_negative: "#00ff00"
    delay_positive: ""
    delay_negative: ""
    path_negative: >-
      M1437 1493.32C1437 1493.32 1437 1543.06 1437 1548C1437 1552.94 1431.79
      1556.57 1427.31 1557.27C1421.72 1558.13 1416.8 1555.21 1413.41
      1553.25C1410.01 1551.29 1177.59 1433.17 1174.19 1431.21C1170.8 1429.25
      1165.25 1426.77 1161.41 1421.94C1157.43 1416.94 1155.2 1411.13 1155.2
      1406.81C1155.2 1402.48 1155.2 1360 1155.2 1360
  - entity: sensor.energy_consumption_new
    position: bottom-left
    label: bk roof to battery
    color_positive: "#ff00ff"
    path_positive: >-
      M1779.44 1423.5C1779.44 1423.5 1779.44 1126.54 1779.44 1110.17C1779.44
      1093.79 1777.99 1092.74 1772.02 1083.91C1766.05 1075.07 1761.83 1073.1
      1750.4 1067.23C1738.97 1061.36 1660.5 1023.05 1642.59 1014.4C1624.67
      1005.75 1626.85 1008.63 1620.96 1000.5C1616.86 994.84 1614.75 990.803
      1614.48 983.819C1614.17 976.042 1614.48 971.462 1620.96 964.975C1624.87
      961.072 1738.1 852.177 1862.46 731.824
    color_negative: ""
    path_negative: ""
    delay_positive: ""
    delay_negative: ""
  - entity: sensor.energy_consumption_new
    position: bottom-center
    label: bk garage to house
    color_positive: "#ff9966"
    path_positive: >-
      M1464.69 1385.44C1464.69 1385.44 1464.69 1156.34 1464.69 1139.35C1464.69
      1134.89 1463.99 1125.08 1458.51 1116C1451.77 1104.86 1440.31 1099.5
      1432.01 1095.5L1204.47 980.5C1199.51 977.5 1186.14 972.16 1172.03
      972.16C1161.41 972.16 1152.88 974.631 1141.14 980.5C1129.4 986.369 675.912
      1214.66 675.912 1214.66
    color_negative: ""
    path_negative: ""
    delay_positive: ""
    delay_negative: ""
  - entity: sensor.energy_consumption_new
    position: bottom-right
    label: bk garage to battery
    color_positive: "#ff9966"
    color_negative: ""
    path_negative: ""
    delay_positive: ""
    delay_negative: ""
    path_positive: >-
      M1757.19 1434.94C1757.19 1434.94 1757.19 1236.34 1757.19 1219.35C1757.19
      1214.89 1758.43 1197.19 1753.17 1192.49C1746.58 1186.59 1742.67 1183.22
      1730 1186C1723.74 1187.37 1704.72 1198.78 1690.39 1205.39C1675.73 1212.16
      1666.95 1211.27 1663.52 1210.33C1656.72 1208.48 1636.33 1198.6 1630.15
      1195.51C1623.98 1192.42 1215.17 986.678 1204.47 980.5C1193.77 974.321
      1186.14 972.16 1172.03 972.16C1161.41 972.16 1152.88 974.631 1141.14
      980.5C1129.4 986.369 675.912 1214.66 675.912 1214.66
entity_sun: sun.sun
minmax_min_width: 175px
flow_height: 265px
svg_height: 220px
gradient_day: linear-gradient(to bottom,#2A75F6 0%,#FFFFFF 67%,#D5D5D5 100%)
gradient_night: linear-gradient(to bottom,#0A1929 0%,#1A2332 67%,#2C3440 100%)
viewbox_width: "2600"
viewbox_height: "1935"
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
