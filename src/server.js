const app = require('./app');

app.get('/', (req, res) => {
	res.status(200).send();
});

app.listen(3001, () => {
	console.log('A aplicação está no ar');
});
