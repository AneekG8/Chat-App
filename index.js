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

const users=[];
io.on('connection',(socket)=>{
    console.log('new user connected...id: ' + socket.id);

    //on disconnection
    socket.on('disconnect',()=>{
        
        //delete from data base
        users.splice(users.findIndex(user=> user.id===socket.id),1);

        //send a feedback to other clients
        io.emit('user-left',{id: socket.id})
    })

    //listen for an announcement from client
    socket.on('new-user', data =>{
        io.emit('new-user',data);
        users.push({name: data.name,id: data.id});
        console.log(users);
    })


    //listen for a message from client
    socket.on('new-message', data =>{
        socket.broadcast.emit('new-message',data);
        socket.emit('new-message',{
            name: "you",
            message: data.message
        })
    })

    //when a client is typing
    socket.on('typing',data=>{
        console.log('a user is typing')
        socket.broadcast.emit('typing',data);
    })
})

app.get('/',(req,res)=>{
    res.render('index',{users: users});
})

