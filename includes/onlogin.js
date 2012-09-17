// ==UserScript==
// @include http://www.lapiduch.cz/
// @include http://www.lapiduch.cz/index.php
// ==/UserScript==

/**
* This script is supposed to cause immidiate SD item update
* when user logs in to www.lapiduch.cz
*/

document.addEventListener('DOMContentLoaded', function() {
	var but = document.querySelector("input[value='Vstoupit!']");
	if (but) {
		but.form.addEventListener('submit', handleSubmit);
	} 
});

function handleSubmit() {
	opera.extension.postMessage({ action: 'refresh-soon' });
}