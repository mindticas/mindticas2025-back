import { Controller, Logger, Get, Res, Query } from '@nestjs/common';
import { GoogleCalendarService, GoogleTokenService } from '../services/index';
import { Response } from 'express';

@Controller('google-calendar')
export default class GoogleCalendarController {
  private readonly logger = new Logger(GoogleCalendarController.name);

  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly googleTokenService: GoogleTokenService,
  ) {}
  @Get('sync')
  async syncGoogleAccount(@Res() res: Response) {
    try {
      const authUrl = await this.googleCalendarService.getAuthUrl();

      return res.redirect(authUrl);
    } catch (error) {
      this.logger.error(`Error generating auth URL: ${error.message}`);

      return res.status(500).send(`
        <html><body>
          <h1>Error</h1>
          <p>No se pudo iniciar la autenticación con Google.</p>
        </body></html>
      `);
    }
  }

  @Get('oauth2callback')
  async handleOAuthCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const ACCOUNT_ID = 'Elegangsters Barbershop';
      const refreshToken = await this.googleCalendarService.getRefreshToken(
        code,
      );
      this.googleTokenService.saveToken(ACCOUNT_ID, refreshToken);
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Autenticación Exitosa</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
              .success { color: #2ecc71; font-size: 1.5rem; margin-bottom: 1rem; }
              .message { color: #34495e; }
            </style>
          </head>
          <body>
            <div class="success">✓ Autenticación con Google completada</div>
            <div class="message">Ya puedes cerrar esta ventana y volver a la aplicación.</div>
          </body>
        </html>
      `);
    } catch (error) {
      this.logger.error(`Error obtaining refresh token: ${error.message}`);
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error de Autenticación</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
              .error { color: #e74c3c; font-size: 1.5rem; margin-bottom: 1rem; }
              .message { color: #34495e; }
            </style>
          </head>
          <body>
            <div class="error">✗ Error en la autenticación</div>
            <div class="message">'Por favor, intenta nuevamente.'
            }</div>
          </body>
        </html>
      `);
    }
  }
}
