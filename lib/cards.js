// Card generation using SVG
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createCardSVG(rank, suit) {
    const color = (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
    const suitSymbol = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    }[suit];

    return `
        <svg width="60" height="90" viewBox="0 0 60 90">
            <rect width="60" height="90" fill="white" stroke="black" rx="5"/>
            <text x="5" y="15" font-size="12" fill="${color}">${rank}</text>
            <text x="5" y="30" font-size="20" fill="${color}">${suitSymbol}</text>
            <text x="55" y="85" font-size="12" fill="${color}" text-anchor="end">${rank}</text>
            <text x="55" y="70" font-size="20" fill="${color}" text-anchor="end">${suitSymbol}</text>
        </svg>
    `;
}

function createCardBackSVG() {
    return `
        <svg width="60" height="90" viewBox="0 0 60 90">
            <rect width="60" height="90" fill="#333" stroke="black" rx="5"/>
            <text x="30" y="45" font-size="10" fill="white" text-anchor="middle">Ckrit</text>
        </svg>
    `;
}

function createDeck() {
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ rank, suit, svg: createCardSVG(rank, suit) });
        }
    }
    return deck;
}

export { createCardSVG, createCardBackSVG, createDeck, suits, ranks };