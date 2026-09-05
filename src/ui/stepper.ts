import { html, type TemplateResult } from 'lit';

/** A minus/value/plus stepper for number entities. */
export function renderStepper(
  value: number,
  min: number,
  max: number,
  step: number,
  onChange: (value: number) => void,
): TemplateResult {
  const dec = (): void => onChange(Math.max(min, roundToStep(value - step, step)));
  const inc = (): void => onChange(Math.min(max, roundToStep(value + step, step)));
  return html`
    <div class="stepper">
      <button
        type="button"
        class="stepper-btn"
        aria-label="decrease"
        ?disabled=${value <= min}
        @click=${dec}
      >
        −
      </button>
      <span class="stepper-value">${value}</span>
      <button
        type="button"
        class="stepper-btn"
        aria-label="increase"
        ?disabled=${value >= max}
        @click=${inc}
      >
        +
      </button>
    </div>
  `;
}

function roundToStep(value: number, step: number): number {
  if (!step) return value;
  return Math.round(value / step) * step;
}
