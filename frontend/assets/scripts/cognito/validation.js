setTimeout(() => {
    let element = document.createElement('div');
    element.className('container');
    document.appendChild(element);
}, 500);

const validation = config('url')+"/validation.html";
const url_token = config('url_token');

function getParams (url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
};

// Get parameters from a URL string
var str = window.location.href;
// Rreplace # by ?
var url_other = str.replace('#', '?');
var url_clean = url_other.replace('?_', '');
var objectCode = getParams(url_clean);
var code = (objectCode.code) ? objectCode.code : "";

if (code.trim().length > 0) {
    if (localStorage.getItem('aws.cognito.'+config('clientId')+'.access_token') != null) {
        var cognito_access_token  = localStorage.getItem('aws.cognito.'+config('clientId')+'.access_token');
        var cognito_id_token      = localStorage.getItem('aws.cognito.'+config('clientId')+'.id_token');
        var cognito_refresh_token = localStorage.getItem('aws.cognito.'+config('clientId')+'.refresh_token');
    }else{
        var settings = {
            "async": false,
            "crossDomain": true,
            "url": url_token,
            "method": "POST",
            "headers": {
                "content-type": "application/x-www-form-urlencoded; charset=utf-8",
                "cache-control": "no-cache"
            },
            "data": {
                "grant_type": "authorization_code",
                "client_id": config('clientId'),
                "code": code,
                "redirect_uri": validation
            }
        }
        //console.log(settings);
        $.ajax(settings).done(function (response) {
            localStorage.setItem('aws.cognito.'+config('clientId')+'.id_token', response.id_token);
            localStorage.setItem('aws.cognito.'+config('clientId')+'.refresh_token', response.refresh_token);
            localStorage.setItem('aws.cognito.'+config('clientId')+'.access_token', response.access_token);

            //Obtenemos el usuario & IDP
            var usrIDP   = parseJWT(response.access_token);
            var IDP      = parseJWT(response.id_token);
            var usernameIDP = usrIDP.username;
            
            localStorage.setItem("aws.cognito."+config('clientId')+'.user_data', JSON.stringify(IDP));
            
            if(IDP.identities != undefined){
                var IdentityPro = IDP.identities[0].providerName;    
            }else{
                var IdentityPro = 'cognito';
            }
            
            //Saving username
            localStorage.setItem('aws.cognito.'+config('clientId')+'.username', usernameIDP);
            //Saving IDP
            switch(IdentityPro){
                case 'Facebook':
                    localStorage.setItem('aws.cognito.'+config('clientId')+'.IdentityProvider', IdentityPro);
                break;
                case 'gmail':
                    localStorage.setItem('aws.cognito.'+config('clientId')+'.IdentityProvider', IdentityPro);
                break;
                default:
                    localStorage.setItem('aws.cognito.'+config('clientId')+'.IdentityProvider', IdentityPro);
                break;
            }
            
            getUser(response.access_token);
        });
    }
}else{
    console.log("CODE NON EXIST");
}
var user_data = JSON.parse(localStorage.getItem("aws.cognito."+config('clientId')+'.user_data'));
var zone = (!("zoneinfo" in user_data)) ? 0 : user_data.zoneinfo ;

let htmlVal = `
        <div class="content_cube">
            <div class="cube">
                <img src="assets/images/lightblue.jpg">
                <img src="assets/images/black.jpg">
                <img src="assets/images/darkred.jpg">
                <img src="assets/images/yellow.jpg">
                <img src="assets/images/blue.jpg">
                <img src="assets/images/red.jpg">
            </div>
        </div>
        <div class="container_text">
            <h1>Estamos validando tu cuenta... </h1>
            <p>Si tu cuenta es correcta, te notificaremos para que puedas acceder...</p>
            <br><br>
            <p class="counter_redirect">Redirigiendo al panel de Inicio de Sesión en... <span>5</span></p>
        </div>
`;
$(".container").html(htmlVal);
if(zone == 0){
    //funcion redirigir
    var start = 5 - 1;
    var end = 0;
    setInterval(function(){
        if (start != end) {
            $(".counter_redirect span").html(start);
            start--;
        }else{
            removeLocalStorage();
        }
    }, 1000);
}else{
    location.href = config('url');
}