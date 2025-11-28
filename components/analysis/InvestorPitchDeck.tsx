'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  DollarSign, 
  Home, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Calendar,
  Shield,
  Zap,
  Award,
  MapPin
} from 'lucide-react';

const PITCH_DATA = {
  opportunity: {
    title: "Port Colborne ADU Goldmine",
    subtitle: "4-Unit Zoning + $4.3M Government Funding + Market Correction",
    targetReturns: "15-25% IRR",
    investmentSize: "$100K-$500K",
    timeline: "6-18 months"
  },
  marketData: {
    avgPrice: 480000,
    rentalYield: 7.8,
    vacancyRate: 6.5,
    priceCorrection: -15,
    inventory: 3383,
    listingRatio: "3:1"
  },
  sampleDeal: {
    purchasePrice: 450000,
    downPayment: 90000,
    renovationCost: 120000,
    federalLoan: -80000,
    diyLaborSavings: -25000,
    totalInvestment: 120000,
    monthlyRent: 6300,
    monthlyExpenses: 3365,
    netCashFlow: 2935,
    cashOnCashReturn: 29.4,
    capRate: 12.8
  },
  advantages: [
    {
      icon: MapPin,
      title: "Local Connections",
      description: "Father's legal practice + contractor network",
      value: "Insider access"
    },
    {
      icon: Home,
      title: "DIY Capabilities", 
      description: "$15K-$30K savings per project",
      value: "Higher margins"
    },
    {
      icon: Target,
      title: "Data-Driven",
      description: "Custom analysis platform + deal scoring",
      value: "Better decisions"
    },
    {
      icon: Zap,
      title: "First-Mover",
      description: "New zoning laws = less competition",
      value: "Market advantage"
    }
  ],
  investmentTiers: [
    {
      name: "Bronze Partner",
      investment: 50000,
      equity: "10%",
      expectedReturn: "15-20% IRR",
      timeline: "2-3 years",
      type: "Passive investment"
    },
    {
      name: "Silver Partner", 
      investment: 150000,
      equity: "25%",
      expectedReturn: "18-23% IRR",
      timeline: "3-4 years",
      type: "Quarterly updates"
    },
    {
      name: "Gold Partner",
      investment: 300000,
      equity: "35%",
      expectedReturn: "20-25% IRR", 
      timeline: "3-5 years",
      type: "Advisory role"
    }
  ],
  timeline: [
    {
      phase: "Foundation",
      months: "1-2",
      tasks: ["Secure funding", "Identify properties", "Legal structure", "Government programs"]
    },
    {
      phase: "Acquisition",
      months: "3-4", 
      tasks: ["Purchase property", "Secure permits", "Begin conversion", "ADU loans"]
    },
    {
      phase: "Execution",
      months: "5-8",
      tasks: ["Complete renovations", "Market units", "Full occupancy", "Refinance"]
    },
    {
      phase: "Scale",
      months: "9-12",
      tasks: ["Second property", "Repeat process", "Build portfolio", "Optimize"]
    }
  ]
};

