const socket = io();

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

//-------------------------------------------------------

//query DOM

const createRoomForm = document.querySelector('form#createRoomForm');

const createRoomInput = document.querySelector("input[name=createRoom]");

const createRoomBtn = document.querySelector('button#createRoomBtn');

const createRoomFeedback = document.querySelector('#createRoomFeedback');

const defaultFeedback = document.querySelector('#defaultFeedback');

const roomList = document.querySelector('#roomList');


//other variables
const username = document.querySelector('#username').value;

let currentRoom = null;


//============================== utility functions =================================

//function to show rooms list
const showRoomList = ()=>{
    document.querySelector('#sideRoomsList').style.transform = 'translateX(0)';
}

//function to collapse rooms list
const collapseRoomList = ()=>{
    document.querySelector('#sideRoomsList').style.transform = 'translateX(-150%)';
}

const showRoomUsersList = (roomname)=>{

    document.querySelector(`section#room${roomname} #sideRoomUsersList`).style.transform = 'translateX(0)';
     
}

const collapseRoomUsersList = (roomname)=>{

    document.querySelector(`section#room${roomname} #sideRoomUsersList`).style.transform = 'translateX(150%)';

}

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

//validate input
const valid = input => {

    const regex = /^[A-Za-z0-9 ]+$/;

    if(!regex.test(input))
        return false;

    return true;
}

const stopSubmit = ()=>{
    event.preventDefault();
    event.stopPropagation();
  }

const createRoom = ()=>{
    
    event.preventDefault();

    const roomname = createRoomInput.value.replace(/ /g,'');

    console.log('in create room function');
    //tells server about the room creation
    socket.emit('new-room',roomname);
}

const validate = ()=>{
    let input = createRoomInput.value;

    if(!valid(input)){
        createRoomInput.className = "form-control is-invalid";
        defaultFeedback.classList.add('d-none');
        createRoomFeedback.classList.remove('d-none');
        createRoomFeedback.innerText = "invalid room name";
        createRoomFeedback.style.color = '#dc3545';
        createRoomForm.removeEventListener('submit',createRoom);
        //createRoomForm.addEventListener('submit',stopSubmit);
    }
    else{

        // if(e.code === 'Enter'){
        //     loginForm.submit();
        //     return;
        // }
        input = input.replace(/ /g,'');

        //available users
        socket.emit('room-validity',input);

        socket.on('room-validity',isvalid => {
            
            if(isvalid){
                createRoomInput.className = "form-control is-valid";
                defaultFeedback.classList.add('d-none');
                createRoomFeedback.classList.remove('d-none');
                createRoomFeedback.innerText = "looks good!";
                createRoomFeedback.style.color = '#198754';
                //createRoomForm.removeEventListener('submit',stopSubmit);
                createRoomForm.addEventListener('submit',createRoom);
            }
            else{
                createRoomInput.className = "form-control is-invalid";
                defaultFeedback.classList.add('d-none');
                createRoomFeedback.classList.remove('d-none');
                createRoomFeedback.innerText = "this room name is already taken";
                createRoomFeedback.style.color = '#dc3545';
                createRoomForm.removeEventListener('submit',createRoom);
                //createRoomForm.addEventListener('submit',stopSubmit);
            }

        })
        
    }

}



//========================= some event handlers ===========================

createRoomInput.addEventListener('keyup',validate);
createRoomInput.addEventListener('focus',validate);
createRoomForm.addEventListener('submit',validate);


//create a room
createRoomForm.addEventListener('submit',(e)=>{
    e.preventDefault();
})

createRoomInput.addEventListener('blur', e => {
    
    createRoomInput.className = 'form-control';

    createRoomFeedback.classList.add('d-none');

    defaultFeedback.classList.remove('d-none');

})




//============================== socket functionalities ================================

socket.on('connect',()=>{
    console.log('i am socket: ',socket.id);
    socket.emit('new-user',username);
    socket.emit('join-room','lounge',username);
})

