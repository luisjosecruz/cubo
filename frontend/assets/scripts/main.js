/*  --------------------------------------------------------------------------
  DECLARACIÓN DE VARIABLES GLOBALES
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
  setTimeout(() => window.location.href = config('url')+'/login' , 1000);
}

// function to execute getJSON
function doGetJSON(data, url){
  $.getJSON(url, data).done((response) => {
      handleDataJSON(response);
    }).fail(() => {
      console.log('Something is wrong');
    });
}

function handleDataJSON(response){
  let dataType = typeof(response);
  console.log(dataType);
  console.log(response);
}

// Initialización
function init(given_name, family_name, email, zoneinfo){
  // user configuration
  let user_options = $(".user-options-btn");
  let wrapper_options = $(".wraper-options");
  let fullname = `${given_name} ${family_name}`;
  
  // show popup
  user_options.click((e) => {
      wrapper_options.toggleClass("show");
      e.stopPropagation();
  }); 

  // hide popup
  wrapper_options.click((e) => e.stopPropagation());
  $(document).click(() => wrapper_options.removeClass("show"));

  // set user JSON.parse(data)
  document.getElementById('userPicture').setAttribute('src', picture);
  document.getElementById('userName').textContent = given_name+" "+family_name;
  document.getElementById('userEmail').textContent = email;

  // Get permissions for user logged in
  let data = { 'fullname': fullname, 'email': email, 'zoneinfo': zoneinfo, 'request': 'permits' };
  doGetJSON(data, 'src/callRest.php');
}


/*  --------------------------------------------------------------------------
    DOCUMENT READY
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
  
$(document).ready(function() {
  // user permits
  init(given_name, family_name, email, zoneinfo);

  // call log out function
  document.getElementById("logout").addEventListener("click", logout);
});


