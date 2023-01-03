module.exports = {
	test: {
		client: 'pg',
		version: '15.1',
		connection: {
			host: 'localhost',
			user: 'postgres',
			password: 'root',
			database: 'db_api_rest_com_jest',
		},
		migrations: {
			directory: 'src/migrations',
		},
		seeds: {
			directory: 'src/seeds',
		},
	},
	prod: {
		client: 'pg',
		version: '15.1',
		connection: {
			host: 'localhost',
			user: 'postgres',
			password: 'root',
			database: 'apidb',
		},
		migrations: {
			directory: 'src/migrations',
		},
	},
};
