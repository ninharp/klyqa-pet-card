/**
 * Minimal structural Home Assistant frontend types.
 *
 * We deliberately avoid pulling in `custom-card-helpers` to keep the bundle
 * small — only the shapes this card actually touches are declared here.
 */

export interface HassEntityAttributes {
  [key: string]: unknown;
  friendly_name?: string;
  unit_of_measurement?: string;
  device_class?: string;
  min?: number;
  max?: number;
  step?: number;
  percentage?: number;
  preset_mode?: string;
  preset_modes?: string[];
  rgb_color?: [number, number, number];
  options?: string[];
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: HassEntityAttributes;
  last_changed: string;
  last_updated: string;
}

/** EntityRegistryDisplayEntry — the shape exposed via hass.entities. */
export interface EntityRegistryDisplayEntry {
  entity_id: string;
  device_id?: string;
  platform?: string;
  translation_key?: string;
  entity_category?: 'config' | 'diagnostic';
  name?: string;
  hidden?: boolean;
}

/** DeviceRegistryEntry — the shape exposed via hass.devices. */
export interface DeviceRegistryEntry {
  id: string;
  name?: string;
  name_by_user?: string;
  manufacturer?: string;
  model?: string;
  model_id?: string;
  identifiers?: Array<[string, string]>;
}

export interface HassLocale {
  language: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  locale: HassLocale;
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
  ) => Promise<void>;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

export interface KlyqaPetCardConfig extends LovelaceCardConfig {
  device: string;
  name?: string;
  show_image?: boolean;
  image?: 'front' | 'top';
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
}

/** Entry registered in `window.customCards` for the HA "Add card" picker. */
export interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }
}
