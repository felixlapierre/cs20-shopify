var json = "";

var stage = 0;

module.exports = function(data, clientWrite) {
    console.log(data)
    if(stage == 0 && data.indexOf("\n\n") != -1) {
        clientWrite("1");
        stage++;
        return;
    }

    if(stage == 1) {
        json += data.toString();
        if(data.indexOf("\n\n") != -1) {
            if(json.charAt(0) == "T" || json.charAt(0) == "W") {
                console.log("I failed :(");
                return;
            }
            if(json.charAt(0) == 'F') {
                const fs = require('fs');
                fs.writeFile("output.txt", json, () => {});
                console.log("I did it!!");
                return;
            }
            json = JSON.parse(json);
            var cost = getTotalCart(json)
            var output = costToString(cost);
            console.log(output);
            clientWrite(output)
            json = "";
        }
    }
}

function getTotalCart(cart) {
    var total = 0.0;

    cart.forEach((item) => {
        total += item.quantity * Number.parseFloat(item.price.substring(1));
    })

    return total;
}


function costToString(cost) {
    //console.log(cost);
    cost = Math.round((cost + Number.EPSILON) * 100) / 100
    cost.toFixed(2);
    var output = `$${cost}`;

    if(output.indexOf(".") == -1) {
        output += ".00";
    }
    else if(output.indexOf(".") == output.length - 2) {
        output += "0";
    }
    
    return output;
}