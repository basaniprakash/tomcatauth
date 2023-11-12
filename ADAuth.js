// ADAuth.js
const ActiveDirectory = require('activedirectory2');

const adConfig = {
    url: process.env.AD_URL,
    baseDN: process.env.AD_BASE_DN,
    username: process.env.AD_USERNAME,
    password: process.env.AD_PASSWORD
};

const authenticateUser = async (username, password) => {
    const ad = new ActiveDirectory(adConfig);
    const userDN = `CN=${username},${adConfig.baseDN}`;

    try {
        const auth = await ad.authenticate(userDN, password);
        return auth;
    } catch (error) {
        console.error('Error authenticating user with AD:', error);
        return false;
    }
};

module.exports = {
    authenticateUser
};

