import HelpScreenshot from './HelpScreenshot';
import type { HelpTaskDefinition } from './helpTypes';

const HelpTask = ({ task }: { task: HelpTaskDefinition }) => (
  <details className="rounded-lg border border-line p-3">
    <summary className="cursor-pointer font-medium text-content-primary">{task.title}</summary>
    <div className="mt-3 space-y-3 text-sm">
      {task.prerequisites.length ? (
        <div>
          <h3 className="font-medium">Before you start</h3>
          <ul className="list-disc space-y-1 pl-5">
            {task.prerequisites.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <ol className="list-decimal space-y-3 pl-5">
        {task.steps.map((step) => (
          <li key={step.id}>
            {step.text}
            {step.screenshotId ? <HelpScreenshot id={step.screenshotId} /> : null}
          </li>
        ))}
      </ol>
      {task.requiredFields.length ? (
        <p>
          <strong>Required fields: </strong>
          {task.requiredFields.join('; ')}.
        </p>
      ) : null}
      <p>
        <strong>Outcome: </strong>
        {task.afterSave}
      </p>
      <p>
        <strong>Check status: </strong>
        {task.checkStatus}
      </p>
      <div>
        <h3 className="font-medium">If you need help</h3>
        <ul className="list-disc space-y-1 pl-5">
          {task.recovery.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </div>
    </div>
  </details>
);
export default HelpTask;
