import { html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { KlyqaPetViewBase } from './base';
import { aqiColor, minutesToDaysHours, numericState } from '../derive';
import { t, tEnum, type Lang } from '../i18n';
import type { HomeAssistant } from '../ha-types';
import type { MappedEntities } from '../mapping';
import { renderChips } from '../ui/chips';
import { renderToggleRow } from '../ui/toggle-row';

const FAN_LEVELS: Array<{ value: string; percentage: number }> = [
  { value: '1', percentage: 33 },
  { value: '2', percentage: 66 },
  { value: '3', percentage: 100 },
];
const PRESET_MODES = ['standalone', 'auto', 'night', 'pet'];

function nearestFanLevel(percentage: number | undefined): string | undefined {
  if (percentage === undefined) return undefined;
  let best = FAN_LEVELS[0];
  let bestDiff = Math.abs(percentage - best.percentage);
  for (const level of FAN_LEVELS.slice(1)) {
    const diff = Math.abs(percentage - level.percentage);
    if (diff < bestDiff) {
      best = level;
      bestDiff = diff;
    }
  }
  return best.value;
}

export class KlyqaPetAirpurifierView extends KlyqaPetViewBase {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entities!: MappedEntities;
  @property({ attribute: false }) lang: Lang = 'en';

  protected render(): TemplateResult {
    const lang = this.lang;
    const pm25 = numericState(this.state('pm25'));
    const airQuality = this.stateValue('air_quality');
    const fanState = this.state('fan');
    const fanOn = fanState?.state === 'on';
    const currentPercentage = Number(fanState?.attributes.percentage ?? 0);
    const activeFanLevel = fanOn ? nearestFanLevel(currentPercentage) : undefined;
    const activePreset = fanState?.attributes.preset_mode as string | undefined;
    const ledState = this.state('led');
    const ledOn = ledState?.state === 'on';
    const rgb = (ledState?.attributes.rgb_color as [number, number, number] | undefined) ?? [
      255, 255, 255,
    ];
    const filterMinutes = numericState(this.state('filter_remaining'));

    return html`
      ${pm25 !== undefined
        ? html`<div class="primary-value" style="color:${aqiColor(airQuality)}">
            ${pm25}<span class="unit">µg/m³</span>
          </div>`
        : nothing}
      ${airQuality !== undefined
        ? html`<div class="secondary-line">
            ${t(lang, 'airQuality')}: ${tEnum(lang, 'airQuality', airQuality)}
          </div>`
        : nothing}
      ${this.entities.fan
        ? html`
            <div class="section">
              ${renderToggleRow(t(lang, 'power'), fanOn, false, (checked) =>
                this.callService('fan', checked ? 'turn_on' : 'turn_off', 'fan'),
              )}
              <p class="section-title">${t(lang, 'fanLevel')}</p>
              ${renderChips(
                FAN_LEVELS.map((level) => ({ value: level.value, label: level.value })),
                activeFanLevel,
                (value) => {
                  const level = FAN_LEVELS.find((l) => l.value === value);
                  if (level) {
                    this.callService('fan', 'set_percentage', 'fan', {
                      percentage: level.percentage,
                    });
                  }
                },
              )}
              <p class="section-title">${t(lang, 'preset')}</p>
              ${renderChips(
                PRESET_MODES.map((value) => ({ value, label: tEnum(lang, 'presetMode', value) })),
                activePreset,
                (value) =>
                  this.callService('fan', 'set_preset_mode', 'fan', { preset_mode: value }),
              )}
            </div>
          `
        : nothing}
      ${this.entities.led
        ? html`
            <div class="section rows">
              ${renderToggleRow(t(lang, 'led'), ledOn, false, (checked) =>
                checked
                  ? this.callService('light', 'turn_on', 'led')
                  : this.callService('light', 'turn_off', 'led'),
              )}
              <label class="toggle-row">
                <span class="toggle-label">${t(lang, 'ledColor')}</span>
                <input
                  type="color"
                  .value=${rgbToHex(rgb)}
                  @change=${(e: Event) =>
                    this.callService('light', 'turn_on', 'led', {
                      rgb_color: hexToRgb((e.target as HTMLInputElement).value),
                    })}
                />
              </label>
            </div>
          `
        : nothing}
      ${this.entities.ionizer || this.entities.child_lock
        ? html`
            <div class="section rows">
              ${this.entities.ionizer
                ? renderToggleRow(t(lang, 'ionizer'), this.stateValue('ionizer') === 'on', false, (c) =>
                    this.callService('switch', c ? 'turn_on' : 'turn_off', 'ionizer'),
                  )
                : nothing}
              ${this.entities.child_lock
                ? renderToggleRow(
                    t(lang, 'childLock'),
                    this.stateValue('child_lock') === 'on',
                    false,
                    (c) => this.callService('switch', c ? 'turn_on' : 'turn_off', 'child_lock'),
                  )
                : nothing}
            </div>
          `
        : nothing}
      ${filterMinutes !== undefined
        ? html`
            <div class="secondary-line">${t(lang, 'filterRemaining')}: ${formatDuration(filterMinutes, lang)}</div>
          `
        : nothing}
    `;
  }
}

function formatDuration(minutes: number, lang: Lang): string {
  const { days, hours } = minutesToDaysHours(minutes);
  const dayUnit = t(lang, 'days');
  const hourUnit = t(lang, 'hours');
  if (days > 0) return `${days}${dayUnit} ${hours}${hourUnit}`;
  return `${hours}${hourUnit}`;
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return [r, g, b];
}

customElements.define('klyqa-pet-airpurifier-view', KlyqaPetAirpurifierView);

declare global {
  interface HTMLElementTagNameMap {
    'klyqa-pet-airpurifier-view': KlyqaPetAirpurifierView;
  }
}
