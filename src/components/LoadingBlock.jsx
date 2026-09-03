export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="loading-block">
      <div className="loading-spinner" aria-hidden="true" />
      <p className="muted">{label}</p>
    </div>
  );
}
