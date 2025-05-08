import Stripe from 'stripe';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

export async function subCanelling(event: Stripe.Event, prisma: PrismaService): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    await prisma.subscription.update({
        where: { stripeSubId: subscription.id },
        data: {
            status: SubscriptionStatus.CANCELLED
        }
    });
    console.log(`Subscription ${subscription.id} was cancelled...`);
    // Send notification
}
