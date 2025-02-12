exports.up = async function(knex) {
  await knex.schema.createTable('leaderboard', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('score').notNullable();
    table.integer('rank').nullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('leaderboard');
};
