const express   =   require('express'),
      socket        =   require('socket.io'),

      app       =   express();


//middlewares

app.set('view engine','ejs');

app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));



//setting up the server

let port = process.env.PORT || 5000

const server = app.listen(port,()=>{
    console.log('server is running...')
})


//socket set up

const io = socket(server);
//const myio = socket(server);

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

let users = new Map([]);


// myio.on('connection',socket => {
//     console.log("50: ",socket.id,"connected to myio!");
// })


io.on('connection',(socket)=>{

    console.log("56: ",socket.id," connected to io!");
    console.log('sockets:',[...io.sockets.sockets.keys()]);

    let user = null;

    socket.on('new-user', username => {
        users.set(username,socket.id);
        user = new User(username,socket.id);
        //console.log(users);

    })

    //creating a room
    socket.on('new-room', roomname =>{

        if(rooms.has(roomname)){
            socket.emit('new-room-fail',roomname);
            return;
        }

        //new room added for all users
        io.emit('new-room',roomname);

        //update data base
        rooms.set(roomname,new Room(roomname,new Map()));

        //let the creator know about the newly created room
        socket.emit('new-room-success',roomname);

        //console.log('new room created: ',roomname);
        //console.log(rooms);
        //console.log(io.of("/").adapter.rooms);
    })


    //join a room
    socket.on('join-room', (roomname,username) =>{
        // if(rooms[rooms.findIndex(room=>room.name == roomName)].users.includes({name: userName,id: socket.id}))
        //     return;

        //if the user is already in that room do nothing
        if(rooms.get(roomname).users.has(socket.id))
            return;

        const targetRoom = rooms.get(roomname);

        //console.log('105: target: ',targetRoom);
        
        //clients joins the room
        socket.join(roomname);

        //update database
        targetRoom.users.set(socket.id,new User(username,socket.id));

        // console.log('113: updated target: ',targetRoom);

        // console.log('114: from map: ',rooms.get(roomname));

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
        
        if(!user)
            return;

        //console.log(user.name,socket.id,' disconnected');

        users.delete(user.name);

        //console.log('users: ',users);

        //console.log('rooms',[...socket.rooms]);

        const userInRooms = [...socket.rooms];

        userInRooms.splice(0,1);

        //console.log(userInRooms);

        //delete from data base
        userInRooms.forEach( roomname => {
            const room = rooms.get(roomname);

            room.users.delete(socket.id);

            //delete the room if all users leave except for lounge
            if( roomname != 'lounge' && room.users.size === 0)
            {
                //let all the users know that the room is deletd
                io.emit('room-deleted',roomname);

                rooms.delete(roomname);
            }
            
        })

        //send a feedback to other clients
        io.emit('user-disconnect',userInRooms,socket.id);
    })

    //when user leaves a particular room
    socket.on('user-left', roomname => {

        socket.leave(roomname);

        const room = rooms.get(roomname);

        //update database
        room.users.delete(socket.id);

        socket.to(roomname).emit('user-left',roomname,socket.id);

        //delete the room if all users leave except for lounge
        if( roomname != 'lounge' && room.users.size === 0)
        {
            //let all the users know that the room is deletd
            io.emit('room-deleted',roomname);

            rooms.delete(roomname);
        }
    })

    socket.on('user-validity',(username)=>{
        if(users.has(username))
            socket.emit('user-validity',false);
        else
            socket.emit('user-validity',true);
    })

    socket.on('room-validity',(roomname)=>{
        if(rooms.has(roomname))
            socket.emit('room-validity',false);
        else
            socket.emit('room-validity',true);
    })

})

app.get('/',(req,res)=>{
    res.redirect('/login');
})

app.get('/login',(req,res)=>{

    const a = 10;

    res.render('login');
})

app.post('/login',(req,res)=>{
    //console.log(req.body);
    const username = req.body.user.name.replace(/ /g,"");
    res.redirect(`/${username}`);
})

app.get('/:username',(req,res)=>{
    //console.log(req.params);
    //console.log(rooms);

    res.render('index',{username: req.params.username,rooms: rooms});
})

