#!/usr/bin/yarn dev
import { createClient, print } from 'redis';

const client = createClient();

client.on('error', (err) => {
    console.log(`Redis client not connected: ${err}`);
});

const update = (hashName, fieldName, fieldValue) => {
    client.hset(hashName, fieldName, fieldValue, print);
};

const print = (hashName) => {
    client.hgetall(hashName, (_err, reply) => console.log(reply))
}

const main = () => {
    const Obj = {
        Portland: 50,
        Seattle: 80,
        'New York': 20,
        Bogota: 20,
        Cali: 40,
        Paris: 2
    };

    for (const [field, value] of Object.entries(Obj)) {
        update('HolbertonSchools', field, value);
    }
    print('HolbertonSchools');
}

client.on('connect', () => {
    console.log('Redis client connected to server');
    main();
});
