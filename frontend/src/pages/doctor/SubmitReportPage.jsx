import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Search,
  CheckCircle,
  Info,
  FileCheck,
  ShieldAlert,
  AlertTriangle,
  Stethoscope,
  X,
  ClipboardList
} from 'lucide-react';
import { doctorAPI, dataAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

export default function SubmitReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillDrug = location.state?.prefillDrug || '';

  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [drugs, setDrugs] = useState([]);
  const [drugSearch, setDrugSearch] = useState(prefillDrug);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState('');
  
  // Generate random 6-char PAT-XXXXXX patient ID
  const [patientId] = useState(() => "PAT-" + Math.random().toString(36).substring(2, 8).toUpperCase());

  const [formData, setFormData] = useState({
    drug_name: prefillDrug,
    patient_age: '',
    patient_gender: '',
    patient_weight: '',
    pre_existing_conditions: '',
    dosage: '',
    duration_of_use: '',
    onset_date: '',
    symptoms: '',
    severity: 'mild',
    patient_recovered: 'recovered',
    additional_notes: '',
    clinical_evidence: '',
    alternative_causes: '',
    causality: 'probable',
    recommendation: 'Discontinue'
  });

  useEffect(() => {
    async function fetchDrugs() {
      try {
        const res = await dataAPI.getDrugs();
        setDrugs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch drugs:", err);
      }
    }
    fetchDrugs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.drug_name || !formData.symptoms) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await doctorAPI.submitReport(formData);
      setSubmittedReportId(res.data.report_id);
      setShowSuccess(true);
      toast.success("Clinical report submitted successfully");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.patient_age || !formData.patient_gender)) {
        toast.error("Please fill in patient demographics");
        return;
    }
    if (step === 2 && (!formData.drug_name || !formData.symptoms)) {
        toast.error("Please fill in drug and symptom details");
        return;
    }
    setStep(prev => prev + 1);
  };
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <Layout title="Clinical Submission Node">
      <div className="max-w-4xl mx-auto pb-20 animate-safemed-fadein">
        
        {/* Step Indicator */}
        <div className="clinical-card mb-12 py-10 px-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-teal-500/10" />
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-white/5 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-700" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {[1, 2, 3].map((i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                  step > i ? 'bg-teal-500 border-teal-500 text-white shadow-glow-teal/20' :
                  step === i ? 'bg-white dark:bg-slate-950 border-teal-500 text-teal-500 shadow-glow-teal/40 scale-110' :
                  'bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-400'
                }`}>
                  {step > i ? <Check className="w-7 h-7" /> : <span className="text-lg font-black">{i}</span>}
                </div>
                <div className="absolute -bottom-10 whitespace-nowrap">
                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                     step >= i ? 'text-teal-500' : 'text-slate-400'
                   }`}>
                     {i === 1 ? 'Patient' : i === 2 ? 'Clinical' : 'Evidence'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="clinical-card min-h-[650px] flex flex-col p-12 relative">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
             {step === 1 ? <Stethoscope className="w-64 h-64" /> : step === 2 ? <ShieldAlert className="w-64 h-64" /> : <FileCheck className="w-64 h-64" />}
          </div>

          {step === 1 && (
            <div className="flex-1 animate-safemed-slidein">
               <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-4">
                      <Stethoscope className="w-8 h-8 text-teal-500" />
                      Patient Information
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Step 01: Clinical Demographics</p>
                  </div>
                  <div className="bg-teal-500/10 border border-teal-500/20 px-6 py-3 rounded-2xl text-right">
                     <p className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Generated ID</p>
                     <p className="text-lg font-black text-teal-500 font-mono tracking-tighter">{patientId}</p>
                  </div>
               </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-teal-500" /> Age (Years)
                  </label>
                  <input 
                    type="number"
                    value={formData.patient_age}
                    onChange={(e) => setFormData({...formData, patient_age: e.target.value})}
                    placeholder="Enter age"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-white/10 transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-teal-500" /> Gender
                  </label>
                  <select 
                    value={formData.patient_gender}
                    onChange={(e) => setFormData({...formData, patient_gender: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other/Non-binary</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-teal-500" /> Weight (kg)
                  </label>
                  <input 
                    type="number"
                    value={formData.patient_weight}
                    onChange={(e) => setFormData({...formData, patient_weight: e.target.value})}
                    placeholder="e.g. 70"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-3 md:col-span-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-teal-500" /> Pre-existing Conditions
                  </label>
                  <textarea 
                    value={formData.pre_existing_conditions}
                    onChange={(e) => setFormData({...formData, pre_existing_conditions: e.target.value})}
                    placeholder="Document relevant clinical history (Asthma, Diabetes, etc.)..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold min-h-[180px] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 animate-safemed-slidein">
               <div className="mb-12">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-4">
                    <ShieldAlert className="w-8 h-8 text-teal-500" />
                    Drug & Symptoms
                  </h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Step 02: Adverse Reaction Details</p>
               </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-teal-500" /> Suspected Medication
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    <input 
                      type="text"
                      value={drugSearch}
                      onChange={(e) => {
                        setDrugSearch(e.target.value);
                        if (formData.drug_name) setFormData({...formData, drug_name: ''});
                      }}
                      placeholder="Search tracked drug database..."
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl pl-16 pr-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold"
                    />
                    {drugSearch && !formData.drug_name && (
                      <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-3xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl">
                        {drugs.filter(d => d.drug_name.toLowerCase().includes(drugSearch.toLowerCase())).slice(0, 5).map(drug => (
                          <button
                            key={drug.drug_name}
                            onClick={() => {
                              setFormData({...formData, drug_name: drug.drug_name});
                              setDrugSearch(drug.drug_name);
                            }}
                            className="w-full text-left px-8 py-5 hover:bg-teal-500/10 text-slate-700 dark:text-slate-300 transition-colors border-b border-black/5 dark:border-white/5 last:border-0 flex justify-between items-center"
                          >
                            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{drug.drug_name}</span>
                            <span className="text-[9px] font-black bg-teal-500/10 text-teal-500 px-3 py-1 rounded-full uppercase tracking-tighter">Verified Node</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dosage Schedule</label>
                    <input 
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      placeholder="e.g. 500mg BID"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration of Use</label>
                    <input 
                      type="text"
                      value={formData.duration_of_use}
                      onChange={(e) => setFormData({...formData, duration_of_use: e.target.value})}
                      placeholder="e.g. 14 days"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Symptoms / Side Effects</label>
                    <textarea 
                      value={formData.symptoms}
                      onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                      placeholder="Comprehensive description of the adverse reaction..."
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold min-h-[140px] resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Severity Level</label>
                    <select 
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold cursor-pointer"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="life-threatening">Life-threatening</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date of Onset</label>
                    <input 
                      type="date"
                      value={formData.onset_date}
                      onChange={(e) => setFormData({...formData, onset_date: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold"
                    />
                  </div>
                   <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recovery Status</label>
                    <select 
                      value={formData.patient_recovered}
                      onChange={(e) => setFormData({...formData, patient_recovered: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold cursor-pointer"
                    >
                      <option value="recovered">Recovered</option>
                      <option value="recovering">Recovering</option>
                      <option value="not-recovered">Not Recovered</option>
                      <option value="fatal">Fatal Outcome</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Additional Clinical Notes</label>
                    <textarea 
                      value={formData.additional_notes}
                      onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                      placeholder="Any supplemental clinical observations..."
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 animate-safemed-slidein">
               <div className="mb-12">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-4">
                    <FileCheck className="w-8 h-8 text-teal-500" />
                    Evidence & Confirmation
                  </h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Step 03: Final Assessment & Attestation</p>
               </div>
              
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <ClipboardList className="w-4 h-4 text-teal-500" /> Clinical Evidence (Labs/Tests)
                    </label>
                    <textarea 
                      value={formData.clinical_evidence}
                      onChange={(e) => setFormData({...formData, clinical_evidence: e.target.value})}
                      placeholder="Document lab results, imaging, or physical findings..."
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold min-h-[120px] resize-none"
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alternative Causes Considered</label>
                    <textarea 
                      value={formData.alternative_causes}
                      onChange={(e) => setFormData({...formData, alternative_causes: e.target.value})}
                      placeholder="Rule out underlying diseases or co-medications..."
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WHO-UMC Causality</label>
                    <select 
                      value={formData.causality}
                      onChange={(e) => setFormData({...formData, causality: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold cursor-pointer"
                    >
                      <option value="certain">Certain</option>
                      <option value="probable">Probable</option>
                      <option value="possible">Possible</option>
                      <option value="unlikely">Unlikely</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Doctor's Recommendation</label>
                    <select 
                      value={formData.recommendation}
                      onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all font-bold cursor-pointer"
                    >
                      <option value="Continue">Continue Therapy</option>
                      <option value="Reduce dose">Reduce Dosage</option>
                      <option value="Discontinue">Discontinue Drug</option>
                      <option value="Further investigation">Further Investigation Required</option>
                    </select>
                  </div>
                </div>

                <div className="bg-teal-500/5 border border-teal-500/20 rounded-[2.5rem] p-10 flex items-start gap-6 group hover:bg-teal-500/10 transition-all duration-500">
                   <div className="pt-1">
                      <input 
                         type="checkbox" 
                         id="declaration" 
                         className="w-6 h-6 rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-teal-500 focus:ring-teal-500 cursor-pointer"
                      />
                   </div>
                   <label htmlFor="declaration" className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed cursor-pointer select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      I formally declare that the intelligence provided in this report is accurate to the best of my professional clinical judgment. I confirm that all patient identifiers have been redacted in compliance with global pharmacovigilance data protection standards.
                   </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-12 pt-10 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
            {step > 1 ? (
              <button 
                onClick={prevStep}
                className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                Previous Phase
              </button>
            ) : <div />}

            <div className="flex gap-6">
              <button 
                onClick={() => navigate('/doctor/dashboard')}
                className="px-8 py-5 rounded-2xl text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-red-500 transition-all"
              >
                Abort Protocol
              </button>
              
              {step < 3 ? (
                <button 
                  onClick={nextStep}
                  className="btn-premium !bg-teal-600 hover:!bg-teal-500 flex items-center gap-3 shadow-glow-teal/20 !px-12"
                >
                  Next Phase
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-premium !bg-teal-600 hover:!bg-teal-500 flex items-center gap-3 shadow-glow-teal/20 disabled:opacity-50 !px-12"
                >
                  {loading ? 'Transmitting Intelligence...' : 'Finalize Transmission'}
                  {!loading && <CheckCircle className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/60 animate-in fade-in duration-700">
           <div className="clinical-card max-w-lg w-full !p-0 overflow-hidden shadow-glow-teal/40 border-teal-500/30 scale-100 transform transition-all">
              <div className="p-12 text-center">
                 <div className="w-28 h-28 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-10 relative">
                    <CheckCircle className="w-14 h-14 text-teal-500" />
                    <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-ping" />
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-3">Transmission Verified</h3>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-12">Clinical intelligence node successfully logged to global surveillance network.</p>
                 
                 <div className="bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] p-8 mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                       <ClipboardList className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Reference Signal ID</p>
                    <p className="text-3xl font-black text-teal-500 font-mono tracking-tighter uppercase">{submittedReportId}</p>
                 </div>

                 <button 
                    onClick={() => navigate('/doctor/dashboard')}
                    className="btn-premium w-full !bg-teal-600 hover:!bg-teal-500 shadow-glow-teal/30 !py-6 text-sm"
                 >
                    Return to Clinical Command
                 </button>
              </div>
           </div>
        </div>
      )}
    </Layout>
  );
}
