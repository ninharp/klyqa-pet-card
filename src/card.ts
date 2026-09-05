import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { HomeAssistant, KlyqaPetCardConfig, LovelaceCardEditor } from './ha-types';
import { detectDeviceType, mapEntities, type DeviceType, type MappedEntities } from './mapping';
import { isAvailable } from './derive';
import { resolveLang, t, tEnum, type Lang } from './i18n';
import { sharedStyles } from './styles';
import { AIRPURIFIER_IMAGE, AIRPURIFIER_TOP_IMAGE, FOODY_SVG, WELLY_IMAGE } from './assets/index';

import './views/welly';
import './views/foody';
import './views/airpurifier';

const PRODUCT_NAMES: Record<DeviceType, string> = {
  welly: 'Welly',
  foody: 'Foody',
  airpurifier: 'Air Klyna',
};

/** Entity keys whose primary state decides the card's overall availability badge. */
const PRIMARY_ENTITY_KEYS: Record<DeviceType, string[]> = {
  welly: ['water_temperature'],
  foody: ['bowl_remaining'],
  airpurifier: ['pm25', 'fan'],
};

/** binary_sensor keys that surface as problem chips when "on". */
const PROBLEM_KEYS = [
  'problem',
  'water_tray_low',
  'pump_problem',
  'food_low',
  'bowl_removed',
  'tilted',
  'filter_removed',
];

export class KlyqaPetCard extends LitElement {
  static styles = sharedStyles;

  private _hass?: HomeAssistant;
  private _config?: KlyqaPetCardConfig;

  static getConfigElement(): LovelaceCardEditor {
    return document.createElement('klyqa-pet-card-editor') as LovelaceCardEditor;
  }

  static getStubConfig(hass: HomeAssistant): Partial<KlyqaPetCardConfig> {
    const device = Object.values(hass.devices ?? {}).find((d) => d.manufacturer === 'Klyqa');
    return {
      type: 'custom:klyqa-pet-card',
      device: device?.id ?? '',
      show_image: true,
    };
  }

  setConfig(config: KlyqaPetCardConfig): void {
    if (!config?.device) {
      throw new Error('The "device" option is required.');
    }
    this._config = { show_image: true, ...config };
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this.requestUpdate();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  getCardSize(): number {
    return 4;
  }

  protected render(): TemplateResult {
    const hass = this._hass;
    const config = this._config;
    if (!hass || !config) return html``;

    const lang = resolveLang(hass.locale?.language);
    const device = hass.devices[config.device];
    if (!device) {
      return html`<div class="error-card">${t(lang, 'deviceNotFound')}</div>`;
    }

    const deviceType = detectDeviceType(device.model_id);
    if (!deviceType) {
      return html`<div class="error-card">${t(lang, 'unsupportedDevice')}</div>`;
    }

    const entities = mapEntities(hass, device.id);
    if (Object.keys(entities).length === 0) {
      return html`<div class="error-card">${t(lang, 'noEntities')}</div>`;
    }

    const name = config.name ?? device.name_by_user ?? device.name ?? PRODUCT_NAMES[deviceType];
    const primaryEntityId = PRIMARY_ENTITY_KEYS[deviceType]
      .map((key) => entities[key])
      .find(Boolean);
    const available = primaryEntityId ? isAvailable(hass.states[primaryEntityId]) : true;
    const problems = this._collectProblems(hass, entities, lang);
    const showImage = config.show_image !== false;

    return html`
      <div class="card">
        <div class="frame ${showImage ? 'with-image' : ''}">
          ${showImage
            ? html`<div class="image-column">${this._renderImage(deviceType, config)}</div>`
            : nothing}
          <div class="body">
            <div class="header">
              <div class="header-top">
                <h2 class="name">${name}</h2>
                ${!available
                  ? html`<span class="badge unavailable">${t(lang, 'unavailable')}</span>`
                  : nothing}
              </div>
              <p class="subtitle">${PRODUCT_NAMES[deviceType]}</p>
              ${problems.length
                ? html`<div class="chips-row">
                    ${problems.map((label) => html`<span class="chip active">${label}</span>`)}
                  </div>`
                : nothing}
            </div>
            ${this._renderView(deviceType, hass, entities, lang)}
          </div>
        </div>
      </div>
    `;
  }

  private _collectProblems(hass: HomeAssistant, entities: MappedEntities, lang: Lang): string[] {
    const labels: string[] = [];
    for (const key of PROBLEM_KEYS) {
      const entityId = entities[key];
      if (!entityId) continue;
      if (hass.states[entityId]?.state === 'on') {
        labels.push(tEnum(lang, 'problems', key));
      }
    }
    return labels;
  }

  private _renderImage(deviceType: DeviceType, config: KlyqaPetCardConfig): TemplateResult {
    if (deviceType === 'foody') {
      return html`${unsafeSVG(FOODY_SVG)}`;
    }
    if (deviceType === 'welly') {
      return html`<img src=${WELLY_IMAGE} alt="Welly" />`;
    }
    const src = config.image === 'top' ? AIRPURIFIER_TOP_IMAGE : AIRPURIFIER_IMAGE;
    return html`<img src=${src} alt="Air Klyna" />`;
  }

  private _renderView(
    deviceType: DeviceType,
    hass: HomeAssistant,
    entities: MappedEntities,
    lang: Lang,
  ): TemplateResult {
    switch (deviceType) {
      case 'welly':
        return html`<klyqa-pet-welly-view
          .hass=${hass}
          .entities=${entities}
          .lang=${lang}
        ></klyqa-pet-welly-view>`;
      case 'foody':
        return html`<klyqa-pet-foody-view
          .hass=${hass}
          .entities=${entities}
          .lang=${lang}
        ></klyqa-pet-foody-view>`;
      case 'airpurifier':
        return html`<klyqa-pet-airpurifier-view
          .hass=${hass}
          .entities=${entities}
          .lang=${lang}
        ></klyqa-pet-airpurifier-view>`;
    }
  }
}

customElements.define('klyqa-pet-card', KlyqaPetCard);

declare global {
  interface HTMLElementTagNameMap {
    'klyqa-pet-card': KlyqaPetCard;
  }
}
