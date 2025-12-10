import { GdsTdsCalculator } from "@/components/mortgage/gds-tds-calculator";

export default function MortgageQualificationPage() {
    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Mortgage Qualification Calculator</h1>
                    <p className="text-muted-foreground">
                        Estimate your borrowing power based on Canadian GDS (Gross Debt Service) and TDS (Total Debt Service) ratios.
                    </p>
                </div>

                <GdsTdsCalculator />
            </div>
        </div>
    );
}