//for this user: when this client joins a room
socket.on('join-room-me',(roomname,users) => {

    console.log('in the room',roomname,users);

    const room = new Room(roomname,new Map(users));

    console.log(room);

    //first time when client joins lounge
    if(currentRoom)
        currentRoom.classList.add('d-none');

    document.querySelector('section#rooms').innerHTML += 
    `
    <section id="room${roomname}" class="vh-100 overflow-hidden" style="position: relative;">
                            
        <div class="row vh-100 m-0">
            <div class="col col-12 vh-100">

                <!-- ROOM HEADER SECTION -->

                <div class="bg-dark p-1 p-sm-3 d-flex justify-content-between align-items-center shadow " style="height: 15%;">
                    <div class="d-flex">
                        <div class=""><button class="btn btn-lg btn-outline-secondary border-0  me-2 d-sm-none" id="roomListBtn" onclick="showRoomList()"><i class="fas fa-bars"></i></button></div>
                        <h3 class="m-0 text-light display-6">${roomname}<button id="leave" class="d-none" onclick="leaveRoom('${roomname}')">x</button> </h3>
                    </div>
                    <div class="d-flex align-items-center px-2 border-start"><buttton class="btn btn-lg border-0 btn-outline-secondary" id="roomUsersListBtn" type="button" onclick="showRoomUsersList('${roomname}')"><i class="fas fa-users"></i></buttton></div>
                </div>

                
                <!-- ROOM CHAT SECTION -->

                <div class="bg-dark h-75 overflow-auto p-4 ">
                    <div id="chatbox" class="p-3 neumorphic">
                        <ul class="list-unstyled">
                            
                        </ul>
                    </div>
                </div>


                <!-- ROOM SEND MESSAGE SECTION -->
                <div class="bg-dark p-2 py-lg-3 text-center d-flex align-items-center shadow" style="height: 10%;">
                    <div class="input-group">
                        <input type="text" class="form-control" name="message" placeholder="type here..." onkeypress="pressEnterToSend('${roomname}')" required aria-label="Recipient's username" aria-describedby="button-addon2">
                        <button class="btn btn-outline-secondary" type="button" id="send" onclick="sendMessage('${roomname}')"> |> </button>
                    </div>
                </div>


                <!-- ROOM USERS LIST SECTION -->
                <div class="col col-8 col-sm-5 col-md-4 col-lg-3 vh-100 bg-dark border-start p-2 vh-100 position-relative" id="sideRoomUsersList">

                    <!-- COLLAPSE USERS LIST BUTTON -->
                    <div class="position-absolute top-0 end-100">
                        <button class="btn btn-lg btn-outline-secondary border bg-dark " id="collapseRoomUsersListBtn" onclick="collapseRoomUsersList('${roomname}')"> X </button>
                    </div>

                    <!-- HEADER FOR USERS LIST -->
                    <div style="height: 15%;" class="text-center p-3 shadow"><i class="fas fa-users text-secondary display-3"></i></div>


                    <!-- USERS LIST -->
                    <div class="overflow-auto " style="height: 85%;">

                        <ul id="room${roomname}Users" class="pt-4 px-2 list-unstyled">

                        </ul>

                    </div>

                </div>

            </div>

        </div>
                                
    </section>
    `;

    currentRoom = document.querySelector(`section#room${room.name}`);

    const roomUsers = document.querySelector(`#room${room.name}Users`);

    room.users.forEach((user,id) => {
        roomUsers.innerHTML += 
        `
        <li class="p-2 text-center mb-4 neumorphic  text-primary" id="user${user.id}">
            ${user.name}
        </li>
        `;
    });
}) 

