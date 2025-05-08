import Stripe from 'stripe';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

export async function failedSub(event: Stripe.Event, prisma: PrismaService): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
    const stripeSubId = invoice.subscription;
    if (!stripeSubId) {
        console.log('There was no subscription ID...');
        return;
    }

    await prisma.subscription.update({
        where: { stripeSubId },
        data: {
            status: SubscriptionStatus.EXPIRED
        }
    });
    // Send notification
}
