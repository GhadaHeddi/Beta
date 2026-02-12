import type {
  Simulation,
  SimulationCreateData,
  SimulationUpdateData,
  SimulationInputData,
  SimulationOutputData,
} from '@/types/simulation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

function devOrAuth(projectId: number, path: string): string {
  const token = localStorage.getItem('access_token');
  if (token) {
    return `${API_BASE}/api/projects/${projectId}/simulations${path}`;
  }
  return `${API_BASE}/api/projects/${projectId}/simulations/dev${path}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) throw new Error('Session expirée');
  if (response.status === 404) throw new Error('Ressource non trouvée');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }
  return response.json();
}

// === CRUD ===

export async function getSimulations(projectId: number): Promise<Simulation[]> {
  const response = await fetch(devOrAuth(projectId, '/'), {
    headers: getHeaders(),
  });
  return handleResponse<Simulation[]>(response);
}

export async function createSimulation(
  projectId: number,
  data: SimulationCreateData
): Promise<Simulation> {
  const response = await fetch(devOrAuth(projectId, '/'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Simulation>(response);
}

export async function updateSimulation(
  projectId: number,
  simulationId: number,
  data: SimulationUpdateData
): Promise<Simulation> {
  const token = localStorage.getItem('access_token');
  const url = token
    ? `${API_BASE}/api/projects/${projectId}/simulations/${simulationId}`
    : `${API_BASE}/api/projects/${projectId}/simulations/dev/${simulationId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Simulation>(response);
}

export async function deleteSimulation(
  projectId: number,
  simulationId: number
): Promise<void> {
  const token = localStorage.getItem('access_token');
  const url = token
    ? `${API_BASE}/api/projects/${projectId}/simulations/${simulationId}`
    : `${API_BASE}/api/projects/${projectId}/simulations/dev/${simulationId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Erreur serveur (${response.status})`);
  }
}

// === Calculs côté client ===

export function computeSimulationOutputs(input: SimulationInputData): SimulationOutputData {
  const notary_fees = input.property_price * (input.notary_rate / 100);
  const total_with_fees = input.property_price + notary_fees;
  const price_with_fees_and_works = total_with_fees + input.works_amount;
  const amount_to_finance = price_with_fees_and_works - input.personal_contribution;

  // Mensualité (formule d'amortissement standard)
  const monthlyRate = input.interest_rate / 100 / 12;
  const numPayments = input.loan_duration_years * 12;
  let monthly_payment = 0;
  if (monthlyRate > 0 && numPayments > 0) {
    const loanPrincipal = input.loan_amount;
    const monthlyLoan =
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    const monthlyInsurance = (loanPrincipal * (input.insurance_rate / 100)) / 12;
    monthly_payment = monthlyLoan + monthlyInsurance;
  }

  // Capacité d'emprunt (taux d'endettement max 35%)
  const maxMonthlyPayment = (input.monthly_income - input.monthly_charges) * 0.35;
  let borrowing_capacity = 0;
  if (monthlyRate > 0 && numPayments > 0 && maxMonthlyPayment > 0) {
    // Déduire la part assurance de la mensualité max pour trouver la part prêt
    // monthly_insurance = capacity * (insurance_rate / 100) / 12
    // monthly_loan = maxMonthlyPayment - monthly_insurance
    // On résout: capacity = monthly_loan * ((1+r)^n - 1) / (r * (1+r)^n)
    // avec monthly_loan = maxMonthlyPayment - capacity * insurance_rate/100/12
    // => capacity * (1 + ins/1200) = maxMonthlyPayment * factor
    // => capacity = maxMonthlyPayment * factor / (1 + ins/1200 * factor) -- approximation
    const factor =
      (Math.pow(1 + monthlyRate, numPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    const insuranceMonthlyRate = input.insurance_rate / 100 / 12;
    borrowing_capacity = (maxMonthlyPayment * factor) / (1 + insuranceMonthlyRate * factor);
  }

  return {
    notary_fees: Math.round(notary_fees),
    total_with_fees: Math.round(total_with_fees),
    price_with_fees_and_works: Math.round(price_with_fees_and_works),
    amount_to_finance: Math.round(amount_to_finance),
    monthly_payment: Math.round(monthly_payment),
    borrowing_capacity: Math.round(borrowing_capacity),
  };
}
