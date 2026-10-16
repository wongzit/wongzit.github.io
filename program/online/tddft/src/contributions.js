/** Display convention: 2c² for unlabelled orbitals, c² for A/B spin orbitals.
 * These are independent weights, not renormalized over the printed transitions.
 * The parser's signed coefficient is never modified.
 */
export function contributionPercentage(transition) {
  const coefficient = transition?.coefficient;
  if (typeof coefficient !== 'number' || !Number.isFinite(coefficient)) return null;
  const spinResolved = /\d\s*[AB]\s*$/i.test(String(transition.from ?? ''))
    || /\d\s*[AB]\s*$/i.test(String(transition.to ?? ''))
    || /^(?:alpha|beta|[AB?]→[AB?])$/i.test(String(transition.spin ?? ''));
  const percentage = (spinResolved ? 1 : 2) * coefficient ** 2 * 100;
  return Number.isFinite(percentage) ? percentage : null;
}

const percentFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export function formatContributionPercentage(transition) {
  const percentage = contributionPercentage(transition);
  return percentage === null ? '—' : `${percentFormat.format(percentage)}%`;
}
