export function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function formatPhone(phone) {
  if (!phone) {
    return '—';
  }
  return phone.startsWith('+') ? phone : `+91 ${phone}`;
}

export function formatLabel(value) {
  if (!value) {
    return '—';
  }
  return String(value).replace(/_/g, ' ');
}
