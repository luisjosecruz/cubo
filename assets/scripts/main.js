$(document).ready(function(){
/*  -------------------------------------------------------------
    DECLARACIÓN DE CONSTANTES
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    const doc = $(document);
    const user_options = $(".user-options");
    const wrapper_options = $(".wraper-options");

/*  -------------------------------------------------------------
    USER CONFIG    
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    user_options.click((e) => {
        wrapper_options.toggleClass("show");
        e.stopPropagation();
    }); 

    wrapper_options.click((e) => { 
        e.stopPropagation()
    });

    doc.click(() => {
        wrapper_options.removeClass("show")
    });

});