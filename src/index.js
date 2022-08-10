const xml2js = require('xml2js');
const fs = require('fs');
const {exit} = require('process');
const {firstRow, columnNames, getCodigoImpuesto, normalizeDesc} = require('./utils/SatUtils');
const {
	isSkipped,
	normalizeParentFolder,
	normalizeSkipList,
	getFileName,
} = require('./utils/FileUtils');

/******************                            ****************
 ******************           MAIN             ****************
 ******************                            ****************/
if (process.argv.length <= 2) {
	console.log('invalid parentFolder ::' + process.argv.length);
	console.log('Usage:');
	console.log('node index.js <parentFolder> "skiplist, comma sepparated,"');
	console.log('Example:');
	console.log('node index.js ./may2020 "Spotify Family,CONSUMO DE ALIMENTOS"');
	exit(-1);
}
const parser = new xml2js.Parser({attrkey: 'ATTR'});

const parentFolder = normalizeParentFolder(process.argv[2]);
const skipList = normalizeSkipList(process.argv[3]);

console.log(columnNames.join(','));

fs.readdir(parentFolder, (err, files) => {
	let index = 2;
	files.forEach((file) => {
		if (file.endsWith('.xml')) {
			const currentFile = parentFolder + file;
			let xml_string = fs.readFileSync(currentFile, 'utf-8');
			const uuid = getFileName(currentFile,false);
			parser.parseString(xml_string, function (error, result) {
				if (error === null) {
					const comprobante = getAttribute(result, 'Comprobante');
					let conceptos = getAttribute(comprobante, 'Conceptos');
					let fecha = comprobante['ATTR']['Fecha'];

					let concepto = getAttribute(conceptos[0], 'Concepto');
					let usoCFDI = comprobante['cfdi:Receptor'][0]['ATTR']['UsoCFDI'];
					let rfcEmisor = comprobante['cfdi:Emisor'][0]['ATTR']['Rfc'];
					for (let i = 0; i < concepto.length; i++) {
						try {
							const descripcion = normalizeDesc(concepto[i]['ATTR']['Descripcion']);
							const impuestosObj = concepto[i]['cfdi:Impuestos'] || concepto[i]['Impuestos'];
							let importeBasePrimitive;
							if (descripcion === 'Pago') {
								importeBasePrimitive = 0.0;
							} else {
								const base = getAttributeFromObj(impuestosObj, 'Base', 0);
								const valorUnitario = concepto[i]['ATTR']['ValorUnitario'];
								importeBasePrimitive = parseFloat(base || valorUnitario);
							}
							const impuestoPrimitive = parseFloat(getAttributeFromObj(impuestosObj, 'Importe', 0));
							const codigoImpuesto = getAttributeFromObj(impuestosObj, 'Impuesto', '002');
							if (!isSkipped(descripcion, skipList)) {
								const tipoImpuesto = getCodigoImpuesto(codigoImpuesto);
								if (index === firstRow) {
									gastosTotal = `=E${index}`;
									ivaTotal = `=G${index}`;
								} else {
									gastosTotal = `=E${index}+I${index - 1}`;
									ivaTotal = `=G${index}+J${index - 1}`;
								}
								const totalRow = `=G${index}+E${index}`;
								const gastoMasIva = `=I${index}+J${index++}`;
								console.log(
									`${fecha},${uuid},${usoCFDI},${rfcEmisor},${descripcion},${importeBasePrimitive},${tipoImpuesto},${impuestoPrimitive},${totalRow},${gastosTotal},${ivaTotal},${gastoMasIva}`
								);
							}
						} catch (err) {
							//console.log('Error with file::'+parentFolder+file);
							console.error(err);
						}
					}
				} else {
					console.log(error);
				}
			});
		}
	});
});

const getAttribute = (parent, field) => {
	return parent[`cfdi:${field}`] || result[`${field}`];
};

function getAttributeFromObj(obj, name, defaultValue) {
	if (obj === undefined) {
		return defaultValue;
	}
	const translados = obj[0]['cfdi:Traslados'] || obj[0]['Traslados'];
	const translado = translados[0]['cfdi:Traslado'] || translados[0]['Traslado'];
	let value = translado[0]['ATTR'][name];
	return value == undefined ? defaultValue : value;
}
