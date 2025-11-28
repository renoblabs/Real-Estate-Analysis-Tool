'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Home, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import type { 
  SmallMultifamilyInputs, 
  SmallMultifamilyUnit, 
  RentComparable, 
  UnitType,
  Province 
} from '@/types';

interface SmallMultifamilyFormProps {
  formData: Partial<SmallMultifamilyInputs>;
  onChange: (data: Partial<SmallMultifamilyInputs>) => void;
}

export function SmallMultifamilyForm({ formData, onChange }: SmallMultifamilyFormProps) {
  const [activeTab, setActiveTab] = useState('property');

  const updateFormData = (updates: Partial<SmallMultifamilyInputs>) => {
    onChange({ ...formData, ...updates });
  };

  const addUnit = () => {
    const newUnit: SmallMultifamilyUnit = {
      unit_number: `Unit ${(formData.planned_units?.length || 0) + 1}`,
      unit_type: '2br',
      square_feet: 800,
      bedrooms: 2,
      bathrooms: 1,
      target_monthly_rent: 2000,
      construction_cost: 0,
      renovation_cost: 0
    };
    
    const currentUnits = formData.planned_units || [];
    updateFormData({ planned_units: [...currentUnits, newUnit] });
  };

  const updateUnit = (index: number, updates: Partial<SmallMultifamilyUnit>) => {
    const currentUnits = formData.planned_units || [];
    const updatedUnits = currentUnits.map((unit, i) => 
      i === index ? { ...unit, ...updates } : unit
    );
    updateFormData({ planned_units: updatedUnits });
  };

  const removeUnit = (index: number) => {
    const currentUnits = formData.planned_units || [];
    const updatedUnits = currentUnits.filter((_, i) => i !== index);
    updateFormData({ planned_units: updatedUnits });
  };

  const addComparable = () => {
    const newComparable: RentComparable = {
      address: '',
      unit_type: '2br',
      monthly_rent: 2000,
      square_feet: 800,
      bedrooms: 2,
      bathrooms: 1,
      distance_km: 1,
      property_age_years: 10,
      last_updated: new Date().toISOString().split('T')[0]
    };
    
    const currentComparables = formData.local_rent_comparables || [];
    updateFormData({ local_rent_comparables: [...currentComparables, newComparable] });
  };

  const updateComparable = (index: number, updates: Partial<RentComparable>) => {
    const currentComparables = formData.local_rent_comparables || [];
    const updatedComparables = currentComparables.map((comp, i) => 
      i === index ? { ...comp, ...updates } : comp
    );
    updateFormData({ local_rent_comparables: updatedComparables });
  };

  const removeComparable = (index: number) => {
    const currentComparables = formData.local_rent_comparables || [];
    const updatedComparables = currentComparables.filter((_, i) => i !== index);
    updateFormData({ local_rent_comparables: updatedComparables });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Home className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Small Multifamily Analysis (1-4 Units)</h2>
        <Badge variant="outline">Raw Land vs Existing Structure</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="financing">Financing</TabsTrigger>
        </TabsList>

        {/* Property Details Tab */}
        <TabsContent value="property" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Property Address</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    placeholder="Toronto"
                  />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Select value={formData.province} onValueChange={(value: Province) => updateFormData({ province: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON">Ontario</SelectItem>
                      <SelectItem value="BC">British Columbia</SelectItem>
                      <SelectItem value="AB">Alberta</SelectItem>
                      <SelectItem value="QC">Quebec</SelectItem>
                      <SelectItem value="NS">Nova Scotia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target_unit_count">Target Unit Count</Label>
                  <Select 
                    value={formData.target_unit_count?.toString()} 
                    onValueChange={(value) => updateFormData({ target_unit_count: parseInt(value) as 1 | 2 | 3 | 4 })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Unit</SelectItem>
                      <SelectItem value="2">2 Units (Duplex)</SelectItem>
                      <SelectItem value="3">3 Units (Triplex)</SelectItem>
                      <SelectItem value="4">4 Units (Fourplex)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current_unit_count">Current Unit Count (if existing)</Label>
                  <Input
                    id="current_unit_count"
                    type="number"
                    value={formData.current_unit_count || ''}
                    onChange={(e) => updateFormData({ current_unit_count: parseInt(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="square_feet">Total Square Feet</Label>
                  <Input
                    id="square_feet"
                    type="number"
                    value={formData.square_feet || ''}
                    onChange={(e) => updateFormData({ square_feet: parseInt(e.target.value) || 0 })}
                    placeholder="2400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Development Approach Tab */}
        <TabsContent value="development" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Development Approach & Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="development_approach">Development Approach</Label>
                <Select 
                  value={formData.development_approach} 
                  onValueChange={(value: 'raw_land' | 'existing_conversion' | 'existing_addition') => 
                    updateFormData({ development_approach: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw_land">Raw Land Development</SelectItem>
                    <SelectItem value="existing_conversion">Existing Structure Conversion</SelectItem>
                    <SelectItem value="existing_addition">Existing Structure + Addition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.development_approach === 'raw_land' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="col-span-full font-medium text-green-800">Raw Land Development Costs</h4>
                  <div>
                    <Label htmlFor="land_acquisition_cost">Land Acquisition Cost</Label>
                    <Input
                      id="land_acquisition_cost"
                      type="number"
                      value={formData.land_acquisition_cost || ''}
                      onChange={(e) => updateFormData({ land_acquisition_cost: parseInt(e.target.value) || 0 })}
                      placeholder="200000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="site_preparation_cost">Site Preparation Cost</Label>
                    <Input
                      id="site_preparation_cost"
                      type="number"
                      value={formData.site_preparation_cost || ''}
                      onChange={(e) => updateFormData({ site_preparation_cost: parseInt(e.target.value) || 0 })}
                      placeholder="45000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="utility_connections_cost">Utility Connections</Label>
                    <Input
                      id="utility_connections_cost"
                      type="number"
                      value={formData.utility_connections_cost || ''}
                      onChange={(e) => updateFormData({ utility_connections_cost: parseInt(e.target.value) || 0 })}
                      placeholder="20000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="construction_cost_per_unit">Construction Cost per Unit</Label>
                    <Input
                      id="construction_cost_per_unit"
                      type="number"
                      value={formData.construction_cost_per_unit || ''}
                      onChange={(e) => updateFormData({ construction_cost_per_unit: parseInt(e.target.value) || 0 })}
                      placeholder="140000"
                    />
                  </div>
                </div>
              )}

              {(formData.development_approach === 'existing_conversion' || formData.development_approach === 'existing_addition') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="col-span-full font-medium text-blue-800">Existing Structure Costs</h4>
                  <div>
                    <Label htmlFor="existing_structure_value">Existing Structure Value</Label>
                    <Input
                      id="existing_structure_value"
                      type="number"
                      value={formData.existing_structure_value || ''}
                      onChange={(e) => updateFormData({ existing_structure_value: parseInt(e.target.value) || 0 })}
                      placeholder="350000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conversion_feasibility_score">Conversion Feasibility (1-10)</Label>
                    <Input
                      id="conversion_feasibility_score"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.conversion_feasibility_score || ''}
                      onChange={(e) => updateFormData({ conversion_feasibility_score: parseInt(e.target.value) || 5 })}
                      placeholder="7"
                    />
                  </div>
                  <div>
                    <Label htmlFor="renovation_cost_per_unit">Renovation Cost per Unit</Label>
                    <Input
                      id="renovation_cost_per_unit"
                      type="number"
                      value={formData.renovation_cost_per_unit || ''}
                      onChange={(e) => updateFormData({ renovation_cost_per_unit: parseInt(e.target.value) || 0 })}
                      placeholder="75000"
                    />
                  </div>
                  {formData.development_approach === 'existing_addition' && (
                    <div>
                      <Label htmlFor="construction_cost_per_unit">New Construction Cost per Unit</Label>
                      <Input
                        id="construction_cost_per_unit"
                        type="number"
                        value={formData.construction_cost_per_unit || ''}
                        onChange={(e) => updateFormData({ construction_cost_per_unit: parseInt(e.target.value) || 0 })}
                        placeholder="140000"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="permit_and_approval_costs">Permits & Approvals</Label>
                  <Input
                    id="permit_and_approval_costs"
                    type="number"
                    value={formData.permit_and_approval_costs || ''}
                    onChange={(e) => updateFormData({ permit_and_approval_costs: parseInt(e.target.value) || 0 })}
                    placeholder="15000"
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_completion_months">Timeline (Months)</Label>
                  <Input
                    id="estimated_completion_months"
                    type="number"
                    value={formData.estimated_completion_months || ''}
                    onChange={(e) => updateFormData({ estimated_completion_months: parseInt(e.target.value) || 0 })}
                    placeholder="12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Units Configuration Tab */}
        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Unit Configuration
                </div>
                <Button onClick={addUnit} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Unit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.planned_units?.map((unit, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Unit {index + 1}</h4>
                    <Button 
                      onClick={() => removeUnit(index)} 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label>Unit Number</Label>
                      <Input
                        value={unit.unit_number}
                        onChange={(e) => updateUnit(index, { unit_number: e.target.value })}
                        placeholder="Unit 1"
                      />
                    </div>
                    <div>
                      <Label>Unit Type</Label>
                      <Select 
                        value={unit.unit_type} 
                        onValueChange={(value: UnitType) => updateUnit(index, { unit_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="studio">Studio</SelectItem>
                          <SelectItem value="1br">1 Bedroom</SelectItem>
                          <SelectItem value="2br">2 Bedroom</SelectItem>
                          <SelectItem value="3br">3 Bedroom</SelectItem>
                          <SelectItem value="4br">4 Bedroom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Square Feet</Label>
                      <Input
                        type="number"
                        value={unit.square_feet}
                        onChange={(e) => updateUnit(index, { square_feet: parseInt(e.target.value) || 0 })}
                        placeholder="800"
                      />
                    </div>
                    <div>
                      <Label>Target Rent</Label>
                      <Input
                        type="number"
                        value={unit.target_monthly_rent}
                        onChange={(e) => updateUnit(index, { target_monthly_rent: parseInt(e.target.value) || 0 })}
                        placeholder="2000"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {(!formData.planned_units || formData.planned_units.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No units configured yet. Click "Add Unit" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Research Tab */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Research
                </div>
                <Button onClick={addComparable} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Comparable
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="market_vacancy_rate">Market Vacancy Rate (%)</Label>
                  <Input
                    id="market_vacancy_rate"
                    type="number"
                    step="0.1"
                    value={formData.market_vacancy_rate || ''}
                    onChange={(e) => updateFormData({ market_vacancy_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="5.0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Rent Comparables</h4>
                {formData.local_rent_comparables?.map((comp, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Comparable {index + 1}</h5>
                      <Button 
                        onClick={() => removeComparable(index)} 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <Label>Address</Label>
                        <Input
                          value={comp.address}
                          onChange={(e) => updateComparable(index, { address: e.target.value })}
                          placeholder="456 Oak Street"
                        />
                      </div>
                      <div>
                        <Label>Unit Type</Label>
                        <Select 
                          value={comp.unit_type} 
                          onValueChange={(value: UnitType) => updateComparable(index, { unit_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="1br">1 Bedroom</SelectItem>
                            <SelectItem value="2br">2 Bedroom</SelectItem>
                            <SelectItem value="3br">3 Bedroom</SelectItem>
                            <SelectItem value="4br">4 Bedroom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Monthly Rent</Label>
                        <Input
                          type="number"
                          value={comp.monthly_rent}
                          onChange={(e) => updateComparable(index, { monthly_rent: parseInt(e.target.value) || 0 })}
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <Label>Square Feet</Label>
                        <Input
                          type="number"
                          value={comp.square_feet}
                          onChange={(e) => updateComparable(index, { square_feet: parseInt(e.target.value) || 0 })}
                          placeholder="800"
                        />
                      </div>
                      <div>
                        <Label>Distance (km)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={comp.distance_km}
                          onChange={(e) => updateComparable(index, { distance_km: parseFloat(e.target.value) || 0 })}
                          placeholder="1.5"
                        />
                      </div>
                      <div>
                        <Label>Property Age</Label>
                        <Input
                          type="number"
                          value={comp.property_age_years}
                          onChange={(e) => updateComparable(index, { property_age_years: parseInt(e.target.value) || 0 })}
                          placeholder="10"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!formData.local_rent_comparables || formData.local_rent_comparables.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No comparables added yet. Click "Add Comparable" to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financing Tab */}
        <TabsContent value="financing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="down_payment_percent">Down Payment (%)</Label>
                  <Input
                    id="down_payment_percent"
                    type="number"
                    step="0.1"
                    value={formData.down_payment_percent || ''}
                    onChange={(e) => updateFormData({ down_payment_percent: parseFloat(e.target.value) || 0 })}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    value={formData.interest_rate || ''}
                    onChange={(e) => updateFormData({ interest_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="6.5"
                  />
                </div>
                <div>
                  <Label htmlFor="amortization_years">Amortization (Years)</Label>
                  <Input
                    id="amortization_years"
                    type="number"
                    value={formData.amortization_years || ''}
                    onChange={(e) => updateFormData({ amortization_years: parseInt(e.target.value) || 0 })}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="property_tax_annual">Annual Property Tax</Label>
                  <Input
                    id="property_tax_annual"
                    type="number"
                    value={formData.property_tax_annual || ''}
                    onChange={(e) => updateFormData({ property_tax_annual: parseInt(e.target.value) || 0 })}
                    placeholder="8000"
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_annual">Annual Insurance</Label>
                  <Input
                    id="insurance_annual"
                    type="number"
                    value={formData.insurance_annual || ''}
                    onChange={(e) => updateFormData({ insurance_annual: parseInt(e.target.value) || 0 })}
                    placeholder="2400"
                  />
                </div>
                <div>
                  <Label htmlFor="vacancy_rate">Vacancy Rate (%)</Label>
                  <Input
                    id="vacancy_rate"
                    type="number"
                    step="0.1"
                    value={formData.vacancy_rate || ''}
                    onChange={(e) => updateFormData({ vacancy_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="5.0"
                  />
                </div>
                <div>
                  <Label htmlFor="property_management_percent">Property Management (%)</Label>
                  <Input
                    id="property_management_percent"
                    type="number"
                    step="0.1"
                    value={formData.property_management_percent || ''}
                    onChange={(e) => updateFormData({ property_management_percent: parseFloat(e.target.value) || 0 })}
                    placeholder="8.0"
                  />
                </div>
                <div>
                  <Label htmlFor="maintenance_percent">Maintenance (%)</Label>
                  <Input
                    id="maintenance_percent"
                    type="number"
                    step="0.1"
                    value={formData.maintenance_percent || ''}
                    onChange={(e) => updateFormData({ maintenance_percent: parseFloat(e.target.value) || 0 })}
                    placeholder="5.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}