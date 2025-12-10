"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AcreResult } from "@/lib/acre-analyzer";
import { cn } from "@/lib/utils";
import { Info, TrendingUp, MapPin, BarChart3, Shield, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface AcreScoreDisplayProps {
    result: AcreResult | null;
    compact?: boolean;
}

export function AcreScoreDisplay({ result, compact = false }: AcreScoreDisplayProps) {
    if (!result) return null;

    const getColor = (score: number) => {
        if (score >= 75) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        if (score >= 50) return "text-orange-600";
        return "text-red-600";
    };

    const getBgColor = (score: number) => {
        if (score >= 75) return "bg-green-100 border-green-200";
        if (score >= 60) return "bg-yellow-100 border-yellow-200";
        if (score >= 50) return "bg-orange-100 border-orange-200";
        return "bg-red-100 border-red-200";
    };

    const getGradeBgColor = (grade: string) => {
        if (grade === 'A+' || grade === 'A') return "bg-green-500";
        if (grade === 'B+' || grade === 'B') return "bg-blue-500";
        if (grade === 'C') return "bg-yellow-500";
        if (grade === 'D') return "bg-orange-500";
        return "bg-red-500";
    };

    const getRecommendationIcon = () => {
        if (result.totalScore >= 75) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
        if (result.totalScore >= 60) return <TrendingUp className="h-5 w-5 text-yellow-600" />;
        if (result.totalScore >= 50) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
        return <XCircle className="h-5 w-5 text-red-600" />;
    };

    const getScoreBarColor = (current: number, max: number) => {
        const percentage = (current / max) * 100;
        if (percentage >= 70) return "bg-green-500";
        if (percentage >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    if (compact) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-4",
                    result.totalScore >= 75 ? "border-green-500" :
                        result.totalScore >= 60 ? "border-yellow-500" :
                            result.totalScore >= 50 ? "border-orange-500" : "border-red-500"
                )}>
                    <span className={cn("text-lg font-bold", getColor(result.totalScore))}>
                        {result.totalScore}
                    </span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">ACRE™ Score</span>
                        <Badge className={getGradeBgColor(result.grade)}>{result.grade}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.recommendation.split(' - ')[0]}</p>
                </div>
            </div>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    ACRE™ Property Score
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" title="Based on Don R. Campbell's ACRE system" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Score Circle */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                            "relative flex items-center justify-center w-32 h-32 rounded-full border-8 transition-all duration-500",
                            result.totalScore >= 75 ? "border-green-500" :
                                result.totalScore >= 60 ? "border-yellow-500" :
                                    result.totalScore >= 50 ? "border-orange-500" : "border-red-500"
                        )}>
                            <div className="text-center">
                                <div className={cn("text-4xl font-bold", getColor(result.totalScore))}>
                                    {result.totalScore}
                                </div>
                                <div className="text-xs text-muted-foreground">out of 100</div>
                            </div>
                        </div>
                        <Badge className={cn("text-lg px-4 py-1", getGradeBgColor(result.grade))}>
                            Grade: {result.grade}
                        </Badge>
                    </div>

                    {/* Breakdown List with Progress Bars */}
                    <div className="flex-1 w-full space-y-4">
                        {/* Cash Flow */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                    Cash Flow
                                </span>
                                <span className="font-bold">{result.breakdown.cashFlowScore} / 40</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all", getScoreBarColor(result.breakdown.cashFlowScore, 40))}
                                    style={{ width: `${(result.breakdown.cashFlowScore / 40) * 100}%` }}
                                />
                            </div>
                            {result.details && (
                                <p className="text-xs text-muted-foreground">
                                    {result.details.cashFlowCategory} • Rent/Price: {result.details.rentToPriceRatio}%
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-purple-500" />
                                    Location
                                </span>
                                <span className="font-bold">{result.breakdown.locationScore} / 30</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all", getScoreBarColor(result.breakdown.locationScore, 30))}
                                    style={{ width: `${(result.breakdown.locationScore / 30) * 100}%` }}
                                />
                            </div>
                            {result.details && (
                                <p className="text-xs text-muted-foreground">{result.details.locationRationale}</p>
                            )}
                        </div>

                        {/* Appreciation */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="font-medium flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-green-500" />
                                    Appreciation
                                </span>
                                <span className="font-bold">{result.breakdown.appreciationScore} / 20</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all", getScoreBarColor(result.breakdown.appreciationScore, 20))}
                                    style={{ width: `${(result.breakdown.appreciationScore / 20) * 100}%` }}
                                />
                            </div>
                            {result.details && (
                                <p className="text-xs text-muted-foreground">{result.details.appreciationRationale}</p>
                            )}
                        </div>

                        {/* Risk */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-orange-500" />
                                    Risk Assessment
                                </span>
                                <span className="font-bold">{result.breakdown.riskScore} / 10</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all", getScoreBarColor(result.breakdown.riskScore, 10))}
                                    style={{ width: `${(result.breakdown.riskScore / 10) * 100}%` }}
                                />
                            </div>
                            {result.details && (
                                <p className="text-xs text-muted-foreground">{result.details.riskRationale}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recommendation Box */}
                <div className={cn("mt-6 p-4 rounded-lg border flex items-start gap-3", getBgColor(result.totalScore))}>
                    {getRecommendationIcon()}
                    <div>
                        <p className="font-semibold">{result.recommendation.split(' - ')[0]}</p>
                        <p className="text-sm text-muted-foreground mt-1">{result.recommendation.split(' - ')[1]}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
