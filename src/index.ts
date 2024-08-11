import { setTimeout } from 'node:timers/promises';

const timeoutMsConfig = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 1000;

// TODO: Cleanup queues that are done. - maybe make Queue it's own class.

class Queue {
    tasks: Array<() => any>;
    timeout: Promise<void>;
    startTime: number;

    constructor(timeoutMs: number) {
        this.tasks = [];
        this.timeout = setTimeout(timeoutMs);
        this.startTime = Date.now();
    }

    async add(task: () => any) {
        const timeoutTask = async () => {
            await this.timeout;
            return task();
        }
        this.tasks.push(timeoutTask);
        return timeoutTask;
    }
}


class LimitedScheduler {
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
        if (!lastQueue) {
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
