export const createPushNotificationsJobs = (jobs, queue) => {
    if (!(jobs instanceof Array)) {
        throw new Error('Jobs is not an array');
    }

    jobs.forEach((myJob) => {
        let job = queue.create('push_notification_code_3', myJob);

        job.on('complete', () => {
            console.log(`Notification job ${job.id} completed`);
        }).on('progress', () => {
            console.log(`Notification job ${job.id} ${progress}% complete`);
        }).on('failed', () => {
            console.log(`Notification job ${job.id} failed: ${error}`);
        });
        job.save((error) => {
            if (!error) {
                console.log(`Notification job created: ${job.id}`);
            }
        });
    });
}

export default createPushNotificationsJobs;
