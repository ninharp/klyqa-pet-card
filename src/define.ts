/**
 * Registers a custom element, skipping the call if the name is already taken.
 *
 * Home Assistant keeps loaded dashboard modules alive for the life of the page, so
 * bumping the `?v=` query of the Lovelace resource while a dashboard is open loads a
 * second copy of this bundle into the same registry. A bare `customElements.define`
 * then throws and the card stops rendering until a full reload. Skipping the repeat
 * registration leaves the already-registered class in place — the new one takes over
 * on the next page load, which is when the browser drops the old module anyway.
 */
export function defineElement(name: string, constructor: CustomElementConstructor): void {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}
