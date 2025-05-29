import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { JobQueueService } from 'src/shared/job/job-queue.service';
import { App } from 'supertest/types';
import request from 'supertest';

describe('Full e2e application flow', () => {
    let module: TestingModule;
    let app: INestApplication<App>;
    let config: ConfigService;
    let jqs: JobQueueService;
    let adminEmail: String;
    let password: string;
    let tenantId: string;
    let adminAccessToken: string;
    let adminRefreshToken: string;
    let userAccessToken: string;
    let proPlanId: string;

    beforeAll(async () => {
        module = await Test.createTestingModule({imports: [AppModule]}).compile();
        app = module.createNestApplication();
        config = app.get(ConfigService);
        jqs = app.get(JobQueueService);
        app.useGlobalPipes(new ValidationPipe({whitelist: true}));
        await app.init();
    });

    afterAll(async () => {
        if (jqs) await jqs.close();
        await app.close();
        await module.close();
    });

    it('Get homepage (/)', () => {
        return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('Register new tenant and admin (success)', async () => {
        password = config.get('PASSWORD') as string;
        const res = await request(app.getHttpServer()).post('/auth/register')
        .send({
            companyName: 'E2E Limited',
            email: 'e2eadmin@e2e.com',
            plan: 'Basic',
            password
        });

        expect(res.status).toBe(201);
        adminEmail = res.body.email;
        tenantId = res.body.tenantId;
    });

    it('Register new tenant and admin (failed)', async () => {
        password = config.get('PASSWORD') as string;
        const res = await request(app.getHttpServer()).post('/auth/register')
        .send({
            companyName: 'E2E Limited',
            email: 'e2eadmin@e2e.com',
            plan: 'Basic',
            password
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Invalid email');
    });
    
    it('Login user (admin)', async () => {
        const res = await request(app.getHttpServer()).post('/auth/login')
        .send({
            email: adminEmail,
            password
        });

        expect(res.status).toBe(201);
        expect(res.body.accessToken).toContain('ey');
        expect(res.body.refreshToken).toContain('ey');
        adminAccessToken = res.body.accessToken;
        adminRefreshToken = res.body.refreshToken;
    });

    it('Refresh tokens', async () => {
        // const refreshToken = JSON.stringify(adminRefreshToken);
        const res = await request(app.getHttpServer()).post('/auth/refresh')
        .send({refreshToken: adminRefreshToken});

        expect(res.status).toBe(201);
    });

    it('Get current user profile (admin)', async () => {
        const res = await request(app.getHttpServer()).get('/auth/me')
        .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(adminEmail);
        expect(res.body.role.name).toBe('ADMIN');
    });

    it('No authorization failure', async () => {
        const res = await request(app.getHttpServer()).get('/auth/me');

        expect(res.status).toBe(401);
        expect(res.body.message).toContain('Unauthorized');
    });

    it('Get roles (success)', async () => {
        const res = await request(app.getHttpServer()).get('/role')
        .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
    });

    it('Get plans (success)', async () => {
        const res = await request(app.getHttpServer()).get('/plan')
        .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
        proPlanId = res.body[1].id;
    });

    it('Admin creates user (success)', async () => {
        const res = await request(app.getHttpServer()).post('/user')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
            name: 'Rex Martins',
            email: 'e2erex@e2e.com',
            role: 'MEMBER',
            password
        });

        expect(res.status).toBe(201);
        expect(res.body.role).toBe('MEMBER');
        expect(res.body.email).toBe('e2erex@e2e.com');
        expect(res.body.tenantId).toBe(tenantId);
    });

    it('Admin creates user (failed)', async () => {
        const res = await request(app.getHttpServer()).post('/user')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
            name: 'Rex Martins',
            email: 'e2erex@e2e.com',
            role: 'MEMBER',
            password
        });

        expect(res.status).toBe(403);
    });

    it('Login user', async () => {
        const res = await request(app.getHttpServer()).post('/auth/login')
        .send({
            email: 'e2erex@e2e.com',
            password
        });

        expect(res.status).toBe(201);
        expect(res.body.accessToken).toContain('ey');
        expect(res.body.refreshToken).toContain('ey');
        userAccessToken = res.body.accessToken;
    });

    it('Get roles (failed)', async () => {
        const res = await request(app.getHttpServer()).get('/role')
        .set('Authorization', `Bearer ${userAccessToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toContain('Forbidden');
    });

    it('Get plans (failed)', async () => {
        const res = await request(app.getHttpServer()).get('/plan')
        .set('Authorization', `Bearer ${userAccessToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toContain('Forbidden');
    });

    it('Get users (success)', async () => {
        const res = await request(app.getHttpServer()).get('/user')
        .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(res.status).toBe(200);
    });

    it('Get users (failed)', async () => {
        const res = await request(app.getHttpServer()).get('/user')
        .set('Authorization', `Bearer ${userAccessToken}`);
        
        expect(res.status).toBe(403);
    });

    it('Subscribe (success)', async () => {
        const res = await request(app.getHttpServer())
        .get(`/billing/checkout/${proPlanId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.url).toContain('https://checkout.stripe.com/c/pay/');
    });
});
