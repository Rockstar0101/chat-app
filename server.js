const express = require('express')
const webpush = require('web-push')
const morgan = require('morgan')
const path = require('path')
const WebSocket = require('ws')
const dtm = require('dom-to-image');

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 1111
const WSPORT = process.env.WSPORT || 2222
const MODE = process.env.NODE_ENV || 'developement'
const publicVapidkey = process.env.PUBLIC_VAPID_KEY
const privateVapidkey = process.env.PRIVATE_VAPID_KEY

webpush.setVapidDetails('mailto:govindsaini0101@gmail.com', publicVapidkey, privateVapidkey)

// app.use(morgan('tiny'))

// app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, "public")))
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('index.html')
})

// Handle WebSockets
// const wss = new WebSocket.Server({
//     port: PORT,
//     perMessageDeflate: {
//         zlibDeflateOptions: {
//             chunkSize: 1024,
//             memLevel: 7,
//             level: 3
//         }
//     },
//     zlibInflateOptions: {
//         chunkSize: 10 * 1024
//     },

//     // Other options settable:
//     clientNoContextTakeover: true, // Defaults to negotiated value.
//     serverNoContextTakeover: true, // Defaults to negotiated value.
//     serverMaxWindowBits: 10, // Defaults to negotiated value.
//     // Below options specified as default values.

//     concurrencyLimit: 10, // Limits zlib concurrency for perf.
//     threshold: 1024 // Size (in bytes) below which messages
//     // should not be compressed.
// })

const wss = new WebSocket.Server({ port: WSPORT });

wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify({user:"System",msg:"'Hello User! Live chat is ON 🎉!!"}));
  id = Math.random()

  ws.on('message', function incoming(message) {
    console.log('received: %s', message)
    broadcast(message);      
  });

});

// Every three seconds broadcast "{ message: 'Hello hello!' }" to all connected clients
var broadcast = function(msg) {
  // wss.clients is an array of all connected clients
  wss.clients.forEach(function each(client) {
    client.send(msg);
    console.log('Sent: ' + msg);
  });
}

// setInterval(broadcast, 3000);

//Subscribe Route
app.post('/subscribe', (req, res) => {
  //Get Push Subscription Object
  const { subscription } = req.body;

  // Resource created alert
  res.status(201).json({})

  // Create Payload
  const payload = JSON.stringify({ title: 'ChatApp'})

  // Pass Object into sendNotification
  webpush.sendNotification(subscription, payload).catch(error => {
    console.error(error)
  })
})

app.get('/offline', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/offline.html'))
})
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/404.html'))
})

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT} on ${MODE} mode`))