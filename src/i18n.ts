export type Lang = 'en' | 'de';

export interface Strings {
  ui: Record<string, string>;
  enums: Record<string, Record<string, string>>;
}

/**
 * English and German UI strings, plus enum-value labels matching the option
 * keys defined by the klyqa_pet integration (see its strings.json /
 * const.py). These are duplicated here rather than reused because a custom
 * Lovelace card cannot access the integration's own frontend translations.
 */
const STRINGS: Record<Lang, Strings> = {
  en: {
    ui: {
      unavailable: 'Unavailable',
      deviceNotFound: 'Device not found',
      unsupportedDevice: 'Unsupported device',
      noEntities: 'No entities found yet',
      more: 'More',
      heating: 'Heating',
      mode: 'Mode',
      cleanTank: 'Clean tank',
      sewageTank: 'Sewage tank',
      drinkingToday: 'Drinking today',
      totalConsumption: 'Total',
      startDescaling: 'Start descaling',
      stopDescaling: 'Stop descaling',
      bowlRemaining: 'Bowl remaining',
      lastManualFeeding: 'Last manual feeding',
      lastManualPortions: 'portions',
      nextFeeding: 'Next feeding',
      realtimeWeight: 'Real-time weight',
      queryBowlWeight: 'Query bowl weight',
      dispense: 'Dispense',
      feedConfirmTitle: 'Feed {n} portions?',
      feedConfirmConfirm: 'Feed',
      feedConfirmCancel: 'Cancel',
      appLed: 'Indicator LED',
      petLock: 'Pet lock',
      beep: 'Beep',
      power: 'Power',
      fanLevel: 'Fan level',
      preset: 'Preset',
      led: 'LED',
      ledColor: 'LED colour',
      ionizer: 'Ionizer',
      childLock: 'Child lock',
      filterRemaining: 'Filter remaining',
      airQuality: 'Air quality',
      feedingState: 'Feeding state',
      bowlState: 'Bowl state',
      foodBinState: 'Food bin',
      portions: 'Portions',
      days: 'd',
      hours: 'h',
    },
    enums: {
      mode: {
        sensing: 'Sensing',
        fresh_water_24h: '24h fresh water',
        water_change: 'Water change',
        self_wash: 'Self-wash',
        drain: 'Drain water',
      },
      feedingState: {
        idle: 'Idle',
        dispensing: 'Dispensing',
        pet_eating: 'Pet eating',
        dispensing_wet_food: 'Dispensing wet food',
      },
      bowlState: {
        normal: 'Normal',
        overweight: 'Overweight',
        removed: 'Removed',
      },
      foodBinState: {
        low: 'Low',
        sufficient: 'Sufficient',
      },
      lastManualFeeding: {
        started: 'Started',
        succeeded: 'Succeeded',
        failed: 'Failed',
        failed_wet_food: 'Failed (wet food)',
      },
      airQuality: {
        excellent: 'Excellent',
        good: 'Good',
        slightly_polluted: 'Slightly polluted',
        heavily_polluted: 'Heavily polluted',
      },
      presetMode: {
        standalone: 'Standalone',
        auto: 'Auto',
        night: 'Night',
        pet: 'Pet',
      },
    },
  },
  de: {
    ui: {
      unavailable: 'Nicht verfügbar',
      deviceNotFound: 'Gerät nicht gefunden',
      unsupportedDevice: 'Nicht unterstütztes Gerät',
      noEntities: 'Noch keine Entitäten gefunden',
      more: 'Mehr',
      heating: 'Heizung',
      mode: 'Modus',
      cleanTank: 'Frischwassertank',
      sewageTank: 'Abwassertank',
      drinkingToday: 'Heute getrunken',
      totalConsumption: 'Gesamt',
      startDescaling: 'Entkalkung starten',
      stopDescaling: 'Entkalkung stoppen',
      bowlRemaining: 'Napf verbleibend',
      lastManualFeeding: 'Letzte manuelle Fütterung',
      lastManualPortions: 'Portionen',
      nextFeeding: 'Nächste Fütterung',
      realtimeWeight: 'Aktuelles Gewicht',
      queryBowlWeight: 'Napfgewicht abfragen',
      dispense: 'Füttern',
      feedConfirmTitle: '{n} Portionen füttern?',
      feedConfirmConfirm: 'Füttern',
      feedConfirmCancel: 'Abbrechen',
      appLed: 'Status-LED',
      petLock: 'Tiersperre',
      beep: 'Signalton',
      power: 'Betrieb',
      fanLevel: 'Lüfterstufe',
      preset: 'Voreinstellung',
      led: 'LED',
      ledColor: 'LED-Farbe',
      ionizer: 'Ionisator',
      childLock: 'Kindersicherung',
      filterRemaining: 'Filter verbleibend',
      airQuality: 'Luftqualität',
      feedingState: 'Fütterungsstatus',
      bowlState: 'Napfstatus',
      foodBinState: 'Futterbehälter',
      portions: 'Portionen',
      days: 'T',
      hours: 'Std',
    },
    enums: {
      mode: {
        sensing: 'Sensorbetrieb',
        fresh_water_24h: '24h Frischwasser',
        water_change: 'Wasserwechsel',
        self_wash: 'Selbstreinigung',
        drain: 'Wasser ablassen',
      },
      feedingState: {
        idle: 'Bereit',
        dispensing: 'Ausgabe läuft',
        pet_eating: 'Tier frisst',
        dispensing_wet_food: 'Nassfutter-Ausgabe',
      },
      bowlState: {
        normal: 'Normal',
        overweight: 'Übergewicht',
        removed: 'Entfernt',
      },
      foodBinState: {
        low: 'Niedrig',
        sufficient: 'Ausreichend',
      },
      lastManualFeeding: {
        started: 'Gestartet',
        succeeded: 'Erfolgreich',
        failed: 'Fehlgeschlagen',
        failed_wet_food: 'Fehlgeschlagen (Nassfutter)',
      },
      airQuality: {
        excellent: 'Ausgezeichnet',
        good: 'Gut',
        slightly_polluted: 'Leicht belastet',
        heavily_polluted: 'Stark belastet',
      },
      presetMode: {
        standalone: 'Eigenständig',
        auto: 'Automatisch',
        night: 'Nacht',
        pet: 'Tier',
      },
    },
  },
};

/** Resolves the supported language for a given HA locale language code. */
export function resolveLang(language: string | undefined): Lang {
  return language?.toLowerCase().startsWith('de') ? 'de' : 'en';
}

export function t(lang: Lang, key: string): string {
  return STRINGS[lang].ui[key] ?? key;
}

export function tEnum(lang: Lang, category: string, value: string | undefined): string {
  if (value === undefined) return '';
  const table = STRINGS[lang].enums[category];
  if (!table) return value;
  return table[value] ?? value;
}

export function getStrings(lang: Lang): Strings {
  return STRINGS[lang];
}
