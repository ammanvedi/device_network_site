window.onload = function () {

	var fruit_div = document.getElementById('fruit_update');
	var price = document.getElementById('price_box');
	var fruit = document.getElementById('fruit_select');
	var addbtn = document.getElementById('add_fruit_btn');
	var clearbtn = document.getElementById('clear_fruit_btn');
	var dataset = document.getElementById('dataset');
	var fullstring = '{';

	addbtn.addEventListener('click', function (evt) {
		var partial = fruit.value + ':' + price.value + ';';

		fullstring += partial;

		dataset.value = fullstring + '}';

		console.log('the value for fruit is ' + fruit.value );
		console.log('the value for fruit is ' + fruit.value );
	});

	clearbtn.addEventListener('click', function (evt) {

		dataset.value = '';

	});


}