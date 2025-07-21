'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GameLogic, ActionType, Stage, Player } from '@/lib/gameLogic';
import PlayingCard, { FlippableCard, CardPlaceholder } from '@/components/PlayingCard';
import { GuidanceManager } from '@/lib/guidance';

export default function PlayGamePage() {
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

  // Game statistics
  const [stats, setStats] = useState({
    handsPlayed: 0,
    playerWins: 0,
    soundEnabled: true,
    difficulty: 'Easy'
  });

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(100);

  // Update game state
  const updateGameState = useCallback(() => {
    setGameState({
      players: [...gameLogic.players],
      communityCards: [...gameLogic.communityCards],
      stage: gameLogic.stage,
      pot: gameLogic.pot,
      currentBet: gameLogic.currentBet,
      message: gameLogic.message,
      currentActorIndex: gameLogic.currentActorIndex,
      isGameOver: gameLogic.isGameOver()
    });
  }, [gameLogic]);

  // Initialize game
  useEffect(() => {
    gameLogic.startNewRound();
    updateGameState();
  }, [gameLogic, updateGameState]);

  // Handle player actions
  const handlePlayerAction = (actionType: ActionType, amount: number = 0) => {
    gameLogic.handlePlayerAction(actionType, amount);
    updateGameState();
    
    if (actionType !== ActionType.FOLD) {
      // Small delay before bot actions for better UX
      setTimeout(() => {
        updateGameState();
      }, 1000);
    }
  };

  const handleNextHand = () => {
    gameLogic.startNewRound();
    updateGameState();
    setStats(prev => ({ ...prev, handsPlayed: prev.handsPlayed + 1 }));
  };

  const handleDifficultyChange = () => {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const currentIndex = difficulties.indexOf(stats.difficulty);
    const nextDifficulty = difficulties[(currentIndex + 1) % difficulties.length];
    gameLogic.difficulty = nextDifficulty;
    setStats(prev => ({ ...prev, difficulty: nextDifficulty }));
  };

  const getAmountToCall = () => {
    return gameLogic.getAmountToCall(0);
  };

  const humanPlayer = gameState.players[0];
  const amountToCall = getAmountToCall();
  const minRaise = Math.max(gameLogic.bigBlindAmount, gameState.currentBet);
  const maxRaise = humanPlayer.chips;

  return (
    <div className="min-h-screen felt-texture p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="bg-casino-darkgreen/90 rounded-lg p-4 mb-6 border border-casino-gold/30">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <Link href="/learn-poker">
                <button className="casino-button bg-casino-green hover:bg-casino-darkgreen text-white px-4 py-2 rounded-lg">
                  ← Back
                </button>
              </Link>
              <div className="text-white">
                <span className="font-bold">Hands: {stats.handsPlayed}</span>
                <span className="ml-4 font-bold">Wins: {stats.playerWins}</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-casino-gold text-2xl font-bold">Pot: ${gameState.pot}</div>
              <div className="text-white text-sm">Current Bet: ${gameState.currentBet}</div>
            </div>
            
            <div className="text-white text-right">
              <div>Your Chips: ${humanPlayer.chips}</div>
              <div className="text-sm">Difficulty: {stats.difficulty}</div>
            </div>
          </div>
        </div>

        {/* Bot Players Row */}
        <div className="flex justify-center space-x-8 mb-8">
          {gameState.players.slice(1).map((player, index) => (
            <PlayerDisplay 
              key={player.name}
              player={player} 
              stage={gameState.stage}
              isBot={true}
            />
          ))}
        </div>

        {/* Community Cards */}
        <div className="flex justify-center mb-8">
          <div className="bg-casino-darkgreen/80 rounded-lg p-6 border-2 border-casino-gold/50">
            <div className="flex space-x-4">
              {[...Array(5)].map((_, index) => {
                const card = gameState.communityCards[index];
                return card ? (
                  <FlippableCard
                    key={index}
                    card={card}
                    isFaceUp={true}
                    className="w-16 h-24 md:w-20 md:h-28"
                  />
                ) : (
                  <CardPlaceholder key={index} className="w-16 h-24 md:w-20 md:h-28" />
                );
              })}
            </div>
          </div>
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
          <PlayerDisplay 
            player={humanPlayer} 
            stage={gameState.stage}
            isHuman={true}
          />
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto">
          {gameState.stage === Stage.HAND_OVER || gameState.stage === Stage.SHOWDOWN ? (
            <div className="text-center">
              <button
                onClick={handleNextHand}
                className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold text-xl px-8 py-4 rounded-xl"
              >
                Next Hand
              </button>
            </div>
          ) : gameState.currentActorIndex === 0 && !humanPlayer.isFolded ? (
            <div className="space-y-4">
              {/* Raise Amount Slider */}
              {humanPlayer.chips > amountToCall && (
                <div className="bg-casino-darkgreen/80 rounded-lg p-4 border border-casino-gold/30">
                  <label className="block text-white font-semibold mb-2">
                    Raise Amount: ${raiseAmount}
                  </label>
                  <input
                    type="range"
                    min={minRaise}
                    max={maxRaise}
                    step={10}
                    value={raiseAmount}
                    onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-casino-green rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-white text-sm mt-1">
                    <span>Min: ${minRaise}</span>
                    <span>Max: ${maxRaise}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handlePlayerAction(ActionType.FOLD)}
                  className="casino-button bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg"
                >
                  Fold
                </button>

                {amountToCall === 0 ? (
                  <button
                    onClick={() => handlePlayerAction(ActionType.CHECK)}
                    className="casino-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
                  >
                    Check
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlayerAction(ActionType.CALL)}
                    disabled={humanPlayer.chips < amountToCall}
                    className="casino-button bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg"
                  >
                    Call ${amountToCall}
                  </button>
                )}

                <button
                  onClick={() => handlePlayerAction(ActionType.RAISE, raiseAmount)}
                  disabled={humanPlayer.chips <= amountToCall}
                  className="casino-button bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg"
                >
                  Raise
                </button>

                <button
                  onClick={() => handlePlayerAction(ActionType.RAISE, humanPlayer.chips)}
                  disabled={humanPlayer.chips <= amountToCall}
                  className="casino-button bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg"
                >
                  All-In
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-white text-lg">
              {gameState.currentActorIndex !== 0 ? "Waiting for other players..." : "Hand complete"}
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => setShowCheatSheet(true)}
            className="casino-button bg-casino-darkgreen hover:bg-casino-green text-white px-6 py-3 rounded-lg"
          >
            Hand Rankings
          </button>
          <button
            onClick={() => setShowGuidance(true)}
            className="casino-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Get Guidance
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="casino-button bg-casino-darkgreen hover:bg-casino-green text-white px-6 py-3 rounded-lg"
          >
            Settings
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-casino-darkgreen rounded-lg p-6 border-2 border-casino-gold max-w-md w-full mx-4">
              <h3 className="text-casino-gold text-xl font-bold mb-4">Settings</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white">Sound Enabled</span>
                  <button
                    onClick={() => setStats(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                    className={`w-12 h-6 rounded-full ${stats.soundEnabled ? 'bg-green-500' : 'bg-gray-500'} relative transition-colors`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${stats.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <button
                  onClick={handleDifficultyChange}
                  className="casino-button bg-casino-green hover:bg-casino-darkgreen text-white px-4 py-2 rounded-lg w-full"
                >
                  Difficulty: {stats.difficulty}
                </button>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold px-6 py-2 rounded-lg mt-4 w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Cheat Sheet Modal */}
        {showCheatSheet && (
          <CheatSheetModal onClose={() => setShowCheatSheet(false)} />
        )}
      </div>
    </div>
  );
}

// Player Display Component
function PlayerDisplay({ 
  player, 
  stage, 
  isHuman = false, 
  isBot = false 
}: { 
  player: Player; 
  stage: Stage; 
  isHuman?: boolean; 
  isBot?: boolean; 
}) {
  const showCards = isHuman || stage === Stage.SHOWDOWN;

  return (
    <div className="text-center">
      <div className="bg-casino-darkgreen/80 rounded-lg p-4 border border-casino-gold/30 mb-2">
        <h3 className="text-casino-gold font-bold mb-2">{player.name}</h3>
        <div className="text-white text-sm mb-3">
          <div>Chips: ${player.chips}</div>
          {player.betThisRound > 0 && <div>Bet: ${player.betThisRound}</div>}
          {player.isFolded && <div className="text-red-400">Folded</div>}
          {player.isAllIn && <div className="text-orange-400">All-In</div>}
        </div>
        
        <div className="flex justify-center space-x-2">
          {player.hand.map((card, index) => (
            <FlippableCard
              key={index}
              card={card}
              isFaceUp={showCards}
              className="w-12 h-16 md:w-16 md:h-20"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Cheat Sheet Modal Component
function CheatSheetModal({ onClose }: { onClose: () => void }) {
  const handRankings = [
    { name: "Royal Flush", description: "A, K, Q, J, 10, all same suit", example: "A♠ K♠ Q♠ J♠ 10♠" },
    { name: "Straight Flush", description: "Five cards in sequence, same suit", example: "9♥ 8♥ 7♥ 6♥ 5♥" },
    { name: "Four of a Kind", description: "Four cards of same rank", example: "K♠ K♥ K♦ K♣ 3♠" },
    { name: "Full House", description: "Three of a kind + pair", example: "A♠ A♥ A♦ 8♠ 8♥" },
    { name: "Flush", description: "Five cards of same suit", example: "K♠ J♠ 9♠ 6♠ 4♠" },
    { name: "Straight", description: "Five cards in sequence", example: "10♠ 9♥ 8♦ 7♣ 6♠" },
    { name: "Three of a Kind", description: "Three cards of same rank", example: "Q♠ Q♥ Q♦ 7♠ 4♥" },
    { name: "Two Pair", description: "Two different pairs", example: "A♠ A♥ 8♦ 8♣ K♠" },
    { name: "One Pair", description: "Two cards of same rank", example: "10♠ 10♥ K♦ 6♣ 4♠" },
    { name: "High Card", description: "No matching cards", example: "A♠ J♥ 9♦ 7♣ 5♠" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-casino-darkgreen rounded-lg border-2 border-casino-gold max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-casino-gold text-2xl font-bold mb-6 text-center">Poker Hand Rankings</h3>
          <div className="space-y-3">
            {handRankings.map((hand, index) => (
              <div key={index} className="bg-casino-green/30 rounded-lg p-3 border border-casino-gold/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-bold">{index + 1}. {hand.name}</h4>
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
