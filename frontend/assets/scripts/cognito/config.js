// demo 
const urlEndpoint = "http://localhost:3000/"; 

// production 
//const urlEndpoint = "https://cubo.elmundo.sv/"; 

var cognitoUser;
//var idToken;
var userPool;

var poolData = { 
    UserPoolId : userPoolId,
    ClientId : clientId
};

/*
+ Determinamos si hay IDP ? obtenemos custom access_token : obtenemos por LastAuthUser.
+ Enviamos cognito access token a la funcion getUser
*/
var IdentityProviderUI    = localStorage.getItem('aws.cognito.'+clientId+'.IdentityProvider');

if(IdentityProviderUI === 'Facebook' || IdentityProviderUI === 'Google'){
    var cognito_access_token  = localStorage.getItem('aws.cognito.'+clientId+'.access_token');
    var cognito_id_token      = localStorage.getItem('aws.cognito.'+clientId+'.id_token');
    var cognito_refresh_token = localStorage.getItem('aws.cognito.'+clientId+'.refresh_token');
    //var cognito_devicekey     = localStorage.getItem('aws.cognito.'+clientId+'.deviceKey');

    $("#currentPassword").attr('disabled', true);
    $("#newPassword").attr('disabled', true);
}else{
    var LastAuthUser = localStorage.getItem('CognitoIdentityServiceProvider.'+clientId+'.LastAuthUser');
    //console.log('LastAuthUser: ' + LastAuthUser);
    var cognito_access_token  = localStorage.getItem('CognitoIdentityServiceProvider.'+clientId+'.'+LastAuthUser+'.accessToken');
    var cognito_id_token      = localStorage.getItem('CognitoIdentityServiceProvider.'+clientId+'.'+LastAuthUser+'.idToken');
    var cognito_refresh_token = localStorage.getItem('CognitoIdentityServiceProvider.'+clientId+'.'+LastAuthUser+'.refreshToken');
    var cognito_devicekey     = localStorage.getItem('CognitoIdentityServiceProvider.'+clientId+'.'+LastAuthUser+'.deviceKey');
}

cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'us-west-2'});

//Function to Decode returned Code
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

//Funcion para regenerar tokens temporales
function refreshToken(refresh_token){
    //alert("Refresh Token");
    if(refresh_token){
        var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'us-west-2'});

        var params = {
          AuthFlow: 'REFRESH_TOKEN', /* required */
          ClientId: clientId, /* required */
          AuthParameters: {
            'REFRESH_TOKEN': refresh_token,
            "DEVICE_KEY" : cognito_devicekey
          }
        };

        cognitoidentityserviceprovider.initiateAuth(params, function(err, data) {
          if (err) {
              console.log(err.message); // an error occurred
              if(err.message === 'Refresh Token has expired'){
                removeLocalStorage();
              }
          }else{
                //console.log('Data from refreshToken>>> ');

                if(IdentityProviderUI === 'Facebook' || IdentityProviderUI === 'Google'){
                    //console.log('Set as custom Id & Access Token');
                    localStorage.setItem('aws.cognito.'+clientId+'.id_token', data.AuthenticationResult.IdToken);
                    localStorage.setItem('aws.cognito.'+clientId+'.access_token', data.AuthenticationResult.AccessToken);
                }else{
                    //console.log('Set as SDK tokens format');
                    localStorage.setItem('CognitoIdentityServiceProvider.'+clientId+'.'+LastAuthUser+'.idToken', data.AuthenticationResult.IdToken);
                    localStorage.setItem('CognitoIdentityServiceProvider.'+clientId+'.'+LastAuthUser+'.accessToken', data.AuthenticationResult.AccessToken);
                }              

                //console.log('Hemos regenerado Access and Id Token, RefreshToken works!');
                location.reload();    
            }
        });
    }else{
        window.location.href = urlEndpoint+'login/login.html'; 
    }
}

