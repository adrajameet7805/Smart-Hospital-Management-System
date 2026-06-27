import { useState } from 'react';
import { aiApi } from '../../lib/api';
import { Brain, AlertTriangle, Stethoscope, Activity, Loader2 } from 'lucide-react';

const COMMON_SYMPTOMS = [
  'fever', 'cough', 'headache', 'fatigue', 'chest_pain', 'shortness_of_breath',
  'nausea', 'vomiting', 'diarrhea', 'dizziness', 'body_ache', 'sore_throat',
  'runny_nose', 'joint_pain', 'muscle_weakness', 'blurred_vision', 'numbness',
  'rash', 'weight_loss', 'loss_of_appetite', 'insomnia', 'anxiety',
  'abdominal_pain', 'back_pain',
];

interface TriageResult {
  urgency: string;
  advice: string;
  possible_diseases: Array<{
    disease: string;
    confidence: number;
    severity?: number;
    specialist: string;
  }>;
}

export default function AITriage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [results, setResults] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSymptom = (s: string) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await aiApi.triage({
        symptoms: selected,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
      });
      setResults(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'AI service unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return 'bg-danger-500/15 border-danger-500/30 text-danger-400';
      case 'high': return 'bg-warning-500/15 border-warning-500/30 text-warning-400';
      case 'moderate': return 'bg-info-500/15 border-info-500/30 text-info-400';
      default: return 'bg-success-500/15 border-success-500/30 text-success-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          AI Symptom Triage
        </h1>
        <p className="text-surface-200 text-sm mt-1">Select your symptoms for an AI-powered assessment. This is for informational purposes only.</p>
      </div>

      {/* Symptom Selection */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-400" /> Select Your Symptoms
        </h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_SYMPTOMS.map(s => (
            <button key={s}
              onClick={() => toggleSymptom(s)}
              className={`text-xs px-3 py-2 rounded-xl capitalize transition-all duration-200 border ${
                selected.includes(s)
                  ? 'bg-primary-600/30 text-primary-300 border-primary-500/40 shadow-lg shadow-primary-500/10'
                  : 'bg-surface-700/30 text-surface-200 border-surface-600/30 hover:border-surface-500/50 hover:bg-surface-700/50'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <p className="text-xs text-primary-400 mt-3">{selected.length} symptom{selected.length > 1 ? 's' : ''} selected</p>
        )}

        <div className="mt-5 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-surface-200 mb-1.5">Age</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)}
              className="input-field w-24" placeholder="Age" min="0" max="120" />
          </div>
          <div>
            <label className="block text-xs text-surface-200 mb-1.5">Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              className="input-field w-32">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button onClick={handleSubmit} disabled={loading || selected.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border border-danger-500/20 bg-danger-500/5">
          <p className="text-sm text-danger-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4 animate-fade-in">
          {/* Urgency Banner */}
          <div className={`glass-card p-5 border ${getUrgencyStyle(results.urgency)}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Urgency Level: {results.urgency}</p>
                <p className="text-xs text-surface-200 mt-1">{results.advice}</p>
              </div>
            </div>
          </div>

          {/* Possible Conditions */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary-400" /> Possible Conditions
            </h3>
            <div className="space-y-3">
              {results.possible_diseases?.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-surface-700/30 border border-surface-600/20 rounded-xl p-4 hover:bg-surface-700/50 transition-colors">
                  <div>
                    <p className="text-sm text-white font-medium">{d.disease}</p>
                    <p className="text-xs text-surface-300 mt-1">
                      <Stethoscope className="w-3 h-3 inline mr-1" />
                      Recommended: {d.specialist}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary-400">{d.confidence}%</span>
                    <div className="w-20 h-1.5 bg-surface-600/50 rounded-full mt-1">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                        style={{ width: `${d.confidence}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="glass-card p-4 bg-warning-500/5 border border-warning-500/20">
            <p className="text-xs text-warning-300">
              ⚠️ <strong>Disclaimer:</strong> This AI triage is for informational purposes only and should not replace professional medical advice.
              Always consult a qualified healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
