import { describe, expect, it } from 'vitest';
import { hexToRgb, rgbToHex } from './color';

describe('rgbToHex', () => {
  it('formats an RGB triple as a lowercase #rrggbb string', () => {
    expect(rgbToHex([255, 255, 255])).toBe('#ffffff');
    expect(rgbToHex([0, 0, 0])).toBe('#000000');
    expect(rgbToHex([18, 52, 86])).toBe('#123456');
  });
});

describe('hexToRgb', () => {
  it('parses a #rrggbb string into an RGB triple', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    expect(hexToRgb('#123456')).toEqual([18, 52, 86]);
  });

  it('round-trips through rgbToHex', () => {
    const colours: Array<[number, number, number]> = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [128, 64, 32],
    ];
    for (const rgb of colours) {
      expect(hexToRgb(rgbToHex(rgb))).toEqual(rgb);
    }
  });

  it('returns null for malformed input', () => {
    expect(hexToRgb('')).toBeNull();
    expect(hexToRgb('#fff')).toBeNull();
    expect(hexToRgb('not-a-color')).toBeNull();
    expect(hexToRgb('#gggggg')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
  });
});
