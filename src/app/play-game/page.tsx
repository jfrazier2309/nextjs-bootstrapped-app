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
    gameLogic.isGuidedMode = false; // Ensure regular mode has automatic bot turns
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
        gameLogic.triggerBotAction();
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
              <div className="relative bg-gradient-to-br from-casino-gold/20 to-casino-gold/10 rounded-xl p-4 border-2 border-casino-gold/50 shadow-lg">
                <div className="absolute inset-0 bg-cover bg-center opacity-20 rounded-xl" 
                     style={{ backgroundImage: "url('https://images.pexels.com/photos/1303096/pexels-photo-1303096.jpeg?auto=compress&cs=tinysrgb&w=600')" }}>
                </div>
                <div className="relative z-10">
                  <div className="text-casino-gold text-3xl font-bold mb-1 transition-all duration-300 hover:scale-105">
                    💰 Pot: ${gameState.pot}
                  </div>
                  <div className="text-white text-sm font-medium">
                    Current Bet: ${gameState.currentBet}
                  </div>
                </div>
              </div>
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
                className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold text-xl px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🎲 Next Hand
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
          ) : (
            <div className="text-center">
              <div className="bg-casino-darkgreen/80 rounded-xl p-6 border-2 border-casino-gold/30 shadow-lg">
                <div className="text-casino-gold text-lg font-bold mb-2">
                  {gameState.currentActorIndex !== 0 ? "⏳ Waiting for other players..." : "✅ Hand complete"}
                </div>
                <div className="text-white text-sm">
                  {gameState.message}
                </div>
              </div>
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

        {/* Guidance Modal */}
        {showGuidance && (
          <GuidanceModal 
            gameState={gameState}
            onClose={() => setShowGuidance(false)} 
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

// Enhanced Player Display Component
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
  // In regular mode, only show cards for human player or during showdown
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
        
        <div className="flex justify-center space-x-2 mb-2">
          {player.hand.map((card, index) => (
            <FlippableCard
              key={index}
              card={card}
              isFaceUp={showCards}
              className="w-14 h-20 md:w-18 md:h-24"
            />
          ))}
        </div>

        {/* No peek functionality in regular mode - cards stay hidden until showdown */}
        {isBot && stage !== Stage.SHOWDOWN && (
          <div className="text-casino-gold/60 text-xs py-1">
            Cards Hidden
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Guidance Modal Component
function GuidanceModal({ 
  gameState, 
  onClose 
}: { 
  gameState: any; 
  onClose: () => void; 
}) {
  const [guidanceInfo, setGuidanceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const humanPlayer = gameState.players[0];
      const botPlayer = gameState.players[1]; // First bot for guidance
      
      if (!humanPlayer || !humanPlayer.hand || humanPlayer.hand.length === 0) {
        setError("No cards available for guidance");
        setLoading(false);
        return;
      }

      const guidance = GuidanceManager.updateGuidanceEnhanced(
        humanPlayer.hand,
        botPlayer?.hand || [],
        gameState.communityCards,
        gameState.stage,
        gameState.stage === Stage.SHOWDOWN,
        gameState.pot,
        gameState.currentBet
      );

      setGuidanceInfo(guidance);
      setLoading(false);
    } catch (err) {
      console.error("Error getting guidance:", err);
      setError("Unable to load guidance. Please try again.");
      setLoading(false);
    }
  }, [gameState]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-casino-darkgreen rounded-lg border-2 border-casino-gold max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-casino-gold text-2xl font-bold">Poker Guidance</h3>
            <button
              onClick={onClose}
              className="text-casino-gold hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-casino-gold"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">
              <p>{error}</p>
            </div>
          ) : guidanceInfo ? (
            <div className="space-y-6">
              {/* Current Stage */}
              <div className="bg-casino-green/30 rounded-lg p-4 border border-casino-gold/20">
                <h4 className="text-casino-gold font-bold mb-2">Current Stage</h4>
                <p className="text-white">{guidanceInfo.stage}</p>
              </div>

              {/* Your Hand */}
              <div className="bg-casino-green/30 rounded-lg p-4 border border-casino-gold/20">
                <h4 className="text-casino-gold font-bold mb-2">Your Hand</h4>
                <p className="text-white">{guidanceInfo.playerHand}</p>
                <p className="text-casino-gold text-sm mt-1">Strength: {guidanceInfo.handStrength}</p>
              </div>

              {/* Pot Odds */}
              {guidanceInfo.potOdds && (
                <div className="bg-casino-green/30 rounded-lg p-4 border border-casino-gold/20">
                  <h4 className="text-casino-gold font-bold mb-2">Pot Odds</h4>
                  <p className="text-white">{guidanceInfo.potOdds}</p>
                </div>
              )}

              {/* Strategic Advice */}
              <div className="bg-blue-600/20 rounded-lg p-4 border border-blue-400/30">
                <h4 className="text-blue-300 font-bold mb-2">Strategic Advice</h4>
                <p className="text-white">{guidanceInfo.advice}</p>
              </div>

              {/* Opponent Information */}
              <div className="bg-casino-green/30 rounded-lg p-4 border border-casino-gold/20">
                <h4 className="text-casino-gold font-bold mb-2">Opponent Hand</h4>
                <p className="text-white">{guidanceInfo.botHand}</p>
              </div>
            </div>
          ) : null}

          <button
            onClick={onClose}
            className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold px-6 py-3 rounded-lg mt-6 w-full"
          >
            Close Guidance
          </button>
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
