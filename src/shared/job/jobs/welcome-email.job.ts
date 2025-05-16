import { MailerService } from "src/shared/mailer/mailer.service";

export async function welcomeEmail(data: any, mailer: MailerService) {
    console.log(`Sending welcome email with data: ${data.email}`);
    const { email } = data;
    const subject = 'Welcome To Our Platform';
    const html = '<h2>Welcome to our unique platform, we are delighted...</h2>'
    console.log(mailer.sendMail(email, subject, html));
}
