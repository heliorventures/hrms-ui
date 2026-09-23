export const PALETTES = [
  { id: 'indigo', label: 'Helior Indigo', light: '79 70 229', dark: '165 180 252' },
  { id: 'zinc', label: 'Zinc', light: '82 82 91', dark: '212 212 216' },
  { id: 'slate', label: 'Slate', light: '71 85 105', dark: '203 213 225' },
  { id: 'stone', label: 'Stone', light: '87 83 78', dark: '214 211 209' },
  { id: 'gray', label: 'Gray', light: '75 85 99', dark: '209 213 219' },
  { id: 'red', label: 'Red', light: '185 28 28', dark: '252 165 165' },
  { id: 'orange', label: 'Orange', light: '194 65 12', dark: '253 186 116' },
  { id: 'amber', label: 'Amber', light: '146 64 14', dark: '252 211 77' },
  { id: 'yellow', label: 'Yellow', light: '133 77 14', dark: '253 224 71' },
  { id: 'lime', label: 'Lime', light: '63 98 18', dark: '190 242 100' },
  { id: 'green', label: 'Green', light: '21 128 61', dark: '134 239 172' },
  { id: 'emerald', label: 'Emerald', light: '4 120 87', dark: '110 231 183' },
  { id: 'teal', label: 'Teal', light: '15 118 110', dark: '94 234 212' },
  { id: 'cyan', label: 'Cyan', light: '14 116 144', dark: '103 232 249' },
  { id: 'blue', label: 'Blue', light: '29 78 216', dark: '147 197 253' },
  { id: 'violet', label: 'Violet', light: '109 40 217', dark: '196 181 253' },
  { id: 'purple', label: 'Purple', light: '126 34 206', dark: '216 180 254' },
  { id: 'rose', label: 'Rose', light: '190 18 60', dark: '253 164 175' },
] as const;

export type PaletteId = (typeof PALETTES)[number]['id'];
