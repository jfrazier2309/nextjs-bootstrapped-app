// Game Utilities - Converted from Kotlin GameUtils.kt
import { Card, HandType } from './gameLogic';

export const SUIT_SPADES = 0;
export const SUIT_HEARTS = 1;
export const SUIT_DIAMONDS = 2;
export const SUIT_CLUBS = 3;

export function initializeDeck(): Card[] {
  const deck: Card[] = [];
  const suits = [SUIT_SPADES, SUIT_HEARTS, SUIT_DIAMONDS, SUIT_CLUBS];
  const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        rank,
        suit,
        imageUrl: getCardImageUrl(rank, suit)
      });
    }
  }
  
  return shuffleDeck(deck);
}

export function getCardImageUrl(rank: number, suit: number): string {
  const suitNames = ['spades', 'hearts', 'diamonds', 'clubs'];
  const rankNames = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
  
  // Using DeckOfCards API for card images
  const suitChar = suitNames[suit][0].toUpperCase();
  const rankName = rankNames[rank];
  
  return `https://deckofcardsapi.com/static/img/${rankName}${suitChar}.png`;
}

export function getCardBackImageUrl(): string {
  return "https://deckofcardsapi.com/static/img/back.png";
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function evaluateHand(cards: Card[]): HandType {
  if (cards.length < 5) return evaluatePartialHand(cards);
  
  const combinations = getCombinations(cards, 5);
  let bestHand = HandType.HIGH_CARD;
  
  for (const combo of combinations) {
    const handType = evaluateFiveCardHand(combo);
    if (handType > bestHand) {
      bestHand = handType;
    }
  }
  
  return bestHand;
}

function evaluatePartialHand(cards: Card[]): HandType {
  const rankCounts = getRankCounts(cards);
  const isFlush = cards.length > 0 && new Set(cards.map(c => c.suit)).size === 1;

  if (Object.values(rankCounts).includes(4)) return HandType.FOUR_OF_A_KIND;
  if (Object.values(rankCounts).includes(3)) return HandType.THREE_OF_A_KIND;
  if (Object.values(rankCounts).filter(count => count === 2).length >= 1) return HandType.PAIR;
  if (isFlush) return HandType.FLUSH;
  return HandType.HIGH_CARD;
}

function evaluateFiveCardHand(cards: Card[]): HandType {
  const ranks = cards.map(c => c.rank);
  const suits = cards.map(c => c.suit);
  const rankCounts = getRankCounts(cards);
  const isFlush = new Set(suits).size === 1;
  const isStraight = checkIfStraight(ranks);

  if (isFlush && isStraight) {
    return ranks.includes(14) && ranks.includes(13) ? HandType.ROYAL_FLUSH : HandType.STRAIGHT_FLUSH;
  }
  if (Object.values(rankCounts).includes(4)) return HandType.FOUR_OF_A_KIND;
  if (Object.values(rankCounts).includes(3) && Object.values(rankCounts).includes(2)) return HandType.FULL_HOUSE;
  if (isFlush) return HandType.FLUSH;
  if (isStraight) return HandType.STRAIGHT;
  if (Object.values(rankCounts).includes(3)) return HandType.THREE_OF_A_KIND;
  if (Object.values(rankCounts).filter(count => count === 2).length === 2) return HandType.TWO_PAIR;
  if (Object.values(rankCounts).includes(2)) return HandType.PAIR;
  return HandType.HIGH_CARD;
}

function getRankCounts(cards: Card[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return counts;
}

export function checkIfStraight(ranks: number[]): boolean {
  const distinctRanks = [...new Set(ranks)].sort((a, b) => a - b);
  if (distinctRanks.length < 5) return false;

  // Check for standard straight
  for (let i = 0; i <= distinctRanks.length - 5; i++) {
    let isConsecutive = true;
    for (let j = 0; j < 4; j++) {
      if (distinctRanks[i + j] + 1 !== distinctRanks[i + j + 1]) {
        isConsecutive = false;
        break;
      }
    }
    if (isConsecutive) return true;
  }

  // Check for Ace-low straight (A, 2, 3, 4, 5)
  return distinctRanks.includes(2) && distinctRanks.includes(3) && 
         distinctRanks.includes(4) && distinctRanks.includes(5) && distinctRanks.includes(14);
}

function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k < 0 || k > arr.length) return [];
  if (k === 0) return [[]];
  if (k === arr.length) return [arr];

  const result: T[][] = [];
  
  function backtrack(start: number, current: T[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}

export function describeHandRank(cards: Card[]): string {
  const handType = evaluateHand(cards);
  return getHandTypeDescription(handType);
}

export function getHandTypeDescription(handType: HandType): string {
  switch (handType) {
    case HandType.ROYAL_FLUSH: return "a Royal Flush";
    case HandType.STRAIGHT_FLUSH: return "a Straight Flush";
    case HandType.FOUR_OF_A_KIND: return "Four of a Kind";
    case HandType.FULL_HOUSE: return "a Full House";
    case HandType.FLUSH: return "a Flush";
    case HandType.STRAIGHT: return "a Straight";
    case HandType.THREE_OF_A_KIND: return "Three of a Kind";
    case HandType.TWO_PAIR: return "Two Pair";
    case HandType.PAIR: return "a Pair";
    case HandType.HIGH_CARD: return "a High Card";
    default: return "an Unknown Hand Type";
  }
}

export function formatCard(card: Card): string {
  const rankStr = card.rank === 11 ? "J" : 
                  card.rank === 12 ? "Q" : 
                  card.rank === 13 ? "K" : 
                  card.rank === 14 ? "A" : 
                  card.rank.toString();
  
  const suitStr = card.suit === SUIT_SPADES ? "♠" :
                  card.suit === SUIT_HEARTS ? "♥" :
                  card.suit === SUIT_DIAMONDS ? "♦" :
                  card.suit === SUIT_CLUBS ? "♣" : "?";
  
  return `${rankStr}${suitStr}`;
}

export function getSuitColor(suit: number): string {
  return suit === SUIT_HEARTS || suit === SUIT_DIAMONDS ? "text-red-600" : "text-black";
}

export function getSuitSymbol(suit: number): string {
  switch (suit) {
    case SUIT_SPADES: return "♠";
    case SUIT_HEARTS: return "♥";
    case SUIT_DIAMONDS: return "♦";
    case SUIT_CLUBS: return "♣";
    default: return "?";
  }
}

export function getRankSymbol(rank: number): string {
  switch (rank) {
    case 11: return "J";
    case 12: return "Q";
    case 13: return "K";
    case 14: return "A";
    default: return rank.toString();
  }
}

// Poker hand strength for comparison
export function getHandStrength(handType: HandType): number {
  return handType;
}

// Get poker odds and probabilities
export function getHandOdds(handType: HandType): string {
  switch (handType) {
    case HandType.ROYAL_FLUSH: return "1 in 649,740";
    case HandType.STRAIGHT_FLUSH: return "1 in 72,193";
    case HandType.FOUR_OF_A_KIND: return "1 in 4,165";
    case HandType.FULL_HOUSE: return "1 in 694";
    case HandType.FLUSH: return "1 in 509";
    case HandType.STRAIGHT: return "1 in 255";
    case HandType.THREE_OF_A_KIND: return "1 in 47";
    case HandType.TWO_PAIR: return "1 in 21";
    case HandType.PAIR: return "1 in 2.4";
    case HandType.HIGH_CARD: return "1 in 2";
    default: return "Unknown";
  }
}

// Calculate pot odds
export function calculatePotOdds(betAmount: number, potSize: number): number {
  return betAmount / (potSize + betAmount);
}

// Get recommended action based on hand strength
export function getRecommendedAction(handType: HandType, potOdds: number): string {
  const strength = getHandStrength(handType);
  
  if (strength >= HandType.THREE_OF_A_KIND) {
    return "Strong hand - consider raising";
  } else if (strength >= HandType.PAIR) {
    return potOdds < 0.3 ? "Decent hand - calling might be safe" : "Consider folding if facing large bets";
  } else {
    return "Weak hand - consider folding unless pot odds are very favorable";
  }
}
