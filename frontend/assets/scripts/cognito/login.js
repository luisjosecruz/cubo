// demo 
// const urlEndpoint = "http://cubo.development.localhost/"; 
const urlEndpoint = "http://localhost:3000/"; 

// production 
// const urlEndpoint = "https://cubo.elmundo.sv/"; 

const validation = urlEndpoint+"login.html";
const url_token = 'https://demdrive.auth.us-west-2.amazoncognito.com/oauth2/token';

function googleSignUpButton(){
    window.location.href = `https://demdrive.auth.us-west-2.amazoncognito.com/oauth2/authorize?identity_provider=Google&redirect_uri=${urlEndpoint}validation.html&response_type=CODE&client_id=4an9qm3m50br1khn7gl5tonnaa&amp;scope=aws.cognito.signin.user.admin email openid profile`;
}

let loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", e => {
    e.preventDefault();
    loginUser();
}); 

//Views
function registerView(){
    let permiso = prompt("Clave");

    if (parseInt(permiso) === 120598) {
        $('#views')[0].reset();
        $("#givenName").show();
        $("#familyName").show();
        $("#confirmPasswordInput").show();
        $("#registerButton").show();
        $("#login").show();
        $("#typeUser").show();

        //Hidden Elements
        $("#txtForgotPassword").hide();
        $("#loginUsr").hide();
        $("#newAccount").hide();
        $("#passwdRe").html("<div class=\"checkPassword-lowerletter\">" +
                                    "<span aria-hidden=\"true\" class=\"check-lowerletter\"></span>" +
                                    "<span class=\"checkPasswordText-lowerletter\"></span>" +
                                "</div>" +
                                "<div class=\"checkPassword-upperletter\">" + 
                                    "<span aria-hidden=\"true\" class=\"check-upperletter\"></span>" +
                                    "<span class=\"checkPasswordText-upperletter\"></span>" +
                                "</div>" +
                                "<div class=\"checkPassword-symbols\">" +
                                    "<span aria-hidden=\"true\" class=\"check-symbols\"></span>" +
                                    "<span class=\"checkPasswordText-symbols\"></span>" +
                                "</div>" +
                                "<div class=\"checkPassword-numbers\">" + 
                                    "<span aria-hidden=\"true\" class=\"check-numbers\"></span>" +
                                    "<span class=\"checkPasswordText-numbers\"></span>" +
                                "</div>" +
                                "<div class=\"checkPassword-length\">" +
                                    "<span aria-hidden=\"true\" class=\"check-length\"></span>" +
                                    "<span class=\"checkPasswordText-length\"></span>" +
                                "</div>");
        $("#passwdRe").show();
    }else{
        alert("No tiene permisos para realizar esta acción");
    }
}
function loginView(){
    $('#views')[0].reset();
    $("#txtForgotPassword").show();
    $("#loginUsr").show();
    $("#newAccount").show();            
    $("#passwordInput").show();
    //$("#headview").html('Iniciar sesión con usuario y contraseña.')
     $("#headview").html('');

    //Hidden Elements
    $("#txForgotPwd").hide();
    $("#givenName").hide();
    $("#familyName").hide();
    $("#confirmPasswordInput").hide();
    $("#registerButton").hide();
    $("#login").hide();
    $("#requestCode").hide();
    $("#cancelAction").hide();
    $("#passwdRe").hide();
    $("#typeUser").hide();
}
function viewforgotpasswd(){
    $('#views')[0].reset();
    $("#headview").html('¿Olvidé mi contraseña?');
    $("#requestCode").show();
    $("#txForgotPwd").show();
    $("#cancelAction").show();
    
    //Hide Elements
    $("#loginUsr").hide();
    $("#newAccount").hide();
    $("#passwordInput").hide();
    $("#txtForgotPassword").hide();
    $("#passwdRe").hide();
}

var cognitoUser;
var idToken;
var userPool;

var poolData = { 
    UserPoolId : userPoolId,
    ClientId : clientId
};
cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'us-west-2'});

function parseJwt(token) {
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

        // TODO: add expiration at check ...
        return dataJWT;
    } catch (err) {
        return false;
    }
}

