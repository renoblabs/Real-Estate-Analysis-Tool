// DIY Construction Cost Calculator
// Factors in what you can do yourself vs contractor costs

export interface DIYCapabilities {
  electrical: boolean;
  plumbing: boolean;
  drywall: boolean;
  flooring: boolean;
  painting: boolean;
  landscaping: boolean;
  generalLabor: boolean;
  roofing: boolean;
  framing: boolean;
  insulation: boolean;
  tiling: boolean;
  cabinetry: boolean;
}

export interface RenovationScope {
  kitchenReno: boolean;
  bathroomReno: boolean;
  flooringReplacement: boolean;
  paintingInterior: boolean;
  paintingExterior: boolean;
  electricalUpgrade: boolean;
  plumbingUpgrade: boolean;
  roofRepair: boolean;
  windowReplacement: boolean;
  insulationUpgrade: boolean;
  basementFinishing: boolean;
  deckConstruction: boolean;
  landscaping: boolean;
  hvacUpgrade: boolean;
}

export interface ConstructionCostBreakdown {
  totalCost: number;
  laborSavings: number;
  materialCosts: number;
  contractorCosts: number;
  permitCosts: number;
  timeline: {
    diyHours: number;
    contractorDays: number;
    totalWeeks: number;
  };
  breakdown: {
    category: string;
    diyPossible: boolean;
    materialCost: number;
    laborCost: number;
    contractorCost: number;
    savings: number;
    timeRequired: number; // hours
  }[];
}

// Canadian construction costs (2024 averages)
const CONSTRUCTION_COSTS = {
  kitchen: {
    basic: { material: 8000, labor: 6000, contractor: 18000 },
    mid: { material: 15000, labor: 12000, contractor: 35000 },
    high: { material: 25000, labor: 20000, contractor: 60000 }
  },
  bathroom: {
    basic: { material: 3000, labor: 3500, contractor: 8500 },
    mid: { material: 6000, labor: 6000, contractor: 15000 },
    high: { material: 12000, labor: 10000, contractor: 28000 }
  },
  flooring: {
    laminate: { materialPerSqFt: 3, laborPerSqFt: 2, contractorPerSqFt: 8 },
    hardwood: { materialPerSqFt: 8, laborPerSqFt: 4, contractorPerSqFt: 15 },
    tile: { materialPerSqFt: 5, laborPerSqFt: 6, contractorPerSqFt: 14 },
    carpet: { materialPerSqFt: 4, laborPerSqFt: 2, contractorPerSqFt: 8 }
  },
  painting: {
    interiorPerSqFt: { material: 0.5, labor: 1.5, contractor: 3 },
    exteriorPerSqFt: { material: 0.8, labor: 2, contractor: 4.5 }
  },
  electrical: {
    panelUpgrade: { material: 1500, labor: 1000, contractor: 3500 },
    rewiring: { material: 3000, labor: 4000, contractor: 8500 },
    addOutlets: { material: 50, labor: 100, contractor: 200 }
  },
  plumbing: {
    roughIn: { material: 2000, labor: 3000, contractor: 6500 },
    fixtures: { material: 1500, labor: 1000, contractor: 3000 },
    waterHeater: { material: 1200, labor: 800, contractor: 2500 }
  },
  roofing: {
    asphaltPerSqFt: { material: 4, labor: 3, contractor: 9 },
    metalPerSqFt: { material: 8, labor: 4, contractor: 15 }
  },
  windows: {
    standardWindow: { material: 400, labor: 200, contractor: 800 },
    premiumWindow: { material: 800, labor: 300, contractor: 1400 }
  },
  insulation: {
    atticPerSqFt: { material: 1.5, labor: 1, contractor: 3.5 },
    wallsPerSqFt: { material: 2, labor: 2, contractor: 5.5 }
  },
  hvac: {
    furnaceReplacement: { material: 3000, labor: 1500, contractor: 6000 },
    ductwork: { material: 2000, labor: 2500, contractor: 6000 }
  },
  permits: {
    electrical: 150,
    plumbing: 100,
    structural: 300,
    general: 200
  }
};

export class DIYConstructionCalculator {
  
