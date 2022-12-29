const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const mail = `${Date.now()}@mail.com`;
const MAIN_ROUTE = '/v1/users';

let user;

beforeAll(async () => {
	const res = await app.services.user.save({
		name: 'Erick Germani',
		mail: Date.now() + '@mail.com',
		passwd: '123456',
	});

	user = { ...res[0] };

	user.token = jwt.encode(user, 'Segredo!');
});

test('Deve listar todos os usuários', () => {
	return request(app)
		.get(MAIN_ROUTE)
		.set('authorization', `bearer ${user.token}`)
		.then((res) => {
			expect(res.status).toBe(200);
			expect(res.body.length).toBeGreaterThan(0);
		});
});

test('Deve inserir usuário com sucesso', () => {
	return request(app)
		.post(MAIN_ROUTE)
		.set('authorization', `bearer ${user.token}`)
		.send({ name: 'Walter Mitty', mail, passwd: '123456' })
		.then((res) => {
			expect(res.status).toBe(201);
			expect(res.body.name).toBe('Walter Mitty');
			expect(res.body).not.toHaveProperty('passwd');
		});
});

test('Deve armazenar senha criptografada', async () => {
	const res = await request(app)
		.post(MAIN_ROUTE)
		.set('authorization', `bearer ${user.token}`)
		.send({ name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, passwd: '123456' });

	expect(res.status).toBe(201);

	const { id } = res.body;

	const userDB = await app.services.user.findOne({ id });
	expect(userDB.passwd).not.toBeUndefined();
	expect(userDB.passwd).not.toBe('123456');
});

test('Não deve inserir usuário sem nome', () => {
	return request(app)
		.post(MAIN_ROUTE)
		.set('authorization', `bearer ${user.token}`)
		.send({ mail, passwd: '123456' })
		.then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Nome é um atributo obrigatório');
		});
});

test('Não deve inserir usuário sem email', async () => {
	const result = await request(app)
		.post(MAIN_ROUTE)
		.set('authorization', `bearer ${user.token}`)
		.send({
			name: 'Walter Mitty',
			passwd: '123456',
		});

	expect(result.status).toBe(400);
	expect(result.body.error).toBe('Email é um atributo obrigatório');
});

test('Não deve inserir usuário sem senha', (done) => {
	request(app)
		.post(MAIN_ROUTE)
		.set('authorization', `bearer ${user.token}`)
		.send({ name: 'Walter Mitty', mail })
		.then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Senha é um atributo obrigatório');
			done();
		})
		.catch((err) => done.fail(err));
});

test('Não deve inserir usuário com email existente', () => {
	return request(app)
		.post(MAIN_ROUTE)
		.set('authorization', `bearer ${user.token}`)
		.send({ name: 'Walter Mitty', mail, passwd: '123456' })
		.then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Já existe um usuário cadastrado com este email');
		});
});
