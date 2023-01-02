const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6LTEsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXIxQG1haWwuY29tIn0.W6jmuFPwZOhQfhBo15kBUfqWCS4UtpiJQ1f7m6q_4xs';

beforeAll(async () => {
	// await app.db.migrate.rollback();
	// await app.db.migrate.latest();
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
