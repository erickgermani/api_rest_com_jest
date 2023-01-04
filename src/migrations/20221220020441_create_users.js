exports.up = (knex) => {
	return knex.schema.createTable('users', (t) => {
		t.increments('id').primary();
		t.string('name').notNullable();
		t.string('mail').notNullable().unique();
		t.string('passwd').notNullable();
	});
};

exports.down = (knex) => {
	return knex.schema.dropTableIfExists('users');
};