function removeLocalStorage(){
    //console.log('Borramos todo, para un nuevo inicio de sesion');
    localStorage.removeItem('aws.cognito.'+clientId+'.access_token');
    localStorage.removeItem('aws.cognito.'+clientId+'.id_token');
    localStorage.removeItem('aws.cognito.'+clientId+'.refresh_token');
    localStorage.removeItem('aws.cognito.'+clientId+'.IdentityProvider');
    localStorage.removeItem('aws.cognito.'+clientId+'.username');
    localStorage.removeItem('aws.cognito.'+clientId+'.redirect_uri');
    //console.log('Realizando procesos y redireccionando a HostedUI');

    localStorage.setItem('CognitoIdentityServiceProvider.'+clientId+'.'+LastAuthUser+'.accessToken', '');
    
    setTimeout(function(){
        window.location.href = urlEndpoint+'login/login.html'; 
    }, 1500);    
}


//function for validating json string
function checkJSON(text){
    try{
        if (typeof text!=="string"){
            return false;
        }else{
            JSON.parse(text);
            return true;                            
        }
    }
    catch (error){
        return false;
    }
}

//Funcion para obtener sesion del usuario
function getUser(cognito_access_token){
    //console.log('getUser function >>>');
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'us-west-2'});

    if(cognito_access_token){
        var params = {
          AccessToken: cognito_access_token /* required */
        };

        cognitoidentityserviceprovider.getUser(params, function(err, data) {
            if (err){
                //console.log(err);
                //console.log(err.message);
                //console.log('Session expire, make a new request AWS');
                if(err.message === 'Access Token has expired'){
                    refreshToken(cognito_refresh_token);
                }
                $("#userProfile").html ('');
                if(err.message === 'Missing required key \'AccessToken\' in params'){
                    //console.log('Sesion NO iniciada');
                    //$("#userProfile").append('<div><img src="https://admin.elmundo.sv/web2020/wp-content/themes/webdem2020/images/account.png" width="28"  height="28" alt="">');
                    //$("#userProfile").append('<button class="btn btn-warning btn-sm" id="closeSession" onclick="" >Iniciar sesion</button></div>');
                } 

                if(err.message === 'User does not exist.'){
                    removeLocalStorage();
                }            
                
            }else{

                //console.log('Get temporary credentials by:');
                //Getting IdentityCredentials
                getCognitoIdentityCredentials(cognito_id_token);
                
                let attrU = data.UserAttributes;
                let strIDP = data.Username;

                const given_name = attrU.find(given_name => given_name.Name === 'given_name');
                const family_name = attrU.find(family_name => family_name.Name === 'family_name');
                //console.log('Antes de picture var');
                const picture = attrU.find(picture => picture.Name === 'picture');
                //console.log('Despues');

                var LetterName = given_name.Value.substring(0,1);

                const type_user = attrU.find(zoneinfo => zoneinfo.Name === 'zoneinfo');
                const correo = attrU.find(email => email.Name === 'email');

                //console.log(picture.Value);
                //Check is picture Value exist
                if(picture){
                    //Validating IDP
                    if(IdentityProviderUI === 'Facebook'){
                        if(checkJSON(picture.Value)){
                            var jsonString = JSON.parse(picture.Value);
                            var imgURL     = jsonString.data['url'];
                            var avatarProfile =  '<img src="'+imgURL+'" widht="28" height="28" style="border-radius:50%;" id="editAccount" onclick="showUserActions()" />';
                        }else{
                            var imgURL     = picture.Value;
                            var avatarProfile =  '<img src="'+imgURL+'" widht="28" height="28" style="border-radius:50%;" id="editAccount" onclick="showUserActions()" />';
                        }
                    }else{
                        var imgURL        = picture.Value;
                        var avatarProfile =  '<img src="'+imgURL+'" widht="28" height="28" style="border-radius:50%;" id="editAccount" onclick="showUserActions()" />';
                    }
                }else{
                    var avatarProfile =  '<img src="https://static.elmundo.sv/letters_cognito/'+LetterName+'.svg" widht="28" height="28" style="border-radius:50%;" id="editAccount" onclick="showUserActions()"/>';
                }

                //Disable actions
                if(IdentityProviderUI === 'Facebook' || IdentityProviderUI === 'Google'){
                    $("#updatepasswd").prop('disabled', true);
                    $("#currentPassword").prop('disabled', true);
                    $("#newPassword").prop('disabled', true);
                }else{
                }

                commentFunction = true;
                searhFunction   = true;
                fname           = given_name.Value;
                lname           = family_name.Value;
                urlprofile      = imgURL;
                typeUser        = type_user.Value;

                if(given_name.Value != undefined){
                    //$("#userProfile").html('<span class="loginspan"><span onclick="showUserActions()">Hola, <br>' + fname + '</span> ' +avatarProfile+' <svg id="arrowDown" onclick="showUserActions()" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-caret-down-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg> <svg onclick="showUserActions()" id="arrowUp" style="display:none;" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-caret-up-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.247 4.86l-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/></svg></span>');
                    $("#userProfile").html('<div class="account"><p style="color: #fff"></p><p> ' +avatarProfile+'</p></div>');
                    //$("#userProfile").append('<div id="userActions" style="display:none;padding-top: 12px;"><ul><li><a href="https://admin.elmundo.sv/cognito/profile.html">Mi cuenta</a></li><li><a href="#" onclick="removeLocalStorage()">Cerrar sesión</a></li>');
                    $(".user-config-header h4").html(fname+" "+lname+" <br><small>"+correo.Value+"</small><input id='user_id' type='hidden' value='"+correo.Value+"'><input id='typeUser' type='hidden' value='"+typeUser+"'>");
                }else{
                    //$("#userProfile").append('<div>Bienvenido ');
                }                
            }
        });
    }else{
        //$("#userProfile").html ('');    
        $("#userProfile").html('<div><img src="https://admin.elmundo.sv/web2020/wp-content/themes/webdem2020/images/account.png" id="closeSession" width="28"  height="28" alt=""></div>');
        //$("#userProfile").append('<button class="btn btn-warning btn-sm"  onclick="" >Iniciar sesion</button>');
        window.location.href = urlEndpoint+'login/login.html'; 
    }

    
}


