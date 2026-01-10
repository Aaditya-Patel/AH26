import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { formalitiesAPI } from '../api/client';
import { WorkflowStep } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function Formalities() {
  const [workflowType, setWorkflowType] = useState<string>('buyer_registration');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadWorkflow();
  }, [workflowType]);

  const loadWorkflow = async () => {
    setLoading(true);
    try {
      const response = await formalitiesAPI.getSteps(workflowType);
      setSteps(response.data.steps || []);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to load workflow. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const workflows = [
    { value: 'buyer_registration', label: 'Buyer Registration' },
    { value: 'seller_registration', label: 'Seller Registration' },
    { value: 'mrv_compliance', label: 'MRV Compliance' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Government Formalities Advisor</h1>

        {/* Workflow Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Workflow Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflows.map((wf) => (
              <button
                key={wf.value}
                onClick={() => setWorkflowType(wf.value)}
                className={`p-4 border rounded-lg text-left ${
                  workflowType === wf.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {wf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.step} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    
                    {step.documents.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Required Documents:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {step.documents.map((doc, index) => (
                            <li key={index}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
