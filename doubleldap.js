require('dotenv').config();
const express = require('express');
const ldap = require('ldapjs');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const SEARCH_BASE_REMOTE = process.env.SEARCH_BASE_REMOTE;
const SEARCH_BASE_LOCAL = process.env.SEARCH_BASE_LOCAL;
const primaryLDAP = process.env.PRIMARY_LDAP || 'ldaps://192.168.100.100:636';
const secondaryLDAP = process.env.SECONDARY_LDAP || 'ldaps://192.168.100.101:636';
const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));


function createFQDN(username, isRemote) {
	const base = isRemote? SEARCH_BASE_REMOTE : SEARCH_BASE_LOCAL;
	return `cn=${username},${base}`;
}

function performLDAPBind(client, dn, password, callback) {
	console.log('performLDAPBind', dn, password);
  client.bind(dn, password, (err) => {
    callback(err, client);
  });
}

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



function performLDAPSearch(client, base, opts, callback) {
  client.search(base, opts, (err, searchRes) => {
    if (err) {
      return callback(err, null);
    }

    let entries = [];
    searchRes.on('searchEntry', (entry) => {
			let entryPojo = entry.pojo;
			//logSearchResultEntry(entryPojo);
      entries.push(entryPojo);
    });

    searchRes.on('error', (err) => {
      callback(err, null);
    });

    searchRes.on('end', (result) => {
			console.log('Total entries', entries.length);
      callback(null, entries);
    });
  });
}

// POST endpoint to perform LDAP search on secondary server
app.post('/search', (req, res) => {
  const { username, password } = req.body;
	console.log(username, password);

	const dnLocal =  createFQDN(username, false);
	const dnRemote = createFQDN(username, true);

	console.log(dnLocal, dnRemote);
  // Authenticate user against primary LDAP
	console.log('primaryLDAP', primaryLDAP);
  const primaryClient = ldap.createClient({
    url: primaryLDAP,
    tlsOptions: { rejectUnauthorized: false }
  });

  if (!users.hasOwnProperty(username)) {
    return res.status(401).send('Invalid username');
  }

  performLDAPBind(primaryClient, dnRemote, password, (err) => {
    primaryClient.unbind(); // Disconnect from primary LDAP regardless of bind result

    if (err) {
      return res.status(500).send('Primary LDAP bind failed');
    }

		console.log('Primary/Remote bind successful');
    // Bind to secondary LDAP using the credentials from the users file
    const secondaryClient = ldap.createClient({
      url: secondaryLDAP,
      tlsOptions: { rejectUnauthorized: false }
    });

    performLDAPBind(secondaryClient, dnLocal, users[username].password, (err) => {
      if (err) {
        return res.status(500).send('Secondary LDAP bind failed');
      }

			console.log('Local/Secondary bind successful');
      // Perform the search on secondary LDAP
      const opts = {
        scope: 'sub',
        filter: '(objectclass=*)',
        attributes: ['dn'] // specify attributes you want to retrieve
      };

      performLDAPSearch(secondaryClient, SEARCH_BASE_LOCAL, opts, (err, entries) => {
        secondaryClient.unbind(); // Disconnect from secondary LDAP

        if (err) {
          return res.status(500).send('LDAP search failed');
        }

        res.json(entries);
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

