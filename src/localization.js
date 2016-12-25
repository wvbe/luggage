import MessageFormat from 'messageformat';

const englishLanguage = {


};

const language = {
		en: englishLanguage
	},
	defaultLocale = 'en',
	messageFormat = new MessageFormat('en'),
	wasAlreadyWarnedForMissingMessageKey = {},
	translations = Object.keys(language)
		.reduce((translations, locale) => {
			const localLanguage = language[locale];

			translations[locale] = Object.keys(localLanguage)
				.reduce((localTranslations, messageKey) => {
					localTranslations[messageKey] = messageFormat.compile(localLanguage[messageKey]);
					return localTranslations;
				}, {});

			return translations;
		});

export function translate (messageKey, args) {
	let translator = null;

	if (!translations[messageKey]) {
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
