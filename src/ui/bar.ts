import { html, type TemplateResult } from 'lit';

/** A labelled horizontal bar, e.g. for tank fill levels. Visual only. */
export function renderBar(
  label: string,
  valueLabel: string,
  percent: number,
  color?: string,
): TemplateResult {
  const style = color ? `width:${percent}%;background:${color}` : `width:${percent}%`;
  return html`
    <div class="bar-row">
      <div class="bar-row-header">
        <span class="bar-label">${label}</span>
        <span class="bar-value">${valueLabel}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style=${style}></div>
      </div>
    </div>
  `;
}
