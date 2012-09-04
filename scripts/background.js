/*global jQuery, Backbone, widget, atob, $*/

if ('jQuery' in this && jQuery.support) {
	jQuery.support.cors = true;
}

JSON.saveParse = function(str) {
	try {
		return JSON.parse( atob(str) );
	} catch(ex) {
		return null;
	}
};

/**
* DOM CONTENT LOADED
*/
$(function() {

	var cesty = {
		nove: 'http://www.lapiduch.cz/index.php?mod=book&new=1',
		nic: 'http://www.lapiduch.cz/index.php?mod=book'
	};

	var sd = opera.contexts.speeddial;
	sd.url = cesty.nove;


	var Addon = {
		fetch: function() {

			if ($('#kluby').html()) {
				sd.title = '...';
			}
			
			$.ajax({
				url: 'http://www.lapiduch.cz/index.php?mod=book',
				// Lapiduch does not have charset in content-type header - overrride to prevent wrong char mapping
				mimeType: 'text/html;charset=Windows-1250',
				success: function(data) {

					var rows = $(data).find('.vypisKlubu tr'); 
					var celkem = 0;

					var models = rows.map(function(i, row) {
						var name = $(row).find('td:first-of-type a').html();

						// filter rows with column headers
						if (name) {
							
							// set count to 0 for rows without new posts
							var findCount = $(row).find('.L1p');
							var count = findCount.html() ? parseInt(findCount.html().replace(/[^\d]/g, ''), 10) : 0;

							celkem += count;
							return { nazev: name, pocet: count };
						}
					});

					// When there are no new posts, set SD item url to list of all clubs
					sd.url = !celkem ? cesty.nic : cesty.nove;
					sd.title = 'Lapiduch Preview';

					// jQuery reutrns object, Zepto returns array
					if (!Array.isArray(models)) {
						models = models.toArray();
					}

					if (!models.length) {
						if (logMeIn()) {
							models.push({ nazev: 'Probíhá automatické přihlášení!', pocet: '' });
						} else {
							models.push({ nazev: 'Nejste přihlášeni!', pocet: '' });	
						}
					}

					kluby.reset(models);
					//kluby.sort();
				},
				error: function(err, type, msg) {
					sd.title = 'Nastala chyba - asi jste offline';
					console.log('Lapiduch Preview: Problem with connection. Can\'t load data.\n\n' + msg);
				}
			});
		},
		interval: null,
		lastAutoLogin: 0
	};

	function logMeIn() {
		var autologin = JSON.saveParse(widget.preferences.autologin);

		if (autologin && autologin.nick && autologin.pass && Date.now() - Addon.lastAutoLogin > 1800000) {

			Addon.lastAutoLogin = Date.now();

			$.post('http://www.lapiduch.cz/log.php', {
				user: autologin.nick,
				pass: autologin.pass,
				'ACTION[login]': 'Vstoupit!'
			}).success(function() {
				refreshWidget();
			});

			return true;
		}
		return false;
	}


	var Klub = Backbone.Model.extend({
		defaults: function() {
			return {
				nazev: '<unknown name>',
				pocet: 0
			};
		}
	});

	var kluby = new (Backbone.Collection.extend({
		model: Klub,
		comparator: function(model) {
			return [ !model.get('pocet'), model.get('pocet') ];
		}
	}));

	

	var KlubView = Backbone.View.extend({
		tagName: 'tr',
		template: _.template($('#klub-template').html()),
		initialize: function() {

		},

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		remove: function() {
			this.$el.remove();
			this.model.destroy({ silent: true });
		}
	});

	var app = new (Backbone.View.extend({
		initialize: function() {

			kluby.on('add', this.addClub, this);
			kluby.on('reset', this.addAll, this);

			Addon.fetch();
			if (Addon.interval) {
				clearInterval(Addon.interval);
			}

			Addon.interval = setInterval(Addon.fetch, getInter());
		},

		addClub: function(mod) {
			mod = typeof mod === 'number' ? arguments[1] : mod;
			var view = new KlubView({ model: mod });
			$('#kluby').append(view.render().el);
		},

		addAll: function() {
			$('#kluby').html('');
			kluby.each(this.addClub);
		}

	}));

	function getInter() {
		return (parseInt(widget.preferences.interval, 10) || 2) * 1000 * 60;
	}

	function refreshWidget() {
		Addon.fetch();
		if (Addon.interval) {
			clearInterval(Addon.interval);
		}
		Addon.interval = setInterval(Addon.fetch, getInter());
	}

	opera.extension.onmessage = function(e) {
		switch (e.data.action) {
			case 'refresh-now':
				refreshWidget();
				break;

			case 'refresh-soon':
				setTimeout(refreshWidget, 5000);
				break;
		}
	};

});