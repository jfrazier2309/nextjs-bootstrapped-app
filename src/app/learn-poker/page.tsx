'use client';

import React from 'react';
import Link from 'next/link';

export default function LearnPokerPage() {
  return (
    <div className="min-h-screen felt-texture flex items-center justify-center p-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/game-options">
            <button className="casino-button bg-casino-darkgreen hover:bg-casino-green text-white font-bold px-6 py-3 rounded-full transition-all duration-300">
              ← Back to Game Options
            </button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-casino-darkgreen/90 backdrop-blur-sm rounded-2xl border-4 border-casino-gold shadow-2xl p-8 md:p-12">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
            Learn to Play Poker
          </h1>

          {/* Option Buttons */}
          <div className="space-y-6">
            {/* Walkthrough */}
            <Link href="/walkthrough">
              <button className="w-full casino-button bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xl py-6 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                📚 Walkthrough
                <p className="text-sm font-normal mt-2 opacity-90">
                  Step-by-step tutorial covering poker basics, rules, and hand rankings
                </p>
              </button>
            </Link>

            {/* Guided Playthrough */}
            <Link href="/guided-playthrough">
              <button className="w-full casino-button bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-xl py-6 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                🎯 Guided Playthrough
                <p className="text-sm font-normal mt-2 opacity-90">
                  Interactive gameplay with real-time hints, tips, and strategic guidance
                </p>
              </button>
            </Link>

            {/* Play Game */}
            <Link href="/play-game">
              <button className="w-full casino-button bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xl py-6 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                🎮 Play Game
                <p className="text-sm font-normal mt-2 opacity-90">
                  Challenge AI opponents in full poker gameplay without assistance
                </p>
              </button>
            </Link>
          </div>

          {/* Learning Path Info */}
          <div className="mt-12 bg-casino-green/50 rounded-lg p-6 border border-casino-gold/30">
            <h3 className="text-casino-gold font-bold text-lg mb-4 text-center">
              🎓 Recommended Learning Path
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="text-white">
                <div className="text-2xl mb-2">1️⃣</div>
                <p className="font-semibold">Start with Walkthrough</p>
                <p className="text-sm opacity-80">Learn the basics</p>
              </div>
              <div className="text-white">
                <div className="text-2xl mb-2">2️⃣</div>
                <p className="font-semibold">Try Guided Playthrough</p>
                <p className="text-sm opacity-80">Practice with help</p>
              </div>
              <div className="text-white">
                <div className="text-2xl mb-2">3️⃣</div>
                <p className="font-semibold">Play Independently</p>
                <p className="text-sm opacity-80">Test your skills</p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-casino-green/30 rounded-lg p-4 border border-casino-gold/20">
              <h4 className="text-casino-gold font-bold mb-2">💡 Quick Tips</h4>
              <ul className="text-white/90 text-sm space-y-1">
                <li>• Start tight - play premium hands</li>
                <li>• Position matters - act last when possible</li>
                <li>• Watch your opponents for tells</li>
                <li>• Manage your bankroll carefully</li>
              </ul>
            </div>
            
            <div className="bg-casino-green/30 rounded-lg p-4 border border-casino-gold/20">
              <h4 className="text-casino-gold font-bold mb-2">🎯 Key Skills</h4>
              <ul className="text-white/90 text-sm space-y-1">
                <li>• Hand ranking memorization</li>
                <li>• Pot odds calculation</li>
                <li>• Betting pattern recognition</li>
                <li>• Emotional control (tilt management)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-lg bg-white shadow-lg flex items-center justify-center text-2xl"
            >
              {['♠', '♥', '♦'][i]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
