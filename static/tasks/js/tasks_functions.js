$("span.right button").click(function(){
	$(".right-nav-container").addClass("activated");
});

$("span.left button").click(function(){
	$(".left-nav-container").addClass("activated");
});
$("button.back").click(function(){
	$(".left-nav-container").removeClass("activated");
    $(".right-nav-container").removeClass("activated");
});
