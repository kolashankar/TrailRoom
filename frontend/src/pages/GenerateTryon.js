import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';
import ModeSelector from '../components/ModeSelector';
import GenerationProgress from '../components/GenerationProgress';
import ResultDisplay from '../components/ResultDisplay';
import ImageEditor from '../components/ImageEditor';
import BatchProcessor from '../components/BatchProcessor';
import { AlertCircle, ArrowRight, ArrowLeft, Edit, Layers } from 'lucide-react';

const GenerateTryon = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('top');
  const [personImage, setPersonImage] = useState(null);
  const [clothingImage, setClothingImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    let interval;
    if (jobId && (jobStatus === 'queued' || jobStatus === 'processing')) {
      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${backendUrl}/api/v1/tryon/${jobId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          setJobStatus(response.data.status);
          
          if (response.data.status === 'completed') {
            setResultImage(response.data.result_image_base64);
            setGenerating(false);
            clearInterval(interval);
          } else if (response.data.status === 'failed') {
            setError(response.data.error_message || 'Generation failed');
            setGenerating(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error polling job:', err);
          setError('Failed to check job status');
          setGenerating(false);
          clearInterval(interval);
        }
      }, 2000);
    }
    
    return () => clearInterval(interval);
  }, [jobId, jobStatus, backendUrl]);

  const handleGenerate = async () => {
    if (!personImage || !clothingImage) {
      setError('Please upload both person and clothing images');
      return;
    }

    if (mode === 'full' && !bottomImage) {
      setError('Please upload bottom clothing for full outfit mode');
      return;
    }

    if (user.credits < 1) {
      setError('Insufficient credits. Please purchase more credits.');
      return;
    }

    setGenerating(true);
    setError(null);
    setStep(4);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/api/v1/tryon`,
        {
          mode,
          person_image_base64: personImage,
          clothing_image_base64: clothingImage,
          bottom_image_base64: mode === 'full' ? bottomImage : null
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setJobId(response.data.id);
      setJobStatus(response.data.status);
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.detail || 'Failed to create generation job');
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setMode('top');
    setPersonImage(null);
    setClothingImage(null);
    setBottomImage(null);
    setGenerating(false);
    setJobId(null);
    setJobStatus(null);
    setResultImage(null);
    setError(null);
  };

  const canProceedToNextStep = () => {
    if (step === 1) return personImage !== null;
    if (step === 2) return true;
    if (step === 3) {
      if (mode === 'full') {
        return clothingImage !== null && bottomImage !== null;
      }
      return clothingImage !== null;
    }
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Generate Try-On ✨
          </h1>
          <p className="text-gray-300">
            Create realistic virtual try-ons with AI
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 mt-0.5" />
            <div>
              <p className="text-red-200 font-semibold">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        {!resultImage && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold
                        ${step >= s 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-700 text-gray-400'
                        }
                      `}
                    >
                      {s}
                    </div>
                    <span className="text-xs text-gray-400 mt-2">
                      {s === 1 && 'Person'}
                      {s === 2 && 'Mode'}
                      {s === 3 && 'Clothing'}
                      {s === 4 && 'Generate'}
                    </span>
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-purple-600' : 'bg-gray-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Upload Person Image */}
          {step === 1 && (
            <div>
              <ImageUpload
                label="Upload Person Image"
                onImageSelect={setPersonImage}
                imagePreview={personImage}
                onClear={() => setPersonImage(null)}
                required
              />
            </div>
          )}

          {/* Step 2: Select Mode */}
          {step === 2 && (
            <div>
              <ModeSelector
                selectedMode={mode}
                onModeChange={setMode}
              />
            </div>
          )}

          {/* Step 3: Upload Clothing */}
          {step === 3 && (
            <div className="space-y-6">
              <ImageUpload
                label="Upload Top Clothing"
                onImageSelect={setClothingImage}
                imagePreview={clothingImage}
                onClear={() => setClothingImage(null)}
                required
              />
              {mode === 'full' && (
                <ImageUpload
                  label="Upload Bottom Clothing"
                  onImageSelect={setBottomImage}
                  imagePreview={bottomImage}
                  onClear={() => setBottomImage(null)}
                  required
                />
              )}
            </div>
          )}

          {/* Step 4: Generation/Result */}
          {step === 4 && (
            <div>
              {generating || (jobStatus && jobStatus !== 'completed' && jobStatus !== 'failed') ? (
                <GenerationProgress status={jobStatus} />
              ) : resultImage ? (
                <ResultDisplay
                  imageBase64={resultImage}
                  onClose={handleReset}
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {!generating && !resultImage && (
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            )}
            {step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceedToNextStep()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Next
                <ArrowRight size={20} />
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleGenerate}
                disabled={!canProceedToNextStep()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Generate Try-On (1 Credit)
              </button>
            )}
          </div>
        )}

        {/* Reset Button */}
        {resultImage && (
          <div className="mt-6">
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
            >
              Create Another Try-On
            </button>
          </div>
        )}
      </div>

      {/* Credit Info */}
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
        <p className="text-blue-200 text-sm">
          💳 You have <span className="font-bold">{user?.credits || 0} credits</span> remaining. 
          Each generation costs 1 credit.
        </p>
      </div>
    </div>
  );
};

export default GenerateTryon;
