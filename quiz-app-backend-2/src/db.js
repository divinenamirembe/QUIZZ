import knex from 'knex';
import { knexConfig } from './knexfile.js'; // Import knexConfig instead of knex instance

// Initialize Knex instance using knexConfig
const knexInstance = knex(knexConfig);

const testDbConnection = async () => {
  try {
    const result = await knexInstance.raw('SELECT NOW()');
    console.log('Database connection successful. Server time:', result.rows[0]);
  } catch (err) {
    console.error('Database test query failed:', err.message);
  }
};

export { knexInstance, testDbConnection };
