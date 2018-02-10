$(document).ready(function(){
 	$("#left").sideNav({
 		edge:'left'
 	});
 	$("#right").sideNav({
 		edge:'right'
 	});

 	$("#right_open").sideNav({
 		edge:'right'
 	});
 	
	$('.modal').modal();
	$('ul.tabs').tabs();
	$('.timepicker').pickatime();
	$('.dropdown-button').dropdown();  



	// $('.button-collapse-engineer').sideNav({
	// 	edge: 'right',
	// 	closeOnClick: true,
	// 	draggable: false,
	// }
	// );
	$(".actionbar").hide();
	$(".indicator").click(function() {
		$(".actionbar").show();
		
	});
	$(".close").click(function() {
		// $(".actionbar").hide();
		$("#right").trigger("click");
	});

	$("#cross_list").click(function() {
		$('.button-collapse-engineer').sideNav('hide');
		
	});
	$("#cross_list_select").click(function() {
		$('.button-collapse-engineer').sideNav('hide');
		
	});


	$("#user_profile_pic").click(function() {		
		$(".menu_temp").toggle();
		
	});

	// $("#right").click(function() {		
	// 	$("#slide-out-engineer").show();
		
	// });
	// if ($("#slide-out-engineer-list").hasClass("deactive-sides-engineer")) 
	// {
	// 	$("#add_task>div").css("right","320px");
	// } 
	// else {
	// 	$("#add_task>div").css("right","6vh");
	// }



$('.datepicker').pickadate({
	selectMonths: true, // Creates a dropdown to control month
	selectYears: 15, // Creates a dropdown of 15 years to control year,
	today: 'Today',
	clear: 'Clear',
	close: 'Ok',
	format:'dd-mm-yyyy',
	closeOnSelect: false // Close upon selecting a date,
});

$('.datepicker1').pickadate({
	format:'dd-mm-yyyy',
	closeOnSelect: true // Close upon selecting a date,
});

    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    
    $('.modal').modal({complete: function() {
    var element = angular.element("#add_task");
    var controller = element.controller();
    var $scope = element.scope();

     //as this happends outside of angular you probably have to notify angular of the change by wrapping your function call in $apply
     $scope.$apply(function(){
      $scope.title         = ""
      $scope.description   = ""
      $scope.engineer      = ""
      $scope.markers           = [];
      $scope.task_id       = 0;
      $scope.address          = ""
      $(".highlight").removeClass("highlight");
      angular.element('.datepicker').val('')
     });
  }});
  
  //$("select").select2();

  angular.element(".modal-overlay").trigger('click');
  

  //$('select').material_select();

  // $('.timepicker').pickatime({
  //   default: 'now', // Set default time: 'now', '1:30AM', '16:30'
  //   fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
  //   twelvehour: false, // Use AM/PM or 24-hour format
  //   donetext: 'OK', // text for done-button
  //   cleartext: 'Clear', // text for clear-button
  //   canceltext: 'Cancel', // Text for cancel-button
  //   autoclose: false, // automatic close timepicker
  //   ampmclickable: true, // make AM PM clickable
  //   aftershow: function(){} //Function for after opening timepicker
  // });

  	var select2_backup = [];

    $('ul.tabs').tabs();

    $("a.btn-floating").click(function(){
	    $("form.addcomment .col.s10").toggle();
	    // $("form.addcomment").hide();
	});



});