const https = require('https');
const querystring = require('querystring');
const uuid = require('uuid');

class PagoController {
    async  guardar(req, res) {
        const path = '/v1/checkouts';
        console.log(req.body);
        const data = querystring.stringify({
            'entityId': '8a8294175d602369015d73bf009f1808',
            'amount': req.body.amount,
            'currency': 'USD',
            'paymentType': 'DB'
        });
        
        const entityId = '8a8294175d602369015d73bf009f1808';  // Definir entityId
        
        const options = {
            port: 443,
            host: 'eu-test.oppwa.com',
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length,
                'Authorization': 'Bearer OGE4Mjk0MTc1ZDYwMjM2OTAxNWQ3M2JmMDBlNTE4MGN8ZE1xNU1hVEQ1cg=='
            }
        };
        
        return new Promise((resolve, reject) => {
            const postRequest = https.request(options, function (response) {
                const buf = [];
                response.on('data', chunk => {
                    buf.push(Buffer.from(chunk));
                });
                response.on('end', () => {
                    const jsonString = Buffer.concat(buf).toString('utf8');
                    try {
                        const result = JSON.parse(jsonString);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            
            postRequest.on('error', reject);
            postRequest.write(data);
            postRequest.end();
        }).then(result => {
            // Cuando se resuelve la promesa, enviamos una respuesta JSON al cliente
            res.json({
                msg: "checkout creado correctamente",
                code: 200,
                info: {
                    entityId: entityId,  // Usar la variable entityId
                    result
                }
            });
        }).catch(error => {
            // En caso de error, también enviamos una respuesta JSON con el mensaje de error
            res.status(500).json({
                msg: "Error al crear el checkout",
                code: 500,
                error: error.message
            });
        });
    }
    
    async obtener(req, res) {
        
        var path = `/v1/checkouts/${req.params.checkoutId}/payment?entityId=8a8294175d602369015d73bf009f1808`;
        const options = {
            port: 443,
            host: 'eu-test.oppwa.com',
            path: path,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer OGE4Mjk0MTc1ZDYwMjM2OTAxNWQ3M2JmMDBlNTE4MGN8ZE1xNU1hVEQ1cg=='
            }
        };
        return new Promise((resolve, reject) => {
            const postRequest = https.request(options, function (res) {
                const buf = [];
                res.on('data', chunk => {
                    buf.push(Buffer.from(chunk));
                });
                res.on('end', () => {
                    const jsonString = Buffer.concat(buf).toString('utf8');
                    try {
                        const result = JSON.parse(jsonString);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            postRequest.on('error', reject);
            postRequest.end();
        }).then(result => {
            res.json({
                msg: "checkout obtenido",
                code: 200,
                info: result
            });
        }).catch(error => {

            res.status(500).json({
                msg: "Error al crear el checkout",
                code: 500,
                error: error.message
            });
        });;
    }
}

module.exports = PagoController;
