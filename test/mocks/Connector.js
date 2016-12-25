import fs from 'fs';
import path from 'path';

import { DOMParser } from 'xmldom';

export default class MockConnector {
	constructor () {

	}

	loadDocument (remoteDocumentId) {
		const realRemoteDocumentId = remoteDocumentId.slice(remoteDocumentId.length - 4) !== '.xml' ? remoteDocumentId + '.xml' : remoteDocumentId;
		return new Promise((resolve, reject) => {
				fs.readFile(
					path.resolve(__dirname, '..', '..', 'dev-cms', 'files', realRemoteDocumentId),
					'utf-8',
					(err, res) => err ? reject(err) : resolve(res));
			})
			.then(xmlString => {
				return {
					documentFile: { remoteDocumentId },
					content: new DOMParser().parseFromString(xmlString, 'application/xml')
				};
			});
	}

	retrieveReferences (permanentIds) {
		return new Promise(resolve => process.nextTick(() => resolve({
			results: permanentIds.map(permanentId => ({
				ok: true,
				body: {
					permanentId,
					target: permanentId.split(':::')[2],
					type: permanentId.split(':::')[1]
				}
			}))
		})));
	}
};
