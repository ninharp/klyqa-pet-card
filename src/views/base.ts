import { LitElement } from 'lit';
import type { HassEntity, HomeAssistant } from '../ha-types';
import type { MappedEntities } from '../mapping';
import type { Lang } from '../i18n';

/**
 * Shared behaviour for the per-device view components: entity lookup and
 * service-call dispatch. Views render into the light DOM so they pick up
 * the host card's shared stylesheet without duplicating it.
 */
export abstract class KlyqaPetViewBase extends LitElement {
  declare hass: HomeAssistant;
  declare entities: MappedEntities;
  declare lang: Lang;

  protected createRenderRoot(): this {
    return this;
  }

  protected state(key: string): HassEntity | undefined {
    const entityId = this.entities[key];
    return entityId ? this.hass.states[entityId] : undefined;
  }

  protected stateValue(key: string): string | undefined {
    return this.state(key)?.state;
  }

  protected callService(
    domain: string,
    service: string,
    key: string,
    data: Record<string, unknown> = {},
  ): void {
    const entityId = this.entities[key];
    if (!entityId) return;
    void this.hass.callService(domain, service, { entity_id: entityId, ...data });
  }
}
