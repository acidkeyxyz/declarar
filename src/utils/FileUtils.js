const isSkipped = (descripcion, skipList) => {
	if (skipList === null) {
		return false;
	}
	return skipList.indexOf(descripcion) != -1;
};

const normalizeParentFolder = (param) => {
	return param.endsWith('/') ? param : param + '/';
};
const normalizeSkipList = (param) => {
	return param === undefined ? null : param.split(',');
};
const getFileName = (filePath, withExtension = true) => {
	if (filePath.length === null || filePath.length === undefined || filePath.length === '') {
		return '';
	}
	const startFileName = filePath.lastIndexOf('/');
	if (startFileName === -1) {
		return '';
	}
	const endFilename = withExtension ? filePath.length : filePath.lastIndexOf('.');
	return filePath.substring(startFileName + 1, endFilename);
};

module.exports = {
	isSkipped,
	normalizeParentFolder,
	normalizeSkipList,
	getFileName,
};
