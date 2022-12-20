module.exports = (app) => {
	const MAIN_DATABASE = 'users';

	const find = (filter = {}) => {
		return app.db(MAIN_DATABASE).where(filter).select();
	};

	const save = async (user) => {
		if (!user.name) return { error: 'Nome é um atributo obrigatório' };
		if (!user.mail) return { error: 'Email é um atributo obrigatório' };
		if (!user.passwd) return { error: 'Senha é um atributo obrigatório' };

		const userDb = await find({ mail: user.mail });

		if (userDb && userDb.length === 1)
			return { error: 'Já existe um usuário cadastrado com este email' };

		return app.db(MAIN_DATABASE).insert(user, '*');
	};

	return { find, save };
};
