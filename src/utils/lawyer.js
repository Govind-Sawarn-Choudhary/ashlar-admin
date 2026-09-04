export function asBool(value) {
  return value === true || value === 1 || value === '1';
}

export function isBarUnverified(lawyer) {
  return !asBool(lawyer.bar_enrollment_verified);
}

export function barStatusLabel(lawyer) {
  if (asBool(lawyer.bar_enrollment_verified)) {
    return 'Auto-verified via UP Bar Council COP portal';
  }

  if (asBool(lawyer.bar_manual_review)) {
    return 'Profile not verified — manual review required';
  }

  if (lawyer.bar_enrollment_number) {
    return 'Enrollment saved — awaiting verification';
  }

  return 'Profile not verified';
}

export function barBadgeType(lawyer) {
  if (asBool(lawyer.bar_enrollment_verified)) {
    return 'bar-auto';
  }

  if (asBool(lawyer.bar_manual_review)) {
    return 'bar-unverified';
  }

  if (lawyer.bar_enrollment_number) {
    return 'bar-pending';
  }

  return 'bar-none';
}

export function formatDay(selectedDay) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const index = Number(selectedDay);
  return days[index] || '—';
}

export function formatSelectedDays(availability) {
  if (!availability) {
    return '—';
  }

  if (asBool(availability.repeat_weekly)) {
    return 'Every day (Mon–Sun)';
  }

  let selectedDays = [];
  if (availability.selected_days) {
    try {
      const parsed = JSON.parse(availability.selected_days);
      if (Array.isArray(parsed)) {
        selectedDays = parsed;
      }
    } catch {
      selectedDays = [];
    }
  }

  if (selectedDays.length === 0 && availability.selected_day !== undefined) {
    selectedDays = [Number(availability.selected_day)];
  }

  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const labels = [...new Set(selectedDays.map((day) => shortDays[Number(day)]).filter(Boolean))];
  return labels.length > 0 ? labels.join(', ') : '—';
}

export function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}
