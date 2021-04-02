const express   =   require('express'),
      socket        =   require('socket.io'),

      app       =   express();


//middlewares

app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));

app.set('view engine','ejs');


//setting up the server

let port = process.env.PORT || 5000

const server = app.listen(port,()=>{
    console.log('server is running...')
})


//socket set up

const io = socket(server);

//constructor function for user object
function User(name,id){
    this.name = name;
    this.id = id;
}
//constructor function for room object
function Room(name,users){
    this.name = name;
    this.users = users;

}

let rooms = new Map([
    ['lounge',new Room('lounge',new Map([]))]
])

io.on('connection',(socket)=>{

    // //when a new user connects to the server
    // socket.on('new-user', (roomName,user) =>{
    //     socket.join(roomName);
    //     io.to(roomName).emit('new-user',roomname,user);
    //     rooms.get(roomName).users.set(user.id,new User(user.name,user.id));
    //     console.log(rooms.get(roomName));
    // })

    

    
    // //when a client is typing
    // socket.on('typing',data=>{
    //     console.log('a user is typing')
    //     socket.broadcast.emit('typing',data);
    // })

    //creating a room
    socket.on('new-room', roomname =>{

        //new room added for all users
        io.emit('new-room',roomname);

        //update data base
        rooms.set(roomname,new Room(roomname,new Map()));

        console.log('new room created: ',roomname);
        console.log(rooms);
        //console.log(io.of("/").adapter.rooms);
    })


    //join a room
    socket.on('join-room', (roomname,username) =>{
        // if(rooms[rooms.findIndex(room=>room.name == roomName)].users.includes({name: userName,id: socket.id}))
        //     return;
        const targetRoom = rooms.get(roomname);

        console.log('105: target: ',targetRoom);
        
        //clients joins the room
        socket.join(roomname);

        //update database
        targetRoom.users.set(socket.id,new User(username,socket.id));

        console.log('113: updated target: ',targetRoom);

        console.log('114: from map: ',rooms.get(roomname));

        //for other clients
        socket.to(roomname).emit('join-room',roomname,new User(username,socket.id));

        //for this client's acknowledgement
        io.to(socket.id).emit('join-room-me',roomname,[...targetRoom.users.entries()]);

        //console.log(targetRoom);
        
    })

    //listen for a message from client
    socket.on('new-message', (roomname,user,message) =>{
        socket.to(roomname).emit('new-message',roomname,user,message);
        socket.emit('new-message',roomname,new User('you',socket.id),message);
    })

    //on disconnection
    socket.on('disconnecting',()=>{
        
        console.log(socket.id,' disconnected');

        console.log('rooms',[...socket.rooms]);

        const userInRooms = [...socket.rooms];

        userInRooms.splice(0,1);

        console.log(userInRooms);

        //delete from data base
        userInRooms.forEach( roomname => {
            const room = rooms.get(roomname);

            room.users.delete(socket.id);

            //delete the room if all users leave
            // if(room.users.size() === 0)
            //     rooms.delete(roomname);
            
        })

        //send a feedback to other clients
        io.emit('user-disconnect',userInRooms,socket.id);
    })

    //when user leaves a particular room
    socket.on('user-left', roomname => {

        socket.leave(roomname);

        //update database
        rooms.get(roomname).users.delete(socket.id);

        socket.to(roomname).emit('user-left',roomname,socket.id);
    })

})

app.get('/',(req,res)=>{
    res.redirect('/login');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login',(req,res)=>{
    //console.log(req.body);
    res.redirect(`/${req.body.user.name}`);
})

app.get('/:username',(req,res)=>{
    //console.log(req.params);
    console.log(rooms);

    res.render('index',{username: req.params.username,rooms: rooms});
})

