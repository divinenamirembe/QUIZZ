exports.up = function (knex) {
  return knex.schema.createTable('questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('quiz_id').notNullable().references('id').inTable('quizzes').onDelete('CASCADE');
    table.string('question').notNullable();
    table.jsonb('options').notNullable(); // Use jsonb for better performance and flexibility
    table.string('correct_answer').notNullable();
    table.string('image_url');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('questions');
};