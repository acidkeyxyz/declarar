const firstRow = 2;
const columnNames = [
	'Fecha',
	'uuid',
	'uso CFDI',
	'RFC',
	'Descripcion',
	'Importe Base',
	'Tipo de Impuesto',
	'Impuestos',
	'Total',
	'IVA Acumulado',
	'Gasto Acumulado',
	'Gasto + IVA acumulado',
];

const convertirCodigoImpuesto = (codigoImpuesto) => {
	let msg = '';
	switch (codigoImpuesto) {
		case '002':
			msg = 'IVA';
			break;
		case '003':
			msg = 'IEPS';
			break;
		default:
			msg = 'OTRO ' + codigoImpuesto;
	}
	return msg;
};

const normalizeDesc = (text) => {
	return text
		.trim()
		.replace(/\s\s+/g, ' ')
		.replace(/[^a-zA-Z0-9_ ]/g, '');
};

function formatMoney(amount, decimalCount = 2, decimal = '.', thousands = ',',currencySymbol ='',) {
	try {
		decimalCount = Math.abs(decimalCount);
		decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
		const negativeSign = amount < 0 ? '-' : '';
		let i = parseInt((amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))).toString();
		let j = i.length > 3 ? i.length % 3 : 0;

		return (
			currencySymbol +
			negativeSign +
			(j ? i.substr(0, j) + thousands : '') +
			i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
			(decimalCount
				? decimal +
				  Math.abs(amount - i)
						.toFixed(decimalCount)
						.slice(2)
				: '')
		);
	} catch (e) {
		console.log(`[formatMoney] Error with ${amount}`);
		return null;
	}
}

module.exports = {
	firstRow,
	columnNames,
	convertirCodigoImpuesto,
	normalizeDesc,
	formatMoney,
};
