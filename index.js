const express   =   require('express'),
      socket        =   require('socket.io'),

      app       =   express();


//middlewares

app.use(express.static('public'));

app.set('view engine','ejs');


//setting up the server

let port = process.env.PORT || 5000

const server = app.listen(port,()=>{
    console.log('server is running...')
})


//socket set up

const io = socket(server);

io.on('connection',(socket)=>{
    console.log('new user connected...id: ' + socket.id);

    socket.on('new-message', data =>{
        io.sockets.emit('new-message',data);
    })
})

app.get('/',(req,res)=>{
    res.render('index');
})

