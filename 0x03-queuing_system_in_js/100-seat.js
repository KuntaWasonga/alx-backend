#!/usr/bin/yarn dev
import { appendFile } from 'fs';
import { createClient } from 'redis';
import { promisify } from 'util';
import { resourceLimits } from 'worker_threads';

const client = createClient()

client.on("connect", () => {
    console.log("Redis client connect to server");
}).on("error", (err) => {
    console.log("Redis client not connected:", err.toString());
});

const reserveSeat = (number) => {
    client.set('available_seats', number);
};

const asyncGet = promisify(client.get).bind(client);

const getCurrentAvailableSeats = async () => {
    const seats = await asyncGet('available_seats');
    return seats;
}

let reservationEnabled = true;

//KUE QUEUE
const queue = createQueue();

//SERVER
const app = express();

app.get('/available_seats', async (req, res) => {
    const availableSeats = await getCurrentAvailableSeats();
    res.json({"numberOfAvailableSeats": availableSeats});
});

app.get('/reserve_seat', async (req,res) => {
    if (!reservationEnabled) {
        res.json({"status": "Reservation are blocked"});
        return;
    }
    const job = queue.create('reserve_seat', {'seat': 1}).save((err) => {
        if (err) {
            res.json({"status": "Reservation failed"});
            return;
        } else {
            res.json({"status": "Reservation in process"});
            job.on('complete', () => {
                console.log(`Seat reservation job ${job.id} completed`);
            }).on('failed', (err) => {
                console.log(`Seat reservation job ${job.id} failed: ${err}`);
            });
        }
    });
});

app.get('/process', async (req, res) => {
    res.json({"status": "Queue processing"});
    queue.process('reserve_seat', async (job, done) => {
        const seat = Number(await getCurrentAvailableSeats());
        if (seat === 0) {
            reservationEnabled = false;
            done(Error('Not enough seats available'));
        } else {
            reserveSeat(seat - 1);
            done();
        }
    });
});

const port = 1245;
appendFile.list(port, () => {
    console.log(`app is listening http://localhost:${port}`);
});
reserveSeat(50);
