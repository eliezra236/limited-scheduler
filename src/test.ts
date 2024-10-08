import {Queue, LimitedScheduler} from './index.js';
import {LimitedSchedulerByDone} from './LimitedSchedulerByDone.js';
import { setTimeout } from 'node:timers/promises';

async function mathAdd(a: number, b: number) {
    return a + b;
}

// const queue = new Queue(5000);
// const timeXStart = Date.now();
// const x = await queue.add(() => mathAdd(1, 2));
// const timeYStarts = Date.now();
// const y = await queue.add(() => mathAdd(3, 4));
// const z = await queue.add(() => mathAdd(5, 6));
// const end = Date.now();
// console.log('res', {
//     x,
//     y,
//     z,
//     timeXTook: end - timeXStart,
//     timeYTook: end - timeYStarts
// });

const scheduler = new LimitedSchedulerByDone(2, false);

const startX = Date.now();
const x2 = scheduler.run(() => mathAdd(1, 2));
const endX = Date.now();
const y2 = scheduler.run(() => setTimeout(3000));
const endY = Date.now();
const z2 = scheduler.run(() => mathAdd(5, 6));
const endZ = Date.now();

await Promise.all([x2, y2, z2]);
const end = Date.now();

console.log('res', {
    x2,
    y2,
    z2,
    timeXTook: endX - startX,
    timeYTook: endY - endX,
    timeZTook: endZ - endY,
    totalTimeZTook: endZ - startX,
    totalTimeTook: end - startX
});
