const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post("http://localhost:8080/api/auth/login", {
            username: "kiruthiyan7@gmail.com",
            password: "somepassword"
        });
        console.log("AXIOS RAW RESPONSE DATA:", JSON.stringify(response.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.log("AXIOS ERROR RESPONSE DATA:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.log("AXIOS ERROR:", err.message);
        }
    }
}

testLogin();
