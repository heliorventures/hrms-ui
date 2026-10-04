import { toUserMessage } from '../../utils/graphqlUserMessage';

/** Only locally authored validation messages can bypass the server error filter. */
export class TaxFormError extends Error {
  constructor(readonly publicMessage: string) {
    super(publicMessage);
  }
}
export const taxFormErrorMessage = (cause: unknown) =>
  cause instanceof TaxFormError ? cause.publicMessage : toUserMessage(cause);
