module.exports = (app) => {
	const MAIN_DATABASE = 'transfers';

	const find = (filter = {}) => {
		return app.db(MAIN_DATABASE).where(filter).select();
	};

	const save = async (transfer) => {
		const result = await app.db(MAIN_DATABASE).insert(transfer, '*');

		const transferId = result[0].id;

		const transactions = [
			{
				description: `Transfer to Acc #${transfer.acc_dest_id}`,
				date: transfer.date,
				amount: transfer.amount * -1,
				type: 'O',
				acc_id: transfer.acc_ori_id,
				transfer_id: transferId,
			},
			{
				description: `Transfer from Acc #${transfer.acc_ori_id}`,
				date: transfer.date,
				amount: transfer.amount,
				type: 'I',
				acc_id: transfer.acc_dest_id,
				transfer_id: transferId,
			},
		];

		await app.db('transactions').insert(transactions);

		return result;
	};

	return { find, save };
};
