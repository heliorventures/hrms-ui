import { PALETTES, type PaletteId } from './palettes';

const PalettePicker = ({
  value,
  onChange,
}: {
  value: PaletteId;
  onChange: (value: PaletteId) => void;
}) => (
  <fieldset>
    <legend className="mb-2 text-sm font-medium">Accent color</legend>
    <p className="mb-3 text-xs text-content-muted">
      Status colors keep their meaning. Accent shades adapt for readable contrast.
    </p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {PALETTES.map((palette) => (
        <label key={palette.id} className="appearance-palette">
          <input
            type="radio"
            name="accent-palette"
            value={palette.id}
            checked={value === palette.id}
            onChange={() => onChange(palette.id)}
          />
          <span className="flex items-center gap-2" aria-hidden="true">
            <span
              className="size-4 rounded-full"
              style={{ backgroundColor: `rgb(${palette.light})` }}
            />
            <span
              className="size-4 rounded-full"
              style={{ backgroundColor: `rgb(${palette.dark})` }}
            />
          </span>
          <span>{palette.label}</span>
        </label>
      ))}
    </div>
  </fieldset>
);
export default PalettePicker;
