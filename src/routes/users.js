module.exports = (app) => {
	const findAll = (req, res) => {
		app.services.user.find().then((result) => res.status(200).json(result));
	};

	const create = async (req, res) => {
		const result = await app.services.user.save(req.body);

		if (result.error) return res.status(400).json(result);

		return res.status(201).json(result[0]);
	};

	return { findAll, create };
};
