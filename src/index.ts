import { setTimeout } from 'node:timers/promises';

const timeoutMsConfig = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 1000;

export class PromiseWithStatus<T> {
    status: 'pending' | 'fulfilled' | 'rejected';
    promise: () => Promise<T>;

    constructor(promise: () => Promise<T>) {
        this.status = 'pending';
        this.promise = promise;
    }

    async run() {
        try {
            const res = await this.promise();
            this.status = 'fulfilled';
            return res;
        } catch (error) {
            this.status = 'rejected';
            throw error;
        }
    }
}

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


export class LimitedScheduler {
    limit: number;
    queues: Queue[] = [];

    constructor(limit: number) {
        if (limit <= 0 || limit > 100) {
            throw Error('Limit must be between 1 and 100');
        }
        this.limit = limit;
    }

    async run<T>(task: () => T) {
        const queue = this.getQueue();
        return queue.add(task);
    }

    getQueue(): Queue {
        const queue = this.queues.find((q) => q.tasks.length < this.limit);
        if (queue) {
            return queue;
        }
        const lastQueue = this.queues.at(-1);
        if (!lastQueue || lastQueue.isSettled()) {
            const newQueue = new Queue(timeoutMsConfig);
            this.queues.push(newQueue);
            return newQueue;
        }

        const timeDelta = Math.max(Date.now() - lastQueue.startTime, 0);
        const newQueue = new Queue(timeDelta + timeoutMsConfig);

        this.queues.push(newQueue);
        return newQueue;
    }
}