//Funcion para actualizar profile
function getProfile(cognito_access_token){
    if(cognito_access_token){
        var params = {
          AccessToken: cognito_access_token /* required */
        };

        cognitoidentityserviceprovider.getUser(params, function(err, data) {
            if (err){
                if(err.message === 'Access Token has expired'){
                    refreshToken(cognito_refresh_token);
                }
                $("#userProfile").html ('');
                if(err.message === 'Missing required key \'AccessToken\' in params'){
                    console.log('Sesion NO iniciada');
                    $("#userProfile").append('<div><img src="https://admin.elmundo.sv/web2020/wp-content/themes/webdem2020/images/account.png" width="28"  height="28" alt="">');
                    $("#userProfile").append('<button class="btn btn-warning btn-sm" id="closeSession" onclick="" >Iniciar sesion</button></div>');
                }   

                if(err.message === 'User does not exist.'){
                    removeLocalStorage();
                }         
                
            }else{
                getCognitoIdentityCredentials();

                let attrU = data.UserAttributes;
                let strIDP = data.Username;

                const given_name  = attrU.find(given_name => given_name.Name === 'given_name');
                const family_name = attrU.find(family_name => family_name.Name === 'family_name');
                const email       = attrU.find(email => email.Name === 'email');
                const gender      = attrU.find(gender => gender.Name === 'gender');
                const picture     = attrU.find(picture => picture.Name === 'picture');
                const birthdate     = attrU.find(birthdate => birthdate.Name === 'birthdate');

                var LetterName = given_name.Value.substring(0,1);
                
                //console.log(picture.Value);
                //Check is picture Value exist
                if(picture){
                    if(IdentityProviderUI === 'Facebook'){
                        if(checkJSON(picture.Value)){
                            var jsonString = JSON.parse(picture.Value);
                            var avatarProfile =  '<img src="'+jsonString.data['url']+'" widht="50" height="50" style="border-radius:50%;" />';
                        }else{
                            var avatarProfile =  '<img src="'+picture.Value+'" widht="50" height="50" style="border-radius:50%;" />';
                        }
                    }else{
                        var avatarProfile =  '<img src="'+picture.Value+'" widht="50" height="50" style="border-radius:50%;" />';
                    }
                }else{
                    //var avatarProfile =  '<span style="width:50px; height:50px; display:inline-block; background:#444; border-radius:50%; color:#fff; text-align:center;font-size:1.8rem;">'+LetterName+'</span>';
                    var avatarProfile =  '<img src="https://static.elmundo.sv/letters_cognito/'+LetterName+'.svg" widht="28" height="28" style="border-radius:50%;" />';
                }

                //Disable actions
                if(IdentityProviderUI === 'Facebook' || IdentityProviderUI === 'Google'){
                    $("#updatepasswd").prop('disabled', true);
                    $("#currentPassword").prop('disabled', true);
                    $("#newPassword").prop('disabled', true);
                    //="" data-placement="top" =""
                }else{
                }

                if(given_name.Value != undefined){
                    //Nombre
                    $("#givenName").val(given_name.Value);
                    //Apellido
                    $("#familyName").val(family_name.Value);
                    //Correo electronico
                    $("#emailInput").val(email.Value);
                    //Genero
                    if(gender){
                        if(gender.Value === 'Masculino'){
                            $('#genderM').prop('checked',true);
                        }else{
                            $('#genderF').prop('checked',true);
                        }
                    }
                    //Fecha de nacimiento
                    if(birthdate){
                        $("#birthdate").val(birthdate.Value);
                    }
                    $("#photoprofile").html(avatarProfile);
                }
                
            }
            
        });

        

    }else{
        alert('Usted no tiene privilegios para ver este contenido, por favor inicie sesión');
        window.location.href = urlEndpoint+'login/login.html'; 
    }
   
}

