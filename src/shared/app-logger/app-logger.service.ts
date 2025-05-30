import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as path from 'node:path';
import * as fs from 'node:fs';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
    async logToFile<T>(logEntry: T){
        const entryFormat = `${Intl.DateTimeFormat('en-US', {
            dateStyle: 'short', timeStyle: 'short', timeZone: 'America/New_York'
        }).format(new Date())}\t${logEntry}\n`;

        try {
            if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
                await fs.promises.mkdir(path.join(__dirname, '..', '..', 'logs'));
            }
            await fs.promises.appendFile(
                path.join(__dirname, '..', '..', 'logs', 'myLogFile.log'), 
                entryFormat
            );
        } catch (err) {
            if (err instanceof Error) console.error(err.message);
        }
    }
    
    log(message: any, context?: string) {
        const logEntry = `${context}\t\t${message}`;
        this.logToFile(logEntry);
        super.log(message, context);
    }

    error(message: any, stackOrContext?: string) {
        const logEntry = `${stackOrContext}\t\t${message}`;
        this.logToFile(logEntry);
        super.error(message, stackOrContext);
    }
}

@Injectable()
export class AppLoggerService {}