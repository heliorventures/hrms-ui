interface AccessibleNameValues {
  label?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

const nonBlank = (value: string | undefined) => Boolean(value?.trim());

export const requireAccessibleName = (
  componentName: string,
  { label, ariaLabel, ariaLabelledBy }: AccessibleNameValues
) => {
  const visibleLabel = label?.trim();
  if (visibleLabel || nonBlank(ariaLabel) || nonBlank(ariaLabelledBy)) {
    return visibleLabel || undefined;
  }

  throw new Error(
    `${componentName} requires a non-blank accessible name through label, aria-label, or aria-labelledby.`
  );
};
