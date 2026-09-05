import { html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { KlyqaPetViewBase } from './base';
import { numericState } from '../derive';
import { t, tEnum, type Lang } from '../i18n';
import type { HomeAssistant } from '../ha-types';
import type { MappedEntities } from '../mapping';
import { renderStepper } from '../ui/stepper';
import { renderToggleRow } from '../ui/toggle-row';

export class KlyqaPetFoodyView extends KlyqaPetViewBase {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entities!: MappedEntities;
  @property({ attribute: false }) lang: Lang = 'en';

  @state() private _confirmOpen = false;
  @state() private _portionsDraft?: number;

  protected render(): TemplateResult {
    const lang = this.lang;
    const bowlRemaining = numericState(this.state('bowl_remaining'));
    const feedingState = this.stateValue('feeding_state');
    const bowlState = this.stateValue('bowl_state');
    const foodBinState = this.stateValue('food_bin_state');
    const portionsState = this.state('portions');
    const portions =
      this._portionsDraft ?? numericState(portionsState) ?? Number(portionsState?.attributes.min ?? 1);
    const lastManualFeeding = this.stateValue('last_manual_feeding');
    const lastManualPortions = numericState(this.state('last_manual_portions'));
    const nextFeedMinutes = numericState(this.state('next_feed_time'));
    const realtimeWeight = numericState(this.state('realtime_weight'));

    return html`
      ${bowlRemaining !== undefined
        ? html`<div class="primary-value">${bowlRemaining}<span class="unit">g</span></div>`
        : nothing}
      ${feedingState || bowlState || foodBinState
        ? html`
            <div class="chips-row">
              ${feedingState
                ? html`<span class="chip active">${tEnum(lang, 'feedingState', feedingState)}</span>`
                : nothing}
              ${bowlState
                ? html`<span class="chip active">${tEnum(lang, 'bowlState', bowlState)}</span>`
                : nothing}
              ${foodBinState
                ? html`<span class="chip active">${tEnum(lang, 'foodBinState', foodBinState)}</span>`
                : nothing}
            </div>
          `
        : nothing}
      ${this.entities.portions
        ? html`
            <div class="section">
              <p class="section-title">${t(lang, 'portions')}</p>
              ${renderStepper(
                portions,
                Number(portionsState?.attributes.min ?? 1),
                Number(portionsState?.attributes.max ?? 40),
                Number(portionsState?.attributes.step ?? 1),
                (value) => this._setPortions(value),
              )}
              ${this.entities.dispense_food
                ? html`<button
                    type="button"
                    class="chip"
                    @click=${() => (this._confirmOpen = true)}
                  >
                    ${t(lang, 'dispense')}
                  </button>`
                : nothing}
            </div>
          `
        : nothing}
      ${lastManualFeeding !== undefined || nextFeedMinutes !== undefined
        ? html`
            <div class="section secondary-line">
              ${lastManualFeeding !== undefined
                ? html`<div>
                    ${t(lang, 'lastManualFeeding')}: ${tEnum(lang, 'lastManualFeeding', lastManualFeeding)}
                    ${lastManualPortions !== undefined
                      ? html` (${lastManualPortions} ${t(lang, 'lastManualPortions')})`
                      : nothing}
                  </div>`
                : nothing}
              ${nextFeedMinutes !== undefined
                ? html`<div>${t(lang, 'nextFeeding')}: ${nextFeedMinutes} min</div>`
                : nothing}
            </div>
          `
        : nothing}
      ${realtimeWeight !== undefined
        ? html`
            <div class="section secondary-line">
              ${t(lang, 'realtimeWeight')}: ${realtimeWeight} g
              ${this.entities.query_bowl_weight
                ? html`<button
                    type="button"
                    class="chip"
                    @click=${() => this.callService('button', 'press', 'query_bowl_weight')}
                  >
                    ${t(lang, 'queryBowlWeight')}
                  </button>`
                : nothing}
            </div>
          `
        : nothing}
      ${this.entities.app_led || this.entities.app_pet_lock || this.entities.beep_switch
        ? html`
            <div class="section rows">
              ${this.entities.app_led
                ? renderToggleRow(t(lang, 'appLed'), this.stateValue('app_led') === 'on', false, (c) =>
                    this.callService('switch', c ? 'turn_on' : 'turn_off', 'app_led'),
                  )
                : nothing}
              ${this.entities.app_pet_lock
                ? renderToggleRow(
                    t(lang, 'petLock'),
                    this.stateValue('app_pet_lock') === 'on',
                    false,
                    (c) => this.callService('switch', c ? 'turn_on' : 'turn_off', 'app_pet_lock'),
                  )
                : nothing}
              ${this.entities.beep_switch
                ? renderToggleRow(
                    t(lang, 'beep'),
                    this.stateValue('beep_switch') === 'on',
                    false,
                    (c) => this.callService('switch', c ? 'turn_on' : 'turn_off', 'beep_switch'),
                  )
                : nothing}
            </div>
          `
        : nothing}
      ${this._confirmOpen ? this._renderConfirmDialog(lang, portions) : nothing}
    `;
  }

  private _setPortions(value: number): void {
    this._portionsDraft = value;
    this.callService('number', 'set_value', 'portions', { value });
  }

  private _renderConfirmDialog(lang: Lang, portions: number): TemplateResult {
    const title = t(lang, 'feedConfirmTitle').replace('{n}', String(portions));
    return html`
      <dialog class="confirm-dialog" open @cancel=${() => (this._confirmOpen = false)}>
        <p>${title}</p>
        <div class="confirm-actions">
          <button type="button" @click=${() => (this._confirmOpen = false)}>
            ${t(lang, 'feedConfirmCancel')}
          </button>
          <button
            type="button"
            @click=${() => {
              this.callService('button', 'press', 'dispense_food');
              this._confirmOpen = false;
            }}
          >
            ${t(lang, 'feedConfirmConfirm')}
          </button>
        </div>
      </dialog>
    `;
  }
}

customElements.define('klyqa-pet-foody-view', KlyqaPetFoodyView);

declare global {
  interface HTMLElementTagNameMap {
    'klyqa-pet-foody-view': KlyqaPetFoodyView;
  }
}
