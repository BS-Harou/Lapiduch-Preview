// ==UserScript==
// @include http://www.lapiduch.cz/
// @include http://www.lapiduch.cz/index.php
// ==/UserScript==

/**
* Smyslem toho skriptu je, aby se po přihlášení automaticky
* začali nahrávat kluby do položky v rychlém přístupu
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