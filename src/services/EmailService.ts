import { env } from '@/env';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

type Args = {
  to: string;
  subject: string;
  html: string;
};

export default class EmailService {
  private async init() {
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    const refresh_token = env.GOOGLE_REFRESH_TOKEN;
    const user = env.GOOGLE_USER;

    const oauth2Client = new google.auth.OAuth2({
      clientId,
      clientSecret,
      redirectUri: 'https://developers.google.com/oauthplayground',
    });

    oauth2Client.setCredentials({
      refresh_token,
    });

    const token = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      // @ts-expect-error: it's ok
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken: refresh_token,
        accessToken: token.token,
      },
    });
    return transporter;
  }

  async send(args: Args) {
    const { html, subject, to } = args;
    const tp = await this.init();
    await tp.sendMail({
      to,
      subject,
      html,
    });
  }
}
