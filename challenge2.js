var json = "";

var stage = 0;

const mode = 1;

module.exports = function(data, clientWrite) {
    console.log(data)
    if(stage == 0 && data.indexOf("\n\n") != -1) {
        clientWrite("2");
        stage++;
        return;
    }

    if(stage == 1) {
        const message = getJson(data);
        if(message) {
            const discounts = getDiscounts(message);
            var response;
            if(mode == 1) response = discountEachItemIndividually(discounts, message.lineItems);
            console.log(response);
            clientWrite(response);
        }
    }
}

function discountEachItemIndividually(discounts, lineItems) {
    var total = 0;
    lineItems.forEach((item) => {
        total += getDiscountedPrice(item, discounts);
    })

    return costToString(total);
}

function getDiscounts(data) {
    var discounts = {};

    data.discounts.forEach((discount) => {
        const target = discount.target;
        if(!discounts[target]) {
            discounts[target] = []
        }
        discounts[target].push(discount);
    })

    return discounts;
}

function getDiscountedPrice(item, discounts) {
    var cost = getCostAll(item);
    const discountList = discounts[item.category];

    if(discountList) {
        var bestPrice = cost;
        discountList.forEach((discount) => {
            var newPrice;
            if(discount.type == "%") {
                newPrice = applyPercentDiscount(item, discount.amount);
                newPrice = newPrice * item.quantity;
            } else if(discount.type == 'BOGO') {
                newPrice = applyBogoDiscount(item)
            } else if(discount.type == '$') {
                newPrice = applyDollarDiscount(item, discount.amount);
            }
            if(newPrice < bestPrice) {
                bestPrice = newPrice;
            }
        })
        cost = bestPrice;
    }
    return cost;
}

function applyPercentDiscount(item, amount) {
    price = getCostSingle(item);
    const amountNum = Number.parseInt(amount.substring(0, amount.length - 1));
    price = roundTwoDecimals(price * (100 - amountNum) / 100.0);
    return price;
}

function applyBogoDiscount(item) {
    var price = getCostSingle(item);
    var amount = item.quantity / 2;
    if(item.quantity % 2 == 1) {
        amount += 1;
    }
    return price * amount;
}

function applyDollarDiscount(item, amount) {
    var price = getCostSingle(item);
    price -= Number.parseFloat(amount.substring(1));
    if(price < 0) {
        price = 0;
    }
    return price * item.quantity;
}

function getCostSingle(item) {
    return Number.parseFloat(item.price.substring(1));
}

function getCostAll(item) {
    return item.quantity * roundTwoDecimals(Number.parseFloat(item.price.substring(1)));
}

function getJson(data) {
    json += data.toString();
    if(data.indexOf("\n\n") != -1) {
        if(json.charAt(0) == "T" || json.charAt(0) == "W") {
            console.log("I failed :(");
        }
        else if(json.charAt(0) == 'F') {
            const fs = require('fs');
            fs.writeFile("output.txt", json, () => {});
            console.log("I did it!!");
        } else {
            const object = JSON.parse(json);
            json = "";
            return object;
        }
    }
}

function costToString(cost) {
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

function roundTwoDecimals(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100
}