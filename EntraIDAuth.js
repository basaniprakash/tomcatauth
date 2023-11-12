// EntraIDAuth.js
const axios = require('axios');

const entraIDConfig = {
    apiUrl: process.env.ENTRAID_API_URL,
};

const authenticateUser = async (username, password) => {
    try {
        const response = await axios.post(entraIDConfig.apiUrl, {
            username,
            password
        });
        return response.data.authenticated;
    } catch (error) {
        console.error('Error authenticating user with EntraID:', error);
        return false;
    }
};

module.exports = {
    authenticateUser
};

