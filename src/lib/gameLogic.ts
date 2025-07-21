// Game Logic - Enhanced Poker Implementation
export interface Card {
  rank: number; // 2-14 (11=J, 12=Q, 13=K, 14=A)
  suit: number; // 0=Spades, 1=Hearts, 2=Diamonds, 3=Clubs
  imageUrl: string;
}

export enum HandType {
  HIGH_CARD = 1,
  PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10
}

export interface Player {
  name: string;
  chips: number;
  hand: Card[];
  isFolded: boolean;
  isAllIn: boolean;
  isOut: boolean;
  betThisRound: number;
}

export enum Stage {
  PRE_FLOP = 0,
  FLOP = 1,
  TURN = 2,
  RIVER = 3,
  SHOWDOWN = 4,
  HAND_OVER = 5
}

export enum ActionType {
  FOLD = 'FOLD',
  CHECK = 'CHECK',
  CALL = 'CALL',
  RAISE = 'RAISE'
}

export interface BotDecision {
  type: ActionType;
  amount: number;
}

export interface HandResultInfo {
  winnerNames: string[];
  winningHand: string;
  winnerIndex: number;
}

export interface SidePot {
  amount: number;
  eligible: Set<number>; // player indices who can win this pot
}

export class GameLogic {
  private startingChips: number = 2000;
  private smallBlindAmount: number = 50;
  public bigBlindAmount: number = 100;
  
  public players: Player[] = [
    { name: "You", chips: this.startingChips, hand: [], isFolded: false, isAllIn: false, isOut: false, betThisRound: 0 },
    { name: "Bot 1", chips: this.startingChips, hand: [], isFolded: false, isAllIn: false, isOut: false, betThisRound: 0 }
  ];

  private lastAggressorIndex: number = -1;
  public dealerIndex: number = 0;
  public stage: Stage = Stage.PRE_FLOP;
  public pot: number = 0;
  public currentBet: number = 0;
  public currentActorIndex: number = -1;
  public lastHandResult: HandResultInfo | null = null;
  
  private deck: Card[] = [];
  public communityCards: Card[] = [];
  public difficulty: string = "Easy";
  public message: string = "";
  public isGuidedMode: boolean = false;
  public awaitingManualAdvance: boolean = false;
  
  private sidePots: SidePot[] = [{ amount: 0, eligible: new Set([0, 1]) }];
  private bettingRoundComplete: boolean = false;
  private playersActedThisRound: Set<number> = new Set();

  constructor() {
    this.initDeck();
  }

  public getAmountToCall(playerIndex: number): number {
    if (playerIndex < 0 || playerIndex >= this.players.length) {
      return 0;
    }
    const player = this.players[playerIndex];
    return Math.max(0, this.currentBet - player.betThisRound);
  }

  private initDeck(): void {
    try {
      this.deck = [];
      const suits = [0, 1, 2, 3]; // Spades, Hearts, Diamonds, Clubs
      const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
      
      for (const suit of suits) {
        for (const rank of ranks) {
          this.deck.push({
            rank,
            suit,
            imageUrl: this.getCardImageUrl(rank, suit)
          });
        }
      }
      
      // Ensure we have a full deck
      if (this.deck.length !== 52) {
        throw new Error(`Invalid deck size: ${this.deck.length}. Expected 52 cards.`);
      }
      
      // Shuffle deck using Fisher-Yates algorithm
      for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
      
      console.log("Deck initialized and shuffled successfully with", this.deck.length, "cards");
    } catch (error) {
      console.error("Error initializing deck:", error);
      throw error;
    }
  }

  private getCardImageUrl(rank: number, suit: number): string {
    const suitNames = ['spades', 'hearts', 'diamonds', 'clubs'];
    const rankNames = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    
    // Using DeckOfCards API for high-quality card images
    return `https://deckofcardsapi.com/static/img/${rankNames[rank]}${suitNames[suit][0].toUpperCase()}.png`;
  }

