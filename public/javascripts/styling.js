
$(function(){
    $(document.body).css('padding-top', $('#topnavbar').height() + 40);
    $('.rimg').click( function(){
        console.log("clicked");
       this.animate({width: "500px", height: "500px"},500);
    });
});
