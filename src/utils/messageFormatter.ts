import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';

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
  configService: ConfigService,
  appointmentId?: number,
  customer?: { name?: string; phone?: string },
): Record<string, string> {
  const timeZone = configService.get('google.timeZone') || 'UTC';

  const dt = DateTime.fromJSDate(scheduledStart)
    .setZone(timeZone)
    .setLocale('es');

  const formattedDay = dt.toFormat('d');
  const month = dt.toFormat('LLLL');
  const formattedTime = dt.toFormat('hh:mm a');

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
    params['url'] = configService.get('google.timeZone');
  }

  return params;
}