function pictureProfile(accessToken){
    
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    cognitoUser = userPool.getCurrentUser();
    
    return false;

    cognitoUser.getSession(function(err, session) {
        if (err) {
            //Do stuff
        }else{
            idToken = session.getIdToken().getJwtToken();
            getCognitoIdentityCredentials(cognito_id_token);
        }
    });
}

//Function to change password
function changePassword(){
    var params = {
      AccessToken: cognito_access_token, /* required */
      PreviousPassword: $('#currentPassword').val(), /* required */
      ProposedPassword: $('#newPassword').val() /* required */
    };
    cognitoidentityserviceprovider.changePassword(params, function(err, data) {
        if (err){
            console.log(err.message); // an error occurred
            if(err.message === 'User is not authorized to change password'){
                alert('Su usuario no tiene permitido hacer cambio de contraseña');
            }
        }else{
        }
    });
}

//User functions
function showUserActions(){
    $("#userActions").fadeToggle(200, function(){
        if($("#userActions").is(":visible")){
            $("#arrowDown").hide();
            $("#arrowUp").show();
        } else{
            $("#arrowDown").show();
            $("#arrowUp").hide();
        }
    });
}


function goToLogin(){
    var this_url = window.location.href;
    window.location.href = urlEndpoint+'/login/login.html?redirect_uri='+this_url; 

}

//Function to update pofile user
    //-----------------------------------------------------------------------------------
    /* IT WORKS, to set new user attributes
    
    */
    //-----------------------------------------------------------------------------------
function updateNickname(){
    console.log('Update nickname' + $("#nicknamedem").val());
    var params = {
      AccessToken: cognito_access_token,
      UserAttributes: [ 
        {
          Name: 'nicknamedem', 
          Value: $("#nicknamedem").val()
        }
      ]
    };
    cognitoidentityserviceprovider.updateUserAttributes(params, function(err, data) {
        if (err){
            //console.log(err, err.stack); // an error occurred
            console.log(err.message);
        }else{
            $("#msgSuccess").html('<img src="https://image.flaticon.com/icons/svg/1828/1828652.svg" width="15"/> Registro actualizado...');
            $("#msgSuccess").fadeIn(200);
            setTimeout(function(){
                $("#msgSuccess").fadeOut(200);
            }, 1800);
        }
    });
}

function updateZoneInfo(){
    var params = {
        AccessToken: cognito_access_token,
        UserAttributes: [ 
          {
            Name: 'zoneinfo', 
            Value: '8'
          }
        ]
    };
    cognitoidentityserviceprovider.updateUserAttributes(params, function(err, data) {
        if (err){
            console.log(err.message);
        }else{
            console.log('Done!');
        }
    });
}

function updateProfile(){
    var params = {
      AccessToken: cognito_access_token,
      UserAttributes: [ 
        {
          Name: 'given_name', 
          Value: $("#givenName").val()
        },
        {
          Name: 'family_name', 
          Value: $("#familyName").val()
        },
        {
          Name: 'gender', 
          Value: $("input[name='genderUP']:checked").val()
        },
        {
          Name: 'birthdate',
          Value: $("#birthdate").val()
        }/*,
        {
          Name: 'picture', 
          Value: 'https://image.flaticon.com/icons/svg/1177/1177568.svg' //$("#pictureProfile").val()
        }*/
        // more items 
      ]
    };
    console.log('updateUserAttributes >>>');
    cognitoidentityserviceprovider.updateUserAttributes(params, function(err, data) {
        if (err){
            //console.log(err, err.stack); // an error occurred
            console.log(err.message);
        }else{
            //console.log(data);           // successful response
            console.log('Done!');
            $("#msgSuccess").html('<img src="https://image.flaticon.com/icons/svg/1828/1828652.svg" width="15"/> Registro actualizado...');
            $("#msgSuccess").fadeIn(200);
            setTimeout(function(){
                $("#msgSuccess").fadeOut(200);
            }, 1800);
        }
    });
}

