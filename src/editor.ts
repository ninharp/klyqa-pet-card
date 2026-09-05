import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { HomeAssistant, KlyqaPetCardConfig } from './ha-types';
import { detectDeviceType } from './mapping';

/**
 * Minimal structural type for the subset of `ha-form`'s schema this editor
 * needs. The real element is provided by the Home Assistant frontend at
 * runtime; we only rely on its `hass`/`data`/`schema` properties and its
 * `value-changed` event.
 */
interface HaFormSchemaEntry {
  name: string;
  selector?: Record<string, unknown>;
  required?: boolean;
}

const BASE_SCHEMA: HaFormSchemaEntry[] = [
  {
    name: 'device',
    required: true,
    selector: { device: { filter: { integration: 'klyqa_pet' } } },
  },
  { name: 'name', selector: { text: {} } },
  { name: 'show_image', selector: { boolean: {} } },
];

const IMAGE_SCHEMA_ENTRY: HaFormSchemaEntry = {
  name: 'image',
  selector: {
    select: {
      mode: 'dropdown',
      options: [
        { value: 'front', label: 'Front' },
        { value: 'top', label: 'Top' },
      ],
    },
  },
};

/** Builds the ha-form schema, adding the airpurifier-only `image` field when relevant. */
export function computeSchema(
  hass: HomeAssistant | undefined,
  config: Partial<KlyqaPetCardConfig> | undefined,
): HaFormSchemaEntry[] {
  const device = hass && config?.device ? hass.devices[config.device] : undefined;
  const deviceType = device ? detectDeviceType(device.model_id) : null;
  if (deviceType === 'airpurifier') {
    return [...BASE_SCHEMA, IMAGE_SCHEMA_ENTRY];
  }
  return BASE_SCHEMA;
}

export class KlyqaPetCardEditor extends LitElement {
  hass?: HomeAssistant;

  @state() private _config: Partial<KlyqaPetCardConfig> = {};

  setConfig(config: Partial<KlyqaPetCardConfig>): void {
    this._config = config;
  }

  protected createRenderRoot(): this {
    return this;
  }

  protected render(): TemplateResult {
    const schema = computeSchema(this.hass, this._config);
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${(entry: HaFormSchemaEntry): string => this._computeLabel(entry.name)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _computeLabel(name: string): string {
    const labels: Record<string, string> = {
      device: 'Device',
      name: 'Name',
      show_image: 'Show image',
      image: 'Image',
    };
    return labels[name] ?? name;
  }

  private _valueChanged(ev: CustomEvent<{ value: Partial<KlyqaPetCardConfig> }>): void {
    this._config = ev.detail.value;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define('klyqa-pet-card-editor', KlyqaPetCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    'klyqa-pet-card-editor': KlyqaPetCardEditor;
  }
}
