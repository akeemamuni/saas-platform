import Stripe from 'stripe';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

// Handle subscription renewal
export async function renewTenantSub(event: Stripe.Event, prisma: PrismaService): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
    if (!invoice.subscription) {
        console.log('Subscription is missing in invoice...');
        return;
    }

    const reason = invoice.billing_reason;
    const stripeSubId = invoice.subscription;
    if (reason === 'subscription_cycle') {
        await prisma.subscription.update({
            where: { stripeSubId },
            data: {
                startDate: new Date(),
                status: SubscriptionStatus.ACTIVE,
                endDate: new Date(new Date().setDate(new Date().getDate() + 30))
            }
        });
    }
    // Send notification
}
