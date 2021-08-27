/*  --------------------------------------------------------------------------
    GET USER VARIABLES
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
let tokenAWS = config('id_token');
let idTokenAWS = localStorage.getItem(tokenAWS);
let JWT = parseJWT(idTokenAWS);
let { zoneinfo, picture, email, family_name, given_name } = JWT;
let access_token;
let IdentityProviderUI = localStorage.getItem('aws.cognito.'+config('clientId')+'.IdentityProvider');

// get access token from local storage
if(IdentityProviderUI === 'Facebook' || IdentityProviderUI === 'Google'){
  access_token = localStorage.getItem('aws.cognito.'+config('clientId')+'.access_token');
}else{
  LastAuthUser = localStorage.getItem('CognitoIdentityServiceProvider.'+config('clientId')+'.LastAuthUser');
  access_token = localStorage.getItem('CognitoIdentityServiceProvider.'+config('clientId')+'.'+LastAuthUser+'.accessToken');
}

// if does'nt exist access token send it to login
if (!access_token) window.location.href = config('url')+'/login';

/*  --------------------------------------------------------------------------
    FUNCTIONS
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

// Remove Local Storage
function logout(){
  loast.show("Cerrando sesión ...", "success");
  window.localStorage.clear();
  setTimeout(() => window.location.href = config('url')+'/login' , 1500);
}

// Get permissions for user logged in
function getPermits(given_name, family_name, email, zoneinfo){
  
}

/*  --------------------------------------------------------------------------
    DOCUMENT READY
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
  
$(document).ready(function() {
/*  --------------------------------------------------------------------------
    DECLARACIÓN DE CONSTANTES GLOBALES
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/*  --------------------------------------------------------------------------
    POPUP USER CONFIG    
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
  let user_options = $(".user-options-btn");
  let wrapper_options = $(".wraper-options");
  
  // show popup
  user_options.click((e) => {
      wrapper_options.toggleClass("show");
      e.stopPropagation();
  }); 

  // hide popup
  wrapper_options.click((e) => e.stopPropagation());
  $(document).click(() => wrapper_options.removeClass("show"));

  // set user picture
  document.getElementById('userPicture').setAttribute('src', picture);

  // call log out function
  document.getElementById("logout").addEventListener("click", logout);
});



// $.ajax({
//     type: "POST",
//     url: 'http://localhost/cubo_development/backend/config/sendEnv.php',
//     data: '',
//     success: (data) => {
//         console.log(data);
//     }
// });
