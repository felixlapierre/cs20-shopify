const fs = require('fs');

var buffer = "";

var stage = 0;

var index = {};

module.exports = function(data, clientWrite) {
    //console.log(data)
    if(stage == 0 && data.indexOf("\n\n") != -1) {
        clientWrite("3");
        index = JSON.parse(fs.readFileSync("index.json").toString("utf-8"));
        stage++;
        return;
    }

    if(stage == 1) {
        buffer += data.toString();
        if(data.indexOf("\n\n") != -1) {
            if(buffer.charAt(0) == "T" || buffer.charAt(0) == "W") {
                console.log(buffer.toString());
                return;
            }
            if(buffer.charAt(0) == 'F') {
                const fs = require('fs');
                fs.writeFile("output.txt", buffer, () => {});
                console.log("I did it!!");
                return;
            }
            var json = JSON.parse(buffer);
            buffer = "";
            console.log("Received message");
            const response = {};
            response.collection_id = json.collection_id;
            response.allowed_products = [];

            json.collection_products.forEach((product) => {
                var id = product.product_id;
                var base64 = product.product_image;
                var indexed64 = base64.substring(50, 80);
                if(index[indexed64]) {
                    if(index[indexed64].allowed) {
                        response.allowed_products.push(id)
                        console.log("allowing " + indexed64);
                    } else {
                        console.log("disallowing " + indexed64);
                    }
                    writeBase64File(base64.substring(50, 110), base64)
                } else {
                    console.log("Cache miss on " + indexed64)
                    index[indexed64] = {allowed: false};
                    writeBase64File(indexed64, base64)
                    response.allowed_products.push(id);
                }
            })
            var products = ` "${response.allowed_products.join('", "')}" `
            if(products.length == 4) {
                products = "";
            }
            const message = `{ "collection_id": "${response.collection_id}", "allowed_products": [${products}] }\n\n`;
            clientWrite(message);
            console.log(message);
            fs.writeFileSync("index.json", JSON.stringify(index));
        }
    }
}

function writeBase64File(id, base64) {
    var filename = "images/" + id.replace('/', '') + ".html";

    const fileData = `<!DOCTYPE html>
    <html>
      <head>
        <title>Display Image</title>
      </head>
      <body>
        <img style='display:block; width:100px;height:100px;' id='base64image' src='data:image/jpeg;base64, ${base64}'/>
      </body>
    </html>`
    fs.writeFileSync(filename, fileData);
}