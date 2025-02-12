exports.up = async function(knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()')); // Or you can use uuidv4() programmatically in some cases
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('username').notNullable();
    table.enu('role', ['Creator', 'Participant']);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('users');
};
