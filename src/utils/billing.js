import { formatCurrency } from './format.js';

export function isPerMinuteBooking(item) {
  if (!item) {
    return false;
  }
  const model = item.billingModel || item.billing_model;
  return model === 'per_minute';
}

export function formatBillingModel(item) {
  return isPerMinuteBooking(item) ? 'Per minute' : 'Prepaid';
}

export function formatBookingPricing(item) {
  if (!item) {
    return '—';
  }
  if (isPerMinuteBooking(item)) {
    const rate = item.ratePerMinute ?? item.rate_per_minute ?? 0;
    const max = item.durationMinutes ? ` · max ${item.durationMinutes} min` : '';
    return `₹${Number(rate).toLocaleString('en-IN')}/min${max}`;
  }
  return formatCurrency(item.amount);
}

export function formatMeteredSummary(item) {
  if (!isPerMinuteBooking(item)) {
    return formatCurrency(item.amount);
  }
  const rate = item.ratePerMinute ?? item.rate_per_minute ?? 0;
  const billed = item.billedMinutes ?? item.billed_minutes ?? 0;
  const charged =
    item.meteredCharged != null ? item.meteredCharged : billed * Number(rate);
  if (billed > 0) {
    return `${billed} min · ${formatCurrency(charged)}`;
  }
  return formatBookingPricing(item);
}

export function formatConsultationFeeAdmin(fee) {
  if (!fee) {
    return '—';
  }
  const type = fee.fee_type || fee.feeType;
  if (type === 'physical') {
    return `₹${fee.amount} per session`;
  }
  const label = fee.duration_label || fee.durationLabel;
  return `₹${fee.amount}/min${label ? ` · max ${label}` : ''}`;
}