// src/migrations/20250211062842_create_participants_table.cjs
module.exports.up = async function (knex) {
  await knex.schema.createTable('participants', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('phone');
    table.string('status');
    table.timestamps(true, true); // created_at and updated_at
  });
};

module.exports.down = async function (knex) {
  await knex.schema.dropTable('participants');
};
