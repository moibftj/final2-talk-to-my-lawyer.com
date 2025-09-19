import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from './Card';
import { ShinyButton } from './magicui/shiny-button';
import { SparklesText } from './magicui/sparkles-text';
import { Spinner } from './Spinner';
import { discountService } from '../services/discountService';
import { DiscountCode } from '../types';

interface SubscriptionPlan {
  id: 'one_letter' | 'four_monthly' | 'eight_yearly';
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'one_letter',
    name: 'Single Letter',
    description: 'Perfect for one-time needs',
    price: 299,
    features: [
      'One professional letter',
      'AI-powered generation',
      'PDF download',
      'Email delivery option',
      'Basic support'
    ]
  },
  {
    id: 'four_monthly',
    name: 'Monthly Plan',
    description: 'Four letters per month',
    price: 299,
    features: [
      'Up to 4 letters monthly',
      'Priority AI generation',
      'PDF download',
      'Email delivery option',
      'Priority support',
      'Letter templates library'
    ],
    popular: true
  },
  {
    id: 'eight_yearly',
    name: 'Annual Plan',
    description: 'Eight letters per year',
    price: 599,
    features: [
      'Up to 8 letters yearly',
      'Premium AI generation',
      'PDF download',
      'Email delivery option',
      'Premium support',
      'All letter templates',
      'Custom legal consultation'
    ]
  }
];

interface SubscriptionFormProps {
  onSubscribe?: (planId: string, discountCode?: string) => void;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  onSubscribe
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('four_monthly');
  const [discountCode, setDiscountCode] = useState('');
  const [validatedDiscount, setValidatedDiscount] = useState<DiscountCode | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setValidatedDiscount(null);
      setDiscountError('');
      return;
    }

    setIsValidating(true);
    setDiscountError('');

    try {
      const discount = await discountService.validateDiscountCode(discountCode.trim().toUpperCase());
      if (discount) {
        setValidatedDiscount(discount);
      } else {
        setDiscountError('Invalid or expired discount code');
        setValidatedDiscount(null);
      }
    } catch (error) {
      setDiscountError('Error validating discount code');
      setValidatedDiscount(null);
    } finally {
      setIsValidating(false);
    }
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!validatedDiscount) return originalPrice;
    return originalPrice - (originalPrice * validatedDiscount.discountPercentage / 100);
  };

  const getSelectedPlan = () => SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)!;

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      // Here you would integrate with your payment processor
      // For now, we'll just call the onSubscribe callback
      await onSubscribe?.(selectedPlan, validatedDiscount?.code);

      // If a discount code was used, record the usage
      if (validatedDiscount) {
        // This would be called after successful payment
        // await discountService.applyDiscountCode(validatedDiscount.id, userId, getSelectedPlan().price);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const selectedPlanData = getSelectedPlan();
  const originalPrice = selectedPlanData.price;
  const finalPrice = calculateDiscountedPrice(originalPrice);
  const savings = originalPrice - finalPrice;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          <SparklesText>Choose Your Plan</SparklesText>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Select the perfect plan for your legal letter needs
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPlan === plan.id
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:border-blue-300'
            } ${plan.popular ? 'border-green-500 shadow-md' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ${plan.price}
                </span>
                {plan.id !== 'one_letter' && (
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    /{plan.id === 'four_monthly' ? 'month' : 'year'}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Discount Code Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Discount Code</CardTitle>
          <CardDescription>
            Have a discount code? Enter it below to save on your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter discount code (e.g., EMP-ABC12)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onBlur={validateDiscountCode}
              />
              {discountError && (
                <p className="text-red-500 text-sm mt-1">{discountError}</p>
              )}
              {validatedDiscount && (
                <p className="text-green-500 text-sm mt-1">
                  ✓ Valid! {validatedDiscount.discountPercentage}% discount applied
                </p>
              )}
            </div>
            <button
              onClick={validateDiscountCode}
              disabled={isValidating || !discountCode.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {isValidating ? <Spinner /> : null}
              Validate
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">{selectedPlanData.name}</span>
              <span className="font-medium">${originalPrice.toFixed(2)}</span>
            </div>

            {validatedDiscount && (
              <>
                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                  <span>Discount ({validatedDiscount.discountPercentage}% off)</span>
                  <span>-${savings.toFixed(2)}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
              </>
            )}

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <div className="text-right">
                {validatedDiscount && (
                  <div className="text-sm text-gray-500 line-through">
                    ${originalPrice.toFixed(2)}
                  </div>
                )}
                <div className="text-blue-600 dark:text-blue-400">
                  ${finalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <ShinyButton
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="w-full"
          >
            {isSubscribing ? (
              <div className="flex items-center gap-2">
                <Spinner />
                Processing...
              </div>
            ) : (
              `Subscribe to ${selectedPlanData.name}`
            )}
          </ShinyButton>
        </CardFooter>
      </Card>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Why Choose Our Legal Letter Service?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">AI-Powered Generation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced AI creates professional, legally sound letters tailored to your specific needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get your professionally formatted letters within minutes, not days.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Expert Quality</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All letters follow legal best practices and professional formatting standards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};