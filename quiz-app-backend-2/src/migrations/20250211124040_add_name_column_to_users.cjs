// Migration file: add_name_column_to_users.js

exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('name');  // Add the 'name' column (change data type as needed)
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('name');  // Rollback the change if needed
  });
};
