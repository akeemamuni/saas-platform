import { MailerService } from "src/shared/mailer/mailer.service";

export async function welcomeEmail(data: any, mailer: MailerService) {
    const { email } = data;
    const subject = 'Welcome To Our Platform';
    const html = '<h2>Welcome to our platform 🎉. <br> We are delighted...</h2>';
    console.log(`Sending welcome email to ${data.email}`);
    mailer.sendMail(email, subject, html);
}
