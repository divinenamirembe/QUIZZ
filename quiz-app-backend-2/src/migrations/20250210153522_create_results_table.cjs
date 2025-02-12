exports.up = async function(knex) {
  await knex.schema.createTable('results', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.integer('score').notNullable();
    table.json('answers').nullable();
    table.integer('time_taken').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('results');
};
