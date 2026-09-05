import { html, type TemplateResult } from 'lit';

export interface ChipOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** A row of selectable pill buttons; the option matching `activeValue` is highlighted. */
export function renderChips(
  options: ChipOption[],
  activeValue: string | undefined,
  onSelect: (value: string) => void,
): TemplateResult {
  return html`
    <div class="chips-row">
      ${options.map(
        (opt) => html`
          <button
            type="button"
            class="chip ${opt.value === activeValue ? 'active' : ''}"
            ?disabled=${opt.disabled}
            @click=${() => onSelect(opt.value)}
          >
            ${opt.label}
          </button>
        `,
      )}
    </div>
  `;
}
