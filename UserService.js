const fs = require('fs');
const path = require('path');

class UserService {
    constructor(usersFilePath) {
//				console.log('UserService constructor');
        this.usersFilePath = usersFilePath;
				this.userData = {};
        this.loadUserData();
				//console.log('userdata: ', this.userData);
    }

    loadUserData() {
        try {
            const rawData = fs.readFileSync(this.usersFilePath, 'utf8');
            this.userData=JSON.parse(rawData);
						return this.userData;
        } catch (error) {
            console.error("Error loading user data:", error);
            return {};
        }
    }

    findUserByUsername(username) {
				console.log('Finding user', username);
        return this.userData[username] || null;
    }

    userExists(username) {
        return !!this.findUserByUsername(username);
    }

    getStoredPassword(username) {
        const user = this.findUserByUsername(username);
        return user ? user.storedPassword : null;
    }

    getAuthType(username) {
        const user = this.findUserByUsername(username);
        return user ? user.authType : null;
    }
}


const usersFilePath = process.env.USERS_FILE_PATH || './users.json';
const userServiceInstance = new UserService(usersFilePath);

module.exports = userServiceInstance;

