const express = require('express');
const app = express();
const cors = require('cors')
app.use(cors())
app.use(express.json())

let array = [
    {name: 'Uriel', id: 0},
    {name: 'Joan', id: 1},
    {name: 'Laura', id: 2},
    {name: 'Rocio', id: 3},
    {name: 'Martin', id: 4},
    {name: 'Ramiro', id: 5}
]

// let whiteList = ['http://127.0.0.1:5500', 'localhost:3000']
// let corsOptions = {
//     origin: function(origin, callback) {
//         if (whiteList.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//             console.log(whiteList.indexOf(origin))
//         }
//     }
// }

// app.get('/api', cors(corsOptions), (req, res) => {
//     console.log(req)
//     res.send(array)
// })

app.get('/api', (req, res) => {
    console.log(req.params)
    res.send(array)
})
app.get('/api/:id', (req,res) => {
    let personRequested = array.find(item => item.id === parseInt(req.params.id))
    console.log(personRequested);
    res.send(personRequested);

})
app.delete('/api/:id', (req, res) => {
    let personRequested = array.find(item => item.id === parseInt(req.params.id));
    // console.log(personRequested);
    let index = array.indexOf(personRequested)
    console.log(index);
    if(index !== -1) {
        array.splice(index, 1);
    }
    console.log(array)
    res.send(array)
})

// app.post('/api', (req, res) => {
//     console.log(req.body);
//     let element = req.body;
//     array.push(element);
//     res.send(array);
// })

app.listen(3000);