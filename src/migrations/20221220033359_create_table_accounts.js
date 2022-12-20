/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.createTable('accounts', (t) => {
		t.increments('id').primary();
		t.string('name').notNullable();
		t.integer('user_id').references('id').inTable('users').notNullable();
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.dropTableIfExists('accounts');
};
