import { html, type TemplateResult } from 'lit';

/** A labelled toggle switch backed by a native checkbox for accessibility. */
export function renderToggleRow(
  label: string,
  checked: boolean,
  disabled: boolean,
  onToggle: (checked: boolean) => void,
): TemplateResult {
  return html`
    <label class="toggle-row ${disabled ? 'disabled' : ''}">
      <span class="toggle-label">${label}</span>
      <input
        type="checkbox"
        .checked=${checked}
        ?disabled=${disabled}
        @change=${(e: Event): void => onToggle((e.target as HTMLInputElement).checked)}
      />
      <span class="toggle-switch" aria-hidden="true"></span>
    </label>
  `;
}
