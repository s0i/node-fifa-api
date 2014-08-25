node-fifa-api
=============
Usage
-------------
First, you want to open up NPM in your working directory
	
	cd node-fifa-api

Then simply run 'npm install'
	
	npm install

Start the app
	
	node app.js
	
API
=============
To get match data that is current, send a GET request to:
	http://localhost/api/today
	
And if you want to retreive data for future matches, i.e., > today:
	http://localhost/api/tomorrow
