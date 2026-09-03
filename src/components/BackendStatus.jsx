import { useEffect, useState } from 'react';
import { checkBackendHealth } from '../api/client.js';

export function BackendStatus() {
  const [status, setStatus] = useState({ online: null, message: 'Checking backend…' });

  useEffect(() => {
    let active = true;

    async function poll() {
      const next = await checkBackendHealth();
      if (active) {
        setStatus(next);
      }
    }

    poll();
    const timer = setInterval(poll, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (status.online === null) {
    return <span className="status-pill status-pill-neutral">Checking…</span>;
  }

  return (
    <span
      className={`status-pill ${status.online ? 'status-pill-online' : 'status-pill-offline'}`}
      title={status.message}
    >
      {status.online ? 'Backend online' : 'Backend offline'}
    </span>
  );
}
