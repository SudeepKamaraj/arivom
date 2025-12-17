import React, { useState, useEffect } from 'react';
import axios from 'axios';

// PaymentButton Component for Course Purchase
const PaymentButton = ({ course, user, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Check if user has already paid for this course
  useEffect(() => {
    checkPaymentStatus();
  }, [course._id]);

  const checkPaymentStatus = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/payments/status/${course._id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      setPaymentStatus(response.data);
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Step 1: Create payment order
      console.log('Creating payment order...');
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payments/create-order`,
        { courseId: course._id },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );
      
      const orderData = orderResponse.data;
      console.log('Payment order created:', orderData.orderId);
      
      // Step 2: Initialize Razorpay checkout
      const options = {
        key: orderData.key, // Your Razorpay key ID
        amount: orderData.amount, // Amount in paisa
        currency: orderData.currency,
        name: 'Course Purchase',
        description: orderData.description,
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        theme: { 
          color: '#3B82F6' // Customize theme color
        },
        handler: async function(response) {
          // Step 3: Verify payment
          console.log('Payment successful, verifying...');
          await verifyPayment(response);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
            setLoading(false);
          }
        }
      };
      
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const verifyResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payments/verify-payment`,
        {
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          courseId: course._id
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );
      
      const result = verifyResponse.data;
      
      if (result.success) {
        console.log('Payment verified successfully!');
        alert('Payment successful! You have been enrolled in the course.');
        
        // Update payment status
        await checkPaymentStatus();
        
        // Call success callback
        if (onPaymentSuccess) {
          onPaymentSuccess(course._id, result.paymentId);
        }
        
        // Refresh page or redirect
        window.location.reload();
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  // Render different states
  if (!paymentStatus) {
    return <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>;
  }

  if (paymentStatus.isFree) {
    return (
      <button 
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        onClick={() => alert('This is a free course!')}
      >
        Free Course
      </button>
    );
  }

  if (paymentStatus.hasPaid) {
    return (
      <div className="flex items-center space-x-2">
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
          ✅ Purchased
        </span>
        <span className="text-sm text-gray-600">
          Paid on {new Date(paymentStatus.paymentDetails.paidAt).toLocaleDateString()}
        </span>
      </div>
    );
  }

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className={`
        px-6 py-2 rounded font-medium transition-colors
        ${loading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'
        }
      `}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Processing...</span>
        </div>
      ) : (
        `Buy Course - ₹${course.price}`
      )}
    </button>
  );
};

// Payment History Component
const PaymentHistory = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/payments/history`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      
      {payments.length === 0 ? (
        <p className="text-gray-500">No payments found.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment._id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{payment.courseId?.title}</h4>
                  <p className="text-sm text-gray-600">
                    Payment ID: {payment.razorpayPaymentId}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(payment.paidAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{payment.amount}</p>
                  <span className={`
                    text-xs px-2 py-1 rounded
                    ${payment.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {payment.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Course Card with Payment Integration
const CourseCard = ({ course, user }) => {
  const handlePaymentSuccess = (courseId, paymentId) => {
    console.log(`Payment successful for course ${courseId}: ${paymentId}`);
    // You can add additional logic here like updating course access, etc.
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={course.thumbnail || '/placeholder-course.jpg'} 
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-blue-600">
            {course.price === 0 ? 'Free' : `₹${course.price}`}
          </span>
          <span className="text-sm text-gray-500">
            {course.duration} • {course.level}
          </span>
        </div>
        
        <PaymentButton 
          course={course} 
          user={user} 
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};

export { PaymentButton, PaymentHistory, CourseCard };