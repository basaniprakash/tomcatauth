require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authService = require('./AuthService');
const userService = require('./UserService');

const app = express();

const port = process.env.PORT || 3001;
const secondaryAppUrl = process.env.SECONDARY_APP_URL

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const proxyOptions = {
	target: secondaryAppUrl,
	changeOrigin: true,
	ws: true,
	onProxyRes: function(proxyRes, req, res) {
		let responseBody = '';
		proxyRes.on('data', (chunk) => {
			responseBody += chunk;
		});
		proxyRes.on('end', () => {
			console.log('Response from secondary app:', responseBody);
		});
	}
};

const secondaryAppProxy = createProxyMiddleware(proxyOptions);

app.use((req, res, next) => {
	console.log('path', req.path);
	if (req.path !== '/search') {
		console.log('forwarding to secondaryAppProxy');
		return secondaryAppProxy(req, res, next);
	}
	console.log('calling to next middleware');
	next();
});


// POST endpoint to perform LDAP search on secondary server
app.post('/search', async (req, res, next) => {
  const { username, password } = req.body;
	console.log(username, password);

	try {
		console.log('Authenticating...');
		const isAuthenticated = await authService.authenticateUser(username, password)

		if (isAuthenticated) {
			console.log('Successfully authenticated..');
			const storedPassword = userService.getStoredPassword(username);
			if (storedPassword) {
				req.body.password = storedPassword;
				console.log(req.body.username, req.body.password);
			}
			else {
				return res.status(404).send('User password not found');
			}
			console.log('Forwarding to secondaryapp');
			secondaryAppProxy(req, res, next);
		} else {
				console.log('Authentication failed');
				return res.status(401).send('LDAP Authentication failed');
		}
	} catch (error) {
		return res.status(500).send(error.message);
	}
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

