'use client';

import React from 'react';
import Link from 'next/link';

export default function GameOptionsPage() {
  return (
    <div className="min-h-screen felt-texture flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <button className="casino-button bg-casino-darkgreen hover:bg-casino-green text-white font-bold px-6 py-3 rounded-full transition-all duration-300">
              ← Back to Home
            </button>
          </Link>
        </div>

        {/* Decorative Chips Row Top */}
        <div className="flex justify-center items-center space-x-3 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-casino-gold to-yellow-600 border-4 border-white shadow-lg"
            />
          ))}
        </div>

        {/* Main Options Card */}
        <div className="bg-casino-darkgreen/90 backdrop-blur-sm rounded-2xl border-4 border-white shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
            Select a Game Option
          </h1>

          <div className="space-y-6">
            {/* Learn to Play Basic Poker - Active */}
            <Link href="/learn-poker">
              <button className="w-full casino-button bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xl py-6 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                🎓 Learn to Play Basic Poker
              </button>
            </Link>

            {/* Coming Soon Options - Disabled */}
            <button 
              disabled 
              className="w-full bg-gray-600 text-gray-400 font-bold text-xl py-6 px-8 rounded-xl cursor-not-allowed opacity-60"
            >
              🃏 Learn Texas Hold'em (Coming Soon)
            </button>

            <button 
              disabled 
              className="w-full bg-gray-600 text-gray-400 font-bold text-xl py-6 px-8 rounded-xl cursor-not-allowed opacity-60"
            >
              🎯 Learn Omaha Poker (Coming Soon)
            </button>

            <button 
              disabled 
              className="w-full bg-gray-600 text-gray-400 font-bold text-xl py-6 px-8 rounded-xl cursor-not-allowed opacity-60"
            >
              🎲 Learn to Play Blackjack (Coming Soon)
            </button>
          </div>

          {/* Info Text */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-lg">
              Start with Basic Poker to learn the fundamentals!
            </p>
            <p className="text-casino-gold text-sm mt-2">
              More games will be available soon
            </p>
          </div>
        </div>

        {/* Decorative Chips Row Bottom */}
        <div className="flex justify-center items-center space-x-3 mt-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-casino-gold to-yellow-600 border-4 border-white shadow-lg"
            />
          ))}
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="bg-casino-green/80 backdrop-blur-sm rounded-lg p-6 border border-casino-gold/30">
            <h3 className="text-casino-gold font-bold text-lg mb-3">🎮 What You'll Learn</h3>
            <ul className="text-white/90 text-sm space-y-2">
              <li>• Hand rankings and poker rules</li>
              <li>• Betting strategies and pot odds</li>
              <li>• Reading opponents and bluffing</li>
              <li>• Position play and table dynamics</li>
            </ul>
          </div>

          <div className="bg-casino-green/80 backdrop-blur-sm rounded-lg p-6 border border-casino-gold/30">
            <h3 className="text-casino-gold font-bold text-lg mb-3">🏆 Game Features</h3>
            <ul className="text-white/90 text-sm space-y-2">
              <li>• Interactive tutorials with guidance</li>
              <li>• AI opponents with adjustable difficulty</li>
              <li>• Real-time hints and strategy tips</li>
              <li>• Progress tracking and statistics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
