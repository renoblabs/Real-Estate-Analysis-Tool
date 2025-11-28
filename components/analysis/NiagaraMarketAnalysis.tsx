'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp, MapPin, DollarSign, Home, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const NIAGARA_MARKET_DATA = {
  overview: {
    averagePrice: 670103,
    priceChange: -4.24,
    salesVolume: 502,
    salesChange: -5.64,
    newListings: 1366,
    listingsChange: 2.94,
    activeListings: 3383,
    inventoryChange: 6.22,
    daysOnMarket: 45,
    domChange: 12.5
  },
  opportunities: [
    {
      city: 'St. Catharines',
      avgPrice: 670103,
      rentYield: 6.8,
      priceChange: -4.2,
      opportunity: 'Deep correction creating buyer opportunities',
      score: 85,
      highlights: [
        'Strong buyers market (3:1 listing ratio)',
        'Well-priced homes still selling',
        'High rental demand from students/workers',
        'Major city amenities and infrastructure'
      ]
    },
    {
      city: 'Welland',
      avgPrice: 580000,
      rentYield: 8.1,
      priceChange: -2.5,
      opportunity: 'Highest cash flow potential in region',
      score: 82,
      highlights: [
        '$6.8M government housing investment',
        'Most affordable entry point',
        'Strong local workforce demand',
        'Achieving housing development targets'
      ]
    },
    {
      city: 'Fort Erie',
      avgPrice: 520000,
      rentYield: 7.8,
      priceChange: -1.8,
      opportunity: 'Border benefits and lakefront access',
      score: 78,
      highlights: [
        'Peace Bridge proximity',
        'Cross-border worker appeal',
        'Lakefront and canal properties',
        'Improved buyer selection'
      ]
    },
    {
      city: 'Niagara Falls',
      avgPrice: 650000,
      rentYield: 7.2,
      priceChange: -3.8,
      opportunity: 'Tourism recovery driving rentals',
      score: 75,
      highlights: [
        'Strong tourism recovery',
        'Short-term rental potential',
        'Infrastructure investments',
        'Seasonal rental premiums'
      ]
    }
  ],
  propertyTypes: [
    { type: 'Detached', avgPrice: 712867, change: -2.34, recommendation: 'Strong' },
    { type: 'Semi-detached', avgPrice: 541898, change: -4.44, recommendation: 'Good' },
    { type: 'Townhouse', avgPrice: 629095, change: -4.80, recommendation: 'Good' },
    { type: 'Condo', avgPrice: 380512, change: -21.71, recommendation: 'Excellent Entry Point' }
  ],
  investmentStrategies: [
    {
      strategy: 'BRRRR',
      suitability: 90,
      reason: 'High inventory + motivated sellers + strong rental demand',
      bestAreas: ['St. Catharines', 'Welland'],
      timeline: '6-12 months'
    },
    {
      strategy: 'Buy & Hold',
      suitability: 85,
      reason: 'Stable rental market + price correction opportunity',
      bestAreas: ['All Niagara cities'],
      timeline: '3-5 years'
    },
    {
      strategy: 'Short-term Rental',
      suitability: 75,
      reason: 'Tourism recovery + border proximity',
      bestAreas: ['Niagara Falls', 'Fort Erie'],
      timeline: '1-2 years'
    },
    {
      strategy: 'Multi-family Development',
      suitability: 70,
      reason: 'Government housing incentives + workforce demand',
      bestAreas: ['Welland', 'St. Catharines'],
      timeline: '2-4 years'
    }
  ]
};

export default function NiagaraMarketAnalysis() {
  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Niagara Region Market Overview - Fall 2024
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>🎯 Excellent Buyer's Market</AlertTitle>
            <AlertDescription>
              Niagara is experiencing a deep market correction with record inventory levels. 
              This creates exceptional opportunities for investors with cash or strong financing.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(NIAGARA_MARKET_DATA.overview.averagePrice)}</div>
              <div className="text-sm text-muted-foreground">Average Price</div>
              <div className="flex items-center justify-center gap-1 text-green-600">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">{Math.abs(NIAGARA_MARKET_DATA.overview.priceChange)}% YoY</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{NIAGARA_MARKET_DATA.overview.activeListings}</div>
              <div className="text-sm text-muted-foreground">Active Listings</div>
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+{NIAGARA_MARKET_DATA.overview.inventoryChange}% YoY</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{NIAGARA_MARKET_DATA.overview.daysOnMarket}</div>
              <div className="text-sm text-muted-foreground">Days on Market</div>
              <div className="flex items-center justify-center gap-1 text-orange-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+{NIAGARA_MARKET_DATA.overview.domChange}% YoY</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">3:1</div>
              <div className="text-sm text-muted-foreground">Listing:Sales Ratio</div>
              <div className="text-sm text-green-600 font-medium">Strong Buyer's Market</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* City Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-green-600" />
            Top Investment Opportunities by City
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NIAGARA_MARKET_DATA.opportunities.map((city, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{city.city}</h3>
                  <div className="text-right">
                    <div className="text-sm font-medium">Score: {city.score}/100</div>
                    <Progress value={city.score} className="w-16 h-2" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Avg Price: {formatCurrency(city.avgPrice)}</div>
                  <div>Rent Yield: {city.rentYield}%</div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">{Math.abs(city.priceChange)}% correction</span>
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {city.score >= 80 ? 'Excellent' : city.score >= 70 ? 'Good' : 'Fair'}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground italic">{city.opportunity}</p>
                
                <div className="space-y-1">
                  {city.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Types Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            Property Type Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {NIAGARA_MARKET_DATA.propertyTypes.map((type, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">{type.type}</h3>
                <div className="text-lg font-bold">{formatCurrency(type.avgPrice)}</div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">{Math.abs(type.change)}% down</span>
                </div>
                <Badge 
                  variant={type.recommendation === 'Excellent Entry Point' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {type.recommendation}
                </Badge>
              </div>
            ))}
          </div>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>🏠 Condo Opportunity Alert</AlertTitle>
            <AlertDescription>
              Condos are down 21.7% YoY - this represents an exceptional entry point for investors. 
              Consider well-located condos in St. Catharines or Niagara Falls for strong rental yields.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Investment Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Recommended Investment Strategies for Niagara
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {NIAGARA_MARKET_DATA.investmentStrategies.map((strategy, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{strategy.strategy}</h3>
                  <div className="text-right">
                    <div className="text-sm font-medium">Suitability: {strategy.suitability}%</div>
                    <Progress value={strategy.suitability} className="w-20 h-2" />
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{strategy.reason}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Best Areas: </span>
                    {strategy.bestAreas.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Timeline: </span>
                    {strategy.timeline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Your Niagara Investment Action Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Immediate Actions (Next 30 Days)</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Get pre-approved for financing - rates are favorable</li>
                  <li>Start monitoring listings in St. Catharines and Welland</li>
                  <li>Connect with local real estate agents familiar with investment properties</li>
                  <li>Research rental rates in target neighborhoods</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Market Timing Considerations</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Winter months (Nov-Feb) typically offer best buyer opportunities</li>
                  <li>Motivated sellers are pricing aggressively to close before year-end</li>
                  <li>Interest rate cuts expected to continue - but don't wait too long</li>
                  <li>Spring 2025 may see increased buyer competition</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertTitle>Financial Preparation</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Target properties under $600K for best cash flow potential</li>
                  <li>Consider 20% down to avoid CMHC fees on investment properties</li>
                  <li>Budget for 6-month holding costs due to longer sale timelines</li>
                  <li>Factor in renovation costs - many properties need updates</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}