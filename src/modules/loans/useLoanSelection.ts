import { useSearchParams } from 'react-router-dom';

/** Shareable account selection; authorization remains enforced by the detail API. */
export function useLoanSelection() {
  const [parameters, setParameters] = useSearchParams();
  const selected = parameters.get('loan') || null;
  const select = (id: string | null) =>
    setParameters((current) => {
      const next = new URLSearchParams(current);
      if (id) next.set('loan', id);
      else next.delete('loan');
      return next;
    });
  return [selected, select] as const;
}
