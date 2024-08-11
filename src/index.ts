import { setTimeout } from 'node:timers/promises';

interface Queue {
    tasks: Array<() => any>;
    timeout: Promise<void>;
    startTime: number;
}

const timeoutMs = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 1000;

class LimitedScheduler {
    limit: number;
    queues: Queue[] = [];

    constructor(limit: number) {
        if (limit <= 0 || limit > 100) {
            throw Error('Limit must be between 1 and 100');
        }
        this.limit = limit;
    }

    async run(task: () => any) {
        const x = setTimeout();
    }

    getQueue(): Queue {
        const queue = this.queues.find((q) => q.tasks.length < this.limit);
        if (queue) {
            return queue;
        }
        const lastQueue = this.queues.at(-1);
        if (!lastQueue) {
            const newQueue: Queue = {
                tasks: [],
                timeout: setTimeout(timeoutMs),
                startTime: Date.now(),
            };
            this.queues.push(newQueue);
            return newQueue;
        }

        const timeDelta = Math.max(Date.now() - lastQueue.startTime, 0);
        const newQueue = {
            tasks: [],
            timeout: setTimeout(timeDelta + timeoutMs),
            startTime: Date.now(),
        }

        this.queues.push(newQueue);
        return newQueue;
    }
}