/*
This method will get temporary credentials for AWS using the IdentityPoolId and the Id Token recieved from AWS Cognito authentication provider.
*/
function getCognitoIdentityCredentials(cognito_id_token){

    AWS.config.region = region;
    var loginMap = {};
    loginMap['cognito-idp.' + region + '.amazonaws.com/' + userPoolId] = cognito_id_token;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identityPoolId,
        Logins: loginMap
    });

    AWS.config.credentials.clearCachedId();

    AWS.config.credentials.get(function(err) {
        if (err){
            console.log(err.message);
        }
        else {
            accessKey = AWS.config.credentials.accessKeyId;
            secretKey = AWS.config.credentials.secretAccessKey;
            sessionKey = AWS.config.credentials.sessionToken;

            $("#tempCredentials").html('<h5>Temporary credentials</h5>'+
                'AWS Access Key: '+ 
                AWS.config.credentials.accessKeyId + '<br>' + 
                'AWS Secret Key: '+ 
                AWS.config.credentials.secretAccessKey 
            );
        }

        $("#loader").hide();
    });


    /*
    //Buket AWS
    var bucketName = "profilescognito";

    AWS.config.update({
        region: region,
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId
        })
    });

    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: bucketName}
    });

    var files = document.getElementById('pictureProfile').files;
    if (files) {
        var file = files[0];
        var fileName = file.name;
        var fileUrl = 'https://' + region + '.amazonaws.com/' +  fileName;
        s3.upload({
            Key: fileName,
            Body: file,
            ACL: 'public-read'
            }, 
        function(err, data) {
            if(err) {
                console.log(err.message);
            }else{
                var newAvatar = Object.values(data)[0];

                var params = {
                  AccessToken: cognito_access_token,
                  UserAttributes: [ 
                    {
                      Name: 'picture', 
                      Value: newAvatar //$("#pictureProfile").val()
                    }
                  ]
                };
                console.log('updateUser Avatar >>>');
                cognitoidentityserviceprovider.updateUserAttributes(params, function(err, data) {
                    if (err){
                        //console.log(err, err.stack); // an error occurred
                        console.log(err.message);
                    }else{
                        //console.log(data);           // successful response
                        console.log('Done!');
                        $("#msgSuccess").html('<img src="https://image.flaticon.com/icons/svg/1828/1828652.svg" width="15"/> Fotografía actualizada...');
                        $("#msgSuccess").fadeIn(200);
                        setTimeout(function(){
                            $("#msgSuccess").fadeOut(200);
                        }, 1800);
                        location.reload();  
                    }
                });
            }
            
        });

    }

    */

    /*
    AWS.config.credentials.get(function(err) {
        if (err){
            $("#tempCredentials").html(err.message);
        } else {
            logMessage('AWS Access Key: '+ AWS.config.credentials.accessKeyId);
            logMessage('AWS Secret Key: '+ AWS.config.credentials.secretAccessKey);
            logMessage('AWS Session Token: '+ AWS.config.credentials.sessionToken);
            $("#tempCredentials").html('<h5>Temporary credentials</h5>'+
                'AWS Access Key: '+ 
                AWS.config.credentials.accessKeyId + '<br>' + 
                'AWS Secret Key: '+ 
                AWS.config.credentials.secretAccessKey + '<br>'
            );
        }

    });
    */
}

function changePincture(){
    /*console.log('changePincture function start');
    console.log('AWS Access Key: '+ accessKey);
    console.log('AWS Secret Key: '+ secretKey);*/
    //var creds = new AWS.Credentials(accessKey, secretKey, sessionKey);

    //Buket AWS
    var bucketName = "profilescognito";

    /*AWS.config.update({
        region: region,
        credentials: new AWS.Credentials(accessKey, secretKey, sessionKey)
    });*/

    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: bucketName},
        credentials: new AWS.Credentials(accessKey, secretKey, sessionKey)    
    });

    var files = document.getElementById('pictureProfile').files;
    if (files) {
        var file = files[0];
        var fileName = file.name;
        var fileUrl = 'https://' + region + '.amazonaws.com/' +  fileName;
        s3.upload({
            Key: fileName,
            Body: file,
            ACL: 'public-read'
            }, 
        function(err, data) {
            if(err) {
                console.log(err.message);
            }else{
                var newAvatar = Object.values(data)[0];

                var params = {
                  AccessToken: cognito_access_token,
                  UserAttributes: [ 
                    {
                      Name: 'picture', 
                      Value: newAvatar //$("#pictureProfile").val()
                    }
                  ]
                };
                console.log('updateUser Avatar >>>');
                cognitoidentityserviceprovider.updateUserAttributes(params, function(err, data) {
                    if (err){
                        //console.log(err, err.stack); // an error occurred
                        console.log(err.message);
                    }else{
                        //console.log(data);           // successful response
                        console.log('Done!');
                        $("#msgSuccess").html('<img src="https://image.flaticon.com/icons/svg/1828/1828652.svg" width="15"/> Fotografía actualizada...');
                        $("#msgSuccess").fadeIn(200);
                        setTimeout(function(){
                            $("#msgSuccess").fadeOut(200);
                        }, 1800);
                        location.reload();  
                    }
                });
            }
            
        });

    }else{
        console.log('No ha elegido archivo');
    }

    console.log('Do s3 functions');
}

