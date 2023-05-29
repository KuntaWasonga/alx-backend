#!/usr/bin/yarn dev
import express from 'express';
import { request } from 'http';
import { createClient } from 'redis';
import { promisify } from 'util';

//Data
listProducts = [
    { 
        itemId: 1,
        itemName: 'Suitcase 250',
        itemPrice: 50,
        stock: 4
    },
    {
        itemId: 2,
        itemName: 'Suitcase 450',
        itemPrice: 100,
        stock: 10
    }, 
    {
        itemId: 3,
        itemName: 'Suitcase 650',
        itemPrice: 350,
        stock: 2
    },
    {
        itemId: 4,
        itemName: 'Suitcase 1050',
        itemPrice: 550,
        stock: 5
    }
]

//DATA ACCESS
const getItemById = (id) => {
    return listProducts.filter((item) => item.itemId === id)[0];
}

//SERVER
const app = express();

//PRODUCTS
app.get('/list_products', (req, res) => {
    result.json(listProducts);
});

//IN STOCK IN REDIS
const client = createClient();

client.on("connect", () => {
    console.log('Redis client connected to the server');
}).on('error', (err) => {
    console.log('Redis client not connected to the server:', err.toString());
});

const reserveStockById = async (itemId, stock) => {
    return promisify(client.set).bind(client)(`item.${itemId}`, stock);
}

const getCurrentReservedStockById = async (itemId) => {
    return promisify(client.get).bind(client)(`item.${itemId}`);
};

//PRODUCT DETAIL
app.get('/list_products/:itemId,', async(req, res) => {
    const itemId = req.params.itemId;
    const item = getItemById(parseInt(itemId));

    if (item) {
        const stocks = await getCurrentReservedStockById(itemId);
        const resItem = {
            itemId: item.itemId,
            itemName: item.itemName,
            price: item.price,
            stock: item.stock,
            currentQuantity: stocks !== null ? parseInt(stocks) : item.stock,
        };
        res.json(resItem);
    } else {
        res.json({"status": "Product not found"});
    }
});

//RESERVE A PRODUCT
app.get('/reserve_product/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    const item = getItemById(parseInt(itemId));

    if (!item) {
        res.json({"status": "Product not found"});
        return;
    }

    let currentStock = await getCurrentReservedStockById(itemId);
    if (currentStock !== null) {
        currentStock = parseInt(currentStock);
        if (currentStock > 0) {
            reserveStockById(itemId, currentStock - 1);
            res.json({"status": "Reservation confirmed", "itemId": itemId});
        } else {
            res.json({"status": "Not enough stock available", "itemId": itemId});
        }
    } else {
        reserveStockById(itemId, item.stock - 1);
        res.json({"status": "Reservation confirmed", "itemId": itemId});
    }
});
