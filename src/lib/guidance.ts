// Guidance System - Converted from Kotlin GuidanceShared.kt
import { Card, HandType, Stage } from './gameLogic';
import { evaluateHand, getHandTypeDescription, getRecommendedAction, calculatePotOdds } from './gameUtils';

export interface GuidanceInfo {
  stage: string;
  playerHand: string;
  botHand: string;
  advice: string;
  handStrength: string;
  potOdds?: string;
}

export class GuidanceManager {
  static updateGuidanceEnhanced(
    playerHand: Card[],
    botHand: Card[],
    tableCards: Card[],
    stage: Stage,
    showBotCards: boolean,
    pot: number = 0,
    currentBet: number = 0
  ): GuidanceInfo {
    const visibleTable = tableCards.filter(card => card !== null);
    const playerEval = evaluateHand([...playerHand, ...visibleTable]);
    const playerDesc = getHandTypeDescription(playerEval);

    const botDesc = showBotCards 
      ? `${getHandTypeDescription(evaluateHand([...botHand, ...visibleTable]))} (Strength: ${evaluateHand([...botHand, ...visibleTable])})`
      : "(Hidden Hand)";

    const stageMsg = this.getStageDescription(stage);
    
    // Calculate pot odds if there's a bet
    const potOddsValue = currentBet > 0 ? calculatePotOdds(currentBet, pot) : 0;
    const potOddsStr = potOddsValue > 0 ? `${(potOddsValue * 100).toFixed(1)}%` : undefined;

    const advice = this.getAdvice(playerEval, stage, potOddsValue, playerHand, visibleTable);

    return {
      stage: stageMsg,
      playerHand: playerDesc,
      botHand: botDesc,
      advice,
      handStrength: this.getHandStrengthDescription(playerEval),
      potOdds: potOddsStr
    };
  }

  private static getStageDescription(stage: Stage): string {
    switch (stage) {
      case Stage.PRE_FLOP: return "Pre-Flop";
      case Stage.FLOP: return "Flop";
      case Stage.TURN: return "Turn";
      case Stage.RIVER: return "River";
      case Stage.SHOWDOWN: return "Showdown";
      case Stage.HAND_OVER: return "Hand Complete";
      default: return "Unknown";
    }
  }

  private static getHandStrengthDescription(handType: HandType): string {
    if (handType >= HandType.STRAIGHT) return "Very Strong";
    if (handType >= HandType.THREE_OF_A_KIND) return "Strong";
    if (handType >= HandType.TWO_PAIR) return "Good";
    if (handType >= HandType.PAIR) return "Decent";
    return "Weak";
  }

  private static getAdvice(
    playerEval: HandType, 
    stage: Stage, 
    potOdds: number,
    playerHand: Card[],
    tableCards: Card[]
  ): string {
    const baseAdvice = getRecommendedAction(playerEval, potOdds);
    const stageSpecificAdvice = this.getStageSpecificAdvice(stage, playerHand, tableCards, playerEval);
    
    return `${baseAdvice}. ${stageSpecificAdvice}`;
  }

  private static getStageSpecificAdvice(
    stage: Stage,
    playerHand: Card[],
    tableCards: Card[],
    currentHand: HandType
  ): string {
    switch (stage) {
      case Stage.PRE_FLOP:
        return this.getPreFlopAdvice(playerHand);
      
      case Stage.FLOP:
        return this.getFlopAdvice(playerHand, tableCards, currentHand);
      
      case Stage.TURN:
      case Stage.RIVER:
        return this.getTurnRiverAdvice(playerHand, tableCards, currentHand);
      
      default:
        return "Play based on your hand strength and position.";
    }
  }

  private static getPreFlopAdvice(playerHand: Card[]): string {
    if (playerHand.length < 2) return "Wait for your cards.";
    
    const [card1, card2] = playerHand;
    const isPair = card1.rank === card2.rank;
    const isSuited = card1.suit === card2.suit;
    const isConnected = Math.abs(card1.rank - card2.rank) <= 1;
    const hasHighCard = card1.rank >= 11 || card2.rank >= 11; // Jack or higher

    if (isPair) {
      if (card1.rank >= 10) return "Premium pair - consider raising aggressively";
      if (card1.rank >= 7) return "Good pair - play cautiously but confidently";
      return "Small pair - consider calling to see the flop";
    }

    if (hasHighCard) {
      if (isSuited) return "Strong suited high cards - good raising hand";
      if (isConnected) return "Connected high cards - solid calling hand";
      return "High cards - play carefully, position matters";
    }

    if (isSuited && isConnected) {
      return "Suited connectors - speculative hand, good in late position";
    }

    return "Marginal hand - consider folding unless in late position";
  }

  private static getFlopAdvice(playerHand: Card[], tableCards: Card[], currentHand: HandType): string {
    const draws = this.analyzeDraws(playerHand, tableCards);
    
    if (currentHand >= HandType.THREE_OF_A_KIND) {
      return "Strong made hand - bet for value and protection";
    }
    
    if (currentHand >= HandType.PAIR) {
      if (draws.flushDraw || draws.straightDraw) {
        return "Pair with draws - good semi-bluffing opportunity";
      }
      return "Made pair - bet for value if top pair, check-call if weak";
    }

    if (draws.flushDraw && draws.straightDraw) {
      return "Monster draw - play aggressively, many outs";
    }
    
    if (draws.flushDraw || draws.straightDraw) {
      return "Drawing hand - consider semi-bluffing or calling";
    }

    return "Missed flop - consider folding unless you have position";
  }

