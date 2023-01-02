const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
	const MAIN_DATABASE = 'transfers';

	const find = (filter = {}) => {
		return app.db(MAIN_DATABASE).where(filter).select();
	};

	const validate = async (t) => {
		if (!t.description) throw new ValidationError('Descrição é um atributo obrigatório');
		if (!t.amount) throw new ValidationError('Valor é um atributo obrigatório');
		if (!t.date) throw new ValidationError('Data é um atributo obrigatório');
		if (!t.acc_ori_id)
			throw new ValidationError('Id da conta de origem é um atributo obrigatório');
		if (!t.acc_dest_id)
			throw new ValidationError('Id da conta de destino é um atributo obrigatório');
		if (t.acc_ori_id === t.acc_dest_id)
			throw new ValidationError('A conta de origem deve ser diferente da conta de destino');

		const accounts = await app.db('accounts').whereIn('id', [t.acc_dest_id, t.acc_ori_id]);
		accounts.forEach((acc) => {
			if (acc.user_id !== parseInt(t.user_id, 10))
				throw new ValidationError('A conta não pertence ao usuário');
		});
	};

	const save = async (t) => {
		const result = await app.db(MAIN_DATABASE).insert(t, '*');

		const transferId = result[0].id;

		const transactions = [
			{
				description: `Transfer to Acc #${t.acc_dest_id}`,
				date: t.date,
				amount: t.amount * -1,
				type: 'O',
				acc_id: t.acc_ori_id,
				transfer_id: transferId,
			},
			{
				description: `Transfer from Acc #${t.acc_ori_id}`,
				date: t.date,
				amount: t.amount,
				type: 'I',
				acc_id: t.acc_dest_id,
				transfer_id: transferId,
			},
		];

		await app.db('transactions').insert(transactions);

		return result;
	};

	const findOne = (filter = {}) => {
		return app.db(MAIN_DATABASE).where(filter).first();
	};

	const update = async (id, t) => {
		const result = await app.db(MAIN_DATABASE).where({ id }).update(t, '*');

		const transactions = [
			{
				description: `Transfer to Acc #${t.acc_dest_id}`,
				date: t.date,
				amount: t.amount * -1,
				type: 'O',
				acc_id: t.acc_ori_id,
				transfer_id: id,
			},
			{
				description: `Transfer from Acc #${t.acc_ori_id}`,
				date: t.date,
				amount: t.amount,
				type: 'I',
				acc_id: t.acc_dest_id,
				transfer_id: id,
			},
		];

		await app.db('transactions').where({ transfer_id: id }).del();
		await app.db('transactions').insert(transactions);

		return result;
	};

	const remove = async (id) => {
		await app.db('transactions').where({ transfer_id: id }).del();

		return app.db(MAIN_DATABASE).where({ id }).del();
	};

	return { find, save, findOne, update, remove, validate };
};
