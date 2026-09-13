import { html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { KlyqaPetViewBase } from './base';
import { numericState } from '../derive';
import { t, tEnum, type Lang } from '../i18n';
import type { HomeAssistant } from '../ha-types';
import type { MappedEntities } from '../mapping';
import { renderToggleRow } from '../ui/toggle-row';
import { hexToRgb, rgbToHex } from '../ui/color';

const DEFAULT_MIN_COLOR_TEMP_KELVIN = 2700;
const DEFAULT_MAX_COLOR_TEMP_KELVIN = 6500;

export class KlyqaPetStrypeView extends KlyqaPetViewBase {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entities!: MappedEntities;
  @property({ attribute: false }) lang: Lang = 'en';

  protected render(): TemplateResult {
    const lang = this.lang;
    const strip = this.state('strip');
    const on = strip?.state === 'on';
    const brightness = Number(strip?.attributes.brightness ?? 0);
    const mode = this.stateValue('light_mode');
    const length = numericState(this.state('strip_length'));

    const rgb = (strip?.attributes.rgb_color as [number, number, number] | undefined) ?? [
      255, 255, 255,
    ];
    const minColorTempKelvin = Number(
      strip?.attributes.min_color_temp_kelvin ?? DEFAULT_MIN_COLOR_TEMP_KELVIN,
    );
    const maxColorTempKelvin = Number(
      strip?.attributes.max_color_temp_kelvin ?? DEFAULT_MAX_COLOR_TEMP_KELVIN,
    );
    const colorTempKelvin = Number(
      strip?.attributes.color_temp_kelvin ?? minColorTempKelvin,
    );

    return html`
      ${mode
        ? html`<div class="secondary-line">
            ${t(lang, 'lightMode')}: ${tEnum(lang, 'lightMode', mode)}
          </div>`
        : nothing}
      <div class="section">
        ${renderToggleRow(t(lang, 'power'), on, false, (checked) =>
          this.callService('light', checked ? 'turn_on' : 'turn_off', 'strip'),
        )}
        <p class="section-title">${t(lang, 'brightness')}</p>
        <input
          type="range"
          min="1"
          max="255"
          .value=${String(brightness)}
          ?disabled=${!on}
          @change=${(ev: Event) =>
            this.callService('light', 'turn_on', 'strip', {
              brightness: Number((ev.target as HTMLInputElement).value),
            })}
        />
        <label class="toggle-row">
          <span class="toggle-label">${t(lang, 'colour')}</span>
          <input
            type="color"
            .value=${rgbToHex(rgb)}
            ?disabled=${!on}
            @change=${(ev: Event) => {
              const rgbColor = hexToRgb((ev.target as HTMLInputElement).value);
              if (rgbColor) {
                this.callService('light', 'turn_on', 'strip', { rgb_color: rgbColor });
              }
            }}
          />
        </label>
        <p class="section-title">${t(lang, 'whiteTemp')}</p>
        <input
          type="range"
          min=${minColorTempKelvin}
          max=${maxColorTempKelvin}
          .value=${String(colorTempKelvin)}
          ?disabled=${!on}
          @change=${(ev: Event) =>
            this.callService('light', 'turn_on', 'strip', {
              color_temp_kelvin: Number((ev.target as HTMLInputElement).value),
            })}
        />
      </div>
      ${length !== undefined
        ? html`<div class="section secondary-line">
            ${t(lang, 'stripLength')}: ${length} m
            ${this.entities.detect_length
              ? html`<button
                  type="button"
                  class="chip"
                  @click=${() => this.callService('button', 'press', 'detect_length')}
                >
                  ${t(lang, 'detectLength')}
                </button>`
              : nothing}
          </div>`
        : nothing}
    `;
  }
}

customElements.define('klyqa-pet-strype-view', KlyqaPetStrypeView);

declare global {
  interface HTMLElementTagNameMap {
    'klyqa-pet-strype-view': KlyqaPetStrypeView;
  }
}
