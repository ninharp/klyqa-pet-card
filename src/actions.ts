import type { ActionConfig } from './ha-types';

/** Dispatches a bubbling, composed custom event — the pattern the HA frontend listens for. */
function fireEvent(node: HTMLElement, type: string, detail?: Record<string, unknown>): void {
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}

/** Resolves the path `tap_action: navigate` should go to, defaulting to the device's own page. */
export function resolveNavigationPath(config: ActionConfig | undefined, deviceId: string): string {
  return config?.navigation_path || `/config/devices/device/${deviceId}`;
}

/**
 * Runs the configured tap action. Unset or `action: "default"` navigates to the
 * device's detail page — every other action mirrors Home Assistant's own
 * tap_action semantics for the subset this card supports.
 */
export function handleTapAction(
  node: HTMLElement,
  config: ActionConfig | undefined,
  deviceId: string,
  entityId: string | undefined,
): void {
  const action = config?.action ?? 'default';
  switch (action) {
    case 'none':
      return;
    case 'more-info':
      if (entityId) fireEvent(node, 'hass-more-info', { entityId });
      return;
    case 'url':
      if (config?.url_path) window.open(config.url_path, '_blank', 'noopener,noreferrer');
      return;
    case 'navigate':
    case 'default':
    default: {
      const path = resolveNavigationPath(config, deviceId);
      history.pushState(null, '', path);
      fireEvent(node, 'location-changed', { replace: false });
    }
  }
}
