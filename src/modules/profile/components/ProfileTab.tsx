import { UserProfileFull } from '../../../types';
import Card from '../../../components/common/Card';

interface ProfileTabProps {
  data: UserProfileFull;
}

const ProfileTab = ({ data }: ProfileTabProps) => {
  const { primaryDetails, identification, addresses, contact, education } = data;

  return (
    <div className="space-y-6">
      <Card title="Primary Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Name</p>
            <p className="mt-1 text-gray-900 dark:text-white">{primaryDetails.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Display Name</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {primaryDetails.displayName || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Gender</p>
            <p className="mt-1 text-gray-900 dark:text-white">{primaryDetails.gender}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Marital Status</p>
            <p className="mt-1 text-gray-900 dark:text-white">{primaryDetails.maritalStatus}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
            <p className="mt-1 text-gray-900 dark:text-white">{primaryDetails.dateOfBirth}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Nationality</p>
            <p className="mt-1 text-gray-900 dark:text-white">{primaryDetails.nationality}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Physically Handicapped
            </p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {primaryDetails.physicallyHandicapped ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Education Summary">
        {education && education.length > 0 ? (
          <div className="space-y-3">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {edu.degree} – {edu.institution}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {edu.year} {edu.percentage ? `• ${edu.percentage}` : ''}{' '}
                  {edu.summary ? `• ${edu.summary}` : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Education Details.</p>
        )}
      </Card>

      <Card title="Identification">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Aadhar</p>
            <p className="mt-1 text-gray-900 dark:text-white">{identification.aadhar || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">PAN</p>
            <p className="mt-1 text-gray-900 dark:text-white">{identification.pan || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Passport</p>
            <p className="mt-1 text-gray-900 dark:text-white">{identification.passport || '-'}</p>
          </div>
        </div>
      </Card>

      <Card title="Address">
        {addresses && addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((addr, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-gray-900 dark:text-white">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {addr.city}, {addr.state} – {addr.pincode}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{addr.country}</p>
                {addr.proofDocument && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Address proof: {addr.proofDocument}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Address Added.</p>
        )}
      </Card>

      <Card title="Contact Details">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Primary Phone</p>
            <p className="mt-1 text-gray-900 dark:text-white">{contact.phone || '-'}</p>
          </div>
          {contact.alternate && (
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Alternate Contact</p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                {contact.alternate.personName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Relation: {contact.alternate.relation} • {contact.alternate.phone}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileTab;
