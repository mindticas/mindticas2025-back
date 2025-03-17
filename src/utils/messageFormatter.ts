export function formatMessage(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] || `{${key}}`);
}

export function generateParams(
  scheduledStart: Date,
  treatments: any[] = [],
  type: string,
  customer?: { name?: string; phone?: string }
): Record<string, string> {
  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

  const correctedDate = new Date(scheduledStart);
  correctedDate.setHours(correctedDate.getHours() + 6); //6 hours difference

  const formattedDay = correctedDate.toLocaleDateString('es-ES', dateOptions) || 'Undefined day';
  const month = correctedDate.toLocaleString('es-ES', { month: 'long' }) || 'Undefined month';
  const formattedTime = correctedDate.toLocaleTimeString('es-ES', timeOptions) || 'Undefined hour';

  const params: Record<string, string> = {
    day: formattedDay.split(' ')[0] || 'Day',
    month: month.charAt(0).toUpperCase() + month.slice(1),
    hour: formattedTime,
    service: treatments.length > 0 ? treatments.map(t => t.name).join(', ') : 'Undefined service',
  };

  if (type === "appointment_reminder" || type === "appointment_canceled") {
    params["name"] = customer?.name || 'Customer';
    params["phone"] = customer?.phone || 'Unavailable phone';
  }

  if (type === "appointment_canceled") {
    params["url"] = "https://mindticas2025-front-git-development-michelada-interns.vercel.app/"; //URL development
  }

  return params;
}
