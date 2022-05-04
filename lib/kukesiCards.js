import { init, getImages, canvas, ctx, deck, canvasWidth, canvasHeight } from './styluxCardLib.js';

init();
getImages();
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
});