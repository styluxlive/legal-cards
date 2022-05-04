//Importing All The Card Positions From The JSON File
import { cardSprite } from './cardsJSON.js';
//Cards Suits And Rank To Be Polpulated Into The Deck Array
const suits = ['club', 'diamond', 'spade', 'heart'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
//Card Source Width And Height Including Card Width And Height
let sourceWidth = 169, sourceHeight = 245, cardWidth = 76, cardHeight = 96;
//An Array To Store All The Card Data To Recieved From Cards JSON File
let cardSpriteArray;
//Canvas And Context Variable To Be Set By The Init Function
let canvas, ctx;
let cardImages, canvasWidth, canvasHeight;
//Center Position Of The Current Set Canvas
let centerX, centerY;
//An Array To Be Populated By The Cards Including Images
let deck;
//Temporaly Layout Adjustor
let tempLayout;
//Class To House All The Game Effects
class Effect {
    constructor(x, y, width, height){ //Position For The Effect To Start
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    update(){
        console.log('Update TODO');
    }
    draw(){
        console.log('Draw TODO');
    }
}
//Class To House All The Games Sounds
class Sound {
    constructor(soundType, soundFile, soundLoop){ //Sound Type, File, Loop Properties Comming From handleSound Function
        this.soundType = soundType;
        this.sound = new Audio();
        this.sound.src= soundFile;
        this.soundLoop = soundLoop;
    }
    playSound(){
        this.sound.play();
    }
}
//Class To House All The Cards Prototype
class Card {
    constructor(sourceX, sourceY, x, y, cardRank, value, cardSuit) {
        this.sourceX = sourceX;
        this.sourceY = sourceY;
        this.sourceWidth = sourceWidth;
        this.sourceHeight = sourceHeight;
        this.x = x;
        this.y = y;
        this.width = cardWidth;
        this.height = cardHeight;
        this.cardRank = cardRank;
        this.value = value;
        this.cardSuit = cardSuit;
        if (this.cardSuit === 'spade' || this.cardSuit === 'club') {
            this.cardColor= 'black';
        } else {
            this.cardColor= 'red';
        }
    }
    update(){
        tempLayout+=0.9;

        if (this.x >= canvasWidth) this.x--;
        if (this.x <= 0) this.x++;
        this.y += 0.2;
    }
    draw(){
        ctx.drawImage(cardImages, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.x, this.y, this.width, this.height);
    }
}
//Function The Initializes The Whole Global Game Variables
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    cardImages = document.getElementById('cardImages');
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;
    centerX = canvasWidth / 2;
    centerY = canvasHeight / 2;
    cardSpriteArray = [];
    tempLayout = 0;
    deck = [];
}
//Function To Retrieve All The Card Images From The JSON File
function getImages() {
    const cardFrames = cardSprite.frames;
    for (var s = 0; s < suits.length; s++) {
        let value = 0;
        let name;
        for (var r = 0; r < ranks.length; r++) {
            value++;
            if (value === 11 || value === 12 || value === 13) {
                name = ranks[r]+'_'+suits[s]+'.png';
            } else {
                name = value+'_'+suits[s]+'.png';
            }
            cardFrames.forEach((frame) => {
                let card = {};
                if (frame.filename === name) {
                    card.cardName = name;
                    card.cardSourceX = frame.frame.x;
                    card.cardSourceY = frame.frame.y;
                    deck.push(new Card(frame.frame.x, frame.frame.y, centerX, centerY, ranks[r], value, suits[s]));
                }
            });
        }
    }
}
//An Export Of All Relevant Functions And Or Variables To Used By Other JavaScript Files
export { init, getImages, canvas, ctx, canvasWidth, canvasHeight, deck };
