import { ConfigService } from '@nestjs/config';

export function formatMessage(
  template: string,
  params: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] || `{${key}}`);
}

export function generateParams(
  scheduledStart: Date,
  treatments: any[] = [],
  type: string,
  confingService: ConfigService,
  appointmentId?: number,
  customer?: { name?: string; phone?: string },
): Record<string, string> {
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    timeZone: confingService.get('google.timeZone'),
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: confingService.get('google.timeZone'),
  };

  const correctedDate = new Date(scheduledStart);
  const formattedDay =
    correctedDate.toLocaleDateString('es-ES', dateOptions) || 'Undefined day';
  const month =
    correctedDate.toLocaleString('es-ES', { month: 'long' }) ||
    'Undefined month';
  const formattedTime =
    correctedDate.toLocaleTimeString('es-ES', timeOptions) || 'Undefined hour';

  const params: Record<string, string> = {
    day: formattedDay.split(' ')[0] || 'Day',
    month: month.charAt(0).toUpperCase() + month.slice(1),
    hour: formattedTime,
    service:
      treatments.length > 0
        ? treatments.map((t) => t.name).join(', ')
        : 'Undefined service',
    id: appointmentId ? appointmentId.toString() : 'undefined',
  };

  if (type === 'appointment_reminder' || type === 'appointment_canceled') {
    params['name'] = customer?.name || 'Customer';
    params['phone'] = customer?.phone || 'Unavailable phone';
  }

  if (type === 'appointment_canceled') {
    params['url'] = confingService.get('google.timeZone');
  }

  return params;
}
