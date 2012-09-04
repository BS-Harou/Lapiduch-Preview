var
	d = document
;

JSON.saveParse = function(str) {
	try {
		return JSON.parse(atob(str));
	} catch(ex) {
		return null;
	}
}

function init() {
	var interval = d.getElementById('interval');
	interval.value = localStorage.getItem('interval') || 2;
	interval.addEventListener('change', handleInterval, false);

	var refresh = d.getElementById('refresh');
	refresh.addEventListener('click', handleRefresh, false);

	var nick = d.getElementById('nick');
	var pass = d.getElementById('pass');
	var autologin = JSON.saveParse( localStorage.getItem('autologin') );
	if (autologin) {
		nick.value = autologin.nick || '';
		pass.value = autologin.pass || '';
	}
	nick.addEventListener('input', handleChange, false);
	pass.addEventListener('input', handleChange, false);
}

function handleChange() {
	var autologin = JSON.saveParse( localStorage.getItem('autologin') ) || {};
	autologin[this.id] = this.value;
	localStorage.setItem('autologin', btoa(JSON.stringify(autologin)));
}

function handleInterval() {
	var val = parseInt(this.value);
	if (val < 1) {
		val = 1;
	}
	localStorage.setItem('interval', val);
}

function handleRefresh() {
	//o.extension.postMessage({ action: 'refresh-now' });
}

d.addEventListener('DOMContentLoaded', init, false);