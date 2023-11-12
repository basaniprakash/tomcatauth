const ldap = require('ldapjs');
require('dotenv').config();
const userService = require('./UserService');

async function authenticate(username, password) {
		console.log('Authenticating', username, password);
    let user = await userService.findUserByUsername(username);
    if (!user) {
				console.log('User not found');
        throw new Error('User not found');
    }

    const ldapUserDn = createLdapUserDn(username);
    const client = ldap.createClient({
        url: process.env.LDAP_URL,
				tlsOptions: {rejectUnauthorized: false}
    });

    try {
        // Attempt to bind using the user's DN and the provided password
				console.log('Making a bind request with ', process.env.LDAP_URL, ldapUserDn, password);
        await new Promise((resolve, reject) => {
            client.bind(ldapUserDn, password, (err) => {
								console.log('Bind suceeded for', ldapUserDn, password);
                client.unbind();
                if (err) {
										console.log('Bind failed for', ldapUserDn, password);
                    reject(new Error('LDAP bind failed: ' + err.message));
                } else {
                    resolve();
                }
            });
        });

        // If authentication is successful, replace the password with the stored one
        const storedPassword = user.password;
        return { username, password: storedPassword };
    } catch (error) {
        throw error;
    }
}

function createLdapUserDn(username) {
    const ldapUserBase = process.env.LDAP_USER_BASE;
		console.log("LDAP User Base:", ldapUserBase);
    const userDn =  `cn=${username},${ldapUserBase}`;
		console.log("Constructed DN: ", userDn);
		return userDn;
}

module.exports = { authenticate };

