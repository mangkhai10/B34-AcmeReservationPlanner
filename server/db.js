// Importing necessary packages and modules
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_reservation_planner');
const uuid = require('uuid');

// Function to create database tables
const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS restaurants;
    DROP TABLE IF EXISTS customers;

    CREATE TABLE customers(
      id UUID PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE restaurants(
      id UUID PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE reservations (
      id UUID PRIMARY KEY,
      date DATE NOT NULL,
      party_count INTEGER NOT NULL,
      restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
      customer_id UUID REFERENCES customers(id) NOT NULL,
      CONSTRAINT unique_customer_id_and_restaurant_id UNIQUE (customer_id, restaurant_id)
    );
  `;
  await client.query(SQL);
};

// Function to create a new customer in the database
const createCustomer = async (name) => {
  try {
    const SQL = `INSERT INTO customers (id, name) VALUES ($1, $2) RETURNING *`;
    const result = await client.query(SQL, [uuid.v4(), name]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Function to create a new restaurant in the database
const createRestaurant = async (name) => {
  const SQL = `
    INSERT INTO restaurants (id, name) VALUES ($1, $2) RETURNING *`;
  const result = await client.query(SQL, [uuid.v4(), name]);
  return result.rows[0];
};

// Function to create a new reservation in the database
const createReservation = async ({ date, party_count, restaurant_id, customer_id }) => {
  const SQL = `
    INSERT INTO reservations (id, date, party_count, restaurant_id, customer_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const result = await client.query(SQL, [uuid.v4(), date, party_count, restaurant_id, customer_id]);
  return result.rows[0];
};

// Function to fetch all customers from the database
const fetchCustomers = async () => {
  const SQL = `SELECT * FROM customers`;
  const result = await client.query(SQL);
  return result.rows;
};

// Function to fetch all restaurants from the database
const fetchRestaurants = async () => {
  const SQL = `SELECT * FROM restaurants`;
  const result = await client.query(SQL);
  return result.rows;
};

// Function to fetch all reservations from the database
const fetchReservations = async () => {
  const SQL = `SELECT * FROM reservations`;
  const result = await client.query(SQL);
  return result.rows;
};

// Function to delete a reservation from the database based on its ID
const deleteReservation = async (id) => {
  const SQL = `DELETE FROM reservations WHERE id = $1`;
  await client.query(SQL, [id]);
};

// Exporting all functions and the database client for external use
module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  deleteReservation
};
