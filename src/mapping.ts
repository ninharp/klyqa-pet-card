import type { EntityRegistryDisplayEntry, HomeAssistant } from './ha-types';

export type DeviceType = 'welly' | 'foody' | 'airpurifier';

/**
 * Detects the Klyqa Pet device type from the device registry's `model_id`.
 * See docs/superpowers/specs/2026-09-05-klyqa-pet-card-design.md for the
 * authoritative list of model id prefixes.
 */
export function detectDeviceType(modelId: string | undefined | null): DeviceType | null {
  if (!modelId) return null;
  if (/^@klyqa\.welly(-dev)?$/.test(modelId) || /^@pfriendly\.water-fountain/.test(modelId)) {
    return 'welly';
  }
  if (/^@klyqa\.foody/.test(modelId) || /^@pfriendly\.foody/.test(modelId)) {
    return 'foody';
  }
  if (/^@klyqa\.airpurifier2/.test(modelId) || /^@pfriendly\.airpurifier/.test(modelId)) {
    return 'airpurifier';
  }
  return null;
}

/** Entities without a translation_key, identified by domain + device_class instead. */
const DEVICE_CLASS_FALLBACKS: Array<{ key: string; domain: string; deviceClass: string }> = [
  { key: 'battery', domain: 'sensor', deviceClass: 'battery' },
  { key: 'pm25', domain: 'sensor', deviceClass: 'pm25' },
  { key: 'charging', domain: 'binary_sensor', deviceClass: 'battery_charging' },
  { key: 'power', domain: 'binary_sensor', deviceClass: 'power' },
  { key: 'problem', domain: 'binary_sensor', deviceClass: 'problem' },
];

export type MappedEntities = Record<string, string>;

/**
 * Maps every entity belonging to `deviceId` to a stable key.
 *
 * Most entities carry a `translation_key` set by the integration, which is
 * used directly as the key. A handful of entities rely on their HA
 * `device_class` instead (battery, pm25, charging, power, problem). The
 * device's single `fan` entity is mapped to `fan`, and its single `light`
 * entity to `led` (unless a `led` translation_key already matched).
 */
export function mapEntities(hass: HomeAssistant, deviceId: string): MappedEntities {
  const result: MappedEntities = {};
  const entries: EntityRegistryDisplayEntry[] = Object.values(hass.entities).filter(
    (entry) => entry.device_id === deviceId,
  );

  const fanEntities: string[] = [];
  const lightEntities: string[] = [];

  for (const entry of entries) {
    const domain = entry.entity_id.split('.')[0];
    if (entry.translation_key && !result[entry.translation_key]) {
      result[entry.translation_key] = entry.entity_id;
    }
    if (domain === 'fan') fanEntities.push(entry.entity_id);
    if (domain === 'light') lightEntities.push(entry.entity_id);
  }

  for (const fallback of DEVICE_CLASS_FALLBACKS) {
    if (result[fallback.key]) continue;
    const match = entries.find((entry) => {
      if (entry.entity_id.split('.')[0] !== fallback.domain) return false;
      const state = hass.states[entry.entity_id];
      return state?.attributes.device_class === fallback.deviceClass;
    });
    if (match) result[fallback.key] = match.entity_id;
  }

  if (!result.fan && fanEntities.length === 1) {
    result.fan = fanEntities[0];
  }
  if (!result.led && lightEntities.length === 1) {
    result.led = lightEntities[0];
  }

  return result;
}
