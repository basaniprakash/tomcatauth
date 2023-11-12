const ldapAuth = require('./ldapAuth');
const adAuth = require('./ADAuth');
const entraIDAuth = require('./EntraIDAuth');
const userService = require('./UserService');

class AuthService {
    constructor() {
        if (!AuthService.instance) {
						console.log('AuthService constructor');
            this.userService = userService;
            AuthService.instance = this;
        }

        return AuthService.instance;
    }

    async authenticateUser(username, password) {
        const user = this.userService.findUserByUsername(username);
        if (!user) {
						console.log('User not found', username);
            return false; // User not found
        }

        try {
            switch (user.authType.toLowerCase()) {
                case 'ldap':
										console.log('Authenticating with LDAP');
                    return await ldapAuth.authenticate(username, password);
                 case 'ad':
         				   return await adAuth.authenticateUser(username, password);
				        case 'entraid':
        			    return await entraIDAuth.authenticateUser(username, password);
                default:
                    return false;
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return false;
        }
    }
}

const instance = new AuthService();
module.exports = instance;

