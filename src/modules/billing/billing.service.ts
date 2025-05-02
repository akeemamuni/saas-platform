import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SessionParams } from 'src/shared/types/session-param.type';
import Stripe from 'stripe';
import { JwtPayload } from 'src/shared/types/payload.type';

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
        const data: SessionParams = {
            plan: plan.name,
            planId: plan.id,
            tenantId: user.tenantId,
            priceInCents: plan.priceInCents,
            successUrl: 'https://stripe.com',
            cancelUrl: 'https://stripe.com'
        }

        // Stipe checkout session
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card', 'paypal'],
            success_url: data.successUrl,
            cancel_url: data.cancelUrl,
            mode: 'subscription',
            metadata: {
                tenantId: data.tenantId,
                planId: data.planId
            },
            line_items: [{
                price_data: {
                    currency: 'usd',
                    unit_amount: data.priceInCents,
                    recurring: { interval: 'month' },
                    product_data: { name: data.plan }
                },
                quantity: 1
            }]
        });
        return { url: session.url };
    }
}
