import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, Check, AlertCircle } from 'lucide-react';

interface ParentPinModalProps {
  mode: 'verify' | 'set' | 'change';
  onClose: () => void;
  onSuccess: (pin?: string) => void;
  onVerify?: (pin: string) => Promise<boolean>;
}

const ParentPinModal: React.FC<ParentPinModalProps> = ({ 
  mode, 
  onClose, 
  onSuccess,
  onVerify 
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value.slice(-1);
    
    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }
    setError(null);

    // Auto-focus next input
    if (value && index < 3) {
      const refs = isConfirm ? confirmInputRefs : inputRefs;
      refs.current[index + 1]?.focus();
    }

    // Check if PIN is complete
    if (index === 3 && value) {
      const fullPin = newPin.join('');
      
      if (mode === 'verify') {
        handleVerify(fullPin);
      } else if (mode === 'set' || mode === 'change') {
        if (step === 'enter') {
          setTimeout(() => {
            setStep('confirm');
            setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
          }, 200);
        } else {
          // Confirm step
          const originalPin = pin.join('');
          if (fullPin === originalPin) {
            onSuccess(fullPin);
          } else {
            setError('PINs do not match. Try again.');
            setConfirmPin(['', '', '', '']);
            setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
          }
        }
      }
    }
  };

  const handleVerify = async (fullPin: string) => {
    if (onVerify) {
      setIsVerifying(true);
      const isValid = await onVerify(fullPin);
      setIsVerifying(false);
      
      if (isValid) {
        onSuccess();
      } else {
        setError('Incorrect PIN. Try again.');
        setPin(['', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    if (e.key === 'Backspace') {
      const currentPin = isConfirm ? confirmPin : pin;
      if (!currentPin[index] && index > 0) {
        const refs = isConfirm ? confirmInputRefs : inputRefs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  const getTitle = () => {
    if (mode === 'verify') return 'Enter Parent PIN';
    if (mode === 'set') return step === 'enter' ? 'Set Parent PIN' : 'Confirm PIN';
    return step === 'enter' ? 'Enter New PIN' : 'Confirm New PIN';
  };

  const getDescription = () => {
    if (mode === 'verify') return 'Enter your 4-digit PIN to access parent settings';
    if (step === 'enter') return 'Create a 4-digit PIN to protect parent settings';
    return 'Enter the same PIN again to confirm';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-8 h-8" />
            <h2 className="text-xl font-bold font-rounded">{getTitle()}</h2>
          </div>
          <p className="text-purple-100 text-sm">{getDescription()}</p>
        </div>

        {/* PIN Input */}
        <div className="p-6">
          <div className="flex justify-center gap-3 mb-6">
            {(step === 'enter' ? pin : confirmPin).map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (step === 'enter') {
                    inputRefs.current[index] = el;
                  } else {
                    confirmInputRefs.current[index] = el;
                  }
                }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value, step === 'confirm')}
                onKeyDown={(e) => handleKeyDown(index, e, step === 'confirm')}
                className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none transition-colors ${
                  error 
                    ? 'border-red-400 bg-red-50' 
                    : digit 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-200 focus:border-purple-400'
                }`}
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Loading state */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          )}

          {/* Step indicator for set/change mode */}
          {(mode === 'set' || mode === 'change') && (
            <div className="flex justify-center gap-2 mt-4">
              <div className={`w-2 h-2 rounded-full ${step === 'enter' ? 'bg-purple-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'confirm' ? 'bg-purple-500' : 'bg-gray-300'}`} />
            </div>
          )}

          {/* Cancel button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentPinModal;
