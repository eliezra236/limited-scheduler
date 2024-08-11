import {PromiseWithStatus} from './PromiseWithStatus.js';
import { setTimeout } from 'node:timers/promises';

export class Queue {
    tasks: PromiseWithStatus<any>[];
    timeout: Promise<void>;
    startTime: number;
    timeoutMs: number;

    constructor(timeoutMs: number) {
        this.timeoutMs = timeoutMs;
        this.tasks = [];
        this.timeout = setTimeout(timeoutMs);
        this.startTime = Date.now();
    }

    async add<T>(task: () => T) {
        const promiseWithStatus = new PromiseWithStatus(async () => {
            await this.timeout;
            const taskRes = await task();
            return taskRes;
        });
        const taskPromise = promiseWithStatus.run();
        this.tasks.push(promiseWithStatus);
        return taskPromise;
    }

    isSettled() {
        if (this.tasks.length === 0) {
            return true;
        }
        const now = Date.now();
        const timeLeftInTimeout = this.timeoutMs - (now - this.startTime);
        if (timeLeftInTimeout > 0) {
            return false;
        }
        return this.tasks.every((task) => task.status !== 'pending');
    }
}
