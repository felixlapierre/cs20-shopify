var net = require('net');
var challenge1 = require('./challenge1')
var challenge2 = require('./challenge2')

var client = new net.Socket()

client.connect({
    host: "159.65.217.141",
    port:3000
})

client.setEncoding('utf8');

client.on('connect', () => {
    console.log("Connected to server");
})

client.on('data', (data) => {
    challenge2(data, (output) => {
        client.write(output);
    });
})