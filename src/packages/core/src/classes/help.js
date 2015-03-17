define([], function () {
	var SEP = '\t',
		SEPP = SEP + SEP;

	return function(app) {
		app.command.addCommand('help', function(req, res) {
			var commandManager = req.app.command,
				root = commandManager.getCommandForRoute(req.route.slice(1), true);
			res.header('Help');
			res.log('HELP FILE FOR ' + root.getRoute().join('/').toUpperCase()+'');

			if(root.description)
				res.log(root.description);

			if(root.listCommands().length) {
				res.log();
				res.log('Child classes');
				root.listCommands().sort(function(a, b) {
					return a.name < b.name ? -1 : 1;
				}).forEach(function (command) {
					res.log(SEP + '<a command="help '+command.getRoute().slice(1).join(' ')+'">?</a>' + ' ' + '<a command="'+command.getRoute().slice(1).join(' ')+'">'+command.name+'</a>' + SEPP + command.description);
				});
			}

			if(root.listOptions().length) {
				res.log();
				res.log('Options');
				root.listOptions().sort(function(a, b) {
					return a.long < b.long ? -1 : 1;
				}).forEach(function (option) {
					res.log(SEP + [
						option.short ? '-' + option.short : null,
							'--' + option.long + (option.type ? ' &#60;' + option.type + '&#62;' : ''),
						option.description].join(SEP));
				});
			}
		})
			.addDescription('Prints the help files, sort of')
			.isGreedy();

	};



});