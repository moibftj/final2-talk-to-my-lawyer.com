import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { validateDiscountCode } from '../services/discountService';
import { Button } from './ui/button';
import { Input } from './ui/input';

// Subscription plan interface
interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  period: 'monthly' | 'annual';
}

// Available plans
const PLANS: Plan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic',
    price: 19.99,
    period: 'monthly',
    features: [
      'Up to 5 legal letter drafts per month',
      'Basic document review',
      'Email support',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Professional',
    price: 49.99,
    period: 'monthly',
    features: [
      'Unlimited legal letter drafts',
      'Priority document review',
      'Phone and email support',
      'Document storage',
    ],
  },
  {
    id: 'basic-annual',
    name: 'Basic Annual',
    price: 199.99,
    period: 'annual',
    features: [
      'Up to 5 legal letter drafts per month',
      'Basic document review',
      'Email support',
      'Save over 15% compared to monthly',
    ],
  },
  {
    id: 'pro-annual',
    name: 'Professional Annual',
    price: 499.99,
    period: 'annual',
    features: [
      'Unlimited legal letter drafts',
      'Priority document review',
      'Phone and email support',
      'Document storage',
      'Save over 15% compared to monthly',
    ],
  },
];

export interface SubscriptionFormProps {
  onSubscribe?: (planId: string, discountCode?: string) => Promise<void>;
}

function SubscriptionForm({ onSubscribe }: SubscriptionFormProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showAnnual, setShowAnnual] = useState(false);

  // Calculate the final price after discount
  const finalPrice = selectedPlan
    ? Math.max(
        selectedPlan.price - (selectedPlan.price * discountAmount) / 100,
        0
      ).toFixed(2)
    : '0.00';

  // Handle discount code validation
  const handleValidateCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setIsValidatingCode(true);
    setDiscountError('');

    try {
      const discountInfo = await validateDiscountCode(discountCode);

      if (discountInfo) {
        setDiscountAmount(discountInfo.percent_off ?? 0);
        setDiscountError('');
      } else {
        setDiscountAmount(0);
        setDiscountError('Invalid or expired discount code');
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setDiscountError('Error validating code. Please try again.');
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Handle subscription submission
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      return;
    }

    setIsSubscribing(true);

    try {
      // Here you would integrate with your payment processor (Stripe, etc.)
      // For now, we'll just simulate a successful subscription
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call onComplete callback if provided
      if (onSubscribe) {
        onSubscribe(selectedPlan.id, discountCode);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Filter plans based on period selection
  const filteredPlans = PLANS.filter(plan =>
    showAnnual ? plan.period === 'annual' : plan.period === 'monthly'
  );

  return (
    <div className='w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-center mb-8'>
        Choose Your Subscription Plan
      </h2>

      {/* Period toggle */}
      <div className='flex justify-center mb-8'>
        <div className='bg-gray-100 p-1 rounded-full flex items-center'>
          <button
            className={`px-4 py-2 rounded-full ${!showAnnual ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            onClick={() => setShowAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-full ${showAnnual ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            onClick={() => setShowAnnual(true)}
          >
            Annual (Save 15%)
          </button>
        </div>
      </div>

      {/* Plans selection */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        {filteredPlans.map(plan => (
          <div
            key={plan.id}
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              selectedPlan?.id === plan.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            <h3 className='text-xl font-bold mb-2'>{plan.name}</h3>
            <p className='text-3xl font-bold mb-4'>
              ${plan.price.toFixed(2)}
              <span className='text-sm font-normal text-gray-600'>
                /{plan.period === 'monthly' ? 'month' : 'year'}
              </span>
            </p>

            <ul className='mb-4'>
              {plan.features.map((feature, index) => (
                <li key={index} className='flex items-start mb-2'>
                  <svg
                    className='w-5 h-5 text-green-500 mr-2 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    ></path>
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`w-full ${selectedPlan?.id === plan.id ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setSelectedPlan(plan)}
            >
              {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
            </Button>
          </div>
        ))}
      </div>

      {/* Discount code section */}
      {selectedPlan && (
        <div className='mb-8 p-4 border border-gray-200 rounded-lg'>
          <h3 className='text-lg font-medium mb-4'>Have a discount code?</h3>
          <div className='flex gap-2'>
            <Input
              placeholder='Enter discount code'
              value={discountCode}
              onChange={e => setDiscountCode(e.target.value)}
              className='flex-grow'
              disabled={isValidatingCode}
              autoComplete='off'
            />
            <Button
              onClick={handleValidateCode}
              disabled={isValidatingCode || !discountCode.trim()}
              className='bg-blue-600'
            >
              {isValidatingCode ? 'Validating...' : 'Apply'}
            </Button>
          </div>

          {discountError && (
            <p className='text-red-500 mt-2 text-sm'>{discountError}</p>
          )}

          {discountAmount > 0 && (
            <p className='text-green-500 mt-2'>
              Discount applied: {discountAmount}% off
            </p>
          )}
        </div>
      )}

      {/* Summary and checkout section */}
      {selectedPlan && (
        <div className='border-t pt-6'>
          <div className='flex justify-between items-center mb-4'>
            <span className='font-medium'>Plan:</span>
            <span>
              {selectedPlan.name} (${selectedPlan.price.toFixed(2)})
            </span>
          </div>

          {discountAmount > 0 && (
            <div className='flex justify-between items-center mb-4 text-green-600'>
              <span className='font-medium'>Discount:</span>
              <span>
                -${((selectedPlan.price * discountAmount) / 100).toFixed(2)}
              </span>
            </div>
          )}

          <div className='flex justify-between items-center mb-6 text-lg font-bold'>
            <span>Total:</span>
            <span>
              ${finalPrice}/
              {selectedPlan.period === 'monthly' ? 'month' : 'year'}
            </span>
          </div>

          <Button
            className='w-full bg-blue-600 hover:bg-blue-700'
            onClick={handleSubscribe}
            disabled={isSubscribing}
          >
            {isSubscribing
              ? 'Processing...'
              : `Subscribe Now - $${finalPrice}/${selectedPlan.period === 'monthly' ? 'month' : 'year'}`}
          </Button>

          <p className='text-center text-sm text-gray-500 mt-4'>
            You can cancel your subscription at any time. By subscribing, you
            agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      )}
    </div>
  );
}

export { SubscriptionForm };
export default SubscriptionForm;
