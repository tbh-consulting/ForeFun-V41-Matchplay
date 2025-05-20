import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Flag, ChevronLeft, ChevronRight, Calendar, Cloud, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [currentHole, setCurrentHole] = useState(1);
  const [selectedTee, setSelectedTee] = useState<'black' | 'white' | 'yellow' | 'blue' | 'red'>('white');
  const [distanceUnit, setDistanceUnit] = useState<'meters' | 'yards'>('meters');
  const [scores, setScores] = useState({
    1: { lolo: 3, theBrain: 4, nico: 5 },
    2: { lolo: 4, theBrain: 3, nico: 4 },
    3: { lolo: 5, theBrain: 5, nico: 4 }
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const holes = [
    { number: 1, par: 4, si: 13, distance: { white: 270 } },
    { number: 2, par: 3, si: 17, distance: { white: 165 } },
    { number: 3, par: 5, si: 5, distance: { white: 485 } }
  ];

  const currentHoleData = holes[currentHole - 1];

  const handlePrevHole = () => {
    if (currentHole > 1) {
      setCurrentHole(currentHole - 1);
    }
  };

  const handleNextHole = () => {
    if (currentHole < holes.length) {
      setCurrentHole(currentHole + 1);
    }
  };

  const handleScoreChange = (player: string, change: number) => {
    setScores(prev => ({
      ...prev,
      [currentHole]: {
        ...prev[currentHole as keyof typeof prev],
        [player]: Math.max(1, (prev[currentHole as keyof typeof prev][player as keyof typeof prev[keyof typeof prev]] || 0) + change)
      }
    }));
  };

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff === -2) return 'bg-blue-600 text-white';
    if (diff === -1) return 'text-blue-600 border-2 border-blue-600';
    if (diff === 0) return 'bg-green-600 text-white';
    if (diff === 1) return 'border-2 border-red-600 text-red-600';
    if (diff > 1) return 'bg-red-600 text-white';
    return '';
  };

  const getScoreLabel = (score: number, par: number) => {
    const diff = score - par;
    if (diff === -3) return 'Albatross';
    if (diff === -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double Bogey';
    if (diff === 3) return 'Triple Bogey';
    if (diff > 3) return 'Worse';
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="flex items-center gap-3">
                <Flag className="w-12 h-12 text-accent" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">ForeFun Golf</h1>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center lg:text-left">
              Elevate Your Golf Game
            </h2>
            
            <p className="text-lg text-gray-600 text-center lg:text-left">
              Track your progress, connect with fellow golfers, and discover amazing courses all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Sign In</Button>
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Scores</h3>
                <p className="text-gray-600">Record scores, track statistics, and monitor your progress over time.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect with Friends</h3>
                <p className="text-gray-600">Play together, share scorecards, and compete in friendly matches.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Discover Courses</h3>
                <p className="text-gray-600">Find new golf courses, read reviews, and plan your next round.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyze Your Game</h3>
                <p className="text-gray-600">Get insights into your strengths and weaknesses with detailed statistics.</p>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Scorecard */}
          <div className="flex justify-center">
            <div className="relative max-w-[320px] w-full">
              {/* iPhone Frame */}
              <div className="relative border-[14px] border-black rounded-[60px] shadow-xl bg-white overflow-hidden">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl z-10"></div>
                <div className="h-[600px] overflow-y-auto">
                  {/* Scorecard Header */}
                  <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center">
                    <button className="p-1 text-gray-500">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 flex-1 text-center">Scorecard Details</h2>
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                      </button>
                      <button className="p-1 text-gray-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="px-4 py-3 bg-white">
                    <h3 className="font-bold text-gray-900">Henri-Chapelle - Le Charlemagne</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>March 26, 2025</span>
                      <span className="mx-2">•</span>
                      <Cloud className="w-4 h-4 mr-1" />
                      <span>Cloudy</span>
                    </div>
                  </div>

                  {/* Tee Selection */}
                  <div className="px-4 py-3 bg-white border-t border-gray-100">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Tee:</p>
                      <div className="flex gap-2">
                        {[
                          { value: 'black', color: 'bg-gray-900' },
                          { value: 'white', color: 'bg-white border border-gray-300' },
                          { value: 'yellow', color: 'bg-yellow-400' },
                          { value: 'blue', color: 'bg-blue-500' },
                          { value: 'red', color: 'bg-red-500' }
                        ].map(tee => (
                          <button
                            key={tee.value}
                            onClick={() => setSelectedTee(tee.value as any)}
                            className={`
                              w-6 h-6 rounded-full flex items-center justify-center
                              ${tee.color}
                              ${selectedTee === tee.value ? 'ring-2 ring-accent ring-offset-2' : ''}
                              transition-all duration-200
                            `}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Distance:</p>
                      <div className="flex rounded-lg overflow-hidden shadow-sm">
                        <button
                          onClick={() => setDistanceUnit('meters')}
                          className={`
                            px-4 py-1.5 text-sm font-medium transition-colors
                            ${distanceUnit === 'meters'
                              ? 'bg-accent text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                            }
                            border-y border-l border-gray-200
                            rounded-l-lg
                          `}
                        >
                          Meters
                        </button>
                        <button
                          onClick={() => setDistanceUnit('yards')}
                          className={`
                            px-4 py-1.5 text-sm font-medium transition-colors
                            ${distanceUnit === 'yards'
                              ? 'bg-accent text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                            }
                            border border-gray-200
                            rounded-r-lg
                          `}
                        >
                          Yards
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hole Navigation */}
                  <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                    <button 
                      onClick={handlePrevHole}
                      disabled={currentHole === 1}
                      className="p-1 text-gray-400 hover:text-accent disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-lg font-semibold text-gray-900">
                      Hole {currentHoleData.number}
                    </div>
                    <button 
                      onClick={handleNextHole}
                      disabled={currentHole === holes.length}
                      className="p-1 text-gray-400 hover:text-accent disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Hole Info */}
                  <div className="px-4 py-3 bg-white border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xs text-gray-600">Par</div>
                        <div className="font-semibold">{currentHoleData.par}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">S.I.</div>
                        <div className="font-semibold">{currentHoleData.si}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Distance</div>
                        <div className="font-semibold">
                          {currentHoleData.distance[selectedTee] || currentHoleData.distance.white} {distanceUnit}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Player Scores */}
                  <div className="px-4 py-3 bg-white border-t border-gray-100">
                    {/* Player 1 */}
                    <div className="p-3 bg-gray-50 rounded-lg mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            LO
                          </div>
                          <div>
                            <div className="font-medium text-sm">Lolo</div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">HCP: 43.8</span>
                              <span className="text-accent text-xs font-medium">••</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center">
                            <button 
                              onClick={() => handleScoreChange('lolo', -1)}
                              className="p-1 text-gray-400 hover:text-accent"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className={`
                              w-7 h-7 mx-1 flex items-center justify-center font-medium
                              ${getScoreColor(scores[currentHole as keyof typeof scores].lolo, currentHoleData.par)}
                              rounded-lg
                            `}>
                              {scores[currentHole as keyof typeof scores].lolo}
                            </div>
                            <button 
                              onClick={() => handleScoreChange('lolo', 1)}
                              className="p-1 text-gray-400 hover:text-accent"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">
                            {getScoreLabel(scores[currentHole as keyof typeof scores].lolo, currentHoleData.par)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Player 2 */}
                    <div className="p-3 bg-gray-50 rounded-lg mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            TH
                          </div>
                          <div>
                            <div className="font-medium text-sm">TheBrain</div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">HCP: 14.7</span>
                              <span className="text-accent text-xs font-medium">•</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center">
                            <button 
                              onClick={() => handleScoreChange('theBrain', -1)}
                              className="p-1 text-gray-400 hover:text-accent"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className={`
                              w-7 h-7 mx-1 flex items-center justify-center font-medium
                              ${getScoreColor(scores[currentHole as keyof typeof scores].theBrain, currentHoleData.par)}
                              rounded-lg
                            `}>
                              {scores[currentHole as keyof typeof scores].theBrain}
                            </div>
                            <button 
                              onClick={() => handleScoreChange('theBrain', 1)}
                              className="p-1 text-gray-400 hover:text-accent"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">
                            {getScoreLabel(scores[currentHole as keyof typeof scores].theBrain, currentHoleData.par)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Player 3 */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            NI
                          </div>
                          <div>
                            <div className="font-medium text-sm">Nico</div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">HCP: 36</span>
                              <span className="text-accent text-xs font-medium">••</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center">
                            <button 
                              onClick={() => handleScoreChange('nico', -1)}
                              className="p-1 text-gray-400 hover:text-accent"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className={`
                              w-7 h-7 mx-1 flex items-center justify-center font-medium
                              ${getScoreColor(scores[currentHole as keyof typeof scores].nico, currentHoleData.par)}
                              rounded-lg
                            `}>
                              {scores[currentHole as keyof typeof scores].nico}
                            </div>
                            <button 
                              onClick={() => handleScoreChange('nico', 1)}
                              className="p-1 text-gray-400 hover:text-accent"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">
                            {getScoreLabel(scores[currentHole as keyof typeof scores].nico, currentHoleData.par)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pagination Dots */}
                  <div className="px-4 py-3 bg-white border-t border-gray-100 flex justify-center items-center gap-1">
                    {holes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentHole(index + 1)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index + 1 === currentHole
                            ? 'bg-accent w-4'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-black rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Track Your Progress with Detailed Stats
          </h2>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Scoring Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Scoring Distribution</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-purple-700 mb-1">Hole in One</div>
                  <div className="text-2xl font-bold text-purple-700">1</div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-indigo-700 mb-1">Albatross</div>
                  <div className="text-2xl font-bold text-indigo-700">2</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-blue-700 mb-1">Eagle</div>
                  <div className="text-2xl font-bold text-blue-700">5</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-green-700 mb-1">Birdie</div>
                  <div className="text-2xl font-bold text-green-700">18</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">Par</div>
                  <div className="text-2xl font-bold text-gray-700">42</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-yellow-700 mb-1">Bogey</div>
                  <div className="text-2xl font-bold text-yellow-700">36</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-orange-700 mb-1">Double</div>
                  <div className="text-2xl font-bold text-orange-700">24</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-red-700 mb-1">Triple</div>
                  <div className="text-2xl font-bold text-red-700">12</div>
                </div>
                
                <div className="bg-rose-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-rose-700 mb-1">Worse</div>
                  <div className="text-2xl font-bold text-rose-700">8</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance by Par */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Performance by Par</h3>
              
              <div className="ml-auto relative group">
                <svg className="w-5 h-5 text-gray-400 cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <div className="absolute right-0 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
                  <p className="mb-2">
                    The percentage shows your improvement compared to your previous rounds:
                  </p>
                  <ul className="space-y-1 list-disc pl-4">
                    <li>↓ Green percentage means better scoring (lower is better)</li>
                    <li>↑ Red percentage means higher scoring (needs improvement)</li>
                    <li>Based on your last 20 holes vs previous holes</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Par 3</span>
                  <span className="text-lg font-semibold text-gray-900">3.9</span>
                </div>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>Played: 34</span>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600" title="8.6% better than your previous rounds">
                      ↓ 8.6%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Par 4</span>
                  <span className="text-lg font-semibold text-gray-900">4.7</span>
                </div>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>Played: 62</span>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600" title="9.2% better than your previous rounds">
                      ↓ 9.2%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Par 5</span>
                  <span className="text-lg font-semibold text-red-600">6.6</span>
                </div>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>Played: 21</span>
                  <div className="flex items-center gap-1">
                    <span className="text-red-600" title="32.0% worse than your previous rounds">
                      ↑ 32.0%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-accent to-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to improve your golf game?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of golfers who are tracking their progress and connecting with friends on ForeFun Golf.
          </p>
          <Link to="/register">
            <Button variant="primary" className="bg-white text-accent hover:bg-gray-100">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}