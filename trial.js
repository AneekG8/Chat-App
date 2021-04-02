function Room(name,users){
    this.name = name,
    this.users = users
}

const rooms = new Map([['l',new Room('l',new Map())]]);


console.log(rooms.get('l').users.size);