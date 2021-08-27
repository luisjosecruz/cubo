// 
function config (arg){
    let dataConf = {
        'region': 'us-west-2',
        'id_token' : 'aws.cognito.4an9qm3m50br1khn7gl5tonnaa.id_token',
        'url_token': 'https://demdrive.auth.us-west-2.amazoncognito.com/oauth2/token',
        'identityPoolId': 'us-west-2:934339ca-ef17-4441-9d02-aba61c0514ea',
        'clientId': '4an9qm3m50br1khn7gl5tonnaa',
        'userPoolId': 'us-west-2_MenxxYdg6',
        'developer': 'Luis José Cruz Martínez',
        'url': window.location.origin
    }
    return dataConf[arg];
}

// Function to Decode returned Code
function parseJWT(token) {
    try {
        // Get Token Header
        const base64HeaderUrl = token.split('.')[0];
        const base64Header = base64HeaderUrl.replace('-', '+').replace('_', '/');
        const headerData = JSON.parse(window.atob(base64Header));

        // Get Token payload and date's
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        const dataJWT = JSON.parse(window.atob(base64));
        dataJWT.header = headerData;

        return dataJWT;
    } catch (err) {
        return false;
    }
}