export default function InvestorPitchDeck() {
  const [selectedTier, setSelectedTier] = useState(1);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            🏠 {PITCH_DATA.opportunity.title}
          </CardTitle>
          <p className="text-xl text-center opacity-90">
            {PITCH_DATA.opportunity.subtitle}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{PITCH_DATA.opportunity.targetReturns}</div>
              <div className="text-sm opacity-80">Target Returns</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{PITCH_DATA.opportunity.investmentSize}</div>
              <div className="text-sm opacity-80">Investment Size</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{PITCH_DATA.opportunity.timeline}</div>
              <div className="text-sm opacity-80">Timeline</div>
            </div>
            <div>
              <div className="text-2xl font-bold">4 Units</div>
              <div className="text-sm opacity-80">Max Per Property</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="opportunity" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="deal">Sample Deal</TabsTrigger>
          <TabsTrigger value="advantages">Advantages</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Opportunity Tab */}
        <TabsContent value="opportunity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  Regulatory Tailwinds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">4 units per property (NEW)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">$4.3M Housing Accelerator Fund</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">$80K Federal ADU loans</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Streamlined approvals</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Market Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">15% below Niagara average</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">High inventory (buyer's market)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Motivated sellers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Interest rate cuts</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Our Advantages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Local legal connections</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">DIY construction skills</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">First-mover advantage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Market expertise</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>🚨 Limited Time Opportunity</AlertTitle>
            <AlertDescription>
              Government programs are launching NOW, zoning laws just changed, and the market has corrected. 
              This window won't stay open long - early movers will capture the best deals.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{formatCurrency(PITCH_DATA.marketData.avgPrice)}</div>
                <div className="text-sm text-muted-foreground">Average Price</div>
                <Badge variant="secondary" className="mt-2">15% below Niagara</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{PITCH_DATA.marketData.rentalYield}%</div>
                <div className="text-sm text-muted-foreground">Rental Yield</div>
                <Badge variant="default" className="mt-2">Above average</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{PITCH_DATA.marketData.vacancyRate}%</div>
                <div className="text-sm text-muted-foreground">Vacancy Rate</div>
                <Badge variant="secondary" className="mt-2">Manageable</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{PITCH_DATA.marketData.listingRatio}</div>
                <div className="text-sm text-muted-foreground">Listing:Sales</div>
                <Badge variant="default" className="mt-2">Buyer's market</Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Port Colborne vs Niagara Region</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium border-b pb-2">
                  <div>City</div>
                  <div>Avg Price</div>
                  <div>Yield</div>
                  <div>Opportunity</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>St. Catharines</div>
                  <div>$670K</div>
                  <div>6.8%</div>
                  <div>High prices</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>Welland</div>
                  <div>$580K</div>
                  <div>8.1%</div>
                  <div>Good value</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>Fort Erie</div>
                  <div>$520K</div>
                  <div>7.8%</div>
                  <div>Border benefits</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm font-bold bg-green-50 p-2 rounded">
                  <div>Port Colborne ⭐</div>
                  <div>$480K</div>
                  <div>7.8%</div>
                  <div>BEST VALUE + NEW ZONING</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sample Deal Tab */}
        <TabsContent value="deal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sample Deal: Port Colborne 4-Unit Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Investment Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Purchase Price:</span>
                      <span>{formatCurrency(PITCH_DATA.sampleDeal.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Down Payment (20%):</span>
                      <span>{formatCurrency(PITCH_DATA.sampleDeal.downPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Renovation Cost:</span>
                      <span>{formatCurrency(PITCH_DATA.sampleDeal.renovationCost)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Federal ADU Loan:</span>
                      <span>{formatCurrency(PITCH_DATA.sampleDeal.federalLoan)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>DIY Labor Savings:</span>
                      <span>{formatCurrency(PITCH_DATA.sampleDeal.diyLaborSavings)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Investment:</span>
                      <span>{formatCurrency(PITCH_DATA.sampleDeal.totalInvestment)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Monthly Cash Flow</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Unit 1 (Main):</span>
                      <span>$1,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unit 2 (Basement):</span>
                      <span>$1,400</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unit 3 (Garage ADU):</span>
                      <span>$1,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unit 4 (Addition):</span>
                      <span>$1,600</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Monthly Rent:</span>
                      <span>${PITCH_DATA.sampleDeal.monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Expenses:</span>
                      <span>-${PITCH_DATA.sampleDeal.monthlyExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600 border-t pt-2">
                      <span>Net Cash Flow:</span>
                      <span>${PITCH_DATA.sampleDeal.netCashFlow.toLocaleString()}/month</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">{PITCH_DATA.sampleDeal.cashOnCashReturn}%</div>
                  <div className="text-sm">Cash-on-Cash Return</div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-2xl font-bold text-blue-600">{PITCH_DATA.sampleDeal.capRate}%</div>
                  <div className="text-sm">Cap Rate</div>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <div className="text-2xl font-bold text-purple-600">35%+</div>
                  <div className="text-sm">Total ROI</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advantages Tab */}
        <TabsContent value="advantages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PITCH_DATA.advantages.map((advantage, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <advantage.icon className="h-5 w-5 text-blue-600" />
                    {advantage.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{advantage.description}</p>
                  <Badge variant="default">{advantage.value}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <Target className="h-4 w-4" />
            <AlertTitle>Why These Advantages Matter</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Local Connections:</strong> Access to off-market deals and faster approvals</li>
                <li><strong>DIY Skills:</strong> 20-30% cost savings = higher returns</li>
                <li><strong>Data Platform:</strong> Better deal identification and risk assessment</li>
                <li><strong>First-Mover:</strong> Best properties before competition increases</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Investment Tab */}
        <TabsContent value="investment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PITCH_DATA.investmentTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all ${
                  selectedTier === index ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedTier(index)}
              >
                <CardHeader>
                  <CardTitle className="text-center">
                    {tier.name}
                    {index === 1 && <Badge className="ml-2">Popular</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <div className="text-2xl font-bold">{formatCurrency(tier.investment)}</div>
                  <div className="text-sm text-muted-foreground">Investment</div>
                  <div className="space-y-1">
                    <div><strong>{tier.equity}</strong> equity stake</div>
                    <div><strong>{tier.expectedReturn}</strong> expected</div>
                    <div><strong>{tier.timeline}</strong> timeline</div>
                    <div className="text-sm text-muted-foreground">{tier.type}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Use of Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Property Acquisitions</span>
                  <div className="flex items-center gap-2">
                    <Progress value={70} className="w-32" />
                    <span className="text-sm">70%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Renovation/Conversion Costs</span>
                  <div className="flex items-center gap-2">
                    <Progress value={20} className="w-32" />
                    <span className="text-sm">20%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Operating Capital & Contingency</span>
                  <div className="flex items-center gap-2">
                    <Progress value={10} className="w-32" />
                    <span className="text-sm">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="space-y-4">
            {PITCH_DATA.timeline.map((phase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Phase {index + 1}: {phase.phase}
                    <Badge variant="secondary">Months {phase.months}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Risk Mitigation Built In</AlertTitle>
            <AlertDescription>
              Each phase includes contingency planning, multiple exit strategies, and conservative projections 
              to protect investor capital while maximizing returns.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Capitalize on This Opportunity?</h2>
            <p className="text-lg opacity-90">
              Government programs are launching, zoning laws just changed, and the market has corrected.
            </p>
            <p className="text-xl font-semibold">
              The window is NOW. Let's turn this into generational wealth.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                📞 Schedule Meeting
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                📊 Review Financials
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                🏠 Tour Properties
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}