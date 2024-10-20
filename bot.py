const { Client } = require('pg');

const client = new Client({
    host: 'your_render_postgres_host',
    port: 5432, // стандартний порт PostgreSQL
    user: 'your_db_user',
    password: 'your_db_password',
    database: 'your_db_name',
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));