  /**
   * Calculate total renovation costs with DIY savings
   */
  static calculateRenovationCosts(
    scope: RenovationScope,
    capabilities: DIYCapabilities,
    squareFootage: number = 1200,
    quality: 'basic' | 'mid' | 'high' = 'mid'
  ): ConstructionCostBreakdown {
    
    const breakdown: ConstructionCostBreakdown['breakdown'] = [];
    let totalMaterialCosts = 0;
    let totalLaborSavings = 0;
    let totalContractorCosts = 0;
    let totalDIYHours = 0;
    let totalContractorDays = 0;
    let totalPermitCosts = 0;

    // Kitchen Renovation
    if (scope.kitchenReno) {
      const kitchenCosts = CONSTRUCTION_COSTS.kitchen[quality];
      const canDIY = capabilities.generalLabor && capabilities.electrical && capabilities.plumbing;
      
      const item = {
        category: 'Kitchen Renovation',
        diyPossible: canDIY,
        materialCost: kitchenCosts.material,
        laborCost: canDIY ? 0 : kitchenCosts.labor,
        contractorCost: canDIY ? 0 : kitchenCosts.contractor,
        savings: canDIY ? kitchenCosts.labor : 0,
        timeRequired: canDIY ? 80 : 0
      };
      
      breakdown.push(item);
      totalMaterialCosts += item.materialCost;
      totalLaborSavings += item.savings;
      totalContractorCosts += item.contractorCost;
      totalDIYHours += item.timeRequired;
      if (!canDIY) totalContractorDays += 10;
    }

    // Bathroom Renovation
    if (scope.bathroomReno) {
      const bathroomCosts = CONSTRUCTION_COSTS.bathroom[quality];
      const canDIY = capabilities.generalLabor && capabilities.electrical && capabilities.plumbing && capabilities.tiling;
      
      const item = {
        category: 'Bathroom Renovation',
        diyPossible: canDIY,
        materialCost: bathroomCosts.material,
        laborCost: canDIY ? 0 : bathroomCosts.labor,
        contractorCost: canDIY ? 0 : bathroomCosts.contractor,
        savings: canDIY ? bathroomCosts.labor : 0,
        timeRequired: canDIY ? 60 : 0
      };
      
      breakdown.push(item);
      totalMaterialCosts += item.materialCost;
      totalLaborSavings += item.savings;
      totalContractorCosts += item.contractorCost;
      totalDIYHours += item.timeRequired;
      if (!canDIY) totalContractorDays += 7;
    }

    // Flooring Replacement
    if (scope.flooringReplacement) {
      const flooringType = quality === 'high' ? 'hardwood' : quality === 'mid' ? 'laminate' : 'carpet';
      const flooringCosts = CONSTRUCTION_COSTS.flooring[flooringType];
      const canDIY = capabilities.generalLabor && capabilities.flooring;
      
      const materialCost = flooringCosts.materialPerSqFt * squareFootage;
      const laborCost = flooringCosts.laborPerSqFt * squareFootage;
      const contractorCost = flooringCosts.contractorPerSqFt * squareFootage;
      
      const item = {
        category: `${flooringType.charAt(0).toUpperCase() + flooringType.slice(1)} Flooring`,
        diyPossible: canDIY,
        materialCost,
        laborCost: canDIY ? 0 : laborCost,
        contractorCost: canDIY ? 0 : contractorCost,
        savings: canDIY ? laborCost : 0,
        timeRequired: canDIY ? squareFootage * 0.5 : 0
      };
      
      breakdown.push(item);
      totalMaterialCosts += item.materialCost;
      totalLaborSavings += item.savings;
      totalContractorCosts += item.contractorCost;
      totalDIYHours += item.timeRequired;
      if (!canDIY) totalContractorDays += 3;
    }

    // Interior Painting
    if (scope.paintingInterior) {
      const paintingCosts = CONSTRUCTION_COSTS.painting.interiorPerSqFt;
      const canDIY = capabilities.painting;
      const wallArea = squareFootage * 2.5; // Approximate wall area
      
      const materialCost = paintingCosts.material * wallArea;
      const laborCost = paintingCosts.labor * wallArea;
      const contractorCost = paintingCosts.contractor * wallArea;
      
      const item = {
        category: 'Interior Painting',
        diyPossible: canDIY,
        materialCost,
        laborCost: canDIY ? 0 : laborCost,
        contractorCost: canDIY ? 0 : contractorCost,
        savings: canDIY ? laborCost : 0,
        timeRequired: canDIY ? wallArea * 0.3 : 0
      };
      
      breakdown.push(item);
      totalMaterialCosts += item.materialCost;
      totalLaborSavings += item.savings;
      totalContractorCosts += item.contractorCost;
      totalDIYHours += item.timeRequired;
      if (!canDIY) totalContractorDays += 3;
    }

    // Electrical Upgrade
    if (scope.electricalUpgrade) {
      const electricalCosts = CONSTRUCTION_COSTS.electrical.panelUpgrade;
      const canDIY = capabilities.electrical;
      
      const item = {
        category: 'Electrical Panel Upgrade',
        diyPossible: canDIY,
        materialCost: electricalCosts.material,
        laborCost: canDIY ? 0 : electricalCosts.labor,
        contractorCost: canDIY ? 0 : electricalCosts.contractor,
        savings: canDIY ? electricalCosts.labor : 0,
        timeRequired: canDIY ? 16 : 0
      };
      
      breakdown.push(item);
      totalMaterialCosts += item.materialCost;
      totalLaborSavings += item.savings;
      totalContractorCosts += item.contractorCost;
      totalDIYHours += item.timeRequired;
      totalPermitCosts += CONSTRUCTION_COSTS.permits.electrical;
      if (!canDIY) totalContractorDays += 2;
    }

    // Plumbing Upgrade
    if (scope.plumbingUpgrade) {
      const plumbingCosts = CONSTRUCTION_COSTS.plumbing.roughIn;
      const canDIY = capabilities.plumbing;
      
      const item = {
        category: 'Plumbing Rough-in',
        diyPossible: canDIY,
        materialCost: plumbingCosts.material,
        laborCost: canDIY ? 0 : plumbingCosts.labor,
        contractorCost: canDIY ? 0 : plumbingCosts.contractor,
        savings: canDIY ? plumbingCosts.labor : 0,
        timeRequired: canDIY ? 24 : 0
      };
      
      breakdown.push(item);
      totalMaterialCosts += item.materialCost;
      totalLaborSavings += item.savings;
      totalContractorCosts += item.contractorCost;
      totalDIYHours += item.timeRequired;
      totalPermitCosts += CONSTRUCTION_COSTS.permits.plumbing;
      if (!canDIY) totalContractorDays += 3;
    }

    // Roofing
    if (scope.roofRepair) {
      const roofingCosts = CONSTRUCTION_COSTS.roofing.asphaltPerSqFt;
      const canDIY = capabilities.roofing;
      const roofArea = squareFootage * 1.2; // Approximate roof area
      
      const materialCost = roofingCosts.material * roofArea;
      const laborCost = roofingCosts.labor * roofArea;
      const contractorCost = roofingCosts.contractor * roofArea;
      
      const item = {
        category: 'Roof Replacement',
        diyPossible: canDIY,
        materialCost,
        laborCost: canDIY ? 0 : laborCost,
        contractorCost: canDIY ? 0 : contractorCost,
        savings: canDIY ? laborCost : 0,
        timeRequired: canDIY ? roofArea * 0.8 : 0
      };
      
      breakdown.push(item);
      totalMaterialCosts += item.materialCost;
      totalLaborSavings += item.savings;
      totalContractorCosts += item.contractorCost;
      totalDIYHours += item.timeRequired;
      if (!canDIY) totalContractorDays += 5;
    }

    // Landscaping
    if (scope.landscaping) {
      const canDIY = capabilities.landscaping;
      const landscapingBudget = 5000; // Base budget
      
      const item = {
        category: 'Landscaping',
        diyPossible: canDIY,
        materialCost: landscapingBudget * 0.6,
        laborCost: canDIY ? 0 : landscapingBudget * 0.4,
        contractorCost: canDIY ? 0 : landscapingBudget,
        savings: canDIY ? landscapingBudget * 0.4 : 0,
        timeRequired: canDIY ? 40 : 0
      };
      
      breakdown.push(item);
      totalMaterialCosts += item.materialCost;
      totalLaborSavings += item.savings;
      totalContractorCosts += item.contractorCost;
      totalDIYHours += item.timeRequired;
      if (!canDIY) totalContractorDays += 3;
    }

    const totalCost = totalMaterialCosts + totalContractorCosts + totalPermitCosts;
    const totalWeeks = Math.max(
      Math.ceil(totalDIYHours / 40), // Assuming 40 hours/week DIY work
      Math.ceil(totalContractorDays / 5) // Assuming 5 working days/week
    );

    return {
      totalCost,
      laborSavings: totalLaborSavings,
      materialCosts: totalMaterialCosts,
      contractorCosts: totalContractorCosts,
      permitCosts: totalPermitCosts,
      timeline: {
        diyHours: totalDIYHours,
        contractorDays: totalContractorDays,
        totalWeeks
      },
      breakdown
    };
  }

