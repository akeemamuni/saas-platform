import { MailerService } from "src/shared/mailer/mailer.service";

export async function passwordResetEmail(email: string, mailer: MailerService) {
    console.log(`Sending password reset email to ${email}`);
}
