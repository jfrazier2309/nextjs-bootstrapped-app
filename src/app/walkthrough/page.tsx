'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PlayingCard from '@/components/PlayingCard';
import { Card, HandType } from '@/lib/gameLogic';
import { GuidanceManager } from '@/lib/guidance';

export default function WalkthroughPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showExampleCards, setShowExampleCards] = useState(false);

  const walkthroughSteps = [
    {
      title: "Welcome to Poker!",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            Poker is a card game where players compete to make the best five-card hand using their hole cards and community cards.
          </p>
          <div className="bg-casino-green/30 p-4 rounded-lg border border-casino-gold/20">
            <h4 className="text-casino-gold font-bold mb-2">What You'll Learn:</h4>
            <ul className="text-white space-y-1">
              <li>• Basic poker rules and gameplay</li>
              <li>• Hand rankings from high card to royal flush</li>
              <li>• Betting actions and strategies</li>
              <li>• Reading the board and calculating odds</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "The Basics",
      content: (
        <div className="space-y-4">
          <p>In Texas Hold'em poker:</p>
          <ul className="text-white space-y-2">
            <li>• Each player gets 2 private cards (hole cards)</li>
            <li>• 5 community cards are dealt face-up on the table</li>
            <li>• Players make the best 5-card hand using any combination</li>
            <li>• There are 4 betting rounds: Pre-flop, Flop, Turn, River</li>
          </ul>
          <div className="bg-casino-darkgreen/50 p-4 rounded-lg">
            <p className="text-casino-gold font-semibold">🎯 Goal:</p>
            <p>Win chips by having the best hand or making opponents fold!</p>
          </div>
        </div>
      )
    },
    {
      title: "Hand Rankings",
      content: (
        <div className="space-y-4">
          <p>Poker hands are ranked from strongest to weakest:</p>
          <div className="grid gap-2 text-sm">
            {GuidanceManager.getHandRankings().slice(0, 5).map((hand, index) => (
              <div key={index} className="bg-casino-green/20 p-2 rounded border border-casino-gold/20">
                <div className="flex justify-between">
                  <span className="font-bold">{index + 1}. {hand.hand}</span>
                  <span className="text-casino-gold font-mono text-xs">{hand.example}</span>
                </div>
                <p className="text-xs text-white/80">{hand.description}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowExampleCards(!showExampleCards)}
            className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green px-4 py-2 rounded-lg"
          >
            {showExampleCards ? 'Hide' : 'Show'} Example Cards
          </button>
        </div>
      )
    },
    {
      title: "Betting Actions",
      content: (
        <div className="space-y-4">
          <p>During each betting round, you can:</p>
          <div className="grid gap-3">
            <div className="bg-red-600/20 p-3 rounded border border-red-400/30">
              <h4 className="text-red-400 font-bold">Fold</h4>
              <p className="text-sm">Give up your hand and forfeit any chips already bet</p>
            </div>
            <div className="bg-blue-600/20 p-3 rounded border border-blue-400/30">
              <h4 className="text-blue-400 font-bold">Check</h4>
              <p className="text-sm">Pass the action without betting (only if no bet to call)</p>
            </div>
            <div className="bg-green-600/20 p-3 rounded border border-green-400/30">
              <h4 className="text-green-400 font-bold">Call</h4>
              <p className="text-sm">Match the current bet to stay in the hand</p>
            </div>
            <div className="bg-purple-600/20 p-3 rounded border border-purple-400/30">
              <h4 className="text-purple-400 font-bold">Raise</h4>
              <p className="text-sm">Increase the bet, forcing others to call or fold</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Game Flow",
      content: (
        <div className="space-y-4">
          <p>A typical hand follows this sequence:</p>
          <div className="space-y-3">
            <div className="bg-casino-green/20 p-3 rounded">
              <h4 className="text-casino-gold font-bold">1. Pre-Flop</h4>
              <p className="text-sm">Players receive 2 hole cards. First betting round.</p>
            </div>
            <div className="bg-casino-green/20 p-3 rounded">
              <h4 className="text-casino-gold font-bold">2. Flop</h4>
              <p className="text-sm">3 community cards dealt. Second betting round.</p>
            </div>
            <div className="bg-casino-green/20 p-3 rounded">
              <h4 className="text-casino-gold font-bold">3. Turn</h4>
              <p className="text-sm">4th community card dealt. Third betting round.</p>
            </div>
            <div className="bg-casino-green/20 p-3 rounded">
              <h4 className="text-casino-gold font-bold">4. River</h4>
              <p className="text-sm">5th community card dealt. Final betting round.</p>
            </div>
            <div className="bg-casino-green/20 p-3 rounded">
              <h4 className="text-casino-gold font-bold">5. Showdown</h4>
              <p className="text-sm">Remaining players reveal hands. Best hand wins!</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Basic Strategy Tips",
      content: (
        <div className="space-y-4">
          <p>Essential tips for new players:</p>
          <div className="grid gap-3">
            <div className="bg-casino-darkgreen/50 p-3 rounded border border-casino-gold/20">
              <h4 className="text-casino-gold font-bold">🎯 Play Tight</h4>
              <p className="text-sm">Only play strong starting hands, especially as a beginner</p>
            </div>
            <div className="bg-casino-darkgreen/50 p-3 rounded border border-casino-gold/20">
              <h4 className="text-casino-gold font-bold">📍 Position Matters</h4>
              <p className="text-sm">Acting last gives you more information about opponents</p>
            </div>
            <div className="bg-casino-darkgreen/50 p-3 rounded border border-casino-gold/20">
              <h4 className="text-casino-gold font-bold">💰 Manage Your Bankroll</h4>
              <p className="text-sm">Don't risk more than you can afford to lose</p>
            </div>
            <div className="bg-casino-darkgreen/50 p-3 rounded border border-casino-gold/20">
              <h4 className="text-casino-gold font-bold">🧠 Stay Focused</h4>
              <p className="text-sm">Pay attention to opponents' betting patterns and tells</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Play!",
      content: (
        <div className="space-y-6 text-center">
          <p className="text-lg">
            Congratulations! You now know the basics of poker.
          </p>
          <div className="bg-casino-gold/20 p-6 rounded-lg border border-casino-gold/50">
            <h4 className="text-casino-gold font-bold text-xl mb-4">Next Steps:</h4>
            <div className="space-y-4">
              <Link href="/guided-playthrough">
                <button className="casino-button bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full">
                  🎯 Try Guided Playthrough
                  <p className="text-sm font-normal mt-1">Practice with real-time guidance</p>
                </button>
              </Link>
              <Link href="/play-game">
                <button className="casino-button bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg w-full">
                  🎮 Play Independent Game
                  <p className="text-sm font-normal mt-1">Test your skills without help</p>
                </button>
              </Link>
            </div>
          </div>
          <p className="text-casino-gold">
            Remember: Practice makes perfect! 🏆
          </p>
        </div>
      )
    }
  ];

  const currentStepData = walkthroughSteps[currentStep];

  return (
    <div className="min-h-screen felt-texture p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-casino-darkgreen/90 rounded-lg p-4 mb-6 border border-casino-gold/30">
          <div className="flex justify-between items-center">
            <Link href="/learn-poker">
              <button className="casino-button bg-casino-green hover:bg-casino-darkgreen text-white px-4 py-2 rounded-lg">
                ← Back to Learn Poker
              </button>
            </Link>
            <h1 className="text-casino-gold text-2xl font-bold">Poker Walkthrough</h1>
            <div className="text-white text-sm">
              Step {currentStep + 1} of {walkthroughSteps.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-casino-darkgreen/50 rounded-full h-3 border border-casino-gold/30">
            <div 
              className="bg-gradient-to-r from-casino-gold to-yellow-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / walkthroughSteps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-white text-xs">
            <span>Start</span>
            <span>{Math.round(((currentStep + 1) / walkthroughSteps.length) * 100)}% Complete</span>
            <span>Finish</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-casino-darkgreen/90 rounded-2xl border-2 border-casino-gold/50 p-8 mb-8">
          <h2 className="text-casino-gold text-3xl font-bold mb-6 text-center">
            {currentStepData.title}
          </h2>
          
          <div className="text-white leading-relaxed">
            {currentStepData.content}
          </div>

          {/* Example Cards Display */}
          {showExampleCards && currentStep === 2 && (
            <div className="mt-6 p-4 bg-casino-green/20 rounded-lg border border-casino-gold/30">
              <h4 className="text-casino-gold font-bold mb-4">Example: Royal Flush</h4>
              <div className="flex justify-center space-x-2">
                {[
                  { rank: 14, suit: 0, imageUrl: 'https://deckofcardsapi.com/static/img/AS.png' },
                  { rank: 13, suit: 0, imageUrl: 'https://deckofcardsapi.com/static/img/KS.png' },
                  { rank: 12, suit: 0, imageUrl: 'https://deckofcardsapi.com/static/img/QS.png' },
                  { rank: 11, suit: 0, imageUrl: 'https://deckofcardsapi.com/static/img/JS.png' },
                  { rank: 10, suit: 0, imageUrl: 'https://deckofcardsapi.com/static/img/0S.png' }
                ].map((card, index) => (
                  <PlayingCard
                    key={index}
                    card={card as Card}
                    className="w-12 h-16 md:w-16 md:h-20"
                  />
                ))}
              </div>
              <p className="text-center text-sm mt-2 text-casino-gold">
                The strongest possible hand in poker!
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="casino-button bg-casino-green hover:bg-casino-darkgreen disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg"
          >
            ← Previous
          </button>

          <div className="flex space-x-2">
            {walkthroughSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-casino-gold' 
                    : index < currentStep 
                      ? 'bg-casino-gold/60' 
                      : 'bg-casino-green/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(walkthroughSteps.length - 1, currentStep + 1))}
            disabled={currentStep === walkthroughSteps.length - 1}
            className="casino-button bg-casino-gold hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-casino-green font-bold px-6 py-3 rounded-lg"
          >
            Next →
          </button>
        </div>

        {/* Quick Reference Card */}
        <div className="mt-8 bg-casino-darkgreen/80 rounded-lg p-6 border border-casino-gold/30">
          <h3 className="text-casino-gold font-bold text-lg mb-4 text-center">Quick Reference</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="text-casino-gold font-semibold mb-2">Strong Starting Hands</h4>
              <ul className="text-white space-y-1">
                <li>• AA, KK, QQ (Premium pairs)</li>
                <li>• AK, AQ (Strong aces)</li>
                <li>• JJ, TT (Good pairs)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-casino-gold font-semibold mb-2">Betting Guidelines</h4>
              <ul className="text-white space-y-1">
                <li>• Raise with strong hands</li>
                <li>• Call with decent hands</li>
                <li>• Fold weak hands</li>
              </ul>
            </div>
            <div>
              <h4 className="text-casino-gold font-semibold mb-2">Key Concepts</h4>
              <ul className="text-white space-y-1">
                <li>• Position is power</li>
                <li>• Pot odds matter</li>
                <li>• Observe opponents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
