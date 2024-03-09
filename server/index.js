// Importing database functions and client from 'db.js' module
const {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    createReservation,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations,
    deleteReservation
} = require('./db');

// Importing the Express framework
const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Route to get all customers from the database
app.get('/api/customers', async (req, res, next) => {
    try {
        res.send(await fetchCustomers());
    } catch (error) {
        next(error);
    }
});

// Route to get all restaurants from the database
app.get('/api/restaurants', async (req, res, next) => {
    try {
        res.send(await fetchRestaurants());
    } catch (error) {
        next(error);
    }
});

// Route to get all reservations from the database
app.get('/api/reservations', async (req, res, next) => {
    try {
        res.send(await fetchReservations());
    } catch (error) {
        next(error);
    }
});

// Route to delete a reservation by ID
app.delete('/api/customers/:customer_id/reservations/:id', async (req, res, next) => {
    try {
        await deleteReservation(req.params.id);
        res.sendStatus(204); // No Content
    } catch (error) {
        next(error);
    }
});

// Route to create a reservation for a specific customer
app.post('/api/customers/:id/reservations', async (req, res, next) => {
    try {
        // Extract customer_id from the request URL
        const customer_id = req.params.id;

        // Combine customer_id with the payload from the request body
        const reservationData = {
            customer_id,
            ...req.body
        };

        // Call createReservation with the combined data
        const createdReservation = await createReservation(reservationData);

        // Send the created reservation with a status code of 201 (Created)
        res.status(201).send(createdReservation);
    } catch (error) {
        next(error);
    }
});

// Function to initialize the application
const init = async () => {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Create tables if they don't exist
    await createTables();
    console.log('Tables created');

    // Create sample customers and restaurants
    const [john, jane, jim, pastaPalace, tacoTown, sushiShack] = await Promise.all([
        createCustomer('John'),
        createCustomer('Jane'),
        createCustomer('Jim'),
        createRestaurant('Pasta Palace'),
        createRestaurant('Taco Town'),
        createRestaurant('Sushi Shack')
    ]);
    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());

    // Create sample reservations
    await Promise.all([
        createReservation({ date: '2024-04-01', party_count: 4, restaurant_id: pastaPalace.id, customer_id: john.id }),
        createReservation({ date: '2024-05-15', party_count: 3, restaurant_id: tacoTown.id, customer_id: jane.id }),
        createReservation({ date: '2024-06-30', party_count: 2, restaurant_id: sushiShack.id, customer_id: jim.id })
    ]);

    console.log('Sample reservations created:');
    console.log(await fetchReservations());

    // Start the Express server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
};

// Initialize the application
init();
