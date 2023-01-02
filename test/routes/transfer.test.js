const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6LTEsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXIxQG1haWwuY29tIn0.W6jmuFPwZOhQfhBo15kBUfqWCS4UtpiJQ1f7m6q_4xs';

beforeAll(async () => {
	await app.db.seed.run();
});

test('Deve listar apenas as transferências do usuário', () => {
	return request(app)
		.get(MAIN_ROUTE)
		.set('authorization', `bearer ${TOKEN}`)
		.then((res) => {
			expect(res.status).toBe(200);
			expect(res.body).toHaveLength(1);
			expect(res.body[0].description).toBe('Transfer #1');
		});
});

test('Deve inserir uma transferência com sucesso', () => {
	return request(app)
		.post(MAIN_ROUTE)
		.set('authorization', `bearer ${TOKEN}`)
		.send({
			description: 'Regular transfer',
			user_id: -1,
			acc_ori_id: -1,
			acc_dest_id: -2,
			amount: 100,
			date: new Date(),
		})
		.then(async (res) => {
			expect(res.status).toBe(201);
			expect(res.body.description).toBe('Regular transfer');

			const transactions = await app.db('transactions').where({ transfer_id: res.body.id });

			expect(transactions).toHaveLength(2);

			expect(transactions[0].description).toBe('Transfer to Acc #-2');
			expect(transactions[1].description).toBe('Transfer from Acc #-1');

			expect(transactions[0].amount).toBe('-100.00');
			expect(transactions[1].amount).toBe('100.00');

			expect(transactions[0].acc_id).toBe(-1);
			expect(transactions[1].acc_id).toBe(-2);
		});
});

describe('Ao salvar uma transferência válida...', () => {
	let transferId;
	let income;
	let outcome;

	test('Deve retornar o status 201 e os dados da transferência', () => {
		return request(app)
			.post(MAIN_ROUTE)
			.set('authorization', `bearer ${TOKEN}`)
			.send({
				description: 'Regular transfer',
				user_id: -1,
				acc_ori_id: -1,
				acc_dest_id: -2,
				amount: 100,
				date: new Date(),
			})
			.then(async (res) => {
				expect(res.status).toBe(201);
				expect(res.body.description).toBe('Regular transfer');

				transferId = res.body.id;
			});
	});

	test('As transações equivalentes devem ter sido geradas', async () => {
		const transactions = await app
			.db('transactions')
			.where({ transfer_id: transferId })
			.orderBy('amount');
		expect(transactions).toHaveLength(2);

		[outcome, income] = transactions;
	});

	test('A transação de saída deve ser negativa', () => {
		expect(outcome.description).toBe('Transfer to Acc #-2');
		expect(outcome.amount).toBe('-100.00');
		expect(outcome.acc_id).toBe(-1);
		expect(outcome.type).toBe('O');
	});

	test('A transação de saída deve ser positiva', () => {
		expect(income.description).toBe('Transfer from Acc #-1');
		expect(income.amount).toBe('100.00');
		expect(income.acc_id).toBe(-2);
		expect(income.type).toBe('I');
	});

	test('Ambas devem referenciar a transferência que as originou', () => {
		expect(income.transfer_id).toBe(transferId);
		expect(outcome.transfer_id).toBe(transferId);
	});
});

describe('Ao tentar salvar uma transferência inválida...', () => {
	const testTemplate = (newData, errorMessage) => {
		return request(app)
			.post(MAIN_ROUTE)
			.set('authorization', `bearer ${TOKEN}`)
			.send({
				description: 'Regular transfer',
				user_id: -1,
				acc_ori_id: -1,
				acc_dest_id: -2,
				amount: 100,
				date: new Date(),
				...newData,
			})
			.then((res) => {
				expect(res.status).toBe(400);
				expect(res.body.error).toBe(errorMessage);
			});
	};

	test('Não deve inserir sem descrição', () =>
		testTemplate({ description: null }, 'Descrição é um atributo obrigatório'));

	test('Não deve inserir sem valor', () =>
		testTemplate({ amount: null }, 'Valor é um atributo obrigatório'));

	test('Não deve inserir sem data', () =>
		testTemplate({ date: null }, 'Data é um atributo obrigatório'));

	test('Não deve inserir sem conta de origem', () =>
		testTemplate({ acc_ori_id: null }, 'Id da conta de origem é um atributo obrigatório'));

	test('Não deve inserir sem conta de destino', () =>
		testTemplate({ acc_dest_id: null }, 'Id da conta de destino é um atributo obrigatório'));

	test('Não deve inserir se a conta de origem e destino forem as mesmas', () =>
		testTemplate(
			{ acc_dest_id: 1, acc_ori_id: 1 },
			'A conta de origem deve ser diferente da conta de destino'
		));

	test('Não deve inserir se as contas pertencerem a outro usuário', () =>
		testTemplate({ acc_ori_id: -3 }, 'A conta não pertence ao usuário'));
});

