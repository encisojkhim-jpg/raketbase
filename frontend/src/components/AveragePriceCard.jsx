import { formatPeso } from '../utils/ratings';

// Average price (freelancer) or average budget (client), shown on profiles.
// price = { average, contracts }: the average agreed amount over their COMPLETED contracts.
export default function AveragePriceCard({ role, price, className = '' }) {
  const isFreelancer = role === 'freelancer';
  const contracts = price?.contracts || 0;
  const hasData = contracts > 0 && price?.average != null;

  return (
    <div className={`rounded-lg border border-border bg-panel p-4 text-center ${className}`}>
      <p className="text-[12px] uppercase tracking-wider text-text-secondary">
        {isFreelancer ? 'Average rate' : 'Average budget'}
      </p>
      {/* font-sans, not font-display: Space Grotesk has no peso sign glyph */}
      <p className="mt-1 font-sans text-2xl font-semibold text-accent">{hasData ? formatPeso(price.average) : '—'}</p>
      <p className="mt-1 text-[12px] text-text-secondary">
        {hasData
          ? `Across ${contracts} completed contract${contracts === 1 ? '' : 's'}`
          : 'No completed contracts yet'}
      </p>
    </div>
  );
}
