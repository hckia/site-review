'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {DATABSE, PORT} = require('./config');

const {voteSchema, Review, Site} = require('./model');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

/** 
Begin Sites section
**/

//note, I have no site.methods.serialize function in model.js. work with Victor on this.
app.get('/sites', (req, res) => {
	Site.find()
	.then(sites => {
		res.json(sites.map(site => site.serialize()));
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'something went terribly wrong!'});
	});
});

app.get('/sites/:id', (req, res) => {
	Site.find()
	.findById(req.params.id)
	.then(site => res.json(site.serialize()))
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'something went horribly awry, or we just didn\'t find your site'});
	});
});

//ask if this should be in a seperate file for MVC and how to regex this
function sanitize(url){
// which method is better?
//	var lastChar = url.substr(url.length-1);
// or...
 	var lastChar = url.slice(-1);
// asking because I was told substr is not compatible with IE
//http:// = 7 chracters
//https:// = 8 characters
	var httpChar = url.slice(0,7);
	var httpsChar = url.slice(0,8);

	if(lastChar === '/') {
		url = url.slice(-1);
	}
	if(httpChar == 'http://'){
		url = url.slice(7);
	}
	if(httpsChar == 'https://'){
		url = url.slice(8);
	}
//ask about regex for this.
	return url;
};

app.post('/sites', (req, res) => {
	const requiredFields = ['url','description'];
	for(let i = 0; i < requiredFields.length; i++){
		const field = requiredFields[i];
		if(!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	url = sanitize(req.body.url);
// probably wrong, probably still need req.body.url
	if(!Site.find({url: url})) {
		Site
			.create({
				url: url,
				description: req.body.description
			})
			.then(site => res.status(201).json(site.serialize()))
			.catch(err => {
				console.error(err);
				res.status(500).json({error: 'Something went wrong'});
			});
	}
});

// I'm not sure I want them to have the ability to delete a site specifically. Definitely their account.

/*app.delete('/sites/:id', (req, res) => {
	Site.findByIdAndRemove(req.params.id)
	.then(() => {
		res.status(204).json({message: 'successfully deleted'})
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'something went terribly wrong'});
	});
}); */

// I'm not even sure I want them to have the ability to edit the site and description. Just the ability to edit Reviews. MAYBE i can allow them to edit the url and description for two days, or upon review.
// The problem with doing this is I have to think about what if a user deletes their account? What happens to the sites? I want them to remain while respecting the users permission to delete their personal data.



/** 
End Sites section
**/

app.use('*', function (req, res){
	res.status(404).json({message: 'not found'});
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if(err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
				.on('error', err => {
					mongoose.disconnect();
					reject(err);
				});
		});
	});
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.

function closeServer(){
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if(err){
					return reject(err);
				}
				resolve();
			});
		});
	});
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.

if(require.main == module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer}