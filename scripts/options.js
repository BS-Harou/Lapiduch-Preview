var
	d = document,
	o  = opera,
	w = widget
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
	interval.value = w.preferences.interval || 2;
	interval.addEventListener('change', handleInterval, false);

	var refresh = d.getElementById('refresh');
	refresh.addEventListener('click', handleRefresh, false);

	var nick = d.getElementById('nick');
	var pass = d.getElementById('pass');
	var autologin = JSON.saveParse(w.preferences.autologin);
	if (autologin) {
		nick.value = autologin.nick || '';
		pass.value = autologin.pass || '';
	}
	nick.addEventListener('input', handleChange, false);
	pass.addEventListener('input', handleChange, false);
}

function handleChange() {
	var autologin = JSON.saveParse(w.preferences.autologin) || {};
	autologin[this.id] = this.value;
	w.preferences.autologin = btoa(JSON.stringify(autologin));
}

function handleInterval() {
	var val = parseInt(this.value);
	if (val < 1) {
		val = 1;
	}
	w.preferences.interval = val;
}

function handleRefresh() {
	o.extension.postMessage({ action: 'refresh-now' });
}

d.addEventListener('DOMContentLoaded', init, false);