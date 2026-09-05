import { describe, expect, it } from 'vitest';
import { detectDeviceType, mapEntities } from './mapping';
import type { HomeAssistant } from './ha-types';

function makeHass(overrides: Partial<HomeAssistant> = {}): HomeAssistant {
  return {
    states: {},
    entities: {},
    devices: {},
    locale: { language: 'en' },
    callService: async () => {},
    ...overrides,
  };
}

describe('detectDeviceType', () => {
  it('detects welly from @klyqa.welly', () => {
    expect(detectDeviceType('@klyqa.welly')).toBe('welly');
  });

  it('detects welly from @klyqa.welly-dev', () => {
    expect(detectDeviceType('@klyqa.welly-dev')).toBe('welly');
  });

  it('detects welly from @pfriendly.water-fountain variants', () => {
    expect(detectDeviceType('@pfriendly.water-fountain-pro')).toBe('welly');
  });

  it('detects foody from @klyqa.foody* and @pfriendly.foody*', () => {
    expect(detectDeviceType('@klyqa.foody2')).toBe('foody');
    expect(detectDeviceType('@pfriendly.foody-mini')).toBe('foody');
  });

  it('detects airpurifier from @klyqa.airpurifier2* and @pfriendly.airpurifier*', () => {
    expect(detectDeviceType('@klyqa.airpurifier2')).toBe('airpurifier');
    expect(detectDeviceType('@pfriendly.airpurifier')).toBe('airpurifier');
  });

  it('returns null for unknown or missing model ids', () => {
    expect(detectDeviceType('@klyqa.something-else')).toBeNull();
    expect(detectDeviceType(undefined)).toBeNull();
    expect(detectDeviceType(null)).toBeNull();
  });
});

describe('mapEntities', () => {
  it('maps entities by translation_key', () => {
    const hass = makeHass({
      entities: {
        'select.welly_mode': {
          entity_id: 'select.welly_mode',
          device_id: 'dev1',
          platform: 'klyqa_pet',
          translation_key: 'mode',
        },
        'sensor.welly_water_temperature': {
          entity_id: 'sensor.welly_water_temperature',
          device_id: 'dev1',
          platform: 'klyqa_pet',
          translation_key: 'water_temperature',
        },
      },
      states: {
        'select.welly_mode': { entity_id: 'select.welly_mode', state: 'sensing', attributes: {}, last_changed: '', last_updated: '' },
        'sensor.welly_water_temperature': { entity_id: 'sensor.welly_water_temperature', state: '22', attributes: {}, last_changed: '', last_updated: '' },
      },
    });

    const mapped = mapEntities(hass, 'dev1');
    expect(mapped.mode).toBe('select.welly_mode');
    expect(mapped.water_temperature).toBe('sensor.welly_water_temperature');
  });

  it('ignores entities belonging to other devices', () => {
    const hass = makeHass({
      entities: {
        'sensor.other_battery': {
          entity_id: 'sensor.other_battery',
          device_id: 'dev2',
          platform: 'klyqa_pet',
          translation_key: 'battery',
        },
      },
    });
    const mapped = mapEntities(hass, 'dev1');
    expect(mapped).toEqual({});
  });

  it('falls back to device_class for battery/pm25/charging/power/problem', () => {
    const hass = makeHass({
      entities: {
        'sensor.foody_battery': {
          entity_id: 'sensor.foody_battery',
          device_id: 'dev1',
          platform: 'klyqa_pet',
        },
        'binary_sensor.foody_charging': {
          entity_id: 'binary_sensor.foody_charging',
          device_id: 'dev1',
          platform: 'klyqa_pet',
        },
        'binary_sensor.foody_problem': {
          entity_id: 'binary_sensor.foody_problem',
          device_id: 'dev1',
          platform: 'klyqa_pet',
        },
        'sensor.air_pm25': {
          entity_id: 'sensor.air_pm25',
          device_id: 'dev1',
          platform: 'klyqa_pet',
        },
        'binary_sensor.air_power': {
          entity_id: 'binary_sensor.air_power',
          device_id: 'dev1',
          platform: 'klyqa_pet',
        },
      },
      states: {
        'sensor.foody_battery': { entity_id: 'sensor.foody_battery', state: '80', attributes: { device_class: 'battery' }, last_changed: '', last_updated: '' },
        'binary_sensor.foody_charging': { entity_id: 'binary_sensor.foody_charging', state: 'on', attributes: { device_class: 'battery_charging' }, last_changed: '', last_updated: '' },
        'binary_sensor.foody_problem': { entity_id: 'binary_sensor.foody_problem', state: 'off', attributes: { device_class: 'problem' }, last_changed: '', last_updated: '' },
        'sensor.air_pm25': { entity_id: 'sensor.air_pm25', state: '12', attributes: { device_class: 'pm25' }, last_changed: '', last_updated: '' },
        'binary_sensor.air_power': { entity_id: 'binary_sensor.air_power', state: 'on', attributes: { device_class: 'power' }, last_changed: '', last_updated: '' },
      },
    });

    const mapped = mapEntities(hass, 'dev1');
    expect(mapped.battery).toBe('sensor.foody_battery');
    expect(mapped.charging).toBe('binary_sensor.foody_charging');
    expect(mapped.problem).toBe('binary_sensor.foody_problem');
    expect(mapped.pm25).toBe('sensor.air_pm25');
    expect(mapped.power).toBe('binary_sensor.air_power');
  });

  it('maps the single fan entity to "fan" and single light entity to "led"', () => {
    const hass = makeHass({
      entities: {
        'fan.air_purifier': {
          entity_id: 'fan.air_purifier',
          device_id: 'dev1',
          platform: 'klyqa_pet',
        },
        'light.air_led': {
          entity_id: 'light.air_led',
          device_id: 'dev1',
          platform: 'klyqa_pet',
        },
      },
    });
    const mapped = mapEntities(hass, 'dev1');
    expect(mapped.fan).toBe('fan.air_purifier');
    expect(mapped.led).toBe('light.air_led');
  });

  it('prefers an explicit led translation_key over the fan/light fallback', () => {
    const hass = makeHass({
      entities: {
        'light.air_led': {
          entity_id: 'light.air_led',
          device_id: 'dev1',
          platform: 'klyqa_pet',
          translation_key: 'led',
        },
      },
    });
    const mapped = mapEntities(hass, 'dev1');
    expect(mapped.led).toBe('light.air_led');
  });
});
