/** Inline until `npm run codegen` runs with gateway up (merges payroll subgraph field). */
export const PayslipLogoSignedReadUrlDocument = `
  query PayslipLogoSignedReadUrl($fileStorageId: ID!, $ttlSeconds: Int = 600) {
    payslipLogoSignedReadUrl(fileStorageId: $fileStorageId, ttlSeconds: $ttlSeconds)
  }
`;