test('Deve retornar uma transferência por id', () => {
	return request(app)
		.get(`${MAIN_ROUTE}/-1`)
		.set('authorization', `bearer ${TOKEN}`)
		.then((res) => {
			expect(res.status).toBe(200);
			expect(res.body.description).toBe('Transfer #1');
		});
});

describe('Ao alterar uma transferência válida...', () => {
	let transferId;
	let income;
	let outcome;

	test('Deve retornar o status 200 e os dados da transferência', () => {
		return request(app)
			.put(`${MAIN_ROUTE}/-1`)
			.set('authorization', `bearer ${TOKEN}`)
			.send({
				description: 'Transfer updated',
				user_id: -1,
				acc_ori_id: -1,
				acc_dest_id: -2,
				amount: 500,
				date: new Date(),
			})
			.then(async (res) => {
				expect(res.status).toBe(200);
				expect(res.body.description).toBe('Transfer updated');
				expect(res.body.amount).toBe('500.00');

				transferId = res.body.id;
			});
	});

	test('As transações equivalentes devem ter sido geradas', async () => {
		const transactions = await app
			.db('transactions')
			.where({ transfer_id: transferId })
			.orderBy('amount');
		expect(transactions).toHaveLength(2);

		[outcome, income] = transactions;
	});

	test('A transação de saída deve ser negativa', () => {
		expect(outcome.description).toBe('Transfer to Acc #-2');
		expect(outcome.amount).toBe('-500.00');
		expect(outcome.acc_id).toBe(-1);
		expect(outcome.type).toBe('O');
	});

	test('A transação de saída deve ser positiva', () => {
		expect(income.description).toBe('Transfer from Acc #-1');
		expect(income.amount).toBe('500.00');
		expect(income.acc_id).toBe(-2);
		expect(income.type).toBe('I');
	});

	test('Ambas devem referenciar a transferência que as originou', () => {
		expect(income.transfer_id).toBe(transferId);
		expect(outcome.transfer_id).toBe(transferId);
	});
});

describe('Ao tentar alterar uma transferência inválida...', () => {
	const testTemplate = (newData, errorMessage) => {
		return request(app)
			.put(`${MAIN_ROUTE}/-1`)
			.set('authorization', `bearer ${TOKEN}`)
			.send({
				description: 'Regular transfer',
				user_id: -1,
				acc_ori_id: -1,
				acc_dest_id: -2,
				amount: 100,
				date: new Date(),
				...newData,
			})
			.then((res) => {
				expect(res.status).toBe(400);
				expect(res.body.error).toBe(errorMessage);
			});
	};

	test('Não deve inserir sem descrição', () =>
		testTemplate({ description: null }, 'Descrição é um atributo obrigatório'));

	test('Não deve inserir sem valor', () =>
		testTemplate({ amount: null }, 'Valor é um atributo obrigatório'));

	test('Não deve inserir sem data', () =>
		testTemplate({ date: null }, 'Data é um atributo obrigatório'));

	test('Não deve inserir sem conta de origem', () =>
		testTemplate({ acc_ori_id: null }, 'Id da conta de origem é um atributo obrigatório'));

	test('Não deve inserir sem conta de destino', () =>
		testTemplate({ acc_dest_id: null }, 'Id da conta de destino é um atributo obrigatório'));

	test('Não deve inserir se a conta de origem e destino forem as mesmas', () =>
		testTemplate(
			{ acc_dest_id: 1, acc_ori_id: 1 },
			'A conta de origem deve ser diferente da conta de destino'
		));

	test('Não deve inserir se as contas pertencerem a outro usuário', () =>
		testTemplate({ acc_ori_id: -3 }, 'A conta não pertence ao usuário'));
});

describe('Ao remover uma transferência...', () => {
	test('Deve retornar o status 204', () => {
		return request(app)
			.delete(`${MAIN_ROUTE}/-1`)
			.set('authorization', `bearer ${TOKEN}`)
			.then((res) => {
				expect(res.status).toBe(204);
			});
	});

	test('O registro deve ser apagado do banco', () => {
		return app
			.db('transfers')
			.where({ id: -1 })
			.then((result) => {
				expect(result).toHaveLength(0);
			});
	});

	test('As transações associadas devem ter sido removidas', () => {
		return app
			.db('transactions')
			.where({ transfer_id: -1 })
			.then((result) => {
				expect(result).toHaveLength(0);
			});
	});
});

test('Não deve retornar transferência de outro usuário', () => {
	return request(app)
		.get(`${MAIN_ROUTE}/-2`)
		.set('authorization', `bearer ${TOKEN}`)
		.then((res) => {
			expect(res.status).toBe(403);
			expect(res.body.error).toBe('Este recurso não pertence ao usuário');
		});
});
