const socket = io();

// //document.querySelector('body').scrollIntoView(false);

// //query DOM
// const chatbox = document.querySelector('div');



// 

// const send = document.querySelector('button');

// const feedback = document.querySelector('#feedback');

// const users = document.querySelector('#users');


// let currentRoom = document.querySelector('#lounge');




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


// //======socket events======




// //when other client is typing
// socket.on('typing',name=>{
//     //console.log(name);
//     feedback.innerHTML = `<p> <em> <b>${name}</b> is typing... </em> </p>`
// })

// //when a client disconnects
// socket.on('user-left',user=>{
//     const userElement = document.querySelector(`#${user.id}`);
    
//     userElement.remove();
// })


//-------------------------------------------------------

//query DOM

const createRoomInput = document.querySelector("input[name=createRoom]");

const createRoomBtn = document.querySelector('button#createRoom');

const roomList = document.querySelector('#roomList');


//other variables
const username = document.querySelector('#username').value;

let currentRoom = null;



//========================= some event handlers ===========================

//press enter to click createRoomBtn
createRoomInput.addEventListener('keypress',e=>{
    if(e.code === 'Enter')
        createRoomBtn.click();
})

//create a room
createRoomBtn.addEventListener('click',(e)=>{

    e.preventDefault();

    const roomname = createRoomInput.value;

    //tells server about the room creation
    socket.emit('new-room',roomname);

    //requests the server to join that room
    socket.emit('join-room',roomname,username);

    //clear the input box
    createRoomInput.value = "";
    
})




//============================== utility functions =================================
//function to join a room
const joinRoom = (roomName)=>{
    console.log(roomName,'clicked');
    socket.emit('join-room',roomName,username);
}

// function to switch rooms
const switchRoom = (nextRoom)=>{
    currentRoom.classList.add('d-none');
    nextRoom.classList.remove('d-none');
    nextRoom.classList.add('d-block');
    currentRoom = nextRoom;
}

//function to toggle between switchRoom and joinRoom
const toggleRoomAction = (roomName)=>{
    event.preventDefault();

    const inRoom = document.querySelector(`section#room${roomName}`);

    if(!inRoom)
        joinRoom(roomName);
    
    else
        switchRoom(inRoom);
}

//send a message
const sendMessage = (roomname)=>{
    event.preventDefault();

    const messageBox = document.querySelector(`section#room${roomname} input[name=message]`);
    
    //send a message
    socket.emit('new-message',roomname,new User(username,socket.id),messageBox.value);

    //clear chat input
    messageBox.value="";
}

//press Enter to send msg on msgbox
const pressEnterToSend = roomname =>{
    if(event.code === 'Enter')
        document.querySelector(`section#room${roomname} button#send`).click();
}


//leave a room
const leaveRoom = (roomname)=>{

    event.preventDefault();

    //go back to lounge
    document.querySelector('ul#roomList li a#roomlounge').click();

    //remove the room section from DOM
    document.querySelector(`section#room${roomname}`).remove(); 

    socket.emit('user-left',roomname);

}


//============================== socket functionalities ================================

socket.on('connect',()=>{
    socket.emit('join-room','lounge',username);
})

//when this client joins a room
socket.on('join-room-me',(roomname,users) => {

    console.log('in the room',roomname,users);

    const room = new Room(roomname,new Map(users));

    console.log(room);

    //first time when client joins lounge
    if(currentRoom)
        currentRoom.classList.add('d-none');

    document.querySelector('section#rooms').innerHTML += 
    `
        <section id="room${room.name}">
            <h3> ROOM:- ${room.name} <button id="leave" onclick="leaveRoom('${room.name}')">x</button> </h3>
            <ul id="room${room.name}Users"> 
                <b>members: </b>
            </ul>
            <div id="chatbox"></div>
            <input type="text" name="message" placeholder="type here..." onkeypress="pressEnterToSend('${room.name}')" required>
            <button id="send" onclick="sendMessage('${room.name}')">send</button>
        </section>
    `;

    currentRoom = document.querySelector(`section#room${room.name}`);

    const roomUsers = document.querySelector(`#room${room.name}Users`);

    room.users.forEach((user,id) => {
        roomUsers.innerHTML += `<li id="user${user.id}"> ${user.name} </li>`;
    });
}) 

//when other clients join same room
socket.on('join-room',(roomname,user) =>{
    console.log(user.name,' joined',roomname);

    //add user to the list of users in that room
    document.querySelector(`#room${roomname}Users`).innerHTML += `<li id="user${user.id}"> ${user.name} </li>`;

    //annouce the user's arrival in that room
    const chatbox = document.querySelector(`section#room${roomname} div#chatbox`);
    chatbox.innerHTML += `<hr><p> ${user.name} just joined </p> <hr>` ;
    chatbox.scrollIntoView(false);
})

//when any client creates a new room
socket.on('new-room', roomname =>{
    roomList.innerHTML += `<li> <a href="#" class="roomLink" id="room${roomname}" onclick="toggleRoomAction('${roomname}')"> ${roomname} </a> </li>`;
})

//client sends a new message
socket.on('new-message', (roomname,sender,message) =>{

    const chatbox = document.querySelector(`section#room${roomname} div#chatbox`);

    chatbox.innerHTML+='<li>' + `${sender.name} : ${message}` + '</li>';

    chatbox.scrollIntoView(false);

})

//when a client disconnects from the server
socket.on('user-disconnect', (userInRooms,id)=>{
    userInRooms.forEach( roomname => {

        //find the room section
        const roomSection = document.querySelector(`section#room${roomname}`);

        //if this user is in that room
        if(roomSection){

            const user = document.querySelector(`section#room${roomname} ul#room${roomname}Users li#user${id}`);

            user.remove();

            const chatbox = document.querySelector(`section#room${roomname} div#chatbox`);

            chatbox.innerHTML += `<hr><p> ${user.textContent} left </p> <hr>` ;

            chatbox.scrollIntoView(false);
        }
    })
})

//when a user leaves a room
socket.on('user-left', (roomname,id) => {
    const user = document.querySelector(`section#room${roomname} ul#room${roomname}Users li#user${id}`);

    user.remove();

    const chatbox = document.querySelector(`section#room${roomname} div#chatbox`);

    chatbox.innerHTML += `<hr><p> ${user.textContent} left </p> <hr>` ;

    chatbox.scrollIntoView(false);
})