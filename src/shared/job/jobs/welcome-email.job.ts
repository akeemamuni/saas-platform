import { MailerService } from "src/shared/mailer/mailer.service";

export async function welcomeEmail(data: any, mailer: MailerService) {
    const { email } = data;
    const subject = 'Welcome To Our Platform';
    const html = '<h2>Welcome to our unique platform, we are delighted...</h2>';
    const result = await mailer.sendMail(email, subject, html);
    console.log(`Sending welcome email to ${data.email}\n${result}`);
}
