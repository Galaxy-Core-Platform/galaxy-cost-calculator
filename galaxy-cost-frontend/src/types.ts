export interface CostEstimate {
  provider: string;
  customerCount: number;
  architecture: string;
  monthlyCost: number;
  annualCost: number;
  costPerCustomer: number;
  components: {
    compute: number;
    database: number;
    storage: number;
    network: number;
    observability: number;
    security: number;
    backupDr: number;
    nonProduction: number;
    cacheQueue: number;
    apiGateway: number;
    cicd: number;
  };
}

export interface CloudComparison {
  aws: CostEstimate;
  gcp: CostEstimate;
  azure: CostEstimate;
}

export interface CalculatorForm {
  customerCount: number;
  architecture: 'single_region_3az' | 'multi_region_3az';
  provider: 'aws' | 'gcp' | 'azure' | 'all';
  includeNonProd: boolean;
}