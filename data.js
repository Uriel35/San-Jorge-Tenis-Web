// // Constructor de jugadores
class Jugador {
    constructor(namee, surname, email, password, ranking = 1000, streak = 0) { // Acordate de sacar el ranking y streak como parámetros.
        this._namee = namee;
        this._surname = surname;
        this._completeName = surname + ' ' + namee;
        this._email = email;
        this._password = password;
        this._ranking = ranking;
        this._win = 100;
        this._loses = 100;
        this._games = this._win + this._loses;
        this._streak = streak;
        this._photo = '/Fotos/Icono jugador.jpg';
    }
}

//Array de objetos
let playerArray = [
    new Jugador('Joan Santos', 'Espada', 'joanespada@hotmail.com', '123', 2450, 2),
    new Jugador('Uriel Marcelo Santos', 'Espada', 'urielespada@hotmail.com', '123', 900),
    new Jugador('Ramiro', 'Espada', 'ramiroespada@hotmail.com', '123', 1500),
    new Jugador('Pedro', 'Espada', 'pedroespada@hotmail.com', '123', 1235),
    new Jugador('Jazmin', 'Espada', 'jazminespada@hotmail.com', '123', 1023),
    new Jugador('Sofía', 'Espada', 'sofiaespada@hotmail.com', '123', 954),
    new Jugador('Pablo', 'Espada', 'pabloespada@hotmail.com', '123', 700, 7)
]

console.log(playerArray);

export {playerArray, Jugador};