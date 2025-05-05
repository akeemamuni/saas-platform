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
            payment_method_types: ['card', 'paypal'],
            success_url: data.successUrl,
            cancel_url: data.cancelUrl,
            customer_email: user.email,
            mode: 'subscription',
            line_items: [{
                price: data.stripePriceId,
                quantity: 1
            }],
            metadata: {
                tenantId: data.tenantId
            },
        });
        return { url: session.url };
    }
}
