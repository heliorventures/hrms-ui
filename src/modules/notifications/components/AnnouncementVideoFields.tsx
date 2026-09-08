import { useId } from 'react';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

export interface AnnouncementVideoValue {
  videoMode: 'KEEP' | 'NONE' | 'LINK' | 'UPLOAD';
  videoLink: string;
  videoFile: File | null;
}

const AnnouncementVideoFields = ({
  value,
  change,
  disabled,
  progress,
  cancelUpload,
  allowKeep = false,
}: {
  value: AnnouncementVideoValue;
  change: (values: Partial<AnnouncementVideoValue>) => void;
  disabled: boolean;
  progress: number | null;
  cancelUpload: () => void;
  allowKeep?: boolean;
}) => {
  const fileId = useId();
  return (
    <fieldset className="space-y-3 rounded-lg border border-line p-3">
      <legend className="px-1 text-sm font-medium">Video (optional)</legend>
      <div className="flex flex-wrap gap-4 text-sm">
        {(['KEEP', 'NONE', 'LINK', 'UPLOAD'] as const)
          .filter((mode) => mode !== 'KEEP' || allowKeep)
          .map((mode) => (
            <label key={mode} className="flex items-center gap-2">
              <input
                type="radio"
                name={fileId}
                value={mode}
                checked={value.videoMode === mode}
                disabled={disabled}
                onChange={() => change({ videoMode: mode })}
              />
              {
                {
                  KEEP: 'Keep current video',
                  NONE: 'No video',
                  LINK: 'Video link',
                  UPLOAD: 'Upload video',
                }[mode]
              }
            </label>
          ))}
      </div>
      {value.videoMode === 'LINK' && (
        <Input
          label="Video URL"
          type="url"
          value={value.videoLink}
          disabled={disabled}
          required
          placeholder="https://…"
          onChange={(event) => change({ videoLink: event.target.value })}
          description="Opens in a new tab."
        />
      )}
      {value.videoMode === 'UPLOAD' && (
        <div className="space-y-1">
          <label htmlFor={fileId} className="block text-sm font-medium">
            Video file
          </label>
          <input
            id={fileId}
            type="file"
            accept="video/mp4,video/webm"
            disabled={disabled}
            onChange={(event) => change({ videoFile: event.target.files?.[0] ?? null })}
            className="block w-full text-sm"
          />
          <p className="text-xs text-content-secondary">
            MP4 or WebM · up to 50 MB · plays inside the app
          </p>
        </div>
      )}
      {progress !== null && (
        <div className="flex items-center gap-3">
          <progress
            aria-label="Video upload progress"
            value={progress}
            max="100"
            className="min-w-0 flex-1"
          />
          <span className="text-sm" role="status">
            {progress}%
          </span>
          <Button type="button" size="sm" variant="outline" onClick={cancelUpload}>
            Cancel upload
          </Button>
        </div>
      )}
    </fieldset>
  );
};

export default AnnouncementVideoFields;
