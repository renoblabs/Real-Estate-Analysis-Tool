"use client";

import { useState, useEffect } from "react";
import { AcreScoreDisplay } from "@/components/analysis/acre-score-display";
import { calculateAcreScore, AcreInput, AcreResult } from "@/lib/acre-analyzer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcreAnalysisPage() {
    const [formData, setFormData] = useState<AcreInput>({
        purchasePrice: 500000,
        monthlyRent: 2500,
        monthlyCashFlow: 200,
        vacancyRate: 5,
        locationGrade: 'B',
        appreciationPotential: 'Medium',
        riskScore: 3
    });

    const [result, setResult] = useState<AcreResult | null>(null);

    useEffect(() => {
        // Initial calculation
        setResult(calculateAcreScore(formData));
    }, []);

    const handleCalculate = () => {
        setResult(calculateAcreScore(formData));
    };

    const handleNumberChange = (field: keyof AcreInput, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">ACRE™ Property Analyzer</h1>
                <p className="text-muted-foreground">
                    Identify "Investment Grade" properties using the ACRE scoring system (based on Don R. Campbell's formula).
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Property Details</CardTitle>
                        <CardDescription>Enter the key metrics for your potential deal.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                                <Input
                                    id="purchasePrice"
                                    type="number"
                                    value={formData.purchasePrice}
                                    onChange={(e) => handleNumberChange("purchasePrice", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                                <Input
                                    id="monthlyRent"
                                    type="number"
                                    value={formData.monthlyRent}
                                    onChange={(e) => handleNumberChange("monthlyRent", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="monthlyCashFlow">Est. Monthly Cash Flow ($)</Label>
                                <Input
                                    id="monthlyCashFlow"
                                    type="number"
                                    value={formData.monthlyCashFlow}
                                    onChange={(e) => handleNumberChange("monthlyCashFlow", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Net income after expenses & financing.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Location Quality</Label>
                                <Select
                                    value={formData.locationGrade}
                                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, locationGrade: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Class A (Prime)</SelectItem>
                                        <SelectItem value="B">Class B (Standard)</SelectItem>
                                        <SelectItem value="C">Class C (Developing)</SelectItem>
                                        <SelectItem value="D">Class D (Rough)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Appreciation Potential</Label>
                                <Select
                                    value={formData.appreciationPotential}
                                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, appreciationPotential: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="High">High (Gentrifiying/Booming)</SelectItem>
                                        <SelectItem value="Medium">Medium (Stable Growth)</SelectItem>
                                        <SelectItem value="Low">Low (Stagnant)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="riskScore">Risk Score (0-10)</Label>
                                <Input
                                    id="riskScore"
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={formData.riskScore}
                                    onChange={(e) => handleNumberChange("riskScore", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">0 = No Risk, 10 = Extreme Risk</p>
                            </div>
                        </div>

                        <Button onClick={handleCalculate} className="w-full">
                            Calculate Score
                        </Button>
                    </CardContent>
                </Card>

                {/* Results Display */}
                <div className="space-y-6">
                    <AcreScoreDisplay result={result} />

                    {/* Educational Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">About the ACRE™ System</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>
                                The ACRE system helps investors objectively evaluate properties. A score of <strong>75+</strong> indicates a property that is worth serious consideration.
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Cash Flow (40%):</strong> Does the property pay you to own it?</li>
                                <li><strong>Location (30%):</strong> Is the area improving or declining?</li>
                                <li><strong>Appreciation (20%):</strong> Value growth potential.</li>
                                <li><strong>Risk (10%):</strong> Structural, tenant, or market risks.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
