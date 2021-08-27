const urlEndpoint = config('url')+'/';

const url_token = config('url_token');

function googleSignUpButton(){
    window.location.href = `https://demdrive.auth.us-west-2.amazoncognito.com/oauth2/authorize?identity_provider=Google&redirect_uri=${config('url')}/validation.html&response_type=CODE&client_id=4an9qm3m50br1khn7gl5tonnaa&amp;scope=aws.cognito.signin.user.admin email openid profile`;
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
    UserPoolId : config('userPoolId'),
    ClientId : config('clientId')
};
cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'us-west-2'});

// Function login CognitoUserPool
function loginUser(){
    let urlParams = new URLSearchParams(window.location.search);
    let redirect_uri = urlParams.get('redirect_uri');
    
    if(($('#emailInput').val() === "") || ($("#passwordInput").val() === "")){
        loast.show("Ingresar usuario y contraseña", "warning");
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
        
        loast.show("Iniciando sesión ...", "success");
        
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                
                idToken = result.getIdToken().getJwtToken();

                let attr = parseJWT(idToken);
                let type_user = parseInt(attr.zoneinfo);

                localStorage.setItem('aws.cognito.'+config('clientId')+'.IdentityProvider', 'Cognito');
                localStorage.setItem('aws.cognito.'+config('clientId')+'.username', $('#signInFormUsername').val());
                localStorage.setItem('aws.cognito.'+config('clientId')+".id_token", idToken);

                window.location.href = config('url');
            },

            onFailure: function(err) {
                logMessage(err.message);
                if(err.message === 'Missing required parameter USERNAME'){
                    loast.show("Correo electrónico requerido.", "warning");
                }

                if(err.message === 'Incorrect username or password.'){
                    loast.show("Correo o contraseña invalida.", "warning");
                }
            },

        });

        return false;
    }
}

function requestCod(){
    if($("#emailInput").val() === ""){
        loast.show("Ingresar dirección de correo electrónico", "info");
    }else{
        var params = {
            ClientId: config('clientId'),
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
          ClientId: config('clientId'),
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
                location.reload();
            }, 1000);
          }
        });
    }
}

// Starting point for user registration flow with input validation
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

// User registration using AWS Cognito
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
}

//This is a logging method that will be used throught the application
function logMessage(message, action){
    console.log(message);   
}
