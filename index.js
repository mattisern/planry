const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const uuid = require('uuid/v4');

let app = express();

//config/setup
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//routes TODO:extract
app.get('/', (req, res) => res.redirect('boards'))

app.get('/boards', (req, res) => {
	let newUuid = uuid();
	//TODO: here we should actually create a board and persist it to the db. This just proves the point for now
	res.redirect('boards/' + newUuid)
});

app.get('/boards/:uuid', (req, res) => {
	//TODO: here we should start out by checking if we have a board in the db, otherwise someone is playing with our url and should just receive a 404
	res.render('pages/boards', { 'uuid' : req.params.uuid })
});


//start our listener
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))