//for other users of this room: when other clients join same room
socket.on('join-room',(roomname,user) =>{
    console.log(user.name,' joined',roomname);

    //add user to the list of users in that room
    document.querySelector(`#room${roomname}Users`).innerHTML += 
    `
        <li class="p-2 text-center mb-4 neumorphic  text-primary" id="user${user.id}">
            ${user.name}
        </li>
    `;

    //annouce the user's arrival in that room
    const chatbox = document.querySelector(`section#room${roomname} div#chatbox ul`);
    chatbox.innerHTML += `<hr><p class="text-center"> ${user.name} just joined </p> <hr>` ;
    chatbox.parentElement.scrollIntoView(false);
})

//for all users: when any client creates a new room
socket.on('new-room', roomname =>{
    roomList.innerHTML +=
     `
        <li class="p-2 text-center mb-4 neumorphic  text-primary">
            <i class="fas fa-home text-secondary"></i> <a href="#" class="text-break"id="room${roomname}" onclick="toggleRoomAction('${roomname}')">${roomname}</a>    
        </li>
    `;
})

//for this user: if a room with same name already exists
socket.on('new-room-fail',(roomname)=>{
    console.log('this room name is already taken');
})

//for thiis user: if a new room is succesfully created by you
socket.on('new-room-success', roomname => {
    
    //requests the server to join that room
    socket.emit('join-room',roomname,username);

    createRoomInput.value = "";

    //take the input box out of focus
    createRoomInput.blur();
})

//for set of users in that room: client sends a new message
socket.on('new-message', (roomname,sender,message) =>{

    const chatbox = document.querySelector(`section#room${roomname} div#chatbox ul`);

    if(sender.name !== 'you')
        chatbox.innerHTML += 
        `
        <li class="mb-3 d-flex justify-content-start">
            <div class="w-75 d-flex justify-content-start">
                <div class="text-break p-3 neumorphic new-message">
                    <h5 class="text-start text-primary display-8">${sender.name}</h5>
                </div>
            </div>
        </li>
        `;
    else
        chatbox.innerHTML += 
        `
        <li class="mb-3 d-flex justify-content-end">
            <div class="w-75 d-flex justify-content-end">
                <div class="text-break p-3 neumorphic new-message">
                    <h5 class="text-end text-secondary display-8">${sender.name}</h5>
                </div>
            </div>
        </li>
        `;

    const textNode = document.createTextNode(message);
    
    const newMessage = document.querySelector(`section#room${roomname} div#chatbox ul li div div.new-message`);

    newMessage.appendChild(textNode);

    newMessage.classList.remove('new-message');

    chatbox.parentElement.scrollIntoView(false);

})

//for all users and rooms this user was part of: when a client disconnects from the server
socket.on('user-disconnect', (userInRooms,id)=>{
    userInRooms.forEach( roomname => {

        //find the room section
        const roomSection = document.querySelector(`section#room${roomname}`);

        //if this user is in that room
        if(roomSection){

            const user = document.querySelector(`section#room${roomname} ul#room${roomname}Users li#user${id}`);

            user.remove();

            const chatbox = document.querySelector(`section#room${roomname} div#chatbox ul`);

            chatbox.innerHTML += `<hr><p class="text-center"> ${user.textContent} left </p> <hr>` ;

            chatbox.parentElement.scrollIntoView(false);
        }
    })
})

//for set of users of this room: when a user leaves a room
socket.on('user-left', (roomname,id) => {
    const user = document.querySelector(`section#room${roomname} ul#room${roomname}Users li#user${id}`);

    user.remove();

    const chatbox = document.querySelector(`section#room${roomname} div#chatbox ul`);

    chatbox.innerHTML += `<hr><p class="text-center"> ${user.textContent} left </p> <hr>` ;

    chatbox.parentElement.scrollIntoView(false);
})

//for all users: when a room is deleted
socket.on('room-deleted',roomname => {

    //find the room-link from the room list
    const roomLink = document.querySelector(`ul#roomList li a#room${roomname}`);

    console.log(roomLink.parentElement);

    roomLink.parentElement.remove();
})
