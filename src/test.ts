import {Queue, LimitedScheduler} from './index.js';

function mathAdd(a: number, b: number) {
    return a + b;
}

const queue = new Queue(1000);

const x = await queue.add(() => mathAdd(1, 2));
console.log(x);
// const y = queue.add(() => mathAdd(3, 4));
// const z = queue.add(() => mathAdd(5, 6));

// const res = await Promise.all([x, y, z]);

// console.log(res);

