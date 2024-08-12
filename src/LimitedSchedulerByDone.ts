import {Queue} from './Queue.js';
import { setTimeout } from 'node:timers/promises';

const timeoutMsConfig = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 1000;

export class LimitedSchedulerByDone {
    limit: number;
    tasks: Promise<any>[] = []
    cleared: boolean = false;
    timeout: Promise<void> | null = null;
    waitUntilResolved: boolean;

    constructor(limit: number, waitUntilResolved: boolean = true) {
        if (limit <= 0 || limit > 100) {
            throw Error('Limit must be between 1 and 100');
        }
        this.limit = limit;
        this.waitUntilResolved = waitUntilResolved;
    }

    async run<T>(task: () => T): Promise<T> {
        if (this.tasks.length < this.limit) {
            this.cleared = false;
            const promise = Promise.resolve(task());
            this.tasks.push(promise);
            return promise;
        }
        if (this.waitUntilResolved) {
            await Promise.allSettled(this.tasks);
        }
        if (!this.cleared) {
            this.tasks = [];
            this.cleared = true;
            this.timeout = setTimeout(timeoutMsConfig);
        }
        await this.timeout;
        return await this.run(task);
    }
}
