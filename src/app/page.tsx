'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen felt-texture flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Hero Image */}
        <div className="mb-8">
          <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden shadow-2xl">
            <Image
              src="https://images.pexels.com/photos/373076/pexels-photo-373076.jpeg"
              alt="Casino Table"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Welcome to Play Smart Cards!
          </h1>
          <p className="text-xl md:text-2xl text-casino-gold mb-2 font-medium">
            Learn casino-style card games and master your skills!
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            From beginner tutorials to advanced gameplay, become a poker pro with our interactive learning system.
          </p>
        </div>

        {/* Main CTA Button */}
        <div className="mb-16">
          <Link href="/game-options">
            <button className="casino-button bg-casino-gold hover:bg-yellow-500 text-casino-green font-bold text-xl px-12 py-4 rounded-xl transition-all duration-300 transform hover:scale-105">
              Start Game
            </button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-casino-darkgreen/80 backdrop-blur-sm rounded-lg p-6 border border-casino-gold/20">
            <div className="text-casino-gold text-3xl mb-3">🎓</div>
            <h3 className="text-white font-bold text-lg mb-2">Learn</h3>
            <p className="text-white/80 text-sm">
              Step-by-step tutorials and guided walkthroughs for beginners
            </p>
          </div>
          
          <div className="bg-casino-darkgreen/80 backdrop-blur-sm rounded-lg p-6 border border-casino-gold/20">
            <div className="text-casino-gold text-3xl mb-3">🎯</div>
            <h3 className="text-white font-bold text-lg mb-2">Practice</h3>
            <p className="text-white/80 text-sm">
              Interactive guidance mode with real-time hints and advice
            </p>
          </div>
          
          <div className="bg-casino-darkgreen/80 backdrop-blur-sm rounded-lg p-6 border border-casino-gold/20">
            <div className="text-casino-gold text-3xl mb-3">🏆</div>
            <h3 className="text-white font-bold text-lg mb-2">Master</h3>
            <p className="text-white/80 text-sm">
              Challenge AI opponents and test your skills in real gameplay
            </p>
          </div>
        </div>

        {/* Decorative Chips Row */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-casino-gold to-yellow-600 border-4 border-white shadow-lg chip-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {/* Footer Message */}
        <p className="text-white/80 text-lg font-medium">
          Have fun and good luck! 🍀
        </p>
      </div>
    </div>
  );
}
