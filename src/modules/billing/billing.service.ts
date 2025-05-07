import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SessionParams } from 'src/shared/types/session-param.type';
import Stripe from 'stripe';
import { JwtPayload } from 'src/shared/types/payload.type';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class BillingService {
    private readonly apiKey: string | undefined;
    private readonly stripe: Stripe;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) {
        this.apiKey = this.configService.get('STRIPE_SK');
        if (!this.apiKey) {
            throw new NotFoundException('Stripe secret key not found..');
        }
        this.stripe = new Stripe(this.apiKey);
    }

    // Stripe checkout to give secure payment link
    async createCheckoutSession(user: JwtPayload, planId: string) {
        // Check if plan is valid
        const plan = await this.prisma.plan.findUnique({
            where: { id: planId }
        });
        if (!plan) throw new NotFoundException('Plan not found...');

        // Construct session param data
        const successUrl = this.configService.get<string>('SUCCESS_URL') || 'https://stripe.com';
        const cancelUrl = this.configService.get<string>('CANCEL_URL') || 'https://stripe.com';
        const data: SessionParams = {
            stripePriceId: plan.stripePriceId || undefined,
            tenantId: user.tenantId,
            successUrl: successUrl,
            cancelUrl: cancelUrl
        }

        // Stipe checkout session
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: data.successUrl,
            cancel_url: data.cancelUrl,
            customer_email: user.email,
            mode: 'subscription',
            line_items: [{
                price: data.stripePriceId,
                quantity: 1
            }],
            metadata: {
                tenantId: data.tenantId,
                planId: plan.id
            },
        });
        return { url: session.url };
    }

    async handleWebhook(req: Request, rawBody: Buffer) {
        // Verify signature and webhoo
        const sig = req.headers['stripe-signature'] as string;
        const webhookSecret = this.configService.get<string>('WEBHOOK_SECRET');
        if (!webhookSecret) throw new BadRequestException('No webhook secret...');

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (err) {
            throw new BadRequestException(`Webhook error: ${err.message}`);
        }

        // Handling different event types
        switch (event.type) {
            // Successfull payment/sub
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const planId = session.metadata?.planId;
                const tenantId = session.metadata?.tenantId;
                const subscriptionId = session.subscription as string;

                if (!planId || !tenantId || !subscriptionId) {
                    console.warn('Missing planId, tenantId and/or subscriptionId...');
                    break;
                }

                // Update subscription
                await this.prisma.subscription.update({
                    where: { tenantId },
                    data: {
                        planId,
                        tenantId,
                        stripeSubId: subscriptionId,
                        status: SubscriptionStatus.ACTIVE,
                        startDate: new Date(),
                        endDate: new Date(new Date().setDate(new Date().getDate() + 30))
                    }
                });
                // Send notification...
                break;
            }

            // Unsuccessful payment/sub
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const tenantId = invoice.metadata?.tenantId;

                // Get all plans to use in checking current plan
                const [proPlan, goldPlan] = await Promise.all([
                    this.prisma.plan.findUnique({
                        where: { name: 'Pro' }
                    }),
                    this.prisma.plan.findUnique({
                        where: { name: 'Gold' }
                    })
                ]);

                const tenant = await this.prisma.tenant.findFirst({
                    where: { id: tenantId },
                    include: { subscription: true },
                });

                if (tenant) {
                    const currSub = tenant.subscription;
                    // When paid plans fails
                    if (currSub?.planId === proPlan?.id || currSub?.planId === goldPlan?.id) {
                        await this.prisma.subscription.update({
                            where: { tenantId: tenant.id },
                            data: {
                                status: SubscriptionStatus.EXPIRED
                            }
                        });
                    }
                    // Send notification
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }
}
