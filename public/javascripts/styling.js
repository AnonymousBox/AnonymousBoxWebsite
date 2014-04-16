
$(function(){
    $(document.body).css('padding-top', $('#topnavbar').height() + 40);
        $('.rimg').bind("click", function(){
            console.log("clicked");
           $('.rimg').animate({width: "500px", height: "500px"},500);
        });
});
