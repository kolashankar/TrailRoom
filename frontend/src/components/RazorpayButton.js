import React from 'react';

const RazorpayButton = ({ order, onSuccess, onError, disabled, children }) => {
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      const res = await loadRazorpay();

      if (!res) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        return;
      }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'TrailRoom',
        description: `Purchase ${order.credits} credits`,
        handler: async function (response) {
          try {
            await onSuccess({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (error) {
            onError(error);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: function () {
            onError(new Error('Payment cancelled by user'));
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled}
      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
    >
      {children || 'Pay with Razorpay'}
    </button>
  );
};

export default RazorpayButton;
