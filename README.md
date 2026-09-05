# Klyqa Pet Card

A Home Assistant Lovelace card for the [`klyqa_pet`](https://github.com/ninharp/ha-klyqa-pet) integration.
Renders one Klyqa Pet device — Welly (water fountain), Foody (feeder) or Air Klyna
(air purifier) — as a single card: product image, status badges, key values
and direct controls. The device type is detected automatically; you only
pick the device.

[![Open this repository in the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=ninharp&repository=klyqa-pet-card&category=plugin)

## Screenshots

TODO: add screenshots (light and dark theme) for Welly, Foody and Air Klyna once
available.

## Installation

### HACS (custom repository)

1. In HACS, go to **Frontend** → the three-dot menu → **Custom repositories**.
2. Add this repository URL with category **Lovelace**.
3. Install **Klyqa Pet Card** and reload the frontend cache (or restart Home Assistant).

### Manual

1. Download `klyqa-pet-card.js` from the [latest release](../../releases/latest).
2. Copy it into `<config>/www/klyqa-pet-card.js`.
3. Add it as a Lovelace resource: **Settings → Dashboards → Resources → Add resource**,
   URL `/local/klyqa-pet-card.js`, resource type **JavaScript module**.

## Configuration

Add the card via the dashboard UI ("Klyqa Pet Card" in the card picker) or in YAML:

```yaml
type: custom:klyqa-pet-card
device: 1234abcd5678ef90    # device registry id (required)
name: Küche                 # optional, overrides the device name
show_image: true            # optional, default true
image: top                  # airpurifier only: "front" (default) | "top"
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `device` | string | — | Required. The device registry id of a `klyqa_pet` device. |
| `name` | string | device name | Overrides the card title. |
| `show_image` | boolean | `true` | Shows the product image. |
| `image` | `front` \| `top` | `front` | Air Klyna only: which render to show. |

## Supported devices

- **Welly** (water fountain): water temperature, tank levels, drinking totals,
  mode selection, heating, descaling.
- **Foody** (feeder): bowl remaining, feeding/bowl/bin state, portions, manual
  dispense with confirmation, scheduled feeding, real-time weight, indicator
  LED / pet lock / beep switches.
- **Air Klyna** (air purifier): PM2.5 with air-quality colour coding, power,
  fan level, presets, LED colour, ionizer, child lock, filter remaining time.

Out of scope for v1: timers/schedules, pet tags, history graphs, multi-device
cards, custom themes beyond Home Assistant theme variables.

## Development

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build   # -> dist/klyqa-pet-card.js
```

`scripts/prepare-images.py` (re)generates the embedded product images from
the source renders; it needs Pillow (see the script's docstring).

`dev/preview.html` is a standalone harness (not shipped) that loads the
built module directly against fixture `hass` objects, useful for visually
checking all three device views without a running Home Assistant instance.
