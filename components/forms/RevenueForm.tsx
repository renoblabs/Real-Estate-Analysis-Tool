import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PropertyInputs } from '@/types';

interface RevenueFormProps {
  formData: Partial<PropertyInputs>;
  onInputChange: (field: keyof PropertyInputs, value: any) => void;
}

export function RevenueForm({ formData, onInputChange }: RevenueFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Expected monthly income from the property</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthly_rent">Monthly Rent ($)</Label>
            <Input
              id="monthly_rent"
              type="number"
              value={formData.monthly_rent}
              onChange={(e) => onInputChange('monthly_rent', parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              ${(formData.monthly_rent || 0) * 12}/year
            </p>
          </div>
          <div>
            <Label htmlFor="other_income">Other Income ($/month)</Label>
            <Input
              id="other_income"
              type="number"
              value={formData.other_income}
              onChange={(e) => onInputChange('other_income', parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Laundry, parking, storage, etc.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="vacancy_rate">Vacancy Rate (%)</Label>
          <Input
            id="vacancy_rate"
            type="number"
            step="0.1"
            value={formData.vacancy_rate}
            onChange={(e) => onInputChange('vacancy_rate', parseFloat(e.target.value))}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Typical: 5-8% depending on market
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
