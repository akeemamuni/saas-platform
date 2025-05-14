import Stripe from 'stripe';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';
import { JobQueueService } from 'src/shared/job/job-queue.service';

export async function subCanelling(
    event: Stripe.Event, 
    prisma: PrismaService,
    jqService: JobQueueService
): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    const sub = await prisma.subscription.update({
        where: { stripeSubId: subscription.id },
        data: {
            status: SubscriptionStatus.CANCELLED
        }
    });
    // console.log(`Subscription ${sub.stripeSubId} was cancelled...`);
    jqService.stripePaymentCancelledJob({tenantId: sub.tenantId, subId: sub.stripeSubId});
}
