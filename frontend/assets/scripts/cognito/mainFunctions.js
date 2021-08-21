//=============== AWS IDs ===============
var userPoolId = 'us-west-2_FWIh5hRyw';
var clientId = '2e69a0nppmai2qctnc7c0f1jfj';
var region = 'us-west-2';
//var identityPoolId = '';
//=============== AWS IDs ===============

var cognitoUser;
var idToken;
var userPool;

var poolData = { 
    UserPoolId : userPoolId,
    ClientId : clientId
};

//getCurrentLoggedInSession();

function switchToVerificationCodeView(){
    $("#emailInput").hide();
    $("#userNameInput").hide();
    $("#passwordInput").hide();
    $("#confirmPasswordInput").hide();
    $("#logInButton").hide();
    $("#registerButton").hide();
    $("#bucketNameInput").hide();
    $("#verificationCodeInput").show();
    $("#verifyCodeButton").show();
    $("#listS3ObjectsButton").hide();
    $("#logOutButton").hide();
}

function switchToRegisterView(){
    $("#emailInput").show();
    $("#userNameInput").show();
    $("#passwordInput").show();
    $("#confirmPasswordInput").show();
    $("#logInButton").hide();
    $("#registerButton").show();
    $("#verificationCodeInput").hide();
    $("#verifyCodeButton").hide();
    $("#listS3ObjectsButton").hide();
    $("#bucketNameInput").hide();
    $("#logOutButton").hide();
}

function switchToLogInView(){
    $("#userNameInput").val('');
    $("#passwordInput").val('');
    $("#emailInput").hide();
    $("#userNameInput").show();
    $("#passwordInput").show();
    $("#confirmPasswordInput").hide();
    $("#logInButton").show();
    $("#registerButton").show();
    $("#verificationCodeInput").hide();
    $("#verifyCodeButton").hide();
    $("#listS3ObjectsButton").hide();
    $("#bucketNameInput").hide();
    $("#logOutButton").hide();
}

function switchToLoggedInView(){
    $("#emailInput").hide();
    $("#userNameInput").hide();
    $("#passwordInput").hide();
    $("#confirmPasswordInput").hide();
    $("#logInButton").hide();
    $("#registerButton").hide();
    $("#verificationCodeInput").hide();
    $("#verifyCodeButton").hide();
    $("#listS3ObjectsButton").show();
    $("#bucketNameInput").show();
    $("#logOutButton").show();
}

function clearLogs(){
    $('#log').empty();
}

/*
Starting point for user logout flow
*/
function logOut(){
    if (cognitoUser != null) {

        $("#loader").show();
        cognitoUser.signOut();
        switchToLogInView();
        logMessage('Logged out!');
        $("#loader").hide();
    }
}

/*
Starting point for user login flow with input validation
*/
function logIn(){

    if(!$('#userNameInput').val() || !$('#passwordInput').val()){
        logMessage('Please enter Username and Password!');
    }else{
        var authenticationData = {
            Username : $('#userNameInput').val(),
            Password : $("#passwordInput").val(),
        };
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

        var userData = {
            Username : $('#userNameInput').val(),
            Pool : userPool
        };
        cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        $("#loader").show();
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                clearLogs();
                logMessage('Logged in!');
                switchToLoggedInView();

                idToken = result.getIdToken().getJwtToken();
                //getCognitoIdentityCredentials();
            },

            onFailure: function(err) {
                logMessage(err.message);
                $("#loader").hide();
            },

        });
    }
}

/*
Starting point for user registration flow with input validation
*/
function register(){
    switchToRegisterView();

    if( !$('#emailInput').val() || !$('#userNameInput').val()  || !$('#passwordInput').val() || !$('#confirmPasswordInput').val() ) {
            logMessage('Please fill all the fields!');
    }else{
        if($('#passwordInput').val() == $('#confirmPasswordInput').val()){
            registerUser($('#emailInput').val(), $('#userNameInput').val(), $('#passwordInput').val());
        }else{
            logMessage('Confirm password failed!');
        }
        
    }
}

/*
Starting point for user verification using AWS Cognito with input validation
*/
function verifyCode(){
    if( !$('#verificationCodeInput').val() ) {
        logMessage('Please enter verification field!');
    }else{
        $("#loader").show();
        cognitoUser.confirmRegistration($('#verificationCodeInput').val(), true, function(err, result) {
            if (err) {
                logMessage(err.message);
            }else{
                logMessage('Successfully verified code!');
                switchToLogInView();
            }
            
            $("#loader").hide();
        });
    }
}

