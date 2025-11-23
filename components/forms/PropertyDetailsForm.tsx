import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PropertyInputs } from '@/types';

interface PropertyDetailsFormProps {
  formData: Partial<PropertyInputs>;
  onInputChange: (field: keyof PropertyInputs, value: any) => void;
}

export function PropertyDetailsForm({ formData, onInputChange }: PropertyDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
        <CardDescription>Basic information about the property</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="123 Main St"
            />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              placeholder="Toronto"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="province">Province</Label>
            <select
              id="province"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.province}
              onChange={(e) => onInputChange('province', e.target.value)}
            >
              <option value="ON">Ontario</option>
              <option value="BC">British Columbia</option>
              <option value="AB">Alberta</option>
              <option value="NS">Nova Scotia</option>
              <option value="QC">Quebec</option>
            </select>
          </div>

          <div>
            <Label htmlFor="property_type">Property Type</Label>
            <select
              id="property_type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.property_type}
              onChange={(e) => onInputChange('property_type', e.target.value)}
            >
              <option value="single_family">Single Family</option>
              <option value="duplex">Duplex</option>
              <option value="triplex">Triplex</option>
              <option value="fourplex">Fourplex</option>
              <option value="multi_unit_5plus">5+ Units</option>
            </select>
          </div>

          <div>
            <Label htmlFor="square_feet">Square Feet</Label>
            <Input
              id="square_feet"
              type="number"
              value={formData.square_feet}
              onChange={(e) => onInputChange('square_feet', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => onInputChange('bedrooms', parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              step="0.5"
              value={formData.bathrooms}
              onChange={(e) => onInputChange('bathrooms', parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="year_built">Year Built</Label>
          <Input
            id="year_built"
            type="number"
            value={formData.year_built}
            onChange={(e) => onInputChange('year_built', parseInt(e.target.value))}
            placeholder="2010"
          />
        </div>
      </CardContent>
    </Card>
  );
}
