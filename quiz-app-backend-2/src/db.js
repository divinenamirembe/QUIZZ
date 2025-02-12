import knex from 'knex';
import knexConfig from '../knexfile.cjs'; // Use default import for CommonJS module

// Initialize Knex instance using knexConfig for the development environment
const knexInstance = knex(knexConfig.development);

const testDbConnection = async () => {
  try {
    const result = await knexInstance.raw('SELECT NOW()');
    console.log('Database connection successful. Server time:', result.rows[0].now);
  } catch (err) {
    console.error('Database test query failed:', err.message);
  }
};

export { knexInstance, testDbConnection };
