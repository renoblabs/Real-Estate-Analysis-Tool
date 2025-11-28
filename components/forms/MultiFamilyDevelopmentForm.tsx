'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import type { MultiFamilyInputs, MultiFamilyUnit, MarketComparable, DevelopmentType, RenovationScope, UnitType } from '@/types';

interface MultiFamilyDevelopmentFormProps {
  formData: Partial<MultiFamilyInputs>;
  onChange: (data: Partial<MultiFamilyInputs>) => void;
}

export function MultiFamilyDevelopmentForm({ formData, onChange }: MultiFamilyDevelopmentFormProps) {
  const [activeTab, setActiveTab] = useState('development');

  const updateFormData = (updates: Partial<MultiFamilyInputs>) => {
    onChange({ ...formData, ...updates });
  };

  const addUnit = () => {
    const newUnit: MultiFamilyUnit = {
      unit_type: '2br',
      square_feet: 800,
      target_rent: 2000,
      bedrooms: 2,
      bathrooms: 1
    };
    
    const currentUnits = formData.target_units || [];
    updateFormData({ target_units: [...currentUnits, newUnit] });
  };

  const updateUnit = (index: number, updates: Partial<MultiFamilyUnit>) => {
    const currentUnits = formData.target_units || [];
    const updatedUnits = currentUnits.map((unit, i) => 
      i === index ? { ...unit, ...updates } : unit
    );
    updateFormData({ target_units: updatedUnits });
  };

  const removeUnit = (index: number) => {
    const currentUnits = formData.target_units || [];
    const updatedUnits = currentUnits.filter((_, i) => i !== index);
    updateFormData({ target_units: updatedUnits });
  };

  const addComparable = () => {
    const newComparable: MarketComparable = {
      address: '',
      unit_type: '2br',
      rent: 2000,
      square_feet: 800,
      distance_km: 1,
      age_years: 5,
      bedrooms: 2,
      bathrooms: 1
    };
    
    const currentComparables = formData.comparable_rents || [];
    updateFormData({ comparable_rents: [...currentComparables, newComparable] });
  };

  const updateComparable = (index: number, updates: Partial<MarketComparable>) => {
    const currentComparables = formData.comparable_rents || [];
    const updatedComparables = currentComparables.map((comp, i) => 
      i === index ? { ...comp, ...updates } : comp
    );
    updateFormData({ comparable_rents: updatedComparables });
  };

  const removeComparable = (index: number) => {
    const currentComparables = formData.comparable_rents || [];
    const updatedComparables = currentComparables.filter((_, i) => i !== index);
    updateFormData({ comparable_rents: updatedComparables });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏗️ Multi-Family Development Analysis
            <Badge variant="secondary">New Feature</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="units">Unit Mix</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="market">Market Data</TabsTrigger>
            </TabsList>

            <TabsContent value="development" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="development_type">Development Type</Label>
                  <Select
                    value={formData.development_type || 'existing_structure'}
                    onValueChange={(value: DevelopmentType) => updateFormData({ development_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select development type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw_land">Raw Land Development</SelectItem>
                      <SelectItem value="existing_structure">Existing Structure Renovation</SelectItem>
                      <SelectItem value="new_construction">New Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="renovation_scope">Renovation Scope</Label>
                  <Select
                    value={formData.renovation_scope || 'moderate'}
                    onValueChange={(value: RenovationScope) => updateFormData({ renovation_scope: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select renovation scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cosmetic">Cosmetic Updates</SelectItem>
                      <SelectItem value="moderate">Moderate Renovation</SelectItem>
                      <SelectItem value="heavy">Heavy Renovation</SelectItem>
                      <SelectItem value="gut_renovation">Gut Renovation</SelectItem>
                      <SelectItem value="new_build">New Build</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.development_type === 'raw_land' && (
                  <div>
                    <Label htmlFor="land_cost">Land Cost ($)</Label>
                    <Input
                      id="land_cost"
                      type="number"
                      value={formData.land_cost || ''}
                      onChange={(e) => updateFormData({ land_cost: Number(e.target.value) })}
                      placeholder="500000"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="site_preparation_cost">Site Preparation Cost ($)</Label>
                  <Input
                    id="site_preparation_cost"
                    type="number"
                    value={formData.site_preparation_cost || ''}
                    onChange={(e) => updateFormData({ site_preparation_cost: Number(e.target.value) })}
                    placeholder="50000"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="units" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Unit Configuration</h3>
                <Button onClick={addUnit} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
                </Button>
              </div>

              <div className="space-y-4">
                {(formData.target_units || []).map((unit, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
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
                            onChange={(e) => updateUnit(index, { square_feet: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <Label>Target Rent ($)</Label>
                          <Input
                            type="number"
                            value={unit.target_rent}
                            onChange={(e) => updateUnit(index, { target_rent: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <Label>Bedrooms</Label>
                          <Input
                            type="number"
                            value={unit.bedrooms}
                            onChange={(e) => updateUnit(index, { bedrooms: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <Label>Bathrooms</Label>
                          <Input
                            type="number"
                            step="0.5"
                            value={unit.bathrooms}
                            onChange={(e) => updateUnit(index, { bathrooms: Number(e.target.value) })}
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeUnit(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!formData.target_units || formData.target_units.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No units configured yet. Click "Add Unit" to get started.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="construction_cost_per_sqft">Construction Cost per Sq Ft ($)</Label>
                  <Input
                    id="construction_cost_per_sqft"
                    type="number"
                    value={formData.construction_cost_per_sqft || ''}
                    onChange={(e) => updateFormData({ construction_cost_per_sqft: Number(e.target.value) })}
                    placeholder="150"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave blank to use default estimates</p>
                </div>

                <div>
                  <Label htmlFor="permit_costs">Permit Costs ($)</Label>
                  <Input
                    id="permit_costs"
                    type="number"
                    value={formData.permit_costs || ''}
                    onChange={(e) => updateFormData({ permit_costs: Number(e.target.value) })}
                    placeholder="25000"
                  />
                </div>

                <div>
                  <Label htmlFor="architect_engineer_fees">Architect/Engineer Fees ($)</Label>
                  <Input
                    id="architect_engineer_fees"
                    type="number"
                    value={formData.architect_engineer_fees || ''}
                    onChange={(e) => updateFormData({ architect_engineer_fees: Number(e.target.value) })}
                    placeholder="40000"
                  />
                </div>

                <div>
                  <Label htmlFor="zoning_compliance_cost">Zoning Compliance Cost ($)</Label>
                  <Input
                    id="zoning_compliance_cost"
                    type="number"
                    value={formData.zoning_compliance_cost || ''}
                    onChange={(e) => updateFormData({ zoning_compliance_cost: Number(e.target.value) })}
                    placeholder="15000"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="market_vacancy_rate">Market Vacancy Rate (%)</Label>
                  <Input
                    id="market_vacancy_rate"
                    type="number"
                    step="0.1"
                    value={formData.market_vacancy_rate ? formData.market_vacancy_rate * 100 : ''}
                    onChange={(e) => updateFormData({ market_vacancy_rate: Number(e.target.value) / 100 })}
                    placeholder="5.0"
                  />
                </div>

                <div>
                  <Label htmlFor="rent_growth_projection">Rent Growth Projection (%)</Label>
                  <Input
                    id="rent_growth_projection"
                    type="number"
                    step="0.1"
                    value={formData.rent_growth_projection ? formData.rent_growth_projection * 100 : ''}
                    onChange={(e) => updateFormData({ rent_growth_projection: Number(e.target.value) / 100 })}
                    placeholder="3.0"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Market Comparables</h3>
                <Button onClick={addComparable} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Comparable
                </Button>
              </div>

              <div className="space-y-4">
                {(formData.comparable_rents || []).map((comp, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label>Address</Label>
                          <Input
                            value={comp.address}
                            onChange={(e) => updateComparable(index, { address: e.target.value })}
                            placeholder="123 Main St"
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
                              <SelectItem value="1br">1BR</SelectItem>
                              <SelectItem value="2br">2BR</SelectItem>
                              <SelectItem value="3br">3BR</SelectItem>
                              <SelectItem value="4br">4BR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Rent ($)</Label>
                          <Input
                            type="number"
                            value={comp.rent}
                            onChange={(e) => updateComparable(index, { rent: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <Label>Sq Ft</Label>
                          <Input
                            type="number"
                            value={comp.square_feet}
                            onChange={(e) => updateComparable(index, { square_feet: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <Label>Distance (km)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={comp.distance_km}
                            onChange={(e) => updateComparable(index, { distance_km: Number(e.target.value) })}
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeComparable(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!formData.comparable_rents || formData.comparable_rents.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No market comparables added yet. Click "Add Comparable" to get started.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}