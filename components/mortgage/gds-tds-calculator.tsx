"use client";

import { useState, useEffect } from "react";
import {
    calculateMortgageQualification,
    MortgageQualInput,
    MortgageQualResult
} from "@/lib/mortgage-qualification";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function GdsTdsCalculator() {
    const [formData, setFormData] = useState<MortgageQualInput>({
        grossAnnualIncome: 100000,
        monthlyMortgagePayment: 2500,
        annualPropertyTax: 4000,
        monthlyHeatingCost: 150,
        monthlyCondoFees: 0,
        otherMonthlyDebts: 500,
        creditScore: 720
    });

    const [result, setResult] = useState<MortgageQualResult | null>(null);

    useEffect(() => {
        setResult(calculateMortgageQualification(formData));
    }, []);

    const handleCalculate = () => {
        setResult(calculateMortgageQualification(formData));
    };

    const handleChange = (field: keyof MortgageQualInput, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    const getStatusColor = (ratio: number, limit: number) => {
        if (ratio <= limit) return "bg-green-500";
        if (ratio <= limit + 5) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Financial Profile</CardTitle>
                    <CardDescription>Enter your income and debts to calculate qualification ratios.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="income">Gross Annual Income ($)</Label>
                        <Input
                            id="income"
                            type="number"
                            value={formData.grossAnnualIncome}
                            onChange={(e) => handleChange("grossAnnualIncome", e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mortgage">Est. Monthly Mortgage ($)</Label>
                            <Input
                                id="mortgage"
                                type="number"
                                value={formData.monthlyMortgagePayment}
                                onChange={(e) => handleChange("monthlyMortgagePayment", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tax">Annual Property Tax ($)</Label>
                            <Input
                                id="tax"
                                type="number"
                                value={formData.annualPropertyTax}
                                onChange={(e) => handleChange("annualPropertyTax", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="heat">Monthly Heat ($)</Label>
                            <Input
                                id="heat"
                                type="number"
                                value={formData.monthlyHeatingCost}
                                onChange={(e) => handleChange("monthlyHeatingCost", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="condo">Monthly Condo Fees ($)</Label>
                            <Input
                                id="condo"
                                type="number"
                                value={formData.monthlyCondoFees}
                                onChange={(e) => handleChange("monthlyCondoFees", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="debt">Other Monthly Debts ($)</Label>
                            <Input
                                id="debt"
                                type="number"
                                value={formData.otherMonthlyDebts}
                                onChange={(e) => handleChange("otherMonthlyDebts", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Car loans, credit cards, student loans.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="credit">Credit Score</Label>
                            <Input
                                id="credit"
                                type="number"
                                value={formData.creditScore}
                                onChange={(e) => handleChange("creditScore", e.target.value)}
                            />
                        </div>
                    </div>

                    <Button onClick={handleCalculate} className="w-full">Calculate Ratios</Button>
                </CardContent>
            </Card>

            {/* Results Section */}
            <div className="space-y-6">
                {result && (
                    <Card className={cn("border-2",
                        result.approvalOdds === 'High' ? "border-green-200 bg-green-50/50" :
                            result.approvalOdds === 'Medium' ? "border-yellow-200 bg-yellow-50/50" :
                                "border-red-200 bg-red-50/50"
                    )}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardDescription>Qualification Status</CardDescription>
                                    <CardTitle className="text-2xl flex items-center gap-2 mt-1">
                                        {result.lenderType === 'A-Lender' && <CheckCircle2 className="text-green-600" />}
                                        {result.lenderType === 'B-Lender' && <AlertTriangle className="text-yellow-600" />}
                                        {(result.lenderType === 'Private' || result.lenderType === 'Unqualified') && <XCircle className="text-red-600" />}
                                        {result.lenderType}
                                    </CardTitle>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Approval Odds</div>
                                    <div className="font-bold">{result.approvalOdds}</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">{result.recommendation}</p>

                            <div className="space-y-6">
                                {/* GDS Display */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">GDS Ratio (Housing Costs)</span>
                                        <span className="font-bold">{result.gdsRatio}% <span className="text-muted-foreground font-normal">/ 39% Target</span></span>
                                    </div>
                                    <Progress value={Math.min(result.gdsRatio, 100)} className="h-2" indicatorClassName={getStatusColor(result.gdsRatio, 39)} />
                                </div>

                                {/* TDS Display */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">TDS Ratio (Total Debt)</span>
                                        <span className="font-bold">{result.tdsRatio}% <span className="text-muted-foreground font-normal">/ 44% Target</span></span>
                                    </div>
                                    <Progress value={Math.min(result.tdsRatio, 100)} className="h-2" indicatorClassName={getStatusColor(result.tdsRatio, 44)} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-white/50 border-t p-4 text-xs text-muted-foreground">
                            * Qualification based on standard stress test rates (Contract Rate + 2% or 5.25%). This is an estimate only.
                        </CardFooter>
                    </Card>
                )}

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Did you know?</AlertTitle>
                    <AlertDescription>
                        Rental income from the subject property can often be added to your income (usually 50% inclusion rate) to improve these ratios.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
