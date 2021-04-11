const socket = io();
  
const loginForm = document.querySelector('form#login');

const usernameInput = document.querySelector('form#login input#username');

const feedback = document.querySelector('form#login div#feedback');



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

const validate = ()=>{
  let input = usernameInput.value;

  if(!valid(input)){
    usernameInput.className = "form-control is-invalid";
    feedback.innerText = "invalid username";
    feedback.className = "invalid-feedback";
    loginForm.addEventListener('submit',stopSubmit)
  }
  else{

    // if(e.code === 'Enter'){
    //     loginForm.submit();
    //     return;
    // }
    input = input.replace(/ /g,'');

    //available users
    socket.emit('user-validity',input);

    socket.on('user-validity',isvalid => {
      
      if(isvalid){
        usernameInput.className = "form-control is-valid"
        feedback.innerText = "looks good!";
        feedback.className = "valid-feedback";
        loginForm.removeEventListener('submit',stopSubmit);
      }
      else{
        usernameInput.className = "form-control is-invalid";
        feedback.innerText = "this username is already taken";
        feedback.className = "invalid-feedback";

        loginForm.addEventListener('submit',stopSubmit);
      }

    })
    
  }

}

usernameInput.addEventListener('keyup',validate);
usernameInput.addEventListener('focus',validate);
// loginForm.addEventListener('submit',(e)=>{
//   if(!usernameInput)
//     e.preventDefault();
// });