/*
User registration using AWS Cognito
*/
function registerUser(email, username, password){
    var attributeList = [];
    
    var dataEmail = {
        Name : 'email',
        Value : email
    };

    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    $("#loader").show();
    userPool.signUp(username, password, attributeList, null, function(err, result){
        if (err) {
            logMessage(err.message);
        }else{
            cognitoUser = result.user;
            logMessage('Registration Successful!');
            logMessage('Username is: ' + cognitoUser.getUsername());
            logMessage('Please enter the verification code sent to your Email.');
            //switchToVerificationCodeView();
            logMessage('Please visit the verification link sent to your Email.');
        }
        $("#loader").hide();
    });
}

/*
Starting point for AWS List S3 Objects flow with input validation
*/
function listS3Objects(){
    if(!$('#bucketNameInput').val()){
        logMessage('Please enter the name of the S3 Bucket!');
    }else{
        $("#loader").show();
        getAWSS3BucketObjects();
    }
    
}

/*
This method will get temporary credentials for AWS using the IdentityPoolId and the Id Token recieved from AWS Cognito authentication provider.
*/
function getCognitoIdentityCredentials(){
    AWS.config.region = region;

    var loginMap = {};
    loginMap['cognito-idp.' + region + '.amazonaws.com/' + userPoolId] = idToken;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identityPoolId,
        Logins: loginMap
    });

    AWS.config.credentials.clearCachedId();

    AWS.config.credentials.get(function(err) {
        if (err){
            logMessage(err.message);
        }
        else {
            logMessage('AWS Access Key: '+ AWS.config.credentials.accessKeyId);
            logMessage('AWS Secret Key: '+ AWS.config.credentials.secretAccessKey);
            logMessage('AWS Session Token: '+ AWS.config.credentials.sessionToken);
        }

        $("#loader").hide();
    });
}

/*
This method will use AWS S3 SDK to get a list of S3 bucket object.
Before using this method, AWS Credentials must be set in AWS config.
*/
function getAWSS3BucketObjects(){            
    var s3 = new AWS.S3();

    var params = {
        Bucket: $("#bucketNameInput").val()
    };

    s3.listObjects(params, function(err, data) {
        if (err) logMessage(err.message);
        else{
            logMessage('');
            logMessage('====== S3 Bucket Objects ======');
            data.Contents.forEach(element => {
                logMessage(element.Key);
            });
            logMessage('');
        }

        $("#loader").hide();
    });
}


/*
If not logged in, redirect to MainPage Login
*/
function verifiedGetCurrentLoggedInSession(){
    $("#loader").show();
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    cognitoUser = userPool.getCurrentUser();

    if(cognitoUser != null){
        cognitoUser.getSession(function(err, session) {
            if (err) {
                logMessage(err.message);
            }else{
                logMessage('Session found! Logged in.');
                switchToLoggedInView();
                idToken = session.getIdToken().getJwtToken();
            }
            $("#loader").hide();
        });
    }else{
        /*alert('Lo sentimos!\nNo tiene privilegios para ver este contenido\nPor favor iniciar sesión o registrarse');*/
        logMessage('Session expired. Please log in again.');
        window.location.href = "index.html";
        $("#loader").hide();
    }
}

/*
If user has logged in before, get the previous session so user doesn't need to log in again.
*/
function getCurrentLoggedInSession(){
    $("#loader").show();
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    cognitoUser = userPool.getCurrentUser();

    if(cognitoUser != null){
        cognitoUser.getSession(function(err, session) {
            if (err) {
                logMessage(err.message);
            }else{
                logMessage('Session found! Logged in.');
                switchToLoggedInView();
                idToken = session.getIdToken().getJwtToken();

                //console.log('ACCESS TKN: ' + idToken);
                //getCognitoIdentityCredentials();

                setTimeout(function(){
                    console.log('Redireccionando...');
                    window.location.href = "secure.html";
                }, 2500);
            }
            $("#loader").hide();
        });
    }else{
        logMessage('Session expired. Please log in again.');
        window.location.href = "index.html";
        $("#loader").hide();
    }

}

/*
This is a logging method that will be used throught the application
*/
function logMessage(message){
    $('#log').append(message + '</br>');
}