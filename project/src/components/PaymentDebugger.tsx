import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import paymentService from '../services/paymentService';

const PaymentDebugger: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/courses');
      const data = await response.json();
      setCourses(data.filter((course: any) => course.price > 0));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPaymentFlow = async (courseId: string) => {
    addTestResult(`Starting payment test for course: ${courseId}`);
    
    try {
      // Test 1: Check payment status
      addTestResult('Step 1: Checking payment status...');
      const status = await paymentService.getPaymentStatus(courseId);
      addTestResult(`Payment status: hasPaid=${status.hasPaid}, isEnrolled=${status.isEnrolled}`);

      if (status.hasPaid) {
        addTestResult('User has already paid for this course');
        return;
      }

      // Test 2: Create payment order
      addTestResult('Step 2: Creating payment order...');
      const orderData = await paymentService.createPaymentOrder(courseId);
      addTestResult(`Order created: ${orderData.orderId}, Amount: ₹${orderData.amount / 100}`);

      // Test 3: Test payment simulation
      addTestResult('Step 3: Processing test payment...');
      const testPaymentResult = await paymentService.processTestPayment(courseId);
      addTestResult(`Test payment result: ${testPaymentResult.success ? 'SUCCESS' : 'FAILED'} - ${testPaymentResult.message}`);

      // Test 4: Verify final status
      addTestResult('Step 4: Verifying final status...');
      const finalStatus = await paymentService.getPaymentStatus(courseId);
      addTestResult(`Final status: hasPaid=${finalStatus.hasPaid}, isEnrolled=${finalStatus.isEnrolled}, canAccess=${finalStatus.canAccess}`);

    } catch (error) {
      addTestResult(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testRazorpayPayment = async (courseId: string) => {
    addTestResult(`Starting Razorpay payment test for course: ${courseId}`);
    
    try {
      const result = await paymentService.processPayment(courseId);
      addTestResult(`Razorpay payment result: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
    } catch (error) {
      addTestResult(`Razorpay payment ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!user) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">Authentication Required</h2>
        <p className="text-red-600">Please log in to test payment functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Payment System Debugger</h2>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800">User Info:</h3>
        <p>Email: {user.email}</p>
        <p>Name: {user.firstName} {user.lastName}</p>
        <p>Auth Token: {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Available Paid Courses:</h3>
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-600">No paid courses found.</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course._id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{course.title}</h4>
                    <p className="text-sm text-gray-600">Price: ₹{course.price}</p>
                    <p className="text-xs text-gray-500">ID: {course._id}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => testPaymentFlow(course._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Test Payment Flow
                  </button>
                  <button
                    onClick={() => testRazorpayPayment(course._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Test Razorpay Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          <button
            onClick={clearResults}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Click a test button above.</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. "Test Payment Flow" - Tests backend API calls and test payment</li>
          <li>2. "Test Razorpay Payment" - Opens actual payment dialog</li>
          <li>3. Check browser console (F12) for detailed logs</li>
          <li>4. Use test card: 4111 1111 1111 1111 for Razorpay testing</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentDebugger;