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

  const formattedDay = correctedDate.toLocaleDateString('es-ES', dateOptions) || 'Día no definido';
  const formattedTime = correctedDate.toLocaleTimeString('es-ES', timeOptions) || 'Hora no definida';

  const params: Record<string, string> = {
    day: formattedDay.split(' ')[0] || 'Día',
    month: formattedDay.split(' ')[1] || 'Mes',
    hour: formattedTime,
    service: treatments.length > 0 ? treatments.map(t => t.name).join(', ') : 'Servicio no definido',
  };

  if (type === "appointment_reminder" || type === "appointment_canceled") {
    params["name"] = customer?.name || 'Cliente';
    params["phone"] = customer?.phone || 'Teléfono no disponible';
  }

  if (type === "appointment_canceled") {
    params["url"] = "https://mindticas2025-front-git-development-michelada-interns.vercel.app/"; //URL development
  }

  return params;
}
