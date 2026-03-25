// PRNG for deterministic randomness
class Mulberry32 {
    constructor(seed) {
        this.state = seed;
    }

    next() {
        this.state = (this.state + 0x6D2B79F5) | 0;
        let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    nextInt(min, max) {
        return Math.floor(this.next() * (max - min)) + min;
    }

    choice(array) {
        return array[this.nextInt(0, array.length)];
    }
}

// Advanced Deck class
class Deck {
    constructor(seed) {
        this.prng = new Mulberry32(seed);
        this.cards = this.createStandardDeck();
        this.shuffle();
    }

    createStandardDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push(rank + '_' + suit);
            }
        }
        return deck;
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = this.prng.nextInt(0, i + 1);
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        return this.cards.pop();
    }

    smallTop() {
        const count = this.prng.choice([3, 5, 7]);
        const quarter = Math.max(1, Math.floor(this.cards.length / 4));
        const take = Math.min(count, quarter);
        const taken = this.cards.splice(0, take);
        this.cards.push(...taken);
        return taken;
    }

    smallBottom() {
        const count = this.prng.choice([3, 5, 7]);
        const quarter = Math.max(1, Math.floor(this.cards.length / 4));
        const take = Math.min(count, quarter);
        const start = this.cards.length - take;
        const taken = this.cards.splice(start, take);
        this.cards.unshift(...taken);
        return taken;
    }

    smallCenter() {
        const count = this.prng.choice([3, 5, 7]);
        const center = Math.floor(this.cards.length / 2);
        const quarter = Math.max(1, Math.floor(this.cards.length / 4));
        const start = Math.max(0, center - Math.floor(quarter / 2));
        const taken = this.cards.splice(start, count);
        this.cards.unshift(...taken);
        return taken;
    }

    get length() {
        return this.cards.length;
    }
}

export { Deck, Mulberry32 };