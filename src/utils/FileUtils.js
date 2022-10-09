const defaultSkipList = 'Pago,Pago de nmina';
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
	if (param === undefined) {
		return defaultSkipList;
	}
	return param.split(',');
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
const isSkippedFile = (fileName) => {
	return !fileName.startsWith('.');
};
module.exports = {
	isSkipped,
	normalizeParentFolder,
	normalizeSkipList,
	getFileName,
	isSkippedFile,
};
