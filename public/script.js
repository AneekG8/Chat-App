const socket = io();

const send = document.querySelector('button');

send.addEventListener('click',(e)=>{
    e.preventDefault;
})

send.onclick= ()=>{
    let username = document.querySelector('input[name=user]');

    let message = document.querySelector('input[name=message]');

    socket.emit('new-message',{
        name: username.value,
        message: message.value
    })

    socket.on('new-message', data =>{
        const chatbox = document.querySelector('div');
        
        chatbox.innerHTML+='<li>' + `${data.name} : ${data.message}` + '</li>';
    })
}