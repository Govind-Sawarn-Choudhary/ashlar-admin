export function Alert({ type, variant, title, message, children, onRetry }) {
  const alertType = variant || type || 'error';
  const body = message ?? children;

  return (
    <div className={`alert alert-${alertType}`} role="alert">
      <div>
        {title ? <strong>{title}</strong> : null}
        {title && body ? ' — ' : null}
        {body}
      </div>
      {onRetry ? (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="alert alert-success" role="status">
      {message}
    </div>
  );
}
