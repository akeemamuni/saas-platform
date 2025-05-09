import Stripe from 'stripe';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

// Handle subscription
export async function updateTenantSub(event: Stripe.Event, prisma: PrismaService): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    const planId = session.metadata?.planId;
    const tenantId = session.metadata?.tenantId;
    const subscriptionId = session.subscription as string;

    if (!planId || !tenantId || !subscriptionId) {
        console.warn('Missing planId, tenantId and/or subscriptionId...');
        return;
    }
    await prisma.subscription.update({
        where: { tenantId },
        data: {
            planId,
            stripeSubId: subscriptionId,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30))
        }
    });
    // Send notification and log...
    console.log(`Tenant ${tenantId} just a new subscription...`);
}
