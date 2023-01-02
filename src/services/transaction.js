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

	const save = (t) => {
		if (!t.description) throw new ValidationError('Descrição é um atributo obrigatório');
		if (!t.amount) throw new ValidationError('Valor é um atributo obrigatório');
		if (!t.date) throw new ValidationError('Data é um atributo obrigatório');
		if (!t.acc_id) throw new ValidationError('Id da conta é um atributo obrigatório');
		if (!t.type) throw new ValidationError('Tipo é um atributo obrigatório');
		if (!(t.type === 'I' || t.type === 'O')) throw new ValidationError('Tipo inválido');

		if ((t.type === 'I' && t.amount < 0) || (t.type === 'O' && t.amount > 0)) t.amount *= -1;

		return app.db(MAIN_DATABASE).insert(t, '*');
	};

	const update = (id, transaction) => {
		return app.db(MAIN_DATABASE).where({ id }).update(transaction, '*');
	};

	const remove = (id, transaction) => {
		return app.db(MAIN_DATABASE).where({ id }).del();
	};

	return { find, save, findOne, update, remove };
};
