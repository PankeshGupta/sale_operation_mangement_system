
console.log("script.js attached successfully");

$('#myModal').on('shown.bs.modal', function() {
  $(this).find('input:first').focus();
});
$('.modal-content').keypress(function(e){
if(e.which == 13) {
  //dosomething
  $( "#submit" ).trigger( "click" );

}
})
