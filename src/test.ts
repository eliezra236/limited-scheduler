import {Queue, LimitedScheduler} from './index.js';

async function mathAdd(a: number, b: number) {
    return a + b;
}

const queue = new Queue(5000);
const timeXStart = Date.now();
const x = await queue.add(() => mathAdd(1, 2));
const timeYStarts = Date.now();
const y = await queue.add(() => mathAdd(3, 4));
const z = await queue.add(() => mathAdd(5, 6));
const end = Date.now();
console.log('res', {
    x,
    y,
    z,
    timeXTook: end - timeXStart,
    timeYTook: end - timeYStarts
});
// const y = queue.add(() => mathAdd(3, 4));
// const z = queue.add(() => mathAdd(5, 6));

// const res = await Promise.all([x, y, z]);

// console.log(res);

