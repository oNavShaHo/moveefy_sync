"use client";

import { ArrowRight, Music, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Moveify
            </span>
          </div>
          <div className="text-sm text-slate-600">by Navdeep Shah</div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Sync Music & Movies <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                With Minimal Internet
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Create collaborative rooms and enjoy seamless music and movie
              experiences with your friends using incredibly low bandwidth.
              Perfect for low-connectivity environments.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-12">
            <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-purple-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Ultra Low Bandwidth
              </h3>
              <p className="text-sm text-slate-600">
                Uses minimal internet for syncing, perfect for slow connections
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-purple-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Collaborative Rooms
              </h3>
              <p className="text-sm text-slate-600">
                Create rooms and invite friends to enjoy together in real-time
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-purple-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4 mx-auto">
                <Music className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Music & Movies
              </h3>
              <p className="text-sm text-slate-600">
                Stream both music and movies with perfect synchronization
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Divider */}
          <div className="py-8">
            <div className="border-t border-slate-200" />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8">
            <div>
              <p className="text-slate-600 text-sm mb-2">OPTIMIZED FOR</p>
              <p className="text-2xl font-bold text-slate-900">
                Low Connectivity
              </p>
              <p className="text-slate-600 text-sm mt-2">
                Works in areas with limited internet access
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-2">PERFECT FOR</p>
              <p className="text-2xl font-bold text-slate-900">
                Group Experiences
              </p>
              <p className="text-slate-600 text-sm mt-2">
                Share music and movies with friends instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600">
          <p>Moveify • Created by Navdeep Shah • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

