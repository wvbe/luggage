import MessageFormat from 'messageformat';

const englishLanguage = {
	testMessage: 'This is a {testMessage}'
};

const language = {
		en: englishLanguage
	},
	defaultLocale = 'en',
	messageFormat = new MessageFormat('en'),
	wasAlreadyWarnedForMissingMessageKey = {},
	translations = Object.keys(language).reduce(
		(translations, locale) => {
			const localLanguage = language[locale];

			return Object.assign(
				translations,
				{
					[locale]: Object.keys(language[locale]).reduce(
						(localTranslations, messageKey) => Object.assign(localTranslations, {
							[messageKey]: messageFormat.compile(localLanguage[messageKey])
						}),
						{})
				})
		},
		{});

export function translate (messageKey, args) {
	let translator = null;

	if (!translations[defaultLocale][messageKey]) {
		// Warn only once
		if (!wasAlreadyWarnedForMissingMessageKey[messageKey]) {
			console.warn(`Localization key "${messageKey}" is not in localization.js`);
			wasAlreadyWarnedForMissingMessageKey[messageKey] = true;
		}

		translator = messageFormat.compile(messageKey);
	}
	else {
		translator = translations[defaultLocale][messageKey];
	}

	return translator(args);
}