  /**
   * Calculate value-add potential from renovations
   */
  static calculateValueAdd(
    renovationCosts: ConstructionCostBreakdown,
    currentValue: number,
    marketConditions: 'hot' | 'balanced' | 'cold' = 'balanced'
  ): {
    estimatedValueIncrease: number;
    roi: number;
    netGain: number;
    recommendations: string[];
  } {
    
    const recommendations: string[] = [];
    
    // Base value multipliers by renovation type
    const valueMultipliers = {
      'Kitchen Renovation': marketConditions === 'hot' ? 0.8 : marketConditions === 'balanced' ? 0.7 : 0.6,
      'Bathroom Renovation': marketConditions === 'hot' ? 0.75 : marketConditions === 'balanced' ? 0.65 : 0.55,
      'Flooring': 0.6,
      'Interior Painting': 0.5,
      'Electrical Panel Upgrade': 0.4,
      'Plumbing Rough-in': 0.4,
      'Roof Replacement': 0.7,
      'Landscaping': 0.5
    };

    let totalValueIncrease = 0;

    renovationCosts.breakdown.forEach(item => {
      const totalSpent = item.materialCost + item.laborCost + item.contractorCost;
      const multiplier = Object.entries(valueMultipliers).find(([key]) => 
        item.category.includes(key)
      )?.[1] || 0.5;
      
      const valueIncrease = totalSpent * multiplier;
      totalValueIncrease += valueIncrease;
    });

    const roi = (totalValueIncrease / renovationCosts.totalCost) * 100;
    const netGain = totalValueIncrease - renovationCosts.totalCost;

    // Generate recommendations
    if (roi > 100) {
      recommendations.push('🚀 Excellent ROI potential - proceed with renovations');
    } else if (roi > 70) {
      recommendations.push('✅ Good ROI potential - solid investment');
    } else if (roi > 50) {
      recommendations.push('⚠️ Moderate ROI - consider scaling back scope');
    } else {
      recommendations.push('❌ Low ROI - reconsider renovation strategy');
    }

    if (renovationCosts.laborSavings > 10000) {
      recommendations.push(`💪 DIY skills save $${renovationCosts.laborSavings.toLocaleString()} in labor costs`);
    }

    if (renovationCosts.timeline.totalWeeks > 20) {
      recommendations.push('⏰ Long timeline - consider phased approach');
    }

    return {
      estimatedValueIncrease: totalValueIncrease,
      roi,
      netGain,
      recommendations
    };
  }

