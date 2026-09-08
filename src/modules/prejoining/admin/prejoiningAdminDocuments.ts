export const PrejoiningAdminBootstrapDocument = `
  query PrejoiningAdminBootstrap {
    prejoiningConfig
    prejoiningFieldCatalog
    prejoiningDocumentTypes
  }
`;

export const PrejoiningCandidatesAdminDocument = `
  query PrejoiningCandidatesAdmin($offset: Int!, $limit: Int!, $status: String) {
    prejoiningCandidates(offset: $offset, limit: $limit, status: $status) {
      total
      nodes { id email status revision config answers feedback documents expiresAt employeeId createdAt updatedAt }
    }
  }
`;

export const PrejoiningCandidateAdminDocument = `
  query PrejoiningCandidateAdmin($id: ID!) {
    prejoiningCandidate(id: $id) { id email status revision config answers feedback documents expiresAt employeeId createdAt updatedAt }
  }
`;

export const PrejoiningConversionDirectoryDocument = `
  query PrejoiningConversionDirectory($managerSearch: String, $managerOffset: Int) {
    prejoiningConversionOptions(managerSearch: $managerSearch, managerOffset: $managerOffset)
  }
`;

export const SavePrejoiningConfigAdminDocument = `mutation SavePrejoiningConfigAdmin($config: JSON!) { savePrejoiningConfig(config: $config) }`;
export const PrejoiningInviteAdminDocument = `mutation PrejoiningInviteAdmin($email: String!, $sendEmail: Boolean!) { invitePrejoining(email: $email, sendEmail: $sendEmail) { candidate { id email status revision config answers feedback documents expiresAt employeeId createdAt updatedAt } privateUrl emailStatus emailError } }`;
export const PrejoiningReissueAdminDocument = `mutation PrejoiningReissueAdmin($id: ID!, $revision: Int!, $sendEmail: Boolean!) { reissuePrejoining(id: $id, revision: $revision, sendEmail: $sendEmail) { candidate { id email status revision config answers feedback documents expiresAt employeeId createdAt updatedAt } privateUrl emailStatus emailError } }`;
export const PrejoiningRequestChangesAdminDocument = `mutation PrejoiningRequestChangesAdmin($id: ID!, $revision: Int!, $feedback: String!) { requestPrejoiningChanges(id: $id, revision: $revision, feedback: $feedback) { id email status revision config answers feedback documents expiresAt employeeId createdAt updatedAt } }`;
export const PrejoiningApproveAdminDocument = `mutation PrejoiningApproveAdmin($id: ID!, $revision: Int!) { approvePrejoining(id: $id, revision: $revision) { id email status revision config answers feedback documents expiresAt employeeId createdAt updatedAt } }`;
export const PrejoiningCancelAdminDocument = `mutation PrejoiningCancelAdmin($id: ID!, $revision: Int!) { cancelPrejoining(id: $id, revision: $revision) { id email status revision config answers feedback documents expiresAt employeeId createdAt updatedAt } }`;
export const PrejoiningConfirmJoinedAdminDocument = `mutation PrejoiningConfirmJoinedAdmin($input: ConfirmPrejoiningInput!) { confirmPrejoiningJoined(input: $input) { id email status revision config answers feedback documents expiresAt employeeId createdAt updatedAt } }`;
export const PrejoiningDocumentAdminDocument = `query PrejoiningDocumentAdmin($candidateId: ID!, $documentId: ID!) { prejoiningDocument(candidateId: $candidateId, documentId: $documentId) { filename mimeType base64Content } }`;
