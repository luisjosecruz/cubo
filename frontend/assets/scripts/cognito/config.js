let cognitoUser,
    userPool,
    commentFunction, 
	searhFunction,
	fname,
	lname,
	urlprofile;

var poolData = { 
    UserPoolId : config('userPoolId'),
    ClientId : config('clientId')
};

/*
+ Determinamos si hay IDP ? obtenemos custom access_token : obtenemos por LastAuthUser.
+ Enviamos cognito access token a la funcion getUser
*/
var IdentityProviderUI    = localStorage.getItem('aws.cognito.'+config('clientId')+'.IdentityProvider');

if(IdentityProviderUI === 'Facebook' || IdentityProviderUI === 'Google'){
    var cognito_access_token  = localStorage.getItem('aws.cognito.'+config('clientId')+'.access_token');
    var cognito_id_token      = localStorage.getItem('aws.cognito.'+config('clientId')+'.id_token');
    var cognito_refresh_token = localStorage.getItem('aws.cognito.'+config('clientId')+'.refresh_token');
    //var cognito_devicekey     = localStorage.getItem('aws.cognito.'+clientId+'.deviceKey');

    $("#currentPassword").attr('disabled', true);
    $("#newPassword").attr('disabled', true);
}else{
    var LastAuthUser = localStorage.getItem('CognitoIdentityServiceProvider.'+config('clientId')+'.LastAuthUser');
    //console.log('LastAuthUser: ' + LastAuthUser);
    var cognito_access_token  = localStorage.getItem('CognitoIdentityServiceProvider.'+config('clientId')+'.'+LastAuthUser+'.accessToken');
    var cognito_id_token      = localStorage.getItem('CognitoIdentityServiceProvider.'+config('clientId')+'.'+LastAuthUser+'.idToken');
    var cognito_refresh_token = localStorage.getItem('CognitoIdentityServiceProvider.'+config('clientId')+'.'+LastAuthUser+'.refreshToken');
    var cognito_devicekey     = localStorage.getItem('CognitoIdentityServiceProvider.'+config('clientId')+'.'+LastAuthUser+'.deviceKey');
}

cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'us-west-2'});

//Funcion para regenerar tokens temporales
function refreshToken(refresh_token){
    //alert("Refresh Token");
    if(refresh_token){
        var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'us-west-2'});

        var params = {
          AuthFlow: 'REFRESH_TOKEN', /* required */
          ClientId: config('clientId'), /* required */
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
                    localStorage.setItem('aws.cognito.'+config('clientId')+'.id_token', data.AuthenticationResult.IdToken);
                    localStorage.setItem('aws.cognito.'+config('clientId')+'.access_token', data.AuthenticationResult.AccessToken);
                }else{
                    //console.log('Set as SDK tokens format');
                    localStorage.setItem('CognitoIdentityServiceProvider.'+config('clientId')+'.'+LastAuthUser+'.idToken', data.AuthenticationResult.IdToken);
                    localStorage.setItem('CognitoIdentityServiceProvider.'+config('clientId')+'.'+LastAuthUser+'.accessToken', data.AuthenticationResult.AccessToken);
                }              

                //console.log('Hemos regenerado Access and Id Token, RefreshToken works!');
                location.reload();    
            }
        });
    }else{
        window.location.href = config('url')+"/login"; 
    }
}

function removeLocalStorage(){
    localStorage.removeItem('aws.cognito.'+config('clientId')+'.access_token');
    localStorage.removeItem('aws.cognito.'+config('clientId')+'.id_token');
    localStorage.removeItem('aws.cognito.'+config('clientId')+'.refresh_token');
    localStorage.removeItem('aws.cognito.'+config('clientId')+'.IdentityProvider');
    localStorage.removeItem('aws.cognito.'+config('clientId')+'.username');
    localStorage.removeItem('aws.cognito.'+config('clientId')+'.redirect_uri');

    localStorage.setItem('CognitoIdentityServiceProvider.'+config('clientId')+'.'+LastAuthUser+'.accessToken', '');
    
    setTimeout(function(){
        window.location.href = config('url')+"/login";
    }, 500);    
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
                if(err.message === 'Access Token has expired'){
                    refreshToken(cognito_refresh_token);
                }

                if(err.message === 'Missing required key \'AccessToken\' in params'){
                    //console.log('Sesion NO iniciada');
                } 
                if(err.message === 'User does not exist.'){
                    removeLocalStorage();
                }            
            }else{
                //Getting IdentityCredentials
                getCognitoIdentityCredentials(cognito_id_token);
                
                let attrU = data.UserAttributes;
                let strIDP = data.Username;

                const given_name = attrU.find(given_name => given_name.Name === 'given_name');
                const family_name = attrU.find(family_name => family_name.Name === 'family_name');
                const picture = attrU.find(picture => picture.Name === 'picture');
                var LetterName = given_name.Value.substring(0,1);
                const type_user = attrU.find(zoneinfo => zoneinfo.Name === 'zoneinfo');
                const correo = attrU.find(email => email.Name === 'email');

                //Disable actions
                if(IdentityProviderUI === 'Facebook' || IdentityProviderUI === 'Google'){
                    $("#updatepasswd").prop('disabled', true);
                    $("#currentPassword").prop('disabled', true);
                    $("#newPassword").prop('disabled', true);
                }

                commentFunction = true;
                searhFunction   = true;
                fname           = given_name.Value;
                lname           = family_name.Value;
                urlprofile      = imgURL;
                typeUser        = type_user.Value;            
            }
        });
    }else{
        window.location.href = config('url')+"/login";
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
        window.location.href = config('url')+"/login";
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
    window.location.href = config('url')+'/login'; 
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
This method will get temporary credentials for AWS using the IdentityPoolId 
and the Id Token recieved from AWS Cognito authentication provider.
*/
function getCognitoIdentityCredentials(cognito_id_token){

    AWS.config.region = config('region');
    var loginMap = {};
    loginMap['cognito-idp.' + config('region') + '.amazonaws.com/' + config('userPoolId')] = cognito_id_token;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: config('identityPoolId'),
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
}

function changePincture(){
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
        var fileUrl = 'https://' + config('region') + '.amazonaws.com/' +  fileName;
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
