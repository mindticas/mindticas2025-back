import { registerAs } from '@nestjs/config';

export default registerAs('whapi', () => ({
  url: process.env.WHAAPI_URL,
  token: process.env.WHAAPI_TOKEN,
  channelId: process.env.WHAAPI_CHANNEL_ID,
}));
