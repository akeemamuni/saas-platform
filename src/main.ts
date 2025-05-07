import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

dotenv.config();
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = app.get(ConfigService).get<number>('PORT') ?? 3000;
    app.use('/billing/webhook', bodyParser.raw({type: 'application/json'}));
    await app.listen(port, () => console.log(`Listening on port ${port}`));
    //   await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// Add timestamp to personal console logs