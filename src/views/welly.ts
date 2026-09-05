import { html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { KlyqaPetViewBase } from './base';
import { numericState, tankPercent } from '../derive';
import { t, tEnum, type Lang } from '../i18n';
import type { HomeAssistant } from '../ha-types';
import type { MappedEntities } from '../mapping';
import { renderChips } from '../ui/chips';
import { renderBar } from '../ui/bar';
import { renderStepper } from '../ui/stepper';
import { renderToggleRow } from '../ui/toggle-row';

const MODES = ['sensing', 'fresh_water_24h', 'water_change', 'self_wash', 'drain'];
const DEFAULT_TANK_MAX_ML = 1600;

export class KlyqaPetWellyView extends KlyqaPetViewBase {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entities!: MappedEntities;
  @property({ attribute: false }) lang: Lang = 'en';

  @state() private _menuOpen = false;

  protected render(): TemplateResult {
    const lang = this.lang;
    const waterTemp = numericState(this.state('water_temperature'));
    const cleanState = this.state('clean_tank_volume');
    const sewageState = this.state('sewage_tank_volume');
    const cleanMl = numericState(cleanState) ?? 0;
    const sewageMl = numericState(sewageState) ?? 0;
    const drinking = numericState(this.state('drinking_volume'));
    const total = numericState(this.state('total_consumption'));
    const mode = this.stateValue('mode');
    const heatingOn = this.stateValue('heating') === 'on';
    const heatingTempState = this.state('heating_temperature');
    const heatingTemp = numericState(heatingTempState);
    const hasDescaling = Boolean(this.entities.start_descaling || this.entities.stop_descaling);

    return html`
      ${waterTemp !== undefined
        ? html`<div class="primary-value">${waterTemp}<span class="unit">°C</span></div>`
        : nothing}
      ${cleanState || sewageState
        ? html`
            <div class="section">
              ${renderBar(
                t(lang, 'cleanTank'),
                `${cleanMl} ml`,
                tankPercent(cleanMl, sewageMl, DEFAULT_TANK_MAX_ML),
              )}
              ${renderBar(
                t(lang, 'sewageTank'),
                `${sewageMl} ml`,
                tankPercent(sewageMl, cleanMl, DEFAULT_TANK_MAX_ML),
              )}
            </div>
          `
        : nothing}
      ${drinking !== undefined
        ? html`
            <div class="section">
              <p class="section-title">${t(lang, 'drinkingToday')}</p>
              <div class="secondary-line">
                ${drinking} ml
                ${total !== undefined
                  ? html` &middot; ${t(lang, 'totalConsumption')}: ${total} ml`
                  : nothing}
              </div>
            </div>
          `
        : nothing}
      ${mode !== undefined
        ? html`
            <div class="section">
              <p class="section-title">${t(lang, 'mode')}</p>
              ${renderChips(
                MODES.map((value) => ({ value, label: tEnum(lang, 'mode', value) })),
                mode,
                (value) => this.callService('select', 'select_option', 'mode', { option: value }),
              )}
            </div>
          `
        : nothing}
      ${this.entities.heating
        ? html`
            <div class="section">
              ${renderToggleRow(t(lang, 'heating'), heatingOn, false, (checked) =>
                this.callService('switch', checked ? 'turn_on' : 'turn_off', 'heating'),
              )}
              ${heatingTemp !== undefined
                ? renderStepper(
                    heatingTemp,
                    Number(heatingTempState?.attributes.min ?? 20),
                    Number(heatingTempState?.attributes.max ?? 40),
                    Number(heatingTempState?.attributes.step ?? 1),
                    (value) =>
                      this.callService('number', 'set_value', 'heating_temperature', { value }),
                  )
                : nothing}
            </div>
          `
        : nothing}
      ${hasDescaling ? this._renderOverflowMenu(lang) : nothing}
    `;
  }

  private _renderOverflowMenu(lang: Lang): TemplateResult {
    return html`
      <div class="overflow-menu section">
        <button
          type="button"
          class="overflow-toggle"
          aria-label=${t(lang, 'more')}
          @click=${() => (this._menuOpen = !this._menuOpen)}
        >
          &#8942;
        </button>
        ${this._menuOpen
          ? html`
              <div class="overflow-panel">
                ${this.entities.start_descaling
                  ? html`<button
                      type="button"
                      @click=${() => {
                        this.callService('button', 'press', 'start_descaling');
                        this._menuOpen = false;
                      }}
                    >
                      ${t(lang, 'startDescaling')}
                    </button>`
                  : nothing}
                ${this.entities.stop_descaling
                  ? html`<button
                      type="button"
                      @click=${() => {
                        this.callService('button', 'press', 'stop_descaling');
                        this._menuOpen = false;
                      }}
                    >
                      ${t(lang, 'stopDescaling')}
                    </button>`
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

customElements.define('klyqa-pet-welly-view', KlyqaPetWellyView);

declare global {
  interface HTMLElementTagNameMap {
    'klyqa-pet-welly-view': KlyqaPetWellyView;
  }
}
