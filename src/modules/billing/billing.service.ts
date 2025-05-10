import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SessionParams } from 'src/shared/types/session-param.type';
import Stripe from 'stripe';
import { JwtPayload } from 'src/shared/types/payload.type';
import { updateTenantSub } from './webhooks/completed.webhook';
import { renewTenantSub } from './webhooks/renewal.webhook';
import { failedSub } from './webhooks/failed.webhook';
import { subCanelling } from './webhooks/cancelled.webhook';

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
        if (!webhookSecret) {
            console.log('No webhook secret...');
            throw new BadRequestException('No webhook secret...');
        }

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (err) {
            console.log(`Webhook error: ${err.message}`);
            throw new BadRequestException(`Webhook error: ${err.message}`);
        }

        // Handling different event types
        switch (event.type) {
            // Successfull payment/sub
            case 'checkout.session.completed': {
                await updateTenantSub(event, this.prisma);
                break;
            }

            // Successful renewal
            case 'invoice.paid': {
                await renewTenantSub(event, this.prisma);
                break;
            }

            // Unsuccessful payment/sub
            case 'invoice.payment_failed': {
                await failedSub(event, this.prisma);
                break;
            }

            // Subscription changes (upgrades and downgrades)
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log(`Subscription ${subscription.id} was updated...`);
                break;
            }

            // Subscription cancelled
            case 'customer.subscription.deleted': {
                await subCanelling(event, this.prisma);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }
}
