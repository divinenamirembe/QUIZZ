exports.up = async function(knex) {
  await knex.schema.createTable('questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.text('text').notNullable();
    table.json('options').nullable();
    table.json('correct_answer').nullable();
    table.string('media_url').nullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('questions');
};
