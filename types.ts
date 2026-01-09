export interface LoanDetails {
  principal: number;
  interestRate: number; // Percentage
  durationMonths: number;
}

export interface AllocationResult {
  paymentAmount: number;
  expectedMonthlyInterest: number;
  allocatedInterest: number;
  allocatedPrincipal: number;
  isShortfall: boolean;
}

export interface AllocationHistoryItem extends AllocationResult {
  month: number;
}
