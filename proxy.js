require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const authService = require('./AuthService');
const userService = require('./UserService');
const https = require('https');

const fetch = require('node-fetch');
const tough = require('tough-cookie');
const CookieJar = tough.CookieJar;

const jar = new CookieJar();
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // WARNING: This is insecure.
});
const app = express();

const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/authenticate', async (req, res, next) => {
  console.log('Req.body:', req.body);
  const { username, password } = req.body;
  console.log(username, password);

	const requestUrl = 'http://localhost:80/nps/servlet/imanauthentication';
  try {
    console.log('Authenticating...');
    const isAuthenticated = await authService.authenticateUser(username, password);

    if (isAuthenticated) {
		const agent = requestUrl.startsWith('https:') ? httpsAgent : null;

      console.log('Successfully authenticated..');
      const storedPassword = userService.getStoredPassword(username);

      if (storedPassword) {
        const modifiedBody = new URLSearchParams({
          ...req.body,
          password: storedPassword
        }).toString();

        console.log('modifiedBody:', modifiedBody);

        // Forward the modified request back to Apache

			  const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Continue-Processing': '100',
          'Cookie': jar.getCookieStringSync('http://localhost/nps/servlet/imanauthentication'),
        },
        body: modifiedBody,
        agent: parsedURL => parsedURL.protocol === 'https:' ? httpsAgent : null,
      };
      
				const response = await fetch('http://localhost/nps/servlet/imanauthentication', options);

      // Update the cookie jar with response cookies
      jar.setCookieSync(response.headers.get('set-cookie') || '', 'http://localhost/nps/servlet/imanauthentication');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text();
        console.log('Response from apache: (status=', response.status, data);
        return res.status(response.status).send(data);
      } else {
        return res.status(404).send('Stored password not found');
      }
    } else {
      console.log('Authentication failed');
      return res.status(401).send('Authentication failed');
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

