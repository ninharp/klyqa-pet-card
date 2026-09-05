import { css } from 'lit';

/**
 * Shared styling for the card shell and its per-device views. Relies only
 * on Home Assistant CSS custom properties (with sane fallbacks) so the card
 * follows the active theme, light or dark.
 */
export const sharedStyles = css`
  :host {
    display: block;
  }

  .card {
    background: var(--card-background-color, #fff);
    border-radius: var(--ha-card-border-radius, 12px);
    color: var(--primary-text-color, #212121);
    padding: 16px;
    box-sizing: border-box;
    container-type: inline-size;
  }

  .frame {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @container (min-width: 480px) {
    .frame.with-image {
      grid-template-columns: 40% 1fr;
      align-items: start;
    }
  }

  .image-column img,
  .image-column svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 8px;
  }

  .header-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .name {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .subtitle {
    font-size: 0.85rem;
    color: var(--secondary-text-color, #727272);
    margin: 0;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .badge.unavailable {
    background: var(--error-color, #db4437);
    color: #fff;
  }

  .chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 4px 0;
  }

  .chip {
    border: 1px solid var(--divider-color, #e0e0e0);
    background: transparent;
    color: var(--primary-text-color, #212121);
    border-radius: 999px;
    padding: 4px 12px;
    font-size: 0.8rem;
    cursor: pointer;
    font: inherit;
  }

  .chip.active {
    background: var(--primary-color, #03a9f4);
    border-color: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }

  .chip:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .primary-value {
    font-size: 2.2rem;
    font-weight: 600;
    line-height: 1.1;
  }

  .primary-value .unit {
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--secondary-text-color, #727272);
    margin-left: 4px;
  }

  .secondary-line {
    font-size: 0.85rem;
    color: var(--secondary-text-color, #727272);
  }

  .section {
    margin-top: 14px;
  }

  .section-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color, #727272);
    margin: 0 0 6px;
  }

  .bar-row {
    margin-bottom: 8px;
  }

  .bar-row-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    margin-bottom: 2px;
  }

  .bar-track {
    height: 8px;
    border-radius: 4px;
    background: var(--divider-color, #e0e0e0);
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--primary-color, #03a9f4);
    border-radius: 4px;
    transition: width 0.2s ease;
  }

  .stepper {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .stepper-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--divider-color, #e0e0e0);
    background: transparent;
    color: var(--primary-text-color, #212121);
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
  }

  .stepper-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .stepper-value {
    min-width: 2.5em;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
    cursor: pointer;
  }

  .toggle-row.disabled {
    opacity: 0.5;
    cursor: default;
  }

  .toggle-row input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 20px;
    border-radius: 999px;
    background: var(--divider-color, #e0e0e0);
    transition: background 0.15s ease;
    flex-shrink: 0;
  }

  .toggle-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.15s ease;
  }

  .toggle-row input[type='checkbox']:checked + .toggle-switch {
    background: var(--primary-color, #03a9f4);
  }

  .toggle-row input[type='checkbox']:checked + .toggle-switch::after {
    transform: translateX(14px);
  }

  .rows {
    display: flex;
    flex-direction: column;
  }

  .error-card {
    background: var(--card-background-color, #fff);
    border-radius: var(--ha-card-border-radius, 12px);
    color: var(--secondary-text-color, #727272);
    padding: 16px;
    text-align: center;
  }

  .overflow-menu {
    position: relative;
  }

  .overflow-toggle {
    border: none;
    background: transparent;
    color: var(--secondary-text-color, #727272);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px 8px;
  }

  .overflow-panel {
    position: absolute;
    right: 0;
    top: 100%;
    z-index: 1;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    min-width: 160px;
    padding: 4px 0;
  }

  .overflow-panel button {
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    color: var(--primary-text-color, #212121);
    padding: 8px 12px;
    font: inherit;
    cursor: pointer;
  }

  .overflow-panel button:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
  }

  dialog.confirm-dialog {
    border: none;
    border-radius: 12px;
    padding: 20px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
    max-width: 280px;
  }

  dialog.confirm-dialog[open] {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }

  dialog.confirm-dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }

  .confirm-actions button {
    border: none;
    background: transparent;
    color: var(--primary-color, #03a9f4);
    font: inherit;
    font-weight: 500;
    padding: 6px 10px;
    cursor: pointer;
    border-radius: 6px;
  }

  input[type='color'] {
    width: 32px;
    height: 32px;
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;
  }
`;
