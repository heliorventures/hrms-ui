const FinanceMessage = ({ messages }: { messages: (string | null | undefined)[] }) => {
  const message = messages.find(Boolean);
  return message ? (
    <p role="alert" className="text-sm text-status-danger">
      {message}
    </p>
  ) : null;
};
export default FinanceMessage;
