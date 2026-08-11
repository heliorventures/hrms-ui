import { UserProfileFull } from '../../../types';
import Card from '../../../components/common/Card';

interface AboutTabProps {
  data: UserProfileFull;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const AboutTab = ({ data }: AboutTabProps) => {
  return (
    <div className="space-y-6">
      <Card title="User Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Display Name</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {data.primaryDetails.displayName || data.primaryDetails.name}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
            <p className="mt-1 text-gray-900 dark:text-white">{data.header.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Department</p>
            <p className="mt-1 text-gray-900 dark:text-white">{data.org.department}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Designation</p>
            <p className="mt-1 text-gray-900 dark:text-white">{data.jobDetail.jobTitlePrimary}</p>
          </div>
        </div>
      </Card>

      <Card title="Education Details">
        {data.education && data.education.length > 0 ? (
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div
                key={edu.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <p className="font-medium text-gray-900 dark:text-white">{edu.degree}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{edu.institution}</p>
                {edu.board && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Board: {edu.board}</p>
                )}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {edu.year} {edu.percentage ? `• ${edu.percentage}` : ''}
                </p>
                {edu.summary && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{edu.summary}</p>
                )}
              </div>
            ))}
            {data.educationSummary && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{data.educationSummary}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Education Details Added.</p>
        )}
      </Card>

      <Card title="Past Experience">
        {data.pastExperience && data.pastExperience.length > 0 ? (
          <div className="space-y-4">
            {data.pastExperience.map((exp) => (
              <div
                key={exp.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <p className="font-medium text-gray-900 dark:text-white">{exp.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{exp.company}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(exp.from)} – {formatDate(exp.to)}
                </p>
                {exp.summary && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{exp.summary}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Past Experience Added.</p>
        )}
      </Card>

      <Card title="Timeline">
        {data.timeline && data.timeline.length > 0 ? (
          <div className="space-y-4">
            {data.timeline.map((event) => (
              <div
                key={event.id}
                className="flex gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex-shrink-0">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                    {event.type === 'designation' && '📌'}
                    {event.type === 'appraisal' && '⭐'}
                    {event.type === 'project' && '📁'}
                    {event.type === 'anniversary' && '🎉'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Timeline Events.</p>
        )}
      </Card>
    </div>
  );
};

export default AboutTab;
