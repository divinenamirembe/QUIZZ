exports.up = async function(knex) {
  await knex.schema.createTable('quizzes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title').notNullable();
    table.text('description').nullable();
    table.uuid('creator_id').references('id').inTable('users').onDelete('CASCADE');
    table.json('settings').nullable();
    table.enu('status', ['Draft', 'Published']).defaultTo('Draft');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('quizzes');
};
