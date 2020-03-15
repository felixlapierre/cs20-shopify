const fs = require('fs');

var buffer = "";

var stage = 0;

var index = {};
var success = 0;

function indexEncoding(base64) {
    return base64.substring(50, 60)
    + base64.substring(100, 110)
    + base64.substring(150, 160)
    + base64.substring(500, 510)
    + base64.substring(1000, 1010);
}

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
        const length = data.length;
        if(data.charAt(length - 1) == "\n" && data.charAt(length - 2) == "\n") {
            if(buffer.charAt(0) == "T" || buffer.charAt(0) == "W") {
                console.log(buffer.toString() + " Succeeded " + success + " times.");
                return;
            }
            if(buffer.charAt(0) == 'F') {
                const fs = require('fs');
                fs.writeFile("output.txt", buffer, () => {});
                console.log("I did it!!");
                return;
            }

            try {
                var json = JSON.parse(buffer);
            } catch(e) {
                console.log("Timed out after " + success + " tries");
                process.exit(1);
            }
            buffer = "";
            //console.log("Received message "+ success);
            success++;
            const response = {};
            response.collection_id = json.collection_id;
            response.allowed_products = [];

            json.collection_products.forEach((product) => {
                var id = product.product_id;
                var base64 = product.product_image;
                var indexed64 = indexEncoding(base64);
                if(index[indexed64]) {
                    if(index[indexed64].allowed) {
                        response.allowed_products.push(id)
                    }
                } else {
                    console.log("Cache miss on " + indexed64)
                    index[indexed64] = {allowed: true};
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
            //console.log(message);
            fs.writeFileSync("index.json", JSON.stringify(index));
        }
    }
}

function writeBase64File(id, base64) {
    var filename = "images/" + id.replace(/\//g, '') + ".html";

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

function printImagesThatFailed() {
    previous.forEach((entry) => {
        var id = "No";
        if(entry.allowed) {
            id = "Yes"
        }
        writeBase64File(`${entry.counter} ${id} ${indexEncoding(entry.base64)}`, entry.base64);
    })
}