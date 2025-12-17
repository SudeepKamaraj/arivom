import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CreditCard, Shield, Lock, Check, Loader2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Course {
  _id: string;
  title: string;
  price: number;
  thumbnail?: string;
  category?: string;
  level?: string;
  instructor?: {
    name: string;
  };
  description?: string;
}

const CheckoutPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  useEffect(() => {
    loadRazorpayScript();
    fetchCourse();
    if (user && courseId) {
      checkPaymentStatus();
    }
  }, [courseId, user]);

  const loadRazorpayScript = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setError('Failed to load payment system');
    document.body.appendChild(script);
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/courses/${courseId}`);
      
      if (!response.ok) {
        throw new Error('Course not found');
      }
      
      const courseData = await response.json();
      setCourse(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!courseId || !user) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`http://localhost:5001/api/payments/status/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const status = await response.json();
        setPaymentStatus(status);
        
        // If user has already paid, redirect to course page
        if (status.hasPaid || status.isEnrolled) {
          console.log('User has already paid for this course, redirecting...');
          navigate(`/courses/${courseId}?message=already-enrolled`);
          return;
        }

        // If course is free, redirect to course page  
        if (status.isFree) {
          console.log('Course is free, redirecting to course page...');
          navigate(`/courses/${courseId}?message=free-course`);
          return;
        }
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      // Don't show error for payment status check, just continue
    }
  };

  const handlePayment = async () => {
    if (!course || !user || !razorpayLoaded) return;

    try {
      setPaymentLoading(true);
      setError(null);

      // Step 1: Create payment order
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to continue');
      }

      console.log('Creating payment order for course:', course._id);
      
      const orderResponse = await fetch('http://localhost:5001/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: course._id,
          amount: course.price * 100 // Convert to paise
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      console.log('Payment order created:', orderData);

      // Step 2: Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Course Platform',
        description: `Payment for ${course.title}`,
        order_id: orderData.orderId,
        image: course.thumbnail || '/logo.png',
        handler: async (response: any) => {
          console.log('Payment successful:', response);
          await verifyPayment(response);
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
            setPaymentLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentLoading(false);
    }
  };

  const verifyPayment = async (paymentData: any) => {
    try {
      console.log('Verifying payment:', paymentData);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/payments/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          courseId: course?._id
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('Payment verified successfully');
        // Redirect to course page or success page
        navigate(`/courses/${courseId}?payment=success`);
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err instanceof Error ? err.message : 'Payment verification failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to proceed with the payment</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Course
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Course Summary</h2>
              
              <div className="flex space-x-4">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-24 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  {course.instructor && (
                    <p className="text-sm text-gray-600">by {course.instructor.name}</p>
                  )}
                  {course.category && (
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {course.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{course.price}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">One-time payment • Lifetime access</p>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Secure Payment
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  256-bit SSL encryption
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Secure payment processing by Razorpay
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Your payment information is safe
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Course Price</span>
                    <span>₹{course.price}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Taxes & Fees</span>
                    <span>₹0</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{course.price}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={paymentLoading || !razorpayLoaded}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay Now ₹{course.price}</span>
                    </>
                  )}
                </button>

                {!razorpayLoaded && (
                  <p className="text-sm text-gray-500 text-center">
                    Loading payment system...
                  </p>
                )}

                <div className="text-center text-xs text-gray-500">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Secured by Razorpay
                </div>
              </div>
            </div>

            {/* Course Benefits */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">What you'll get:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Lifetime access to course content
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Certificate of completion
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Access to all course materials
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Progress tracking and assessments
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
