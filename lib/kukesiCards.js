import { init, getImages, canvas, ctx, deck, canvasWidth, canvasHeight, centerX, centerY } from './styluxCardLib.js';

init();
if (cardImages.complete) {
    getImages();
} else {
    cardImages.onload = getImages;
}
function shuffleDeck() {
    console.log('Working');
}
function handleDeck() {
    for (let i = 0; i < deck.length; i++) {
        deck[i].draw();
        deck[i].update();
    }
}
function animate(){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    handleDeck();
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', animate);
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    centerX = canvasWidth / 2;
    centerY = canvasHeight / 2;
});