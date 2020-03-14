var json = "";

var stage = 0;

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
            var total = 0;
            message.lineItems.forEach((item) => {
                total += getDiscountedPrice(item, discounts);
            })

            const response = costToString(total);
            console.log(response);
            clientWrite(response);
        }
    }
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
    var cost = getCostSingle(item);
    const discountList = discounts[item.category];

    if(discountList) {
        var bestPrice = cost;
        discountList.forEach((discount) => {
            if(discount.type == "%") {
                const newPrice = applyPercentDiscount(cost, discount.amount);
                if(newPrice < bestPrice) {
                    bestPrice = newPrice;
                }
            } else {
                throw "Unknown discount type";
            }
        })
        cost = bestPrice;
    }
    return cost * item.quantity;
}

function applyPercentDiscount(price, amount) {
    const amountNum = Number.parseInt(amount.substring(0, amount.length - 1));
    price = roundTwoDecimals(price * (100 - amountNum) / 100.0);
    return price;
}

function applyBogoDiscount(price, amount) {

}

function applyDollarDiscount(price, amount) {

}

function getCostSingle(item) {
    return Number.parseFloat(item.price.substring(1));
}

function getCostAll(item) {
    return item.quantity * Number.parseFloat(item.price.substring(1));
}

function getJson(data) {
    json += data.toString();
    if(data.indexOf("\n\n") != -1) {
        if(json.charAt(0) == "T" || json.charAt(0) == "W") {
            console.log("I failed :(");
        }
        else if(json.charAt(0) == 'F') {
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