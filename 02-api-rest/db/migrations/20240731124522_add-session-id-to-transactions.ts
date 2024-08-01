import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', table => {
    // index means that it will store in cache
    table.uuid('session_id').after('id').index();
  });
}

// rollback from above migration
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', table => {
    table.dropColumn('session_id');
  });
}
