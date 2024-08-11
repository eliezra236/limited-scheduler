import {Queue} from './Queue.js';

const timeoutMsConfig = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 1000;

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

    private cleanFinishedQueues() {
        this.queues = this.queues.filter((q) => !q.isSettled());
    }

    private getQueue(): Queue {
        const queue = this.queues.find((q) => q.tasks.length < this.limit);
        if (queue) {
            return queue;
        }
        this.cleanFinishedQueues();
        const lastQueue = this.queues.at(-1);
        if (!lastQueue) {
            const newQueue = new Queue(timeoutMsConfig);
            this.queues.push(newQueue);
            return newQueue;
        }
        const timeLeftInQueue = timeoutMsConfig - (Date.now() - lastQueue.startTime);
        const timeDelta = Math.max(timeLeftInQueue, 0);
        const newQueue = new Queue(timeDelta + timeoutMsConfig);

        this.queues.push(newQueue);
        return newQueue;
    }
}
