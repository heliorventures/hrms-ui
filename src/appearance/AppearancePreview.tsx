import { appearanceAttributes, appearanceVariables } from './applyAppearance';
import type { AppearancePreferences } from './preferences';
import { useSystemTheme } from './useSystemTheme';

const AppearancePreview = ({ preferences }: { preferences: AppearancePreferences }) => {
  const systemDark = useSystemTheme();
  const dark = preferences.mode === 'dark' || (preferences.mode === 'system' && systemDark);
  return (
    <aside aria-label="Live appearance preview" className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-content-muted">
        Live preview · sample data
      </h2>
      <div
        {...appearanceAttributes(preferences)}
        className={`appearance-preview appearance-scope ${dark ? 'dark' : ''}`}
        style={appearanceVariables(preferences, dark)}
      >
        <div className="preview-shell">
          <div className="preview-navigation" aria-hidden="true">
            HL
            <br />
            <span>Home</span>
            <span>People</span>
            <span>Leave</span>
          </div>
          <div className="min-w-0 flex-1 space-y-3 p-3">
            <h3 className="page-heading">Employee directory</h3>
            <div className="preview-search">Search employees…</div>
            <table className="app-data-table w-full text-left">
              <caption className="sr-only">Sample employee preview</caption>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {['Maya Shah', 'Sara Khan', 'Dev Patel'].map((name) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>People</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="app-button rounded-md bg-accent px-3 py-2 text-content-inverse"
            >
              Sample action
            </button>
            <p className="text-xs text-content-muted">Aa · 0123456789 · ₹37,10,000</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-content-muted">
        Your choices apply after Save. Preferences stay in this browser and do not change company
        settings.
      </p>
    </aside>
  );
};
export default AppearancePreview;
