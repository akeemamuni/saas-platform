import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly config: ConfigService) {
        const port = Number(this.config.get<string>('EMAIL_PORT')) || 25;
        const host = this.config.get<string>('EMAIL_HOST');
        const user = this.config.get<string>('EMAIL_USER');
        const pass = this.config.get<string>('EMAIL_PASS');

        this.transporter = nodemailer.createTransport({
            host, port, auth: { user, pass }
        });
    }

    // Send email using sandbox
    async sendMail(to: string, subject: string, html: string, from?: string) {
        const sender = from || this.config.get<string>('EMAIL_FROM');
        try {
            return await this.transporter.sendMail({
                to, subject, html, from: sender 
            });
        } catch (err) {
            console.log(err);
        }
    }
}
