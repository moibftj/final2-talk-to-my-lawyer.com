import React, { useState } from 'react';
import { Check, CreditCard, Percent, Gift, Users, Calendar } from 'lucide-react';
import { discountService } from '../services/discountService';
import { ShinyButton } from './magicui/shiny-button';
import { CompletionBanner, useBanners } from './CompletionBanner';
import type { DiscountCode } from '../types';

interface SubscriptionPlan {
  id: 'one_letter' | 'four_monthly' | 'eight_yearly';
  name: string;
  price: number;
  originalPrice?: number;
  letters: number;
  duration: string;
  popular?: boolean;
  features: string[];
  icon: React.ComponentType<any>;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'one_letter',
    name: 'Single Letter',
    price: 29.99,
    letters: 1,
    duration: 'One-time',
    features: [
      '1 AI-generated legal letter',
      'Professional formatting',
      'PDF download',
      'Email delivery',
      'Attorney review'
    ],
    icon: CreditCard
  },
  {
    id: 'four_monthly',
    name: 'Monthly Plan',
    price: 89.99,
    originalPrice: 119.96,
    letters: 4,
    duration: 'Per month',
    popular: true,
    features: [
      '4 AI-generated legal letters',
      'Professional formatting',
      'PDF download & email delivery',
      'Priority attorney review',
      'Status tracking',
      'Cancel anytime'
    ],
    icon: Calendar
  },
  {
    id: 'eight_yearly',
    name: 'Yearly Plan',
    price: 799.99,
    originalPrice: 1079.88,
    letters: 96,
    duration: 'Per year',
    features: [
      '8 letters per month (96 total)',
      'All monthly features',
      'Fastest attorney review',
      'Premium support',
      'Custom templates',
      'Annual savings of $280'
    ],
    icon: Users
  }
];

interface SubscriptionFormProps {
  onSubscribe: (planId: string, discountCode?: string) => Promise<void>;
  onCancel?: () => void;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  onSubscribe,
  onCancel
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    subscriptionPlans.find(p => p.popular) || subscriptionPlans[0]
  );
  const [discountCode, setDiscountCode] = useState('');
  const [validatedDiscount, setValidatedDiscount] = useState<DiscountCode | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const { banners, showSuccess, showError, showInfo } = useBanners();

  const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number): number => {
    return originalPrice * (1 - discountPercentage / 100);
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setValidatedDiscount(null);
      return;
    }

    setIsValidating(true);
    showInfo('Validating Code', 'Checking discount code...');

    try {
      const discount = await discountService.validateDiscountCode(discountCode.trim());

      if (discount) {
        setValidatedDiscount(discount);
        showSuccess('Code Valid!', `${discount.discountPercentage}% discount applied`);
      } else {
        setValidatedDiscount(null);
        showError('Invalid Code', 'Discount code not found or expired');
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setValidatedDiscount(null);
      showError('Validation Failed', 'Unable to validate discount code');
    } finally {
      setIsValidating(false);
    }
  };

  const getFinalPrice = (plan: SubscriptionPlan): number => {
    if (validatedDiscount) {
      return calculateDiscountedPrice(plan.price, validatedDiscount.discountPercentage);
    }
    return plan.price;
  };

  const getSavingsAmount = (plan: SubscriptionPlan): number => {
    if (validatedDiscount) {
      return plan.price - calculateDiscountedPrice(plan.price, validatedDiscount.discountPercentage);
    }
    return 0;
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    showInfo('Processing', 'Setting up your subscription...');

    try {
      await onSubscribe(selectedPlan.id, validatedDiscount?.code);
    } catch (error) {
      console.error('Subscription error:', error);
      showError('Subscription Failed', 'Unable to process subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Legal Letter Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get professional AI-generated legal letters reviewed by qualified attorneys.
            Cancel anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan?.id === plan.id;
            const finalPrice = getFinalPrice(plan);
            const savings = getSavingsAmount(plan);

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative bg-white rounded-xl shadow-lg cursor-pointer transition-all transform hover:scale-105 ${
                  isSelected
                    ? 'ring-4 ring-blue-500 ring-opacity-50'
                    : 'hover:shadow-xl'
                } ${plan.popular ? 'border-2 border-blue-500' : 'border border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <Icon className="w-12 h-12 text-blue-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    {plan.name}
                  </h3>

                  <div className="text-center mb-6">
                    {validatedDiscount && isSelected && (
                      <div className="mb-2">
                        <span className="text-lg text-gray-500 line-through">
                          ${plan.price.toFixed(2)}
                        </span>
                        <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {validatedDiscount.discountPercentage}% OFF
                        </span>
                      </div>
                    )}

                    <div className="text-4xl font-bold text-gray-900">
                      ${finalPrice.toFixed(2)}
                    </div>

                    <div className="text-gray-600">
                      {plan.duration}
                    </div>

                    {savings > 0 && isSelected && (
                      <div className="text-green-600 font-medium mt-1">
                        Save ${savings.toFixed(2)}!
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-6">
                    <span className="text-lg font-semibold text-blue-600">
                      {plan.letters} Letter{plan.letters > 1 ? 's' : ''}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-xl flex items-center justify-center">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                        Selected Plan
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Discount Code Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <Gift className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Have a Discount Code?</h3>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter discount code (e.g., EMP-ABC123)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={validateDiscountCode}
              disabled={!discountCode.trim() || isValidating}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? 'Validating...' : 'Apply'}
            </button>
          </div>

          {validatedDiscount && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Percent className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Discount code applied! You save {validatedDiscount.discountPercentage}% on your subscription.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Section */}
        {selectedPlan && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-lg transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2" />
                Credit Card
              </button>

              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 border rounded-lg transition-colors ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="w-6 h-6 mx-auto mb-2 bg-blue-600 rounded"></div>
                PayPal
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{selectedPlan.name}</span>
                  <span>${selectedPlan.price.toFixed(2)}</span>
                </div>

                {validatedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({validatedDiscount.discountPercentage}% off)</span>
                    <span>-${getSavingsAmount(selectedPlan).toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getFinalPrice(selectedPlan).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}

              <ShinyButton
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="px-8 py-3 ml-auto"
              >
                {isProcessing ? 'Processing...' : `Subscribe to ${selectedPlan.name}`}
              </ShinyButton>
            </div>
          </div>
        )}
      </div>

      {/* Render banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};