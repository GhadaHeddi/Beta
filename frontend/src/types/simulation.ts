export interface SimulationInputData {
  property_price: number;
  works_amount: number;
  personal_contribution: number;
  notary_rate: number;
  loan_amount: number;
  interest_rate: number;
  insurance_rate: number;
  loan_duration_years: number;
  monthly_income: number;
  monthly_charges: number;
}

export interface SimulationOutputData {
  notary_fees: number;
  total_with_fees: number;
  price_with_fees_and_works: number;
  amount_to_finance: number;
  monthly_payment: number;
  borrowing_capacity: number;
}

export interface Simulation {
  id: number;
  project_id: number;
  simulation_type: string;
  name: string;
  input_data: SimulationInputData;
  output_data: SimulationOutputData | null;
  notes: string | null;
  selected: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface SimulationCreateData {
  name: string;
  simulation_type?: string;
  input_data: SimulationInputData;
  output_data?: SimulationOutputData | null;
  notes?: string | null;
  selected?: boolean;
}

export interface SimulationUpdateData {
  name?: string;
  simulation_type?: string;
  input_data?: SimulationInputData;
  output_data?: SimulationOutputData | null;
  notes?: string | null;
  selected?: boolean;
}

export const DEFAULT_SIMULATION_INPUT: SimulationInputData = {
  property_price: 1000000,
  works_amount: 0,
  personal_contribution: 0,
  notary_rate: 7.4,
  loan_amount: 1000000,
  interest_rate: 3.5,
  insurance_rate: 0.3,
  loan_duration_years: 20,
  monthly_income: 8000,
  monthly_charges: 1500,
};
