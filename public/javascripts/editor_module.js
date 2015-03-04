(function( $ ) {
	var currentStyle = {};

	function objToStyle(obj) {
		var result = '';
		for (var i in obj) result += i + ': ' + obj[i] + ';';
		return result;
	}

	$.fn.initEditor = function() {
		$("#checkboxpane").on("click", function(ev){
		switch(ev.target.value){
			case 'bold':
				if(ev.target.checked)
					currentStyle['font-weight'] = 'bold';
				else
					delete currentStyle['font-weight'];
				break;
			case 'italic':
				if(ev.target.checked)
					currentStyle["font-style"] = "italic";
				else
					delete currentStyle["font-style"];
				break;
			case 'underline':
				if(ev.target.checked)
					currentStyle["text-decoration"] = "underline";
				else
					delete currentStyle["text-decoration"];
				break;
			default : 
				break;
			}
			$("#msg-txt").attr("style", objToStyle(currentStyle));
		});

		$("#colorpickerbutton").on("click", function(ev){
			var wrapper = document.querySelector("#wrapper");
			if(wrapper.style.display == "block") {
				var colorElement = document.querySelector('input[name="color"]:checked');
				currentStyle.color = colorElement.value;
				$("#msg-txt").attr("style", objToStyle(currentStyle));
				wrapper.style.display = "none";
			} else {
				wrapper.style.display = "block";
			}
		});

		$("#fsize").on("selectmenuchange", function(ev) {
			currentStyle["font-size"] = ev.target.value + "px";
			$("#msg-txt").attr("style", objToStyle(currentStyle));
		});
	}

	$.fn.getCurrentStyle = function() {
		return objToStyle(currentStyle);
	};
}( jQuery ));