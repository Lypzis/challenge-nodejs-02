// NOTE: don't EVER edit a migration sent to the team
// creation
export async function up(knex) {
    await knex.schema.createTable('transactions', table => {
        table.uuid('id').primary();
        table.text('title').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}
// rollback
export async function down(knex) {
    await knex.schema.dropTable('transactions');
}
