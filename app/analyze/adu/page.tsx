"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
    Home,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Building,
    Hammer,
    Banknote,
    Clock,
    ArrowLeft,
    Info,
    Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeAduConversion, compareAduOptions, AduAnalysisResult } from "@/lib/adu-analyzer";
import { detectAduPotential, AduPotentialResult, getProvincialAduInfo } from "@/lib/adu-signal-detector";
import type { Province } from "@/types";
import type { AduType } from "@/lib/adu-signal-detector";

export default function AduAnalysisPage() {
    const [formData, setFormData] = useState({
        purchasePrice: 500000,
        currentValue: 500000,
        province: "ON" as Province,
        city: "Port Colborne",
        aduType: "basement_suite" as AduType,
        existingBasement: "unfinished" as "finished" | "unfinished" | "partial" | "walkout" | "none",
        lotSizeSqft: 6000,
        targetUnitSize: 600,
        estimatedMonthlyRent: 0,
        doItYourself: false,
        description: ""
    });

    const [analysis, setAnalysis] = useState<AduAnalysisResult | null>(null);
    const [comparison, setComparison] = useState<AduAnalysisResult[] | null>(null);
    const [potentialResult, setPotentialResult] = useState<AduPotentialResult | null>(null);
    const [activeTab, setActiveTab] = useState("single");

    const handleAnalyze = () => {
        const result = analyzeAduConversion({
            purchasePrice: formData.purchasePrice,
            currentValue: formData.currentValue,
            province: formData.province,
            city: formData.city,
            aduType: formData.aduType,
            existingBasement: formData.existingBasement,
            lotSizeSqft: formData.lotSizeSqft,
            targetUnitSize: formData.targetUnitSize,
            estimatedMonthlyRent: formData.estimatedMonthlyRent || undefined,
            doItYourself: formData.doItYourself
        });
        setAnalysis(result);
    };

    const handleCompareAll = () => {
        const results = compareAduOptions(
            formData.purchasePrice,
            formData.currentValue,
            formData.province,
            formData.city,
            formData.existingBasement,
            formData.lotSizeSqft
        );
        setComparison(results);
        setActiveTab("compare");
    };

    const handleDetectPotential = () => {
        const result = detectAduPotential(
            {
                address: "",
                city: formData.city,
                province: formData.province,
                property_type: "single_family",
                bedrooms: 3,
                bathrooms: 2,
                square_feet: 1500,
                purchase_price: formData.purchasePrice,
                down_payment_percent: 20,
                down_payment_amount: formData.purchasePrice * 0.2,
                interest_rate: 5.5,
                amortization_years: 25,
                strategy: "buy_hold",
                property_condition: "move_in_ready",
                renovation_cost: 0,
                monthly_rent: 2000,
                other_income: 0,
                vacancy_rate: 5,
                property_tax_annual: 4000,
                insurance_annual: 1200,
                property_management_percent: 8,
                maintenance_percent: 10,
                utilities_monthly: 0,
                hoa_condo_fees_monthly: 0,
                other_expenses_monthly: 0,
                lot_size: formData.lotSizeSqft / 43560
            },
            {
                description: formData.description,
                basement: formData.existingBasement,
                lotSize: formData.lotSizeSqft
            }
        );
        setPotentialResult(result);
    };

    const provincialInfo = getProvincialAduInfo(formData.province);

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Home className="h-8 w-8 text-primary" />
                        ADU Opportunity Analyzer
                    </h1>
                    <p className="text-muted-foreground">
                        Find hidden value through Additional Dwelling Units - your Canadian market advantage
                    </p>
                </div>
            </div>

            {/* Provincial Info Banner */}
            {provincialInfo && (
                <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>{formData.province} ADU Regulations</AlertTitle>
                    <AlertDescription>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">
                                Max Units: {provincialInfo.maxUnits} per lot
                            </Badge>
                            {provincialInfo.basementSuiteAllowed && (
                                <Badge variant="outline" className="bg-green-50">
                                    ✓ Basement Suites Allowed
                                </Badge>
                            )}
                            {provincialInfo.gardenSuiteAllowed && (
                                <Badge variant="outline" className="bg-green-50">
                                    ✓ Garden Suites Allowed
                                </Badge>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Property Details</CardTitle>
                        <CardDescription>Enter details to analyze ADU potential</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Purchase Price</Label>
                                <Input
                                    type="number"
                                    value={formData.purchasePrice}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        purchasePrice: parseInt(e.target.value) || 0,
                                        currentValue: parseInt(e.target.value) || 0
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Current Value</Label>
                                <Input
                                    type="number"
                                    value={formData.currentValue}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        currentValue: parseInt(e.target.value) || 0
                                    }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Province</Label>
                                <Select
                                    value={formData.province}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, province: v as Province }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ON">Ontario</SelectItem>
                                        <SelectItem value="BC">British Columbia</SelectItem>
                                        <SelectItem value="AB">Alberta</SelectItem>
                                        <SelectItem value="NS">Nova Scotia</SelectItem>
                                        <SelectItem value="QC">Quebec</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>ADU Type</Label>
                            <Select
                                value={formData.aduType}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, aduType: v as AduType }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basement_suite">Basement Suite</SelectItem>
                                    <SelectItem value="garden_suite">Garden Suite</SelectItem>
                                    <SelectItem value="garage_conversion">Garage Conversion</SelectItem>
                                    <SelectItem value="attic_conversion">Attic Conversion</SelectItem>
                                    <SelectItem value="laneway_house">Laneway House</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Existing Basement</Label>
                            <Select
                                value={formData.existingBasement}
                                onValueChange={(v: any) => setFormData(prev => ({ ...prev, existingBasement: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="finished">Finished</SelectItem>
                                    <SelectItem value="partial">Partially Finished</SelectItem>
                                    <SelectItem value="unfinished">Unfinished</SelectItem>
                                    <SelectItem value="walkout">Walk-out</SelectItem>
                                    <SelectItem value="none">No Basement</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Lot Size (sqft)</Label>
                                <Input
                                    type="number"
                                    value={formData.lotSizeSqft}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lotSizeSqft: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>ADU Size (sqft)</Label>
                                <Input
                                    type="number"
                                    value={formData.targetUnitSize}
                                    onChange={(e) => setFormData(prev => ({ ...prev, targetUnitSize: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="diy"
                                checked={formData.doItYourself}
                                onChange={(e) => setFormData(prev => ({ ...prev, doItYourself: e.target.checked }))}
                                className="rounded"
                            />
                            <Label htmlFor="diy">DIY Construction (30% savings)</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Listing Description (for signal detection)</Label>
                            <textarea
                                className="w-full min-h-[100px] p-2 border rounded-md text-sm"
                                placeholder="Paste listing description to detect ADU signals..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button onClick={handleAnalyze} className="w-full">
                            <Hammer className="h-4 w-4 mr-2" />
                            Analyze ADU Conversion
                        </Button>
                        <Button onClick={handleCompareAll} variant="outline" className="w-full">
                            Compare All ADU Types
                        </Button>
                        {formData.description && (
                            <Button onClick={handleDetectPotential} variant="secondary" className="w-full">
                                <Lightbulb className="h-4 w-4 mr-2" />
                                Detect ADU Signals
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Results Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="single">Single Analysis</TabsTrigger>
                            <TabsTrigger value="compare">Compare Options</TabsTrigger>
                            <TabsTrigger value="signals">ADU Signals</TabsTrigger>
                        </TabsList>

                        {/* Single Analysis Tab */}
                        <TabsContent value="single" className="space-y-4">
                            {analysis ? (
                                <>
                                    {/* Summary Card */}
                                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Building className="h-5 w-5" />
                                                {analysis.aduTypeName} Analysis
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center p-3 bg-white rounded-lg">
                                                    <p className="text-sm text-muted-foreground">Total Cost</p>
                                                    <p className="text-2xl font-bold text-red-600">
                                                        ${analysis.netCost.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg">
                                                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        ${analysis.estimatedMonthlyRent.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg">
                                                    <p className="text-sm text-muted-foreground">Cash-on-Cash ROI</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {analysis.cashOnCashReturn}%
                                                    </p>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg">
                                                    <p className="text-sm text-muted-foreground">Payback</p>
                                                    <p className="text-2xl font-bold">
                                                        {analysis.paybackPeriodYears} yrs
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Cost Breakdown */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Cost Breakdown
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span>Construction</span>
                                                <span className="font-bold">${analysis.estimatedCosts.construction.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Permits & Approvals</span>
                                                <span>${analysis.estimatedCosts.permits.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Design & Engineering</span>
                                                <span>${analysis.estimatedCosts.design.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Utility Connections</span>
                                                <span>${analysis.estimatedCosts.utilities.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Contingency (15%)</span>
                                                <span>${analysis.estimatedCosts.contingency.toLocaleString()}</span>
                                            </div>
                                            <hr />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total Cost</span>
                                                <span>${analysis.netCost.toLocaleString()}</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Funding Options */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Banknote className="h-5 w-5" />
                                                Funding Options
                                            </CardTitle>
                                            <CardDescription>
                                                Total Available: ${analysis.totalFundingAvailable.toLocaleString()} | 
                                                Out of Pocket: ${analysis.outOfPocketCost.toLocaleString()}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {analysis.availableFunding.map((fund, idx) => (
                                                <div key={idx} className="p-3 border rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">{fund.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {fund.interestRate}% interest • {fund.term}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-green-600">
                                                                ${fund.amount.toLocaleString()}
                                                            </p>
                                                            {fund.forgivable && (
                                                                <Badge variant="secondary" className="text-xs">Forgivable</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    {/* Timeline & Risks */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Clock className="h-5 w-5" />
                                                    Timeline
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Permits</span>
                                                    <span>{analysis.estimatedTimeline.permits}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Construction</span>
                                                    <span>{analysis.estimatedTimeline.construction}</span>
                                                </div>
                                                <hr />
                                                <div className="flex justify-between font-bold">
                                                    <span>Total</span>
                                                    <span>{analysis.estimatedTimeline.total}</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <AlertTriangle className="h-5 w-5" />
                                                    Risks & Tips
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-1 text-sm">
                                                    {analysis.risks.map((risk, idx) => (
                                                        <li key={idx} className="text-orange-600">⚠️ {risk}</li>
                                                    ))}
                                                    {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                                                        <li key={idx} className="text-blue-600">💡 {rec}</li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </>
                            ) : (
                                <Card className="p-12 text-center">
                                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        Enter property details and click "Analyze ADU Conversion" to see results
                                    </p>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Compare Tab */}
                        <TabsContent value="compare" className="space-y-4">
                            {comparison && comparison.length > 0 ? (
                                <div className="space-y-4">
                                    {comparison.map((result, idx) => (
                                        <Card key={idx} className={cn(
                                            idx === 0 && "border-2 border-green-500 bg-green-50/50"
                                        )}>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            {result.aduTypeName}
                                                            {idx === 0 && <Badge className="bg-green-500">Best ROI</Badge>}
                                                        </CardTitle>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-green-600">
                                                            {result.cashOnCashReturn}% ROI
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-4 gap-4 text-center">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Cost</p>
                                                        <p className="font-bold">${result.netCost.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Monthly Rent</p>
                                                        <p className="font-bold">${result.estimatedMonthlyRent}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Payback</p>
                                                        <p className="font-bold">{result.paybackPeriodYears} years</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Value Add</p>
                                                        <p className="font-bold">${result.valueAdd.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-12 text-center">
                                    <p className="text-muted-foreground">
                                        Click "Compare All ADU Types" to see a comparison
                                    </p>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Signals Tab */}
                        <TabsContent value="signals" className="space-y-4">
                            {potentialResult ? (
                                <>
                                    <Card className={cn(
                                        "border-2",
                                        potentialResult.overallScore >= 60 ? "border-green-500 bg-green-50/50" :
                                            potentialResult.overallScore >= 30 ? "border-yellow-500 bg-yellow-50/50" :
                                                "border-gray-300"
                                    )}>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>ADU Potential Score</CardTitle>
                                                <div className="text-right">
                                                    <p className="text-3xl font-bold">{potentialResult.overallScore}/100</p>
                                                    <Badge variant={potentialResult.confidence === 'high' ? 'default' : 'secondary'}>
                                                        {potentialResult.confidence} confidence
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Progress value={potentialResult.overallScore} className="h-3" />
                                        </CardContent>
                                    </Card>

                                    {potentialResult.signals.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Detected Signals</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                {potentialResult.signals.map((signal, idx) => (
                                                    <div key={idx} className={cn(
                                                        "p-3 rounded-lg border",
                                                        signal.strength === 'strong' ? "bg-green-50 border-green-200" :
                                                            signal.strength === 'moderate' ? "bg-yellow-50 border-yellow-200" :
                                                                "bg-gray-50"
                                                    )}>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-medium">{signal.description}</p>
                                                                <p className="text-xs text-muted-foreground capitalize">
                                                                    {signal.type.replace('_', ' ')} signal
                                                                </p>
                                                            </div>
                                                            <Badge variant={
                                                                signal.strength === 'strong' ? 'default' : 'secondary'
                                                            }>
                                                                {signal.strength}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {potentialResult.opportunities.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                                                    Opportunities
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {potentialResult.opportunities.map((opp, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                            <span className="text-sm">{opp}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            ) : (
                                <Card className="p-12 text-center">
                                    <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        Paste a listing description and click "Detect ADU Signals" to find hidden potential
                                    </p>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