  /**
   * Generate DIY-optimized renovation strategy
   */
  static generateDIYStrategy(
    capabilities: DIYCapabilities,
    budget: number,
    timeAvailable: number // weeks
  ): {
    recommendedScope: Partial<RenovationScope>;
    phaseOrder: string[];
    budgetAllocation: { phase: string; cost: number; weeks: number }[];
    tips: string[];
  } {
    
    const tips: string[] = [];
    const phases: { phase: string; cost: number; weeks: number; priority: number }[] = [];

    // High-impact, DIY-friendly renovations
    if (capabilities.painting) {
      phases.push({
        phase: 'Interior Painting',
        cost: 2000,
        weeks: 2,
        priority: 1
      });
      tips.push('🎨 Start with painting - highest ROI for lowest cost');
    }

    if (capabilities.flooring) {
      phases.push({
        phase: 'Flooring Replacement',
        cost: 8000,
        weeks: 3,
        priority: 2
      });
      tips.push('🏠 Flooring dramatically improves property appeal');
    }

    if (capabilities.generalLabor && capabilities.electrical && capabilities.plumbing) {
      phases.push({
        phase: 'Kitchen Renovation',
        cost: 15000,
        weeks: 6,
        priority: 3
      });
      tips.push('🍳 Kitchen reno has highest value-add potential');
    }

    if (capabilities.generalLabor && capabilities.tiling) {
      phases.push({
        phase: 'Bathroom Renovation',
        cost: 6000,
        weeks: 4,
        priority: 4
      });
      tips.push('🛁 Bathroom updates provide strong returns');
    }

    if (capabilities.landscaping) {
      phases.push({
        phase: 'Landscaping',
        cost: 3000,
        weeks: 2,
        priority: 5
      });
      tips.push('🌿 Curb appeal improvements help with rent/resale');
    }

    // Filter by budget and time constraints
    const affordablePhases = phases
      .filter(phase => phase.cost <= budget)
      .sort((a, b) => a.priority - b.priority);

    let totalCost = 0;
    let totalWeeks = 0;
    const selectedPhases: typeof phases = [];

    for (const phase of affordablePhases) {
      if (totalCost + phase.cost <= budget && totalWeeks + phase.weeks <= timeAvailable) {
        selectedPhases.push(phase);
        totalCost += phase.cost;
        totalWeeks += phase.weeks;
      }
    }

    const recommendedScope: Partial<RenovationScope> = {};
    selectedPhases.forEach(phase => {
      if (phase.phase === 'Interior Painting') recommendedScope.paintingInterior = true;
      if (phase.phase === 'Flooring Replacement') recommendedScope.flooringReplacement = true;
      if (phase.phase === 'Kitchen Renovation') recommendedScope.kitchenReno = true;
      if (phase.phase === 'Bathroom Renovation') recommendedScope.bathroomReno = true;
      if (phase.phase === 'Landscaping') recommendedScope.landscaping = true;
    });

    return {
      recommendedScope,
      phaseOrder: selectedPhases.map(p => p.phase),
      budgetAllocation: selectedPhases.map(p => ({ 
        phase: p.phase, 
        cost: p.cost, 
        weeks: p.weeks 
      })),
      tips
    };
  }
}