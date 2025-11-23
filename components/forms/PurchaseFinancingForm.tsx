import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PropertyInputs } from '@/types';

interface PurchaseFinancingFormProps {
  formData: Partial<PropertyInputs>;
  onInputChange: (field: keyof PropertyInputs, value: any) => void;
}

export function PurchaseFinancingForm({ formData, onInputChange }: PurchaseFinancingFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase & Financing</CardTitle>
        <CardDescription>Purchase price and mortgage details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchase_price">Purchase Price ($)</Label>
            <Input
              id="purchase_price"
              type="number"
              value={formData.purchase_price}
              onChange={(e) => onInputChange('purchase_price', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="down_payment_percent">Down Payment (%)</Label>
            <Input
              id="down_payment_percent"
              type="number"
              step="0.1"
              value={formData.down_payment_percent}
              onChange={(e) => onInputChange('down_payment_percent', parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              ${formData.down_payment_amount?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="interest_rate">Interest Rate (%)</Label>
            <Input
              id="interest_rate"
              type="number"
              step="0.01"
              value={formData.interest_rate}
              onChange={(e) => onInputChange('interest_rate', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="amortization_years">Amortization (years)</Label>
            <Input
              id="amortization_years"
              type="number"
              value={formData.amortization_years}
              onChange={(e) => onInputChange('amortization_years', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="strategy">Strategy</Label>
            <select
              id="strategy"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.strategy}
              onChange={(e) => onInputChange('strategy', e.target.value)}
            >
              <option value="buy_hold">Buy & Hold</option>
              <option value="brrrr">BRRRR</option>
              <option value="flip">Flip</option>
              <option value="house_hack">House Hack</option>
            </select>
          </div>

          <div>
            <Label htmlFor="property_condition">Property Condition</Label>
            <select
              id="property_condition"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.property_condition}
              onChange={(e) => onInputChange('property_condition', e.target.value)}
            >
              <option value="move_in_ready">Move-In Ready</option>
              <option value="cosmetic_reno">Cosmetic Reno Needed</option>
              <option value="full_reno">Full Renovation</option>
              <option value="tear_down">Tear Down / Rebuild</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="renovation_cost">Renovation Budget ($)</Label>
          <Input
            id="renovation_cost"
            type="number"
            value={formData.renovation_cost}
            onChange={(e) => onInputChange('renovation_cost', parseFloat(e.target.value))}
          />
        </div>
      </CardContent>
    </Card>
  );
}
