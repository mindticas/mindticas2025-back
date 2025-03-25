import { google } from 'googleapis';
import * as readline from 'readline';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import googleConfig from '../config/google.config';

dotenv.config();

const config = googleConfig();

const oAuth2Client = new google.auth.OAuth2(
  config.clientId,
  config.clientSecret,
  config.redirectURI,
);

const SCOPES = [config.googleScope];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log(
  '\n\uD83D\uDD17 Open this link in your browser to authorize the application:',
);
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  '\n\u270F\uFE0F Enter the authorization code here: ',
  async (code) => {
    rl.close();

    try {
      const { tokens } = await oAuth2Client.getToken(code);

      if (!tokens.refresh_token) {
        console.error(
          '\nToken not received,Remove access on Google Accounts and try again',
        );
        process.exit(1);
      }

      console.log(
        '\n\u2705 Refresh Token obtained successfully: ',
        tokens.refresh_token,
      );

      const envFilePath = '.env';
      let envConfig = fs.readFileSync(envFilePath, 'utf8');

      if (envConfig.includes('GOOGLE_REFRESH_TOKEN=')) {
        envConfig = envConfig.replace(
          /GOOGLE_REFRESH_TOKEN=.*/,
          `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`,
        );
      } else {
        envConfig += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`;
      }

      fs.writeFileSync(envFilePath, envConfig);

      console.log('\n\uD83D\uDD04 Refresh Token saved in the .env file');
    } catch (error) {
      console.error('\n\u274C Error getting token: ', error.message);
      process.exit(1);
    }
  },
);
