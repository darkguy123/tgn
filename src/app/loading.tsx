import PageCarcass from '@/components/PageCarcass';

export default function Loading() {
  return (
    <div className="fb-loader-overlay is-visible" role="status" aria-live="polite" aria-label="Loading page">
      <PageCarcass />
    </div>
  );
}