/*
Function login CognitoUserPool
*/
function loginUser(){
    let urlParams = new URLSearchParams(window.location.search);
    let redirect_uri = urlParams.get('redirect_uri');
    
    if( ($('#emailInput').val() === "") || ($("#passwordInput").val() === "") ){
        $("#log").html('Por favor ingrese su usuario y contraseña');
    }else{

        var authenticationData = {
            Username : $('#emailInput').val(),
            Password : $("#passwordInput").val()
        };
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        
        userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

        var userData = {
            Username : $('#emailInput').val(),
            Pool : userPool
        };

        cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        //console.log(cognitoUser);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                //logMessage('Iniciando sesión...');
                
                idToken = result.getIdToken().getJwtToken();

                let attr = parseJwt(idToken);
                let type_user = parseInt(attr.zoneinfo);

                localStorage.setItem('aws.cognito.'+clientId+'.IdentityProvider', 'Cognito');
                localStorage.setItem('aws.cognito.'+clientId+'.username', $('#signInFormUsername').val());
                localStorage.setItem('aws.cognito.'+clientId+".idToken", idToken);

                setTimeout(function(){
                    window.location.href = urlEndpoint;
                }, 1000);

            },

            onFailure: function(err) {
                logMessage(err.message);
                if(err.message === 'Missing required parameter USERNAME'){
                    $("#log").html('Correo electrónico requerido.');
                }

                if(err.message === 'Incorrect username or password.'){
                    $("#log").html('Correo o contraseña invalida.');
                }
            },

        });

        return false;
    }

}

function requestCod(){
    //alert($("#emailInput").val());
    if($("#emailInput").val() === ""){
        $("#log").html('Por favor Ingrese su dirección de correo');
    }else{
        var params = {
            ClientId: clientId,
            Username: $("#emailInput").val(),
        };
        cognitoidentityserviceprovider.forgotPassword(params, function(err, data) {
            if (err){
                console.log(err.message); // an error occurred
            }else{
                $("#requestCode").hide();
                $("#cancelAction").hide();
                $("#NewPassword").show();
                $("#verificationcode").show();
                $("#passwordInput").show();
                $("#txForgotPwd").html('Ingrese el código de 6 digitos y su nueva contraseña.');
            }
        });    
    }
                  
}

function setNewPassword(){
    $("#passwdRe").hide();
    if($("#verificationcode").val() === ""){
        $("#log").html('Por favor ingrese el código de 6 digitos');
    }else{
        var params = {
          ClientId: clientId,
          ConfirmationCode: $("#verificationcode").val(),
          Password: $("#passwordInput").val(),
          Username: $("#emailInput").val(),
        };
        cognitoidentityserviceprovider.confirmForgotPassword(params, function(err, data) {
          if (err){
            console.log(err.message); // an error occurred
          }else{
            $("#log").html('Contraseña actualizada exitosamente\nPuede iniciar sesión');

            setTimeout(function(){
                //reload.location();
                location.reload();
            }, 1000);
          }
        });
    }
}

/*
Starting point for user registration flow with input validation
*/
function register(){
    $('#log').html('');
    
    if(!$('#givenName').val() || !$('#familyName').val() || !$('#emailInput').val() || !$('#passwordInput').val() || !$('#confirmPasswordInput').val() || !$('#typeUser').val()) {
            logMessage('Por favor llene todos los campos requeridos!');
    }else{
        if($('#passwordInput').val() == $('#confirmPasswordInput').val()){
            registerUser($('#givenName').val(), $('#familyName').val(), $('#emailInput').val(), $('#passwordInput').val(), $('#typeUser').val());
            //addToGroupWeb($('#emailInput').val());
        }else{
            $("#passwdRe").fadeOut();
            logMessage('Por favor verifique, la contraseña no coincide!');
        }
        
    }
}

/*
User registration using AWS Cognito
*/
function registerUser(username, lname, email, password, typeuser){
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var firstLetter = username.substring(0,1);
    alert(firstLetter);

    var attributeList = [];
    //Data User ----------------------------------------
    var dataEmail = {
        Name  : 'email',
        Value : email
    };
    var dataName  = {
        Name  : 'given_name',
        Value : username
    };
    var dataLname = {
        Name  : 'family_name',
        Value : lname
    };
    var dataPicture = {
        Name: 'picture', 
        Value: 'https://static.elmundo.sv/letters_cognito/'+firstLetter+'.svg'
    };
    var dataTypeUser = {
        Name: 'zoneinfo', 
        Value: typeuser
    };
    //Data User ----------------------------------------
    var attributeEmail   = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributeName    = new AmazonCognitoIdentity.CognitoUserAttribute(dataName);
    var attributeLName   = new AmazonCognitoIdentity.CognitoUserAttribute(dataLname);
    var attributePicture = new AmazonCognitoIdentity.CognitoUserAttribute(dataPicture);
    var attributeTypeUser = new AmazonCognitoIdentity.CognitoUserAttribute(dataTypeUser);

    attributeList.push(attributeEmail);
    attributeList.push(attributeName);
    attributeList.push(attributeLName);
    attributeList.push(attributePicture);
    attributeList.push(attributeTypeUser);

    $("#loader").show();
    userPool.signUp(email, password, attributeList, null, function(err, result){
        if (err) {
            //Translate labels
            if(err.message === 'Invalid email address format.'){
                logMessage('Formato de correo no válido');    
            }
            if(err.message === 'Expected string length >= 6, but found 1 for params.Password'){
                logMessage('Su contraseña debe contener igual o mayor a 8 caracteres'); 
            }
            if(err.message === 'Expected string length >= 6, but found 2 for params.Password'){
                logMessage('Su contraseña debe contener igual o mayor a 8 caracteres'); 
            }
            if(err.message === 'Expected string length >= 6, but found 3 for params.Password'){
                logMessage('Su contraseña debe contener igual o mayor a 8 caracteres'); 
            }
            if(err.message === 'Expected string length >= 6, but found 4 for params.Password'){
                logMessage('Su contraseña debe contener igual o mayor a 8 caracteres'); 
            }
            if(err.message === 'Expected string length >= 6, but found 5 for params.Password'){
                logMessage('Su contraseña debe contener igual o mayor a 8 caracteres'); 
            }
            if(err.message === 'User already exists'){
                logMessage('El usuario ya existe');
            }
        }else{
            cognitoUser = result.user;
            $('#views')[0].reset();
            //$("#requiredUI").hide();
            $(".welcomemsg").html('Registro realizado exitosamente! <br> Bienvenido ' + cognitoUser.getUsername() + ',<br>Por favor confirme su dirección de correo haciendo clic en el enlace que enviamos a su dirección de correo.');
            $("#signUpCognito").hide('slow');
            $("#signInCognito").show('slow');
            $("#welcomeUser").toast('show');
        }
        $("#loader").hide();
    });
}


