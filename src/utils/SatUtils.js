
const firstRow = 2;
const columnNames = ['Fecha','uuid', 'uso CFDI', 'RFC', 'Descripcion', 'Precio', 'Tipo de Impuesto', 'Impuesto', 'Total', 'IVA Acumulado', 'Gasto Acumulado', 'Gasto + IVA acumulado'];

const  getCodigoImpuesto =(codigoImpuesto)=>{
	let msg = '';
	switch(codigoImpuesto){
			case "002":
					msg = "IVA";break;
			case "003":
					msg = "IEPS";break;
			default:
					msg = "OTRO "+codigoImpuesto;
	}
	return msg;
};

 const normalizeDesc = (text)=>{
	return text.trim().replace(/\s\s+/g,' ').replace(/[^a-zA-Z0-9_ ]/g,'');
};

module.exports = {
	firstRow,columnNames,getCodigoImpuesto,normalizeDesc
}