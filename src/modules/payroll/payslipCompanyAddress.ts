export const PAYSLIP_COMPANY_ADDRESS_MAX_LENGTH = 1000;

export const normalizePayslipCompanyAddress = (value: string): string | null => {
  const address = value.replace(/\r\n?/g, '\n').trim();
  if (!address) return null;
  const characters = Array.from(address);
  if (characters.length > PAYSLIP_COMPANY_ADDRESS_MAX_LENGTH) {
    throw new Error('Company address must be at most 1,000 characters.');
  }
  const hasNonPrintableCharacter = characters.some((character) => {
    const code = character.charCodeAt(0);
    return (code < 32 && code !== 9 && code !== 10) || (code >= 127 && code <= 159);
  });
  if (hasNonPrintableCharacter) {
    throw new Error('Company address contains non-printable characters.');
  }
  return address;
};

export const payslipCompanyAddressText = (value?: string | null): string | null => {
  const address = value?.replace(/\r\n?/g, '\n').trim();
  return address ? `Address: ${address}` : null;
};
