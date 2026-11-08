/** Text exposed to assistive technology, excluding decorative hidden descendants. */
export const accessibleText = (element: HTMLElement): string | null => {
  const copy = element.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
  return copy.textContent;
};
