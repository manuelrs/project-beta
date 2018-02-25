(function($) {
  $(function() {
    $(".button-collapse").sideNav();
  }); // end of document ready
})(jQuery); // end of jQuery name space

$(document).ready(function() {
  $("select").material_select();
});

$(".slider").slider({
  fullWidth: true,
  interval: 1000000
});
