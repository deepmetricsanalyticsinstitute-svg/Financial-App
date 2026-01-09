import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, DollarSign, PieChart as PieChartIcon, Info, Calendar, TrendingUp, Plus, History, Activity } from 'lucide-react';
import { LoanDetails, AllocationResult, AllocationHistoryItem } from './types';
import AllocationChart from './components/AllocationChart';
import TrendChart from './components/TrendChart';
import { generateFinancialInsight } from './services/geminiService';

const App: React.FC = () => {
  // State for Loan Configuration
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    principal: 120000,
    interestRate: 10, // 10% Flat Rate
    durationMonths: 12,
  });

  // State for Simulation
  const [reimbursementInput, setReimbursementInput] = useState<string>('');
  const [allocation, setAllocation] = useState<AllocationResult | null>(null);
  const [history, setHistory] = useState<AllocationHistoryItem[]>([]);
  
  // State for AI Insight
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);

  // Derived Values
  const totalInterest = (loanDetails.principal * (loanDetails.interestRate / 100));
  const expectedMonthlyInterest = totalInterest / loanDetails.durationMonths;
  const expectedMonthlyPrincipal = loanDetails.principal / loanDetails.durationMonths;
  const expectedTotalMonthly = expectedMonthlyInterest + expectedMonthlyPrincipal;

  // Summary Calculations
  const totalPrincipalPaid = history.reduce((sum, item) => sum + item.allocatedPrincipal, 0);
  const totalInterestPaid = history.reduce((sum, item) => sum + item.allocatedInterest, 0);
  const remainingPrincipal = Math.max(0, loanDetails.principal - totalPrincipalPaid);
  const repaymentProgress = loanDetails.principal > 0 ? (totalPrincipalPaid / loanDetails.principal) * 100 : 0;

  // Calculation Logic
  const calculateAllocation = useCallback((amount: number) => {
    // Rule: Interest is knocked off first.
    // If Amount < Expected Interest, all goes to Interest, Principal = 0.
    // If Amount >= Expected Interest, Interest = Expected Interest, Remainder goes to Principal.
    
    let allocatedInterest = 0;
    let allocatedPrincipal = 0;

    if (amount <= expectedMonthlyInterest) {
      allocatedInterest = amount;
      allocatedPrincipal = 0;
    } else {
      allocatedInterest = expectedMonthlyInterest;
      allocatedPrincipal = amount - expectedMonthlyInterest;
    }

    return {
      paymentAmount: amount,
      expectedMonthlyInterest,
      allocatedInterest,
      allocatedPrincipal,
      isShortfall: amount < expectedMonthlyInterest
    };
  }, [expectedMonthlyInterest]);

  // Handle Input Change
  const handleReimbursementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReimbursementInput(val);
    
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && numVal >= 0) {
      const result = calculateAllocation(numVal);
      setAllocation(result);
      setAiInsight(''); // Clear old insight on change
    } else {
      setAllocation(null);
    }
  };

  // Handle Record Payment
  const handleRecordPayment = () => {
    if (!allocation) return;

    const newMonth = history.length + 1;
    const newItem: AllocationHistoryItem = {
      ...allocation,
      month: newMonth
    };

    setHistory([...history, newItem]);
    
    // Reset inputs for next entry
    setReimbursementInput('');
    setAllocation(null);
    setAiInsight('');
  };

  // Trigger AI Insight
  const handleGetInsight = async () => {
    if (!allocation) return;
    setLoadingInsight(true);
    const insight = await generateFinancialInsight(allocation, loanDetails.principal);
    setAiInsight(insight);
    setLoadingInsight(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Retention Fund Allocator</h1>
              <p className="text-xs text-slate-400">Loan Repayment & Interest Separation System</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Loan Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount ($)</label>
                  <input
                    type="number"
                    value={loanDetails.principal}
                    onChange={(e) => setLoanDetails({...loanDetails, principal: Number(e.target.value)})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Interest Rate (%)</label>
                  <input
                    type="number"
                    value={loanDetails.interestRate}
                    onChange={(e) => setLoanDetails({...loanDetails, interestRate: Number(e.target.value)})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Flat rate over the full period</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    value={loanDetails.durationMonths}
                    onChange={(e) => setLoanDetails({...loanDetails, durationMonths: Number(e.target.value)})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Expected Monthly breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Quota:</span>
                    <span className="font-semibold text-amber-600">${expectedMonthlyInterest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Principal Return:</span>
                    <span className="font-semibold text-emerald-600">${expectedMonthlyPrincipal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-200">
                    <span className="text-gray-800 font-medium">Total Expected:</span>
                    <span className="font-bold text-gray-900">${expectedTotalMonthly.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Loan Status Summary (New) */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Loan Status Summary
              </h2>
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                   <span className="text-gray-600 text-sm font-medium">Current Status</span>
                   <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                     {history.length === 0 ? 'Start' : `After Month ${history.length}`}
                   </span>
                </div>
                
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Remaining Principal</span>
                  <div className="text-3xl font-bold text-gray-900 mt-1">${remainingPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Principal Repayment Progress</span>
                      <span>{repaymentProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${Math.min(100, repaymentProgress)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm">Accumulated Interest Paid</span>
                     <span className="font-semibold text-amber-600">${totalInterestPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Allocation Rule</h4>
                  <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                    Reimbursements prioritize interest. If payment &lt; expected interest, entire amount goes to interest. Principal is only paid after the monthly interest quota is met.
                  </p>
                </div>
              </div>
            </div>

            {/* History List Summary (Optional small view) */}
            {history.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-500" />
                  Recent History
                </h2>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {history.slice().reverse().map((item) => (
                    <div key={item.month} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-600">Month {item.month}</span>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">${item.paymentAmount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          <span className="text-amber-600">I: ${item.allocatedInterest.toFixed(2)}</span> • 
                          <span className="text-emerald-600 ml-1">P: ${item.allocatedPrincipal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Calculator & Visualization */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Calculator Card */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Reimbursement Simulator
                </h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  Step 1: Simulate Payment
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Reimbursement Received
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-lg">$</span>
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={reimbursementInput}
                        onChange={handleReimbursementChange}
                        className="w-full rounded-lg border-gray-300 border pl-8 p-3 text-lg font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm transition"
                      />
                    </div>
                  </div>

                  {allocation && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-amber-800">Interest Component</span>
                          <span className="text-lg font-bold text-amber-700">${allocation.allocatedInterest.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-amber-200 rounded-full h-2">
                          <div 
                            className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(allocation.allocatedInterest / allocation.paymentAmount) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-emerald-800">Principal Component</span>
                          <span className="text-lg font-bold text-emerald-700">${allocation.allocatedPrincipal.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-emerald-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(allocation.allocatedPrincipal / allocation.paymentAmount) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        onClick={handleRecordPayment}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-lg font-medium transition shadow-sm mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        Record Payment to History
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 border border-gray-100 h-full min-h-[300px]">
                   <h3 className="text-sm font-medium text-gray-500 mb-4">Current Split Visualization</h3>
                   {allocation ? (
                     <AllocationChart data={allocation} />
                   ) : (
                     <div className="h-64 flex items-center text-gray-400 text-sm">Waiting for input...</div>
                   )}
                </div>
              </div>
            </section>

             {/* History Trend Chart (New Feature) */}
             <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-indigo-600" />
                   Payment Trends
                 </h2>
                 <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  Historical Analysis
                </span>
               </div>
               <div className="w-full">
                 <TrendChart history={history} />
               </div>
             </section>

            {/* AI Insight Card */}
            {allocation && allocation.paymentAmount > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-indigo-600" />
                    Allocation Analysis (Current)
                  </h2>
                  <button 
                    onClick={handleGetInsight}
                    disabled={loadingInsight}
                    className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50 font-medium"
                  >
                    {loadingInsight ? 'Analyzing...' : 'Generate AI Report'}
                  </button>
                </div>
                
                {aiInsight ? (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed animate-in fade-in duration-500">
                    {aiInsight}
                  </div>
                ) : (
                   <div className="text-sm text-gray-500 italic">
                     Click "Generate AI Report" to get a professional explanation of this specific allocation logic for your records.
                   </div>
                )}
              </section>
            )}

            {/* Summary Table (Shortfall Scenario) */}
            {allocation && allocation.isShortfall && (
              <section className="bg-red-50 rounded-xl border border-red-100 p-4 flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-red-100 p-2 rounded-full h-fit">
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-red-900 font-semibold">Payment Shortfall Detected</h3>
                  <p className="text-red-700 text-sm mt-1">
                    The reimbursement of <strong>${allocation.paymentAmount.toFixed(2)}</strong> is less than the expected interest quota of <strong>${expectedMonthlyInterest.toFixed(2)}</strong>. 
                    <br/><br/>
                    Result: 100% of the payment has been allocated to interest. <strong>$0.00</strong> has been allocated to principal repayment.
                  </p>
                </div>
              </section>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;