$(document).ready(function(){
/*  -------------------------------------------------------------
    DECLARACIÓN DE CONSTANTES
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    const doc = $(document);
    const user_options = $(".user-options-btn");
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

    if(screen.width < 768){
        $(".dash-panel-table tr td").click(function(){
            console.log(this);
            $(".dash-editions").hide();
            $(".dash-sheets").show();
        });

        $(".card").click(function(){
            $(".dash-editions").hide();
            $(".dash-sheets").hide();
            $(".dash-pages").show();
        });
    }

    if(screen.width <= 990){
        $(".table-sheets").hide();
        $(".table-progress").hide();
        $(".table-report").hide();

        $(".dash-panel-table tr td").click(function(){
            console.log(this);
            $(".dash-sheets").show();
        });

        $(".card").click(function(){
            $(".dash-sheets").hide();
            $(".dash-pages").show();
        });
    }

});