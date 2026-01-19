const io = require('socket.io-client');

const socket = io('http://localhost:5003');

const numbers = ['7828706954', '9407899216'];
const message = "Hello from AI Test - Verification Run";
// Simple 1x1 pixel base64 image for testing
const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

console.log('Connecting to server...');

socket.on('connect', () => {
    console.log('Connected! Sending bulk request...');
    socket.emit('send_bulk', {
        numbers: numbers,
        message: message,
        image: image,
        caption: "AI Test Image"
    });
});

socket.on('log', (data) => {
    console.log(`[SERVER LOG] [${data.type}]: ${data.message}`);
});

socket.on('bulk_complete', (data) => {
    console.log('Bulk send complete!', data);
    process.exit(0);
});

socket.on('disconnect', () => {
    console.log('Disconnected.');
});
