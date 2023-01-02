const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
	const MAIN_DATABASE = 'transactions';

	const find = (userId, filter = {}) => {
		return app
			.db(MAIN_DATABASE)
			.join('accounts', 'accounts.id', 'acc_id')
			.where(filter)
			.andWhere('accounts.user_id', '=', userId)
			.select();
	};

	const findOne = (filter) => {
		return app.db(MAIN_DATABASE).where(filter).first();
	};

	const save = (transaction) => {
		if (!transaction.description)
			throw new ValidationError('Descrição é um atributo obrigatório');

		if (!transaction.amount) throw new ValidationError('Valor é um atributo obrigatório');

		if (!transaction.date) throw new ValidationError('Data é um atributo obrigatório');

		if (!transaction.acc_id) throw new ValidationError('Id da conta é um atributo obrigatório');

		if (!transaction.type) throw new ValidationError('Tipo é um atributo obrigatório');

		if (!(transaction.type === 'I' || transaction.type === 'O'))
			throw new ValidationError('Tipo inválido');

		if (
			(transaction.type === 'I' && transaction.amount < 0) ||
			(transaction.type === 'O' && transaction.amount > 0)
		)
			transaction.amount *= -1;

		return app.db(MAIN_DATABASE).insert(transaction, '*');
	};

	const update = (id, transaction) => {
		return app.db(MAIN_DATABASE).where({ id }).update(transaction, '*');
	};

	const remove = (id, transaction) => {
		return app.db(MAIN_DATABASE).where({ id }).del();
	};

	return { find, save, findOne, update, remove };
};
