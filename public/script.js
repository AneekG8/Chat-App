const socket = io();

socket.on('connect',()=>{
    console.log('connected to server',socket.id);
})

const send = document.querySelector('button');

send.addEventListener('click',(e)=>{
    e.preventDefault;
})

send.onclick= ()=>{
    let username = document.querySelector('input[name=user]');

    let message = document.querySelector('input[name=message]');


    //send a message
    socket.emit('new-message',{
        name: username.value,
        message: message.value
    });

    //clear chat input
    message.value="";
}

//listen for a new message
socket.on('new-message', data =>{
    console.log(data);

    const chatbox = document.querySelector('div');
    
    chatbox.innerHTML+='<li>' + `${data.name} : ${data.message}` + '</li>';
})