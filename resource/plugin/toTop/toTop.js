jQuery(document).ready(function($) {
	if ($("#toTop").length>0) {
		$("#toTop").css({
			/*width : '50px',
			height : '50px',*/
			bottom : '30px',
			right : '15px',
			padding : '5px',
			border : '1px solid red',
			borderRadius : '5px',
			position : 'fixed',
			cursor : 'pointer',
			zIndex : '999999',
		});
		if ($(this).scrollTop() == 0) {
			$("#toTop").hide();
		}
		$(window).scroll(function(event) {
			if ($(this).scrollTop() == 0) {
				$("#toTop").hide();
			}
			if ($(this).scrollTop() != 0) {
				$("#toTop").show();
			}
		});
		$("#toTop").click(function(event) {
			$("html,body").animate({
				scrollTop : "0px"
			}, 666)
		});
	}
});