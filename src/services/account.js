const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
	const MAIN_DATABASE = 'accounts';

	const findAll = () => {
		return app.db(MAIN_DATABASE).select();
	};

	const save = async (account) => {
		if (!account.name) throw new ValidationError('Nome é um atributo obrigatório');

		return app.db(MAIN_DATABASE).insert(account, '*');
	};

	const find = (filter = {}) => {
		return app.db(MAIN_DATABASE).where(filter).first();
	};

	const update = (id, account) => {
		return app.db(MAIN_DATABASE).where({ id }).update(account, '*');
	};

	const remove = (id) => {
		return app.db(MAIN_DATABASE).where({ id }).del();
	};

	return { findAll, save, find, update, remove };
};