  private static getTurnRiverAdvice(playerHand: Card[], tableCards: Card[], currentHand: HandType): string {
    if (currentHand >= HandType.TWO_PAIR) {
      return "Strong hand - bet for value, don't slow play";
    }
    
    if (currentHand >= HandType.PAIR) {
      const boardTexture = this.analyzeBoardTexture(tableCards);
      if (boardTexture.dangerous) {
        return "Decent hand but dangerous board - proceed with caution";
      }
      return "Made hand - bet for value if strong, check-call if marginal";
    }

    const draws = this.analyzeDraws(playerHand, tableCards);
    if (draws.flushDraw || draws.straightDraw) {
      return "Still drawing - calculate pot odds carefully";
    }

    return "Weak hand - consider folding unless pot odds are very favorable";
  }

  private static analyzeDraws(playerHand: Card[], tableCards: Card[]): {
    flushDraw: boolean;
    straightDraw: boolean;
    outs: number;
  } {
    const allCards = [...playerHand, ...tableCards];
    const suits = allCards.map(c => c.suit);
    const ranks = allCards.map(c => c.rank).sort((a, b) => a - b);
    
    // Check for flush draw
    const suitCounts: Record<number, number> = {};
    suits.forEach(suit => {
      suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    });
    const flushDraw = Object.values(suitCounts).some(count => count === 4);
    
    // Check for straight draw (simplified)
    const uniqueRanks = [...new Set(ranks)];
    const straightDraw = this.hasOpenEndedStraightDraw(uniqueRanks);
    
    // Estimate outs (simplified calculation)
    let outs = 0;
    if (flushDraw) outs += 9;
    if (straightDraw) outs += 8;
    if (flushDraw && straightDraw) outs = 15; // Avoid double counting
    
    return { flushDraw, straightDraw, outs };
  }

  private static hasOpenEndedStraightDraw(ranks: number[]): boolean {
    // Simplified straight draw detection
    for (let i = 0; i < ranks.length - 3; i++) {
      const consecutive = ranks.slice(i, i + 4).every((rank, idx, arr) => 
        idx === 0 || rank === arr[idx - 1] + 1
      );
      if (consecutive) return true;
    }
    return false;
  }

  private static analyzeBoardTexture(tableCards: Card[]): { dangerous: boolean; wet: boolean } {
    if (tableCards.length < 3) return { dangerous: false, wet: false };
    
    const suits = tableCards.map(c => c.suit);
    const ranks = tableCards.map(c => c.rank).sort((a, b) => a - b);
    
    // Check for flush possibilities
    const suitCounts: Record<number, number> = {};
    suits.forEach(suit => {
      suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    });
    const flushPossible = Object.values(suitCounts).some(count => count >= 3);
    
    // Check for straight possibilities
    const uniqueRanks = [...new Set(ranks)];
    const straightPossible = uniqueRanks.length >= 3 && 
      (uniqueRanks[uniqueRanks.length - 1] - uniqueRanks[0] <= 4);
    
    const dangerous = flushPossible || straightPossible;
    const wet = dangerous || ranks.some(rank => rank >= 10); // High cards make board "wet"
    
    return { dangerous, wet };
  }

  // Get specific guidance for tutorial mode
  static getTutorialGuidance(stage: Stage): string {
    switch (stage) {
      case Stage.PRE_FLOP:
        return "Pre-flop is about starting hand selection. Play tight and aggressive with premium hands.";
      
      case Stage.FLOP:
        return "The flop reveals 60% of your final hand. Look for pairs, draws, and board texture.";
      
      case Stage.TURN:
        return "The turn card can change everything. Re-evaluate your hand strength and drawing odds.";
      
      case Stage.RIVER:
        return "Final betting round. Focus on value betting strong hands and bluff catching.";
      
      default:
        return "Observe the action and learn from each decision.";
    }
  }

  // Get hand ranking information for cheat sheet
  static getHandRankings(): Array<{ hand: string; description: string; example: string }> {
    return [
      { hand: "Royal Flush", description: "A, K, Q, J, 10, all same suit", example: "A♠ K♠ Q♠ J♠ 10♠" },
      { hand: "Straight Flush", description: "Five cards in sequence, same suit", example: "9♥ 8♥ 7♥ 6♥ 5♥" },
      { hand: "Four of a Kind", description: "Four cards of same rank", example: "K♠ K♥ K♦ K♣ 3♠" },
      { hand: "Full House", description: "Three of a kind + pair", example: "A♠ A♥ A♦ 8♠ 8♥" },
      { hand: "Flush", description: "Five cards of same suit", example: "K♠ J♠ 9♠ 6♠ 4♠" },
      { hand: "Straight", description: "Five cards in sequence", example: "10♠ 9♥ 8♦ 7♣ 6♠" },
      { hand: "Three of a Kind", description: "Three cards of same rank", example: "Q♠ Q♥ Q♦ 7♠ 4♥" },
      { hand: "Two Pair", description: "Two different pairs", example: "A♠ A♥ 8♦ 8♣ K♠" },
      { hand: "One Pair", description: "Two cards of same rank", example: "10♠ 10♥ K♦ 6♣ 4♠" },
      { hand: "High Card", description: "No matching cards", example: "A♠ J♥ 9♦ 7♣ 5♠" }
    ];
  }
}
