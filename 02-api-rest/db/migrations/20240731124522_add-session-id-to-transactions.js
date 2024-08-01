export async function up(knex) {
    await knex.schema.alterTable('transactions', table => {
        // index means that it will store in cache
        table.uuid('session_id').after('id').index();
    });
}
// rollback from above migration
export async function down(knex) {
    await knex.schema.alterTable('transactions', table => {
        table.dropColumn('session_id');
    });
}
