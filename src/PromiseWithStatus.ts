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
