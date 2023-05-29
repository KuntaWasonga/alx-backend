#!/usr/bin/yarn dev
import { createQueue } from 'kue';

const blacklisted = ['4153518780', '4153518781'];

const queue = createQueue();

const sendNotification = (phoneNUmber, message, job, done) => {
    job.progress(0, 100);
    if (blacklisted.includes(phoneNUmber)) {
        done(Error(`Phone number ${phoneNUmber} is blacklisted`));
        return;
    }
    job.progress(50, 100);
    console.log(`Sending notification to ${phoneNUmber}, with message: ${message}`);
    done();
}

queue.process('push_notification_code_2', 2, (job, done) => {
    sendNotification(job.data.phoneNumber, job.data.message, job, done);
});
