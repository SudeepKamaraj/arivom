const API_BASE_URL = 'http://localhost:5001/api';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentOrderData {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  name: string;
  description: string;
  image?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  notes: {
    courseId: string;
    userId: string;
  };
}

interface PaymentStatus {
  isFree: boolean;
  isEnrolled: boolean;
  hasPaid: boolean;
  canAccess: boolean;
  paymentDetails?: {
    paymentId: string;
    paidAt: string;
    amount: number;
  };
}

interface PaymentHistoryItem {
  _id: string;
  orderId: string;
  courseId: {
    _id: string;
    title: string;
    thumbnail: string;
    category: string;
  };
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
  createdAt: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

class PaymentService {
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  private getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Load Razorpay script
  async loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create payment order
  async createPaymentOrder(courseId: string): Promise<PaymentOrderData> {
    try {
      console.log('Creating payment order for course:', courseId);
      
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login to continue.');
      }

      const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ courseId })
      });

      console.log('Payment order response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment order error response:', errorText);
        
        let errorMessage = 'Failed to create payment order';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          console.warn('Could not parse error response as JSON');
        }
        
        throw new Error(errorMessage);
      }

      const orderData = await response.json();
      console.log('Payment order created successfully:', orderData);
      
      return orderData;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(
    courseId: string,
    razorpayResponse: RazorpayResponse
  ): Promise<{ success: boolean; message: string; paymentId?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify-payment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          courseId,
          ...razorpayResponse
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Handle payment failure
  async handlePaymentFailure(razorpayOrderId: string, error: any): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/payments/payment-failed`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          error
        })
      });
    } catch (err) {
      console.error('Error handling payment failure:', err);
    }
  }

  // Get payment status for a course
  async getPaymentStatus(courseId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/status/${courseId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Get user's payment history
  async getPaymentHistory(page: number = 1, limit: number = 10): Promise<{
    payments: PaymentHistoryItem[];
    page: number;
    limit: number;
    total: number;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/history?page=${page}&limit=${limit}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  // Process payment using Razorpay
  async processPayment(courseId: string): Promise<{
    success: boolean;
    message: string;
    paymentId?: string;
  }> {
    try {
      // In development mode, use test payment instead of Razorpay
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Using test payment mode (localhost detected)');
        return this.processTestPayment(courseId);
      }
      
      // For production, use real Razorpay
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script. Please check your internet connection.');
      }

      // Create payment order
      const orderData = await this.createPaymentOrder(courseId);

      // Open Razorpay checkout
      return new Promise((resolve, reject) => {
        console.log('Opening Razorpay checkout with options:', orderData);
        
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: orderData.name,
          description: orderData.description,
          image: orderData.image,
          order_id: orderData.orderId,
          prefill: orderData.prefill,
          theme: orderData.theme,
          modal: {
            ondismiss: () => {
              console.log('Payment modal dismissed by user');
              resolve({
                success: false,
                message: 'Payment cancelled by user'
              });
            }
          },
          handler: async (response: RazorpayResponse) => {
            try {
              console.log('Payment successful, verifying...', response);
              const verificationResult = await this.verifyPayment(courseId, response);
              console.log('Payment verification result:', verificationResult);
              resolve(verificationResult);
            } catch (error) {
              console.error('Payment verification failed:', error);
              reject(error);
            }
          },
          error: async (error: any) => {
            console.error('Razorpay payment error:', error);
            await this.handlePaymentFailure(orderData.orderId, error);
            resolve({
              success: false,
              message: error.description || 'Payment failed'
            });
          }
        };

        if (!window.Razorpay) {
          console.error('Razorpay script not loaded');
          reject(new Error('Razorpay script not loaded. Please refresh the page and try again.'));
          return;
        }

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Process test payment for development
  async processTestPayment(courseId: string): Promise<{
    success: boolean;
    message: string;
    paymentId?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/test-payment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Test payment failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing test payment:', error);
      throw error;
    }
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Check if payment is successful
  isPaymentSuccessful(status: string): boolean {
    return status === 'paid';
  }

  // Get payment status color
  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'created':
      case 'attempted':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'refunded':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Get payment status text
  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'failed':
        return 'Failed';
      case 'created':
        return 'Created';
      case 'attempted':
        return 'Attempted';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;