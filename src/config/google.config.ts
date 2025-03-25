import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  projectId: process.env.GOOGLE_PROJECT_ID,
  redirectURI: process.env.GOOGLE_REDIRECT_URI,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
}));
