
$(function(){
    $(document.body).css('padding-top', $('#topnavbar').height() + 40);
    var bindClicks = function(){
        $('.rimg').bind("click", function(){
           $('.rimg').animate({width: "500px", height: "500px"},500);
        });
    }
});
