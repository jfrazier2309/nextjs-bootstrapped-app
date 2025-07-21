'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GameLogic, ActionType, Stage, Player, Card } from '../../lib/gameLogic';
import { GuidanceManager } from '../../lib/guidance';
import PlayingCard, { FlippableCard, CardPlaceholder } from '../../components/PlayingCard';

export default function GuidedPlaythroughPage() {
  const [gameLogic] = useState(() => new GameLogic());
  const [gameState, setGameState] = useState({
    players: gameLogic.players,
    communityCards: gameLogic.communityCards,
    stage: gameLogic.stage,
    pot: gameLogic.pot,
    currentBet: gameLogic.currentBet,
    message: gameLogic.message,
    currentActorIndex: gameLogic.currentActorIndex,
    isGameOver: false
  });

  const [guidance, setGuidance] = useState({
    stage: "Pre-Flop",
    playerHand: "High Card",
    botHand: "(Hidden Hand)",
    advice: "Wait for your cards to be dealt.",
    handStrength: "Unknown",
    potOdds: undefined as string | undefined
  });

  const [showBotCards, setShowBotCards] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuidancePanel, setShowGuidancePanel] = useState(true);
  const [raiseAmount, setRaiseAmount] = useState(100);

  const [stats, setStats] = useState({
    handsPlayed: 0,
    playerWins: 0,
    botWins: 0,
    ties: 0,
    soundEnabled: true,
    difficulty: 'Easy'
  });

  const updateGameState = useCallback(() => {
    const newGameState = {
      players: [...gameLogic.players],
      communityCards: [...gameLogic.communityCards],
      stage: gameLogic.stage,
      pot: gameLogic.pot,
      currentBet: gameLogic.currentBet,
      message: gameLogic.message,
      currentActorIndex: gameLogic.currentActorIndex,
      isGameOver: gameLogic.isGameOver()
    };
    setGameState(newGameState);

    if (newGameState.players.length >= 2) {
      const guidanceInfo = GuidanceManager.updateGuidanceEnhanced(
        newGameState.players[0].hand,
        newGameState.players[1].hand,
        newGameState.communityCards,
        newGameState.stage,
        showBotCards,
        newGameState.pot,
        newGameState.currentBet
      );
      setGuidance({
        stage: guidanceInfo.stage,
        playerHand: guidanceInfo.playerHand,
        botHand: guidanceInfo.botHand,
        advice: guidanceInfo.advice,
        handStrength: guidanceInfo.handStrength,
        potOdds: guidanceInfo.potOdds
      });
    }
  }, [gameLogic, showBotCards]);

  useEffect(() => {
    gameLogic.isGuidedMode = true;
    gameLogic.startNewRound();
    updateGameState();
  }, [gameLogic, updateGameState]);

  const handlePlayerAction = (actionType: ActionType, amount: number = 0) => {
    gameLogic.handlePlayerAction(actionType, amount);
    updateGameState();

    if (actionType === ActionType.FOLD) {
      setStats(prev => ({ ...prev, botWins: prev.botWins + 1 }));
    }
  };

  const handleNextHand = () => {
    gameLogic.startNewRound();
    updateGameState();
    setStats(prev => ({ ...prev, handsPlayed: prev.handsPlayed + 1 }));
  };

  const handleNextMove = () => {
    gameLogic.advanceTurn();
    updateGameState();
  };

  const handleDifficultyChange = () => {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const currentIndex = difficulties.indexOf(stats.difficulty);
    const nextDifficulty = difficulties[(currentIndex + 1) % difficulties.length];
    gameLogic.difficulty = nextDifficulty;
    setStats(prev => ({ ...prev, difficulty: nextDifficulty }));
  };

  const getAmountToCall = () => gameLogic.getAmountToCall(0);

  const humanPlayer = gameState.players[0];
  const botPlayer = gameState.players[1];
  const amountToCall = getAmountToCall();
  const minRaise = Math.max(gameLogic.bigBlindAmount, gameState.currentBet);
  const maxRaise = humanPlayer.chips;

  if (gameState.isGameOver) {
    return <GameOverScreen stats={stats} onRestart={() => window.location.reload()} />;
  }

  // Handler to toggle peek bot cards without side effects
  const handlePeekBotCards = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBotCards(prev => !prev);
  };

  return (
    <div className="min-h-screen felt-texture p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-casino-darkgreen/90 rounded-lg p-4 mb-6 border border-casino-gold/30">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <Link href="/learn-poker">
                <button className="casino-button bg-casino-green hover:bg-casino-darkgreen text-white px-4 py-2 rounded-lg">
                  ← Back
                </button>
              </Link>
              <h1 className="text-casino-gold text-xl font-bold">Guided Poker Playthrough</h1>
            </div>

            <div className="text-center">
              <div
                className="relative bg-gradient-to-br from-casino-gold/20 to-casino-gold/10 rounded-xl p-4 border-2 border-casino-gold/50 shadow-lg"
                style={{
                  backgroundImage:
                    "url('https://images.pexels.com/photos/1303096/pexels-photo-1303096.jpeg?auto=compress&cs=tinysrgb&w=600')"
                }}
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-20 rounded-xl" />
                <div className="relative z-10">
                  <div className="text-casino-gold text-3xl font-bold mb-1 transition-all duration-300 hover:scale-105">
                    💰 Pot: ${gameState.pot}
                  </div>
                  <div className="text-white text-sm font-medium">Current Bet: ${gameState.currentBet}</div>
                </div>
              </div>
            </div>

            <div className="text-white text-right text-sm">
              <div>
                Wins: {stats.playerWins} | Losses: {stats.botWins} | Ties: {stats.ties}
              </div>
              <div>
                Hands: {stats.handsPlayed} | Difficulty: {stats.difficulty}
              </div>
            </div>
          </div>
        </div>

        {/* Bot Player */}
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <div className="bg-casino-darkgreen/80 rounded-lg p-4 border border-casino-gold/30 mb-2">
              <h3 className="text-casino-gold font-bold mb-2">{botPlayer.name}</h3>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Only toggle visibility, don't trigger any game actions or bets
                  setShowBotCards(prev => !prev);
                }}
                className="casino-button bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-2 rounded-lg font-semibold mb-3"
                type="button"
              >
                {showBotCards ? 'Hide Bot Cards' : 'Peek Bot Cards'}
              </button>

              <div className="text-white text-sm mb-3">
                <div>Chips: ${botPlayer.chips}</div>
                {botPlayer.betThisRound > 0 && <div>Bet: ${botPlayer.betThisRound}</div>}
                {botPlayer.isFolded && <div className="text-red-400">Folded</div>}
                {botPlayer.isAllIn && <div className="text-orange-400">All-In</div>}
              </div>
              
              <div className="flex justify-center space-x-2 mb-3">
                {botPlayer.hand.map((card: Card, index: number) => (
                  <FlippableCard
                    key={index}
                    card={card}
                    isFaceUp={showBotCards || gameState.stage === Stage.SHOWDOWN}
                    className="w-12 h-16 md:w-16 md:h-20"
                    onClick={undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Community Cards */}
        <div className="flex justify-center mb-8">
          <div className="bg-casino-darkgreen/80 rounded-lg p-6 border-2 border-casino-gold/50">
            <h3 className="text-casino-gold text-center font-bold mb-4">Community Cards</h3>
            <div className="flex space-x-4">
              {[...Array(5)].map((_, index) => {
                const card = gameState.communityCards[index];
                return card ? (
                  <FlippableCard
                    key={index}
                    card={card}
                    isFaceUp={true}
                    className="w-16 h-24 md:w-20 md:h-28"
                    onClick={undefined}
                  />
                ) : (
                  <CardPlaceholder key={index} className="w-16 h-24 md:w-20 md:h-28" />
                );
              })}
            </div>
          </div>
        </div>

        {/* Guidance Panel */}
        <div className="bg-casino-darkgreen/90 rounded-lg p-6 mb-6 border-2 border-casino-gold/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-casino-gold text-xl font-bold">🎯 Strategic Guidance</h3>
            <button
              onClick={() => setShowGuidancePanel(!showGuidancePanel)}
              className="casino-button bg-casino-green hover:bg-casino-darkgreen text-white text-sm px-3 py-1 rounded"
            >
              {showGuidancePanel ? 'Hide Guidance' : 'Show Guidance'}
            </button>
          </div>

          {showGuidancePanel && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-casino-gold font-semibold mb-2">Current Situation</h4>
                <div className="text-white space-y-1 text-sm">
                  <div><strong>Stage:</strong> {guidance.stage}</div>
                  <div><strong>Your Hand:</strong> {guidance.playerHand}</div>
                  <div><strong>Hand Strength:</strong> {guidance.handStrength}</div>
                  <div><strong>Bot's Hand:</strong> {guidance.botHand}</div>
                  {guidance.potOdds && <div><strong>Pot Odds:</strong> {guidance.potOdds}</div>}
                </div>
              </div>
              <div>
                <h4 className="text-casino-gold font-semibold mb-2">Strategic Advice</h4>
                <p className="text-white text-sm leading-relaxed">{guidance.advice}</p>
              </div>
            </div>
          )}
        </div>

        {/* Game Message */}
        <div className="text-center mb-6">
          <div className="bg-casino-darkgreen/80 rounded-lg p-4 border border-casino-gold/30 inline-block">
            <p className="text-casino-gold text-lg font-semibold">{gameState.message}</p>
            <p className="text-white text-sm mt-1">Stage: {Stage[gameState.stage]}</p>
          </div>
        </div>

        {/* Human Player */}
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <div className="bg-casino-darkgreen/80 rounded-lg p-4 border border-casino-gold/30 mb-2">
              <h3 className="text-casino-gold font-bold mb-2">You</h3>
              <div className="text-white text-sm mb-3">
                <div>Chips: ${humanPlayer.chips}</div>
                {humanPlayer.betThisRound > 0 && <div>Bet: ${humanPlayer.betThisRound}</div>}
                {humanPlayer.isFolded && <div className="text-red-400">Folded</div>}
                {humanPlayer.isAllIn && <div className="text-orange-400">All-In</div>}
              </div>

              <div className="flex justify-center space-x-2">
                {humanPlayer.hand.map((card: Card, index: number) => (
                  <FlippableCard
                    key={index}
                    card={card}
                    isFaceUp={true}
                    className="w-16 h-20 md:w-20 md:h-28"
                    onClick={undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto">
          {gameState.stage === Stage.HAND_OVER || gameState.stage === Stage.SHOWDOWN ? (
            <div className="text-center">
              <button
                onClick={handleNextHand}
                className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold text-xl px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🎲 Deal Next Hand
              </button>
            </div>
          ) : gameState.currentActorIndex === 0 && !humanPlayer.isFolded ? (
            <div className="space-y-6">
              {/* Enhanced Betting Info Panel */}
              <div className="bg-gradient-to-r from-casino-darkgreen/90 to-casino-green/90 rounded-xl p-4 border-2 border-casino-gold/30 shadow-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-casino-gold font-bold text-sm">TO CALL</div>
                    <div className="text-white text-xl font-bold">${amountToCall}</div>
                  </div>
                  <div>
                    <div className="text-casino-gold font-bold text-sm">YOUR CHIPS</div>
                    <div className="text-white text-xl font-bold">${humanPlayer.chips}</div>
                  </div>
                  <div>
                    <div className="text-casino-gold font-bold text-sm">POT ODDS</div>
                    <div className="text-white text-xl font-bold">
                      {amountToCall > 0 ? `${((amountToCall / (gameState.pot + amountToCall)) * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Raise Amount Slider */}
              {humanPlayer.chips > amountToCall && (
                <div className="bg-casino-darkgreen/80 rounded-xl p-6 border-2 border-casino-gold/30 shadow-lg">
                  <label className="block text-casino-gold font-bold text-lg mb-3 text-center">
                    🎯 Raise Amount: ${raiseAmount}
                  </label>
                  <input
                    type="range"
                    min={minRaise}
                    max={maxRaise}
                    step={25}
                    value={raiseAmount}
                    onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-casino-green to-casino-gold rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-white text-sm mt-2 font-medium">
                    <span>Min: ${minRaise}</span>
                    <span className="text-casino-gold">Current: ${raiseAmount}</span>
                    <span>Max: ${maxRaise}</span>
                  </div>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handlePlayerAction(ActionType.FOLD)}
                  className="casino-button bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-4 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-red-500/50"
                >
                  🚫 Fold
                </button>

                {amountToCall === 0 ? (
                  <button
                    onClick={() => handlePlayerAction(ActionType.CHECK)}
                    className="casino-button bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-4 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-blue-500/50"
                  >
                    ✋ Check
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlayerAction(ActionType.CALL)}
                    disabled={humanPlayer.chips < amountToCall}
                    className="casino-button bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-4 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-green-500/50 disabled:border-gray-500/50"
                  >
                    {humanPlayer.chips === amountToCall ? '🎯 All-In Call' : `💰 Call $${amountToCall}`}
                  </button>
                )}

                <button
                  onClick={() => handlePlayerAction(ActionType.RAISE, raiseAmount)}
                  disabled={humanPlayer.chips <= amountToCall}
                  className="casino-button bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-4 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-purple-500/50 disabled:border-gray-500/50"
                >
                  📈 Raise
                </button>

                <button
                  onClick={() => handlePlayerAction(ActionType.RAISE, humanPlayer.chips)}
                  disabled={humanPlayer.chips <= amountToCall}
                  className="casino-button bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-4 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-orange-500/50 disabled:border-gray-500/50"
                >
                  🔥 All-In
                </button>
              </div>
            </div>
          ) : gameLogic.awaitingManualAdvance && gameState.currentActorIndex !== 0 ? (
            <div className="text-center space-y-4">
              <div className="text-white text-lg mb-4">
                {gameState.message}
              </div>
              <button
                onClick={handleNextMove}
                className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold text-xl px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                ⏭️ Next Move
              </button>
            </div>
          ) : (
            <div className="text-center text-white text-lg">
              {gameState.currentActorIndex !== 0 ? "Waiting for bot to act..." : "Hand complete"}
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => setShowCheatSheet(true)}
            className="casino-button bg-casino-darkgreen hover:bg-casino-green text-white px-6 py-3 rounded-lg"
          >
            Cheat Sheet
          </button>
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="casino-button bg-casino-darkgreen hover:bg-casino-green text-white px-6 py-3 rounded-lg"
          >
            Tutorial
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="casino-button bg-casino-darkgreen hover:bg-casino-green text-white px-6 py-3 rounded-lg"
          >
            Settings
          </button>
        </div>

        {/* Tutorial Drawer */}
        {showTutorial && (
          <div className="fixed right-0 top-0 h-full w-80 bg-casino-darkgreen border-l-4 border-casino-gold shadow-2xl z-40 p-6 overflow-y-auto animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-casino-gold text-xl font-bold">Tutorial</h3>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-white hover:text-casino-gold text-2xl"
              >
                ×
              </button>
            </div>
            <TutorialContent stage={gameState.stage} />
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            stats={stats}
            onStatsChange={setStats}
            onDifficultyChange={handleDifficultyChange}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Cheat Sheet Modal */}
        {showCheatSheet && (
          <CheatSheetModal onClose={() => setShowCheatSheet(false)} />
        )}
      </div>
    </div>
  );
}

// Tutorial Content Component
function TutorialContent({ stage }: { stage: Stage }) {
  const tutorialContent: Record<Stage, { title: string; content: string[] }> = {
    [Stage.PRE_FLOP]: {
      title: "Pre-Flop Strategy",
      content: [
        "• Look at your two hole cards",
        "• Decide if they're worth playing",
        "• Premium hands: AA, KK, QQ, AK",
        "• Position matters - play tighter in early position",
        "• Consider raising with strong hands",
        "• Fold weak hands like 7-2 offsuit"
      ]
    },
    [Stage.FLOP]: {
      title: "Flop Analysis",
      content: [
        "• Three community cards are revealed",
        "• Check if you made a pair or better",
        "• Look for drawing opportunities",
        "• Consider the board texture",
        "• Wet boards (connected/suited) are dangerous",
        "• Bet strong hands for value"
      ]
    },
    [Stage.TURN]: {
      title: "Turn Strategy",
      content: [
        "• Fourth community card revealed",
        "• Re-evaluate your hand strength",
        "• Calculate your outs if drawing",
        "• Consider pot odds for calls",
        "• Be cautious of opponent's betting",
        "• Strong hands should bet for value"
      ]
    },
    [Stage.RIVER]: {
      title: "River Decision",
      content: [
        "• Final community card revealed",
        "• No more cards to come",
        "• Value bet strong hands",
        "• Consider bluffing missed draws",
        "• Call with bluff catchers carefully",
        "• Fold weak hands to big bets"
      ]
    },
    [Stage.SHOWDOWN]: {
      title: "Showdown",
      content: [
        "• Best hand wins the pot",
        "• Learn from the revealed hands",
        "• Analyze your decisions",
        "• Note opponent's playing style",
        "• Prepare for the next hand"
      ]
    },
    [Stage.HAND_OVER]: {
      title: "Hand Complete",
      content: [
        "• Hand is finished",
        "• Review what happened",
        "• Prepare for next hand",
        "• Learn from the outcome"
      ]
    }
  };

  const content = tutorialContent[stage] || tutorialContent[Stage.PRE_FLOP];

  return (
    <div className="text-white">
      <h4 className="text-casino-gold font-bold text-lg mb-4">{content.title}</h4>
      <ul className="space-y-2 text-sm">
        {content.content.map((item: string, index: number) => (
          <li key={index} className="leading-relaxed">{item}</li>
        ))}
      </ul>
      
      <div className="mt-6 p-4 bg-casino-green/30 rounded-lg border border-casino-gold/20">
        <h5 className="text-casino-gold font-semibold mb-2">💡 Pro Tip</h5>
        <p className="text-sm">
          {stage === Stage.PRE_FLOP && "Tight is right - only play about 20% of your starting hands."}
          {stage === Stage.FLOP && "If you don't improve on the flop, you probably won't win."}
          {stage === Stage.TURN && "This is where pot odds become crucial for drawing hands."}
          {stage === Stage.RIVER && "When in doubt, fold to big bets with marginal hands."}
          {stage === Stage.SHOWDOWN && "Pay attention to what hands your opponents show down."}
        </p>
      </div>
    </div>
  );
}

// Settings Modal Component
function SettingsModal({ 
  stats, 
  onStatsChange, 
  onDifficultyChange, 
  onClose 
}: { 
  stats: any; 
  onStatsChange: (stats: any) => void; 
  onDifficultyChange: () => void; 
  onClose: () => void; 
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-casino-darkgreen rounded-lg p-6 border-2 border-casino-gold max-w-md w-full mx-4">
        <h3 className="text-casino-gold text-xl font-bold mb-4">Settings</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white">Sound Enabled</span>
            <button
              onClick={() => onStatsChange({ ...stats, soundEnabled: !stats.soundEnabled })}
              className={`w-12 h-6 rounded-full ${stats.soundEnabled ? 'bg-green-500' : 'bg-gray-500'} relative transition-colors`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${stats.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <button
            onClick={onDifficultyChange}
            className="casino-button bg-casino-green hover:bg-casino-darkgreen text-white px-4 py-2 rounded-lg w-full"
          >
            Difficulty: {stats.difficulty}
          </button>
        </div>
        <button
          onClick={onClose}
          className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold px-6 py-2 rounded-lg mt-4 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Cheat Sheet Modal Component
function CheatSheetModal({ onClose }: { onClose: () => void }) {
  const handRankings = GuidanceManager.getHandRankings();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-casino-darkgreen rounded-lg border-2 border-casino-gold max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-casino-gold text-2xl font-bold mb-6 text-center">Poker Hand Rankings</h3>
          <div className="space-y-3">
            {handRankings.map((hand: any, index: number) => (
              <div key={index} className="bg-casino-green/30 rounded-lg p-3 border border-casino-gold/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-bold">{index + 1}. {hand.hand}</h4>
                    <p className="text-white/80 text-sm">{hand.description}</p>
                  </div>
                  <div className="text-casino-gold text-sm font-mono">
                    {hand.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold px-6 py-3 rounded-lg mt-6 w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Game Over Screen Component
function GameOverScreen({ stats, onRestart }: { stats: any; onRestart: () => void }) {
  const playerWon = stats.playerWins > stats.botWins;
  
  return (
    <div className="min-h-screen felt-texture flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-casino-darkgreen/90 rounded-2xl border-4 border-casino-gold shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-casino-gold mb-6">Game Over!</h1>
          
          <div className="text-3xl mb-6">
            {playerWon ? (
              <div className="text-green-400">🏆 You Won!</div>
            ) : (
              <div className="text-red-400">😔 Bot Won!</div>
            )}
          </div>

          <div className="bg-casino-green/30 rounded-lg p-6 mb-6 border border-casino-gold/20">
            <h3 className="text-casino-gold font-bold text-lg mb-4">Final Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-white">
              <div>Player Wins: {stats.playerWins}</div>
              <div>Bot Wins: {stats.botWins}</div>
              <div>Ties: {stats.ties}</div>
              <div>Total Hands: {stats.handsPlayed}</div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={onRestart}
              className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold text-xl px-8 py-4 rounded-xl w-full"
            >
              Play Again
            </button>
            
            <Link href="/learn-poker">
              <button className="casino-button bg-casino-green hover:bg-casino-darkgreen text-white font-bold px-6 py-3 rounded-lg w-full">
                Back to Learn Poker
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
