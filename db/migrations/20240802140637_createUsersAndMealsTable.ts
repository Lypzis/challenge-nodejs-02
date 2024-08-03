import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', table => {
    table.uuid('id').primary();

    table.text('name').notNullable();

    table.text('email').notNullable().unique();

    // plain text password :DDDDD
    table.text('password').notNullable();

    table.text('picture_path');

    table.uuid('session_id').after('id').index();
  });

  await knex.schema.createTable('meals', table => {
    table.uuid('id').primary();

    table.uuid('user_id').notNullable();
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.text('name').notNullable();

    table.text('description');

    table.date('date').defaultTo(knex.fn.now()).notNullable();

    table.boolean('is_in_diet').defaultTo(false).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
  await knex.schema.dropTable('users');
}