  public startNewRound(): void {
    try {
      if (this.isGameOver()) {
        this.message = "Game over! Thank you for playing.";
        return;
      }

      // Reset state for new hand
      this.stage = Stage.PRE_FLOP;
      this.communityCards = [];
      this.pot = 0;
      this.currentBet = 0;
      this.lastHandResult = null;
      this.currentActorIndex = -1;
      this.lastAggressorIndex = -1;
      this.bettingRoundComplete = false;
      this.playersActedThisRound = new Set();

      // Reset side pots
      this.sidePots = [{ amount: 0, eligible: new Set([0, 1]) }];

      this.players.forEach(player => {
        if (!player.isOut) {
          player.hand = [];
          player.isFolded = false;
          player.isAllIn = false;
          player.betThisRound = 0;
        }
      });

      // Rotate dealer (in heads-up, dealer is small blind)
      this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
      
      // Initialize new deck and deal cards
      this.initDeck();
      
      if (this.deck.length < 52) {
        this.message = "Error: Deck initialization failed.";
        console.error("Deck has insufficient cards:", this.deck.length);
        return;
      }

      this.dealHoleCards();
      this.postBlindsAndStartBetting();
      
      this.message = "New hand started. Cards dealt!";
    } catch (error) {
      this.message = `Error starting new round: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error("Error in startNewRound:", error);
    }
  }

  private getNextActivePlayer(fromIndex: number): number {
    let idx = (fromIndex + 1) % this.players.length;
    let loopCheck = 0;
    
    while (this.players[idx].isOut && loopCheck < this.players.length) {
      idx = (idx + 1) % this.players.length;
      loopCheck++;
    }
    
    return loopCheck >= this.players.length ? -1 : idx;
  }

  private dealHoleCards(): void {
    // Deal 2 cards to each active player, starting left of dealer
    let currentPlayer = (this.dealerIndex + 1) % this.players.length;
    
    // Deal first card to each player
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < this.players.length; i++) {
        const player = this.players[currentPlayer];
        if (!player.isOut && this.deck.length > 0) {
          player.hand.push(this.deck.shift()!);
        }
        currentPlayer = (currentPlayer + 1) % this.players.length;
      }
      // Reset to start position for next round
      currentPlayer = (this.dealerIndex + 1) % this.players.length;
    }
  }

  private postBlindsAndStartBetting(): void {
    // In heads-up: dealer posts small blind, other player posts big blind
    const smallBlindIdx = this.dealerIndex;
    const bigBlindIdx = (this.dealerIndex + 1) % this.players.length;

    try {
      // Post small blind
      if (!this.players[smallBlindIdx].isOut) {
        const sbAmount = Math.min(this.smallBlindAmount, this.players[smallBlindIdx].chips);
        this.players[smallBlindIdx].chips -= sbAmount;
        this.players[smallBlindIdx].betThisRound = sbAmount;
        this.pot += sbAmount;
        this.message = `${this.players[smallBlindIdx].name} posts small blind $${sbAmount}`;
      }

      // Post big blind
      if (!this.players[bigBlindIdx].isOut) {
        const bbAmount = Math.min(this.bigBlindAmount, this.players[bigBlindIdx].chips);
        this.players[bigBlindIdx].chips -= bbAmount;
        this.players[bigBlindIdx].betThisRound = bbAmount;
        this.pot += bbAmount;
        this.currentBet = bbAmount;
        this.message = `${this.players[bigBlindIdx].name} posts big blind $${bbAmount}`;
      }

      // Start betting with small blind player (dealer in heads-up)
      this.currentActorIndex = smallBlindIdx;
      this.playersActedThisRound.clear();
      
    } catch (error) {
      console.error("Error posting blinds:", error);
      this.message = "Error posting blinds";
    }
  }

  private checkBettingRoundComplete(): boolean {
    const activePlayers = this.players.filter(p => !p.isFolded && !p.isOut && !p.isAllIn);
    
    // If only one player left, round is complete
    if (activePlayers.length <= 1) {
      return true;
    }

    // Check if all active players have acted and have equal bets
    for (const player of activePlayers) {
      const playerIndex = this.players.indexOf(player);
      if (!this.playersActedThisRound.has(playerIndex) || player.betThisRound !== this.currentBet) {
        return false;
      }
    }

    return true;
  }

  private processBotAction(): void {
    if (this.currentActorIndex === -1 || this.players[this.currentActorIndex].name === "You") {
      return;
    }

  public triggerBotAction(): void {
    this.processBotAction();
  }

    const player = this.players[this.currentActorIndex];
    if (player.isFolded || player.isAllIn || player.isOut) {
      this.moveToNextPlayer();
      return;
    }

    try {
      // Bot's turn - add delay for natural gameplay feel
      const callAmount = this.getAmountToCall(this.currentActorIndex);
      const decision = this.decideBotAction(player, callAmount);

      console.log(`Bot ${player.name} deciding: ${decision.type} ${decision.amount > 0 ? `$${decision.amount}` : ''}`);

      this.performAction(this.currentActorIndex, decision, callAmount);
      this.playersActedThisRound.add(this.currentActorIndex);

      // Check if betting round is complete
      if (this.checkBettingRoundComplete()) {
        this.afterBettingRound();
      } else {
        this.moveToNextPlayer();
      }
    } catch (error) {
      console.error(`Error in bot action for ${player.name}:`, error);
      // Fallback: fold if there's an error
      this.performAction(this.currentActorIndex, { type: ActionType.FOLD, amount: 0 }, 0);
      this.playersActedThisRound.add(this.currentActorIndex);
      this.moveToNextPlayer();
    }
  }

  private moveToNextPlayer(): void {
    let nextPlayer = (this.currentActorIndex + 1) % this.players.length;
    let attempts = 0;
    
    while (attempts < this.players.length) {
      const player = this.players[nextPlayer];
      if (!player.isFolded && !player.isOut && !player.isAllIn) {
        this.currentActorIndex = nextPlayer;
        
        if (player.name === "You") {
          this.message = "Your turn to act.";
          this.awaitingManualAdvance = false;
          return;
        } else {
          // In guided mode, wait for manual advance
          if (this.isGuidedMode) {
            this.message = `${player.name}'s turn - Click 'Next Move' to continue`;
            this.awaitingManualAdvance = true;
            return;
          } else {
            // Process bot action after a short delay for better UX in regular mode
            this.message = `${player.name} is thinking...`;
            this.awaitingManualAdvance = false;
            setTimeout(() => {
              this.processBotAction();
            }, 1500);
            return;
          }
        }
      }
      nextPlayer = (nextPlayer + 1) % this.players.length;
      attempts++;
    }
    
    // No active players found, end betting round
    console.log("No active players found, ending betting round");
    this.afterBettingRound();
  }

  private decideBotAction(player: Player, callAmount: number): BotDecision {
    const handStrength = this.evaluateHand(player.hand.concat(this.communityCards));
    const randomFactor = Math.random();
    const [aggression, callStickiness, bluffChance] = this.getDifficultyParams();

    // If no bet to call (can check)
    if (callAmount === 0) {
      if (handStrength >= HandType.PAIR && randomFactor < aggression) {
        const raiseAmount = Math.max(this.bigBlindAmount, Math.floor(this.pot * (0.3 + aggression * 0.5)));
        return { type: ActionType.RAISE, amount: Math.min(raiseAmount, player.chips) };
      }
      return { type: ActionType.CHECK, amount: 0 };
    }

    // If player doesn't have enough to call, decide all-in or fold
    if (player.chips <= callAmount) {
      return handStrength >= HandType.PAIR 
        ? { type: ActionType.CALL, amount: 0 } // Will go all-in
        : { type: ActionType.FOLD, amount: 0 };
    }

    // Calculate pot odds
    const potOdds = callAmount / (this.pot + callAmount);
    const oddsThreshold = 0.5 - callStickiness * 0.3;

    // Strong hand - consider raising
    if (handStrength >= HandType.THREE_OF_A_KIND && randomFactor < aggression) {
      const raiseAmount = Math.max(callAmount * 2, Math.floor(this.pot * (0.5 + aggression * 0.5)));
      return { type: ActionType.RAISE, amount: Math.min(raiseAmount, player.chips - callAmount) };
    }
    
    // Decent hand - call if pot odds are good
    if (handStrength >= HandType.PAIR && potOdds < oddsThreshold) {
      return { type: ActionType.CALL, amount: 0 };
    }
    
    // Bluff occasionally
    if (randomFactor < bluffChance && potOdds < 0.2) {
      const bluffAmount = Math.max(callAmount * 2, this.bigBlindAmount * 3);
      return { type: ActionType.RAISE, amount: Math.min(bluffAmount, player.chips - callAmount) };
    }

    // Default: fold
    return { type: ActionType.FOLD, amount: 0 };
  }

  private getDifficultyParams(): [number, number, number] {
    switch (this.difficulty) {
      case "Easy": return [0.15, 0.3, 0.05];
      case "Medium": return [0.35, 0.5, 0.15];
      case "Hard": return [0.55, 0.7, 0.25];
      default: return [0.15, 0.3, 0.05];
    }
  }

  private performAction(playerIndex: number, decision: BotDecision, callAmount: number): void {
    try {
      if (playerIndex < 0 || playerIndex >= this.players.length) {
        throw new Error(`Invalid player index: ${playerIndex}`);
      }

      const player = this.players[playerIndex];
      
      if (player.isOut || player.isFolded) {
        console.warn(`Player ${player.name} is already out or folded`);
        return;
      }

      // Validate chip count before any action
      if (player.chips < 0) {
        console.error(`Player ${player.name} has negative chips: ${player.chips}`);
        player.chips = 0;
      }

      console.log(`Performing action for ${player.name}: ${decision.type}, callAmount: $${callAmount}, decision.amount: $${decision.amount}`);

      switch (decision.type) {
        case ActionType.FOLD:
          player.isFolded = true;
          this.message = `${player.name} folds.`;
          break;

        case ActionType.CHECK:
          if (callAmount === 0) {
            this.message = `${player.name} checks.`;
          } else {
            // Cannot check when there's a bet to call
            player.isFolded = true;
            this.message = `${player.name} folds (cannot check with bet to call).`;
          }
          break;

        case ActionType.CALL:
        case ActionType.RAISE:
          const totalBetAmount = decision.type === ActionType.CALL ? callAmount : callAmount + decision.amount;
          const actualBetAmount = Math.min(totalBetAmount, player.chips);
          
          // Explicit check to prevent negative bets
          if (actualBetAmount < 0) {
            console.error(`Calculated negative bet for ${player.name}. Forcing fold.`);
            player.isFolded = true;
            this.message = `${player.name} folds due to an error in bet calculation.`;
            return;
          }

          // Deduct chips and update pot
          const previousChips = player.chips;
          const previousPot = this.pot;
          player.chips -= actualBetAmount;
          player.betThisRound += actualBetAmount;
          this.pot += actualBetAmount;

          console.log(`${player.name}: ${previousChips} -> ${player.chips} chips (bet: $${actualBetAmount}), pot: ${previousPot} -> ${this.pot}`);

          // Handle raises
          if (decision.type === ActionType.RAISE && player.betThisRound > this.currentBet) {
            this.currentBet = player.betThisRound;
            this.lastAggressorIndex = playerIndex;
            console.log(`New current bet set to $${this.currentBet} by ${player.name}`);
          }

          // Check for all-in
          if (player.chips === 0) {
            player.isAllIn = true;
            this.message = `${player.name} is all-in with $${actualBetAmount}!`;
          } else {
            this.message = decision.type === ActionType.CALL 
              ? `${player.name} calls $${actualBetAmount}.`
              : `${player.name} raises to $${this.currentBet}.`;
          }
          break;

        default:
          throw new Error(`Unknown action type: ${decision.type}`);
      }
    } catch (error) {
      console.error("Error in performAction:", error);
      this.message = `Error processing ${this.players[playerIndex]?.name || 'player'}'s action.`;
      // Fallback: fold the player to prevent game state corruption
      if (playerIndex >= 0 && playerIndex < this.players.length) {
        this.players[playerIndex].isFolded = true;
      }
    }
  }

  public handlePlayerAction(actionType: ActionType, raiseAmount: number = 0): void {
    if (this.stage === Stage.HAND_OVER || this.currentActorIndex !== 0) {
      console.warn(`Cannot handle player action: stage=${this.stage}, currentActor=${this.currentActorIndex}`);
      return;
    }

    try {
      const callAmount = this.getAmountToCall(0);
      const playerChips = this.players[0].chips;

      console.log(`Player action attempt: ${actionType}, callAmount: $${callAmount}, playerChips: $${playerChips}, pot: $${this.pot}`);

      // Validate player has enough chips for the action
      if (actionType === ActionType.CALL && playerChips < callAmount) {
        if (playerChips === callAmount) {
          console.info(`Player is all-in with $${playerChips}`);
          // Continue with call (all in)
        } else {
          console.warn(`Player cannot call $${callAmount} with only $${playerChips}`);
          actionType = ActionType.FOLD;
        }
      }

      let actualRaise = 0;
      if (actionType === ActionType.RAISE) {
        actualRaise = Math.min(Math.max(this.bigBlindAmount, raiseAmount), playerChips - callAmount);
        if (actualRaise <= 0 && playerChips > callAmount) {
          // If raise amount is invalid, just call
          actionType = ActionType.CALL;
        }
      }

      console.log(`Player action processed: ${actionType} ${actualRaise > 0 ? `$${actualRaise}` : ''}`);

      this.performAction(0, { type: actionType, amount: actualRaise }, callAmount);
      this.playersActedThisRound.add(0);

      if (actionType === ActionType.RAISE) {
        this.lastAggressorIndex = 0;
        // Reset players acted for new betting round after raise
        this.playersActedThisRound.clear();
        this.playersActedThisRound.add(0);
      }

      console.log(`After player action - pot: $${this.pot}, currentBet: $${this.currentBet}`);

      // Check game state after player action
      if (this.players[0].isFolded || this.remainingPlayersInHand() <= 1) {
        this.afterBettingRound();
      } else if (this.checkBettingRoundComplete()) {
        this.afterBettingRound();
      } else {
        this.moveToNextPlayer();
      }
    } catch (error) {
      console.error("Error handling player action:", error);
      this.message = "Error processing your action. Please try again.";
    }
  }

  public advanceTurn(): void {
    try {
      if (this.isGuidedMode && this.awaitingManualAdvance && this.currentActorIndex !== 0) {
        this.awaitingManualAdvance = false;
        this.processBotAction();
      }
    } catch (error) {
      console.error("Error advancing turn:", error);
      this.message = "Error advancing turn. Please try again.";
    }
  }

  private afterBettingRound(): void {
    console.log(`Ending betting round - pot: $${this.pot}, stage: ${Stage[this.stage]}`);
    
    // Clear per-round bets but preserve pot
    this.players.forEach(player => {
      console.log(`${player.name} bet this round: $${player.betThisRound}`);
      player.betThisRound = 0;
    });
    this.currentActorIndex = -1;
    this.currentBet = 0;
    this.lastAggressorIndex = -1;
    this.playersActedThisRound.clear();

    if (this.remainingPlayersInHand() <= 1) {
      this.handleEndOfHand();
      return;
    }

    // Advance to next stage
    switch (this.stage) {
      case Stage.PRE_FLOP:
        this.stage = Stage.FLOP;
        this.dealCommunityCards(3);
        this.message = "Flop dealt!";
        break;
      case Stage.FLOP:
        this.stage = Stage.TURN;
        this.dealCommunityCards(1);
        this.message = "Turn dealt!";
        break;
      case Stage.TURN:
        this.stage = Stage.RIVER;
        this.dealCommunityCards(1);
        this.message = "River dealt!";
        break;
      case Stage.RIVER:
        this.stage = Stage.SHOWDOWN;
        this.handleShowdown();
        return;
    }

    console.log(`Advanced to ${Stage[this.stage]} - pot remains: $${this.pot}`);

    // Start new betting round
    const firstToAct = this.getNextActivePlayer(this.dealerIndex);
    if (firstToAct !== -1) {
      this.currentActorIndex = firstToAct;
      if (this.players[firstToAct].name === "You") {
        this.message += " Your turn to act.";
      } else {
        setTimeout(() => this.processBotAction(), 1500);
      }
    } else {
      this.dealRemainingCommunityCards();
      this.handleShowdown();
    }
  }

  private dealCommunityCards(count: number): void {
    for (let i = 0; i < count && this.deck.length > 0; i++) {
      this.communityCards.push(this.deck.shift()!);
    }
  }

  private dealRemainingCommunityCards(): void {
    const cardsToDeal = 5 - this.communityCards.length;
    if (cardsToDeal > 0) {
      this.dealCommunityCards(cardsToDeal);
    }
  }

  private remainingPlayersInHand(): number {
    return this.players.filter(player => !player.isFolded && !player.isOut).length;
  }

  private handleShowdown(): void {
    const activePlayers = this.players.filter(player => !player.isFolded && !player.isOut);
    if (activePlayers.length === 0) {
      this.concludeHand();
      return;
    }

    // Evaluate all hands
    const results = activePlayers.map(player => ({
      playerIndex: this.players.indexOf(player),
      player: player,
      handStrength: this.evaluateHand(player.hand.concat(this.communityCards)),
      handDescription: this.getHandDescription(player.hand.concat(this.communityCards))
    }));

    // Find the best hand
    const bestStrength = Math.max(...results.map(r => r.handStrength));
    const winners = results.filter(r => r.handStrength === bestStrength);

    // Distribute pot
    const share = Math.floor(this.pot / winners.length);
    const remainder = this.pot % winners.length;

    winners.forEach((winner, idx) => {
      const payout = share + (idx < remainder ? 1 : 0);
      winner.player.chips += payout;
    });

    // Set result info
    this.lastHandResult = {
      winnerNames: winners.map(w => w.player.name),
      winningHand: winners[0].handDescription,
      winnerIndex: winners[0].playerIndex
    };

    this.message = winners.length === 1 
      ? `${winners[0].player.name} wins $${this.pot} with ${winners[0].handDescription}!`
      : `Split pot! ${winners.map(w => w.player.name).join(' and ')} win $${share} each with ${winners[0].handDescription}!`;

    this.pot = 0;
    this.stage = Stage.HAND_OVER;
    this.concludeHand();
  }

  private handleEndOfHand(): void {
    const winner = this.players.find(player => !player.isFolded && !player.isOut);
    if (!winner) return;

    this.message = `${winner.name} wins $${this.pot} by default!`;
    winner.chips += this.pot;

    this.pot = 0;
    this.stage = Stage.HAND_OVER;
    this.lastHandResult = { 
      winnerNames: [winner.name], 
      winningHand: "Default Win",
      winnerIndex: this.players.indexOf(winner)
    };
    this.concludeHand();
  }

  private concludeHand(): void {
    for (const player of this.players) {
      if (player.chips <= 0 && !player.isOut) {
        player.isOut = true;
        player.isAllIn = false;
      }
    }
  }

  public isGameOver(): boolean {
    const humanIsOut = this.players[0].isOut || this.players[0].chips <= 0;
    const allBotsOut = this.players.slice(1).every(player => player.isOut || player.chips <= 0);
    return humanIsOut || allBotsOut;
  }

  private getHandDescription(cards: Card[]): string {
    const handType = this.evaluateHand(cards);
    switch (handType) {
      case HandType.ROYAL_FLUSH: return "Royal Flush";
      case HandType.STRAIGHT_FLUSH: return "Straight Flush";
      case HandType.FOUR_OF_A_KIND: return "Four of a Kind";
      case HandType.FULL_HOUSE: return "Full House";
      case HandType.FLUSH: return "Flush";
      case HandType.STRAIGHT: return "Straight";
      case HandType.THREE_OF_A_KIND: return "Three of a Kind";
      case HandType.TWO_PAIR: return "Two Pair";
      case HandType.PAIR: return "Pair";
      case HandType.HIGH_CARD: return "High Card";
      default: return "Unknown Hand";
    }
  }

  private evaluateHand(cards: Card[]): HandType {
    if (cards.length < 5) return this.evaluatePartialHand(cards);
    
    // Get all 5-card combinations and find the best hand
    const combinations = this.getCombinations(cards, 5);
    let bestHand = HandType.HIGH_CARD;
    
    for (const combo of combinations) {
      const handType = this.evaluateFiveCardHand(combo);
      if (handType > bestHand) {
        bestHand = handType;
      }
    }
    
    return bestHand;
  }

  private evaluatePartialHand(cards: Card[]): HandType {
    const rankCounts = this.getRankCounts(cards);
    const isFlush = cards.length > 0 && new Set(cards.map(c => c.suit)).size === 1;

    if (Object.values(rankCounts).includes(4)) return HandType.FOUR_OF_A_KIND;
    if (Object.values(rankCounts).includes(3)) return HandType.THREE_OF_A_KIND;
    if (Object.values(rankCounts).filter(count => count === 2).length >= 1) return HandType.PAIR;
    if (isFlush) return HandType.FLUSH;
    return HandType.HIGH_CARD;
  }

  private evaluateFiveCardHand(cards: Card[]): HandType {
    const ranks = cards.map(c => c.rank);
    const suits = cards.map(c => c.suit);
    const rankCounts = this.getRankCounts(cards);
    const isFlush = new Set(suits).size === 1;
    const isStraight = this.checkIfStraight(ranks);

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

  private getRankCounts(cards: Card[]): Record<number, number> {
    const counts: Record<number, number> = {};
    for (const card of cards) {
      counts[card.rank] = (counts[card.rank] || 0) + 1;
    }
    return counts;
  }

  private checkIfStraight(ranks: number[]): boolean {
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

  private getCombinations<T>(arr: T[], k: number): T[][] {
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
}
