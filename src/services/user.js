const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
	const MAIN_DATABASE = 'users';

	const find = (filter = {}) => {
		return app.db(MAIN_DATABASE).where(filter).select();
	};

	const save = async (user) => {
		if (!user.name) throw new ValidationError('Nome é um atributo obrigatório');
		if (!user.mail) throw new ValidationError('Email é um atributo obrigatório');
		if (!user.passwd) throw new ValidationError('Senha é um atributo obrigatório');

		const userDb = await find({ mail: user.mail });

		if (userDb && userDb.length === 1)
			throw new ValidationError('Já existe um usuário cadastrado com este email');

		return app.db(MAIN_DATABASE).insert(user, '*');
	};

	return { find, save };
};
