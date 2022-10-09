const xml2js = require('xml2js');
const fs = require('fs');
const bigDecimal = require('js-big-decimal');
const {exit} = require('process');
const {columnNames, convertirCodigoImpuesto, normalizeDesc} = require('./utils/SatUtils');
const {
	normalizeParentFolder,
	normalizeSkipList,
	getFileName,
	isHiddenFile,
} = require('./utils/FileUtils');
const {userInfo} = require('os');

const getAttribute = (parent, field) => {
	if (!parent) {
		return null;
	}
	return parent[`cfdi:${field}`] || result[`${field}`];
};

const getAttributeFromObj = (obj, name, defaultValue) => {
	if (obj === undefined) {
		return defaultValue;
	}
	const translados = obj[0]['cfdi:Traslados'] || obj[0]['Traslados'];
	const translado = translados[0]['cfdi:Traslado'] || translados[0]['Traslado'];
	let value = translado[0]['ATTR'][name];
	return value == undefined ? defaultValue : value;
};
const printData = (item) => {
	const {
		fecha,
		uuid,
		usoCFDI,
		rfcEmisor,
		descripcion,
		importeBase,
		tipoImpuesto,
		impuestoActual,
		totalRow,
		gastosTotal,
		ivaTotal,
		gastoMasIva,
	} = item;
	debugger;
	const row = [
		fecha,
		uuid,
		usoCFDI,
		rfcEmisor,
		descripcion,
		importeBase,
		tipoImpuesto,
		impuestoActual,
		totalRow,
		gastosTotal,
		ivaTotal,
		gastoMasIva,
	];
	console.log(`"${row.join('","')}"`);
};
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
let gastosTotal = new bigDecimal(0.0);
let ivaTotal = new bigDecimal(0.0);
let gastoMasIva = new bigDecimal(0.0);
fs.readdir(parentFolder, (err, files) => {
	if (err) {
		console.log(err);
	}
	files.forEach((file) => {
		if (!file.endsWith('.xml')) {
			return;
		}
		const currentFile = parentFolder + file;
		let xml_string = fs.readFileSync(currentFile, 'utf-8');
		const uuid = getFileName(currentFile, false);
		if (isHiddenFile(uuid)) {
			return;
		}
		parser.parseString(xml_string, function (error, result) {
			if (error !== null) {
				return;
			}
			const comprobante = getAttribute(result, 'Comprobante');
			let conceptos = getAttribute(comprobante, 'Conceptos');
			const fecha = comprobante['ATTR']['Fecha'];
			const concepto = getAttribute(conceptos[0], 'Concepto');
			const usoCFDI = comprobante['cfdi:Receptor'][0]['ATTR']['UsoCFDI'];
			const rfcEmisor = comprobante['cfdi:Emisor'][0]['ATTR']['Rfc'];
			const datafiltered = concepto.filter(
				(item) => !skipList.includes(normalizeDesc(item['ATTR']['Descripcion']))
			);
			const data2print = datafiltered.map((item) => {
			const descripcion = normalizeDesc(item['ATTR']['Descripcion']);
			const impuestosObj = item['cfdi:Impuestos'] || item['Impuestos'];
			const base = getAttributeFromObj(impuestosObj, 'Base', 0);
			const valorUnitario = item['ATTR']['ValorUnitario'];
			const importeBase = new bigDecimal(base || valorUnitario);
			const impuestoActual = new bigDecimal(getAttributeFromObj(impuestosObj, 'Importe', 0));
			const codigoImpuesto = getAttributeFromObj(impuestosObj, 'Impuesto', '002');
			const tipoImpuesto = convertirCodigoImpuesto(codigoImpuesto);
			gastosTotal = gastosTotal.add(importeBase);
			ivaTotal = ivaTotal.add(impuestoActual);
			const totalRow = importeBase.add(impuestoActual);
			gastoMasIva = gastoMasIva.add(totalRow);
				return {
					fecha,
					uuid,
					usoCFDI,
					rfcEmisor,
					descripcion,
					importeBase: importeBase.getValue(),
					tipoImpuesto,
					impuestoActual: impuestoActual.getValue(),
					totalRow: totalRow.getValue(),
					gastosTotal: gastosTotal.getValue(),
					ivaTotal: ivaTotal.getValue(),
					gastoMasIva: gastoMasIva.getValue(),
				};
			});
			data2print.map(printData);
		});
	});
});
