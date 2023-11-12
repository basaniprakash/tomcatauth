const express = require('express');
const ldap = require('ldapjs');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;
const host = '192.168.100.100';
const proto = 'http';

app.use(bodyParser.urlencoded({ extended: true }));

const searchBase = process.env.SEARCH_BASE || 'ou=blr,ou=wpg,ou=imw,o=ot';
const primaryLDAP = process.env.PRIMARY_LDAP || 'ldaps://192.168.100.100:636';
const secondaryLDAP = process.env.SECONDARY_LDAP || 'ldaps://192.168.100.101:636';

const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

function validateUser(username, password) {
	return users.hasOwnProperty(username);
}

// Command-line arguments
const args = process.argv.slice(2); // Remove the first two elements (node and script path)
const adminDn = args[0]; // The first argument
const password = args[1]; // The second argument

console.log(adminDn, password);

function performLDAPBInd(client, username, password, callback) {
	const userDn = users[username]? users[username].dn: null;
	if ( !userDn) {
		return callback(new Error('User DN not found'), null);
	}

	client.bind(userDn, password, (err) => {
		if (err) {
			console.error('LDAP bind error:', err);
			return callback(err, null);
		}
		console.log('LDAP bind successful');
		callback(null, client);
	});
}


// Set up LDAP client using ldapjs
const client = ldap.createClient({
  url: 'ldaps://192.168.100.100:636',
  tlsOptions: { rejectUnauthorized: false }
});


// Bind to the LDAP server
function bindToLDAP() {
  client.bind(adminDn, password, (err) => {
    if (err) {
      console.error('LDAP bind error:', err);
      setTimeout(bindToLDAP, 5000); // Retry bind after 5 seconds
    } else {
      console.log('LDAP bind successful');
    }
  });
}

bindToLDAP(); // Call the function to bind

// Function to log the LDAP search result entry
function logSearchResultEntry(entry) {
  console.log(`Message ID: ${entry.messageId}`);
  console.log(`Protocol Operation: ${entry.protocolOp}`);
  console.log(`Type: ${entry.type}`);
  console.log(`Object Name: ${entry.objectName}`);
  console.log('Attributes:');
  entry.attributes.forEach(attr => {
    console.log(`  ${attr.type}: ${attr.values.join(', ')}`);
  });
  console.log('Controls:', entry.controls);
}


// Function to safely parse and log entries
function safeLogSearchResultEntry(entry) {
  try {
    logSearchResultEntry(entry);
  } catch (error) {
    console.error('Error logging LDAP entry:', error);
  }
}


// Assuming 'entryPojo' is your search result entry object

app.post('/search', (req, res) => {
	const { username, password } = req.body;

	if ( !validateUser(usename)) {
		return res.status(401).send('Invalid username');
	}

	const client = ldap.createClient({
		url: primaryLDAP,
		tlsOptions: { rejectUnauthorized: false }
	});

	performLDAPBInd(client, username, password, (err, boundClient) => {
		if (err) {
			res.status(500).send('LDAP server bind failed');
			return;
		}

	const opts = {
		scope: 'sub',
		filter: '(objectclass=*)',
	};

	boundClient.search(se`

// GET endpoint to perform LDAP search
app.get('/search', (req, res) => {
  const opts = {
    scope: 'sub',
    filter: '(objectclass=*)',
    attributes: ['dn']
  };

  client.search(searchBase, opts, (err, searchRes) => {
    let entries = [];

    if (err) {
      res.status(500).json({ error: err.toString() });
      return;
    }

		searchRes.on('searchEntry', (entry) => {
	  	let entryPojo = entry.pojo;
	  	safeLogSearchResultEntry(entryPojo); // Use safe logging
		  entries.push(entryPojo);
		});

    searchRes.on('error', (err) => {
      console.error('search error:', err);
    });

    searchRes.on('end', (result) => {

      res.json(entries); // Send the search results as JSON
    });
  });
});

process.on('SIGINT', () => {
  console.log('Disconnecting LDAP client...');
  client.unbind((err) => {
    if (err) {
      console.error('Error unbinding LDAP client:', err);
    } else {
      console.log('LDAP client disconnected.');
    }
    process.exit(err ? 1 : 0);
  });
});

app.listen(port, host, () => {
  console.log(`Server is running at ${proto}://${host}:${port}`);
});

