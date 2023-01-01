const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
	const MAIN_DATABASE = 'accounts';

	const find = (filter = {}) => {
		return app.db(MAIN_DATABASE).where(filter).first();
	};

	const findAll = (userId) => {
		return app.db(MAIN_DATABASE).where({ user_id: userId });
	};

	const save = async (account) => {
		if (!account.name) throw new ValidationError('Nome é um atributo obrigatório');

		const accDb = await find({ name: account.name, user_id: account.user_id });

		if (accDb) throw new ValidationError('Já existe uma conta com esse nome');

		return app.db(MAIN_DATABASE).insert(account, '*');
	};

	const update = (id, account) => {
		return app.db(MAIN_DATABASE).where({ id }).update(account, '*');
	};

	const remove = (id) => {
		return app.db(MAIN_DATABASE).where({ id }).del();
	};

	return { find, findAll, save, update, remove };
};
