const axios = require('axios');

async function test() {
    try {
        console.log("Testing /generate endpoint...");
        const response = await axios.post('http://localhost:3001/generate', {
            firstName: "Debug",
            lastName: "Test",
            dotsColor: "#ff4081",
            dotsType: "rounded"
        });
        console.log("Success!");
    } catch (error) {
        console.error("FAILED!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

test();
