const socket = io();

//console.log(socket);

//query DOM
const chatbox = document.querySelector('div');

let username = prompt('please enter ur name!');

let message = document.querySelector('input[name=message]');

const send = document.querySelector('button');

const feedback = document.querySelector('#feedback');

const users = document.querySelector('#users');



send.addEventListener('click',(e)=>{
    e.preventDefault;
})

send.onclick= ()=>{
    //send a message
    socket.emit('new-message',{
        name: username,
        message: message.value
    });

    //clear chat input
    message.value="";

    //clear typing message
    feedback.innerHTML="";
}

message.addEventListener('keydown',()=>{
    socket.emit('typing',username);
})


//events on sockets



//new user

socket.on('connect',()=>{
    //console.log('id: ',socket.id)
    socket.emit('new-user',{name: username,id: socket.id});
})

socket.on('new-user',data=>{
    chatbox.innerHTML += `<hr><p> ${data.name} just joined </p> <hr>` ;
    users.innerHTML += `<li id ="${data.id}"> ${data.name} </li>`;
    chatbox.scrollIntoView(false);
})
//listen for a new message
socket.on('new-message', data =>{

    //console.log(data);

    chatbox.innerHTML+='<li>' + `${data.name} : ${data.message}` + '</li>';

    chatbox.scrollIntoView(false);

})

//when other client is typing
socket.on('typing',name=>{
    console.log(name);
    feedback.innerHTML = `<p> <em> <b>${name}</b> is typing... </em> </p>`
})

//when a client disconnects
socket.on('user-left',user=>{
    const userElement = document.querySelector(`#${user.id}`);
    chatbox.innerHTML += `<hr><p> ${userElement.textContent} left </p> <hr>` ;
    chatbox.scrollIntoView(false);
    userElement.remove();
})