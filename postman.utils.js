// Post-request ***********
const jsonData = pm.response.json();

const token = jsonData.accessToken.split('.')[1];
const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

// Store the access token, refresh token, and expiration time in environment variables
pm.environment.set("accessToken", jsonData.accessToken);
pm.environment.set("refreshToken", jsonData.refreshToken);
pm.environment.set("exp", decodedToken.exp);

// Pre-request ***********
const accessTokenExpiry = pm.environment.get("exp");
const refreshToken = pm.environment.get("refreshToken")
const currentTime = Math.floor(Date.now() / 1000);

if (currentTime >= accessTokenExpiry) {
    // Access token has expired, refresh it using the refresh token
    pm.sendRequest({
        url: pm.environment.get("refreshUrl"),
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({ refreshToken })
        }
    }, function (err, res) {
        if (res && res.code === 201) {
            const jsonData = res.json();
            // Save the new access token and its expiration time
            const newToken = jsonData.accessToken.split('.')[1];
            const decodedNewToken = JSON.parse(Buffer.from(newToken, 'base64').toString('utf-8'));

            pm.environment.set("accessToken", jsonData.accessToken);
            pm.environment.set("refreshToken", jsonData.refreshToken);
            pm.environment.set("exp", decodedNewToken.exp);
            
        } else {
            console.log("Failed to refresh token", err);
        }
    });
} else {
    console.log("Access token is still valid.");
}