import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PropertyInputs } from '@/types';

interface ExpensesFormProps {
  formData: Partial<PropertyInputs>;
  onInputChange: (field: keyof PropertyInputs, value: any) => void;
}

export function ExpensesForm({ formData, onInputChange }: ExpensesFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operating Expenses</CardTitle>
        <CardDescription>Monthly and annual costs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="property_tax_annual">Property Tax ($/year)</Label>
            <Input
              id="property_tax_annual"
              type="number"
              value={formData.property_tax_annual}
              onChange={(e) => onInputChange('property_tax_annual', parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              ${((formData.property_tax_annual || 0) / 12).toFixed(0)}/month
            </p>
          </div>
          <div>
            <Label htmlFor="insurance_annual">Insurance ($/year)</Label>
            <Input
              id="insurance_annual"
              type="number"
              value={formData.insurance_annual}
              onChange={(e) => onInputChange('insurance_annual', parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              ${((formData.insurance_annual || 0) / 12).toFixed(0)}/month
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="property_management_percent">Property Management (%)</Label>
            <Input
              id="property_management_percent"
              type="number"
              step="0.1"
              value={formData.property_management_percent}
              onChange={(e) => onInputChange('property_management_percent', parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Typical: 8-10% of monthly rent
            </p>
          </div>
          <div>
            <Label htmlFor="maintenance_percent">Maintenance Budget (% of rent)</Label>
            <Input
              id="maintenance_percent"
              type="number"
              step="0.1"
              value={formData.maintenance_percent}
              onChange={(e) => onInputChange('maintenance_percent', parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Typical: 10-15% of monthly rent
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="utilities_monthly">Utilities ($/month)</Label>
            <Input
              id="utilities_monthly"
              type="number"
              value={formData.utilities_monthly}
              onChange={(e) => onInputChange('utilities_monthly', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="hoa_condo_fees_monthly">HOA/Condo Fees ($/month)</Label>
            <Input
              id="hoa_condo_fees_monthly"
              type="number"
              value={formData.hoa_condo_fees_monthly}
              onChange={(e) => onInputChange('hoa_condo_fees_monthly', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="other_expenses_monthly">Other Expenses ($/month)</Label>
            <Input
              id="other_expenses_monthly"
              type="number"
              value={formData.other_expenses_monthly}
              onChange={(e) => onInputChange('other_expenses_monthly', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
