const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
	const MAIN_DATABASE = 'users';

	const findAll = () => {
		return app.db(MAIN_DATABASE).select(['id', 'name', 'mail']);
	};

	const findOne = (filter = {}) => {
		return app.db(MAIN_DATABASE).where(filter).first();
	};

	const getPasswdHash = (passwd) => {
		const salt = bcrypt.genSaltSync(10);

		return bcrypt.hashSync(passwd, salt);
	};

	const save = async (user) => {
		if (!user.name) throw new ValidationError('Nome é um atributo obrigatório');
		if (!user.mail) throw new ValidationError('Email é um atributo obrigatório');
		if (!user.passwd) throw new ValidationError('Senha é um atributo obrigatório');

		const userDb = await findOne({ mail: user.mail });

		if (userDb) throw new ValidationError('Já existe um usuário cadastrado com este email');

		user.passwd = getPasswdHash(user.passwd);

		return app.db(MAIN_DATABASE).insert(user, ['id', 'name', 'mail']);
	};

	return { findOne, findAll, save };
};
