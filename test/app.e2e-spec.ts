import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { App } from 'supertest/types';
import request from 'supertest';

describe('Full e2e application flow', () => {
    let module: TestingModule;
    let app: INestApplication<App>;
    let config: ConfigService;
    let adminEmail: String;
    let password: string;
    let adminId: string;
    let tenantId: string;
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
        module = await Test.createTestingModule({imports: [AppModule]}).compile();
        app = module.createNestApplication();
        config = app.get(ConfigService);
        app.useGlobalPipes(new ValidationPipe({whitelist: true}));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await module.close();
    });

    it('Get homepage (/)', () => {
        return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('Register new tenant and admin', async () => {
        password = config.get('PASSWORD') as string;
        const res = await request(app.getHttpServer()).post('/auth/register')
        .send({
            companyName: 'E2E Limited',
            email: 'e2eadmin@test.com',
            plan: 'Basic',
            password
        });

        expect(res.status).toBe(201);
        adminId = res.body.id;
        adminEmail = res.body.email;
        tenantId = res.body.tenantId;
    });
    
    it('Login admin user', async () => {
        const res = await request(app.getHttpServer()).post('/auth/login')
        .send({
            email: adminEmail,
            password
        });

        expect(res.status).toBe(201);
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
    });

    it('Get current user profile', async () => {
        const res = await request(app.getHttpServer()).get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(adminEmail);
    });

    it('Refresh tokens', async () => {
        const res = await request(app.getHttpServer()).post('/auth/refresh')
        .send({refreshToken});

        expect(res.status).toBe(201);
    });
});



// describe('Full E2E Flow', () => {

//   it('creates a user under the tenant', async () => {
//     const res = await request(app.getHttpServer())
//       .post('/users')
//       .set('Authorization', `Bearer ${accessToken}`)
//       .send({
//         email: 'editor@company.com',
//         fullName: 'Editor User',
//         password: 'EditorPass123',
//         role: 'Editor',
//       });

//     expect(res.status).toBe(201);
//   });

//   it('creates a plan', async () => {
//     const res = await request(app.getHttpServer())
//       .post('/plans')
//       .set('Authorization', `Bearer ${accessToken}`)
//       .send({
//         name: 'Pro Plan',
//         price: 2000,
//         currency: 'usd',
//         interval: 'month',
//       });

//     expect(res.status).toBe(201);
//     planId = res.body.id;
//   });

//   it('starts a subscription (mock)', async () => {
//     const res = await request(app.getHttpServer())
//       .post('/billing/checkout')
//       .set('Authorization', `Bearer ${accessToken}`)
//       .send({ planId });

//     expect(res.status).toBe(201);
//   });

//   it('gets all users in tenant', async () => {
//     const res = await request(app.getHttpServer())
//       .get('/users')
//       .set('Authorization', `Bearer ${accessToken}`);

//     expect(res.status).toBe(200);
//     expect(res.body.length).toBe(2); // admin + editor
//   });
// });