function checkPasswordHelper(password) {
    var passwordPolicy = [];
    passwordPolicy.lowercase = "La contraseña debe contener una letra minúscula";
    passwordPolicy.uppercase = "La contraseña debe contener una letra mayúscula";
    passwordPolicy.number = "La contraseña debe contener un número";
    passwordPolicy.special = "La contraseña debe contener un caracter especial";
    var passwordLength = 8;
    passwordPolicy.lengthCheck = "La contraseña debe contener al menos 8 caracteres";

    var requireLowerletter = false;
    var requireUpperletter = false;
    var requireNumber = false;
    var requireSymbol = false;
    var requireLength = false;

    if (password) {
        if (true) {
            if (/[a-z]/.test(password)) {
                $(".check-lowerletter").html("&#10003;");
                $(".checkPasswordText-lowerletter").html(passwordPolicy.lowercase);
                $(".checkPassword-lowerletter").addClass("passwordCheck-valid-customizable").removeClass(
                    "passwordCheck-notValid-customizable");
                requireLowerletter = true;
            } else {
                $(".check-lowerletter").html("&#10006;");
                $(".checkPasswordText-lowerletter").html(passwordPolicy.lowercase);
                $(".checkPassword-lowerletter").addClass("passwordCheck-notValid-customizable").removeClass(
                    "passwordCheck-valid-customizable");
                requireLowerletter = false;
            }
        } else {
            requireLowerletter = true;
        }
        if (true) {
            if (/[A-Z]/.test(password)) {
                $(".check-upperletter").html("&#10003;");
                $(".checkPasswordText-upperletter").html(passwordPolicy.uppercase);
                $(".checkPassword-upperletter").addClass("passwordCheck-valid-customizable").removeClass(
                    "passwordCheck-notValid-customizable");
                requireUpperletter = true;
            } else {
                $(".check-upperletter").html("&#10006;");
                $(".checkPasswordText-upperletter").html(passwordPolicy.uppercase);
                $(".checkPassword-upperletter").addClass("passwordCheck-notValid-customizable").removeClass(
                    "passwordCheck-valid-customizable");
                requireUpperletter = false;
            }
        } else {
            requireUpperletter = true;
        }
        if (true) {
            if (/[-!$%^&*()_|~`{}\[\]:\/;<>?,.@#'"]/.test(password) || password.indexOf('\\') >= 0) {
                $(".check-symbols").html("&#10003;");
                $(".checkPasswordText-symbols").html(passwordPolicy.special);
                $(".checkPassword-symbols").addClass("passwordCheck-valid-customizable").removeClass(
                    "passwordCheck-notValid-customizable");
                requireSymbol = true;
            } else {
                $(".check-symbols").html("&#10006;");
                $(".checkPasswordText-symbols").html(passwordPolicy.special);
                $(".checkPassword-symbols").addClass("passwordCheck-notValid-customizable").removeClass(
                    "passwordCheck-valid-customizable");
                requireSymbol = false;
            }
        } else {
            requireSymbol = true;
        }
        if (true) {
            if (/[0-9]/.test(password)) {
                $(".check-numbers").html("&#10003;");
                $(".checkPasswordText-numbers").html(passwordPolicy.number);
                $(".checkPassword-numbers").addClass("passwordCheck-valid-customizable").removeClass(
                    "passwordCheck-notValid-customizable")
                requireNumber = true;
            } else {
                $(".check-numbers").html("&#10006;");
                $(".checkPasswordText-numbers").html(passwordPolicy.number);
                $(".checkPassword-numbers").addClass("passwordCheck-notValid-customizable").removeClass(
                    "passwordCheck-valid-customizable");
                requireNumber = false;
            }
        } else {
            requireNumber = true;
        }

        if (password.length < passwordLength) {
            $(".check-length").html("&#10006;");
            $(".checkPasswordText-length").html(passwordPolicy.lengthCheck);
            $(".checkPassword-length").addClass("passwordCheck-notValid-customizable").removeClass(
                "passwordCheck-valid-customizable");
            requireLength = false;
        } else {
            $(".check-length").html("&#10003;");
            $(".checkPasswordText-length").html(passwordPolicy.lengthCheck);
            $(".checkPassword-length").addClass("passwordCheck-valid-customizable").removeClass(
                "passwordCheck-notValid-customizable");
            requireLength = true;
        }
    }

    return requireLowerletter && requireUpperletter && requireNumber && requireSymbol && requireLength;
}

function checkPasswordMatch() {
    var hasUsername = $('input[name="username"]').val() != "";
    var password = $('input[name="password"]').val();
    var hasValidPassword = checkPasswordHelper(password);

    var formSubmitted = false;
    var nodes = document.getElementsByName('signupform');
    for (var i = 0; i < nodes.length; i++) {
        formSubmitted = !!nodes[i].submitted || formSubmitted;
    }
    var canSubmit = hasUsername && hasValidPassword && !formSubmitted;
    $('button[name="signUpButton"]').prop("disabled", !canSubmit);
    //$('#requiredUI').toast('show');
    
}

/*
This is a logging method that will be used throught the application
*/
function logMessage(message, action){
    $('#log').html(message);   
}
/*
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

$(document).ready(function(){
    // Get parameters from a URL string
    var str = window.location.href;
    // Rreplace # by ?
    var url_other = str.replace('#', '?');
    var url_clean = url_other.replace('?_', '');
    //alert(url_clean);
    var objectCode = getParams(url_clean);
    var code = (objectCode.code) ? objectCode.code : "";


    if (code.trim().length > 0) {

        if (localStorage.getItem('aws.cognito.'+clientId+'.access_token') != null) {
            var cognito_access_token  = localStorage.getItem('aws.cognito.'+clientId+'.access_token');
            var cognito_id_token      = localStorage.getItem('aws.cognito.'+clientId+'.id_token');
            var cognito_refresh_token = localStorage.getItem('aws.cognito.'+clientId+'.refresh_token');
        }else{
            var settings = {
                "async": false,
                "crossDomain": true,
                "url": url_token,
                "method": "POST",
                "headers": {
                "content-type": "application/x-www-form-urldecoded; charset=utf-8",
                "cache-control": "no-cache"
                },
                "data": {
                "grant_type": "authorization_code",
                "client_id": clientId,
                "code": code,
                "redirect_uri": validation
                }
            }
            $.ajax(settings).done(function (response) {
                
                console.log('Savign JWT');
                localStorage.setItem('aws.cognito.'+clientId+'.id_token', response.id_token);
                localStorage.setItem('aws.cognito.'+clientId+'.refresh_token', response.refresh_token);
                localStorage.setItem('aws.cognito.'+clientId+'.access_token', response.access_token);

                //Obtenemos el usuario & IDP
                var usrIDP   = parseJwt(response.access_token);
                var IDP      = parseJwt(response.id_token);
                var usernameIDP = usrIDP.username;

                console.log(IDP);
                localStorage.setItem("aws.cognito."+clientId+'.user_data', JSON.stringify(IDP));
                
                if(IDP.identities != undefined){
                    var IdentityPro = IDP.identities[0].providerName;    
                }else{
                    var IdentityPro = 'cognito';
                }
                
                //Saving username
                localStorage.setItem('aws.cognito.'+clientId+'.username', usernameIDP);
                //Saving IDP
                switch(IdentityPro){
                    case 'Facebook':
                        localStorage.setItem('aws.cognito.'+clientId+'.IdentityProvider', IdentityPro);
                    break;
                    case 'gmail':
                        localStorage.setItem('aws.cognito.'+clientId+'.IdentityProvider', IdentityPro);
                    break;
                    default:
                        localStorage.setItem('aws.cognito.'+clientId+'.IdentityProvider', IdentityPro);
                    break;
                }
                //window.location.reload();
                //window.location.href = 'index.html';
                getUser(response.access_token);

            });
        }
    }else{
        console.log("CODE NON EXIST");
    }
    var user_data = JSON.parse(localStorage.getItem("aws.cognito."+clientId+'.user_data'));
    console.log(user_data);
});*/
