import Button from '../components/common/Button';

interface Props {
  dirty: boolean;
  onReset: () => void;
  onCancel: () => void;
  onSave: () => void;
}
const PreferenceActions = ({ dirty, onReset, onCancel, onSave }: Props) => (
  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-subtle pt-3">
    <Button
      variant="quiet"
      size="sm"
      onClick={onReset}
      data-tour-anchor="appearance-reset-defaults"
    >
      Reset defaults
    </Button>
    <div className="ml-auto flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
        data-tour-anchor="appearance-cancel-preview"
      >
        Cancel
      </Button>
      <Button
        size="sm"
        disabled={!dirty}
        onClick={onSave}
        data-tour-anchor="appearance-save"
      >
        Save preferences
      </Button>
    </div>
  </div>
);
export default PreferenceActions;
