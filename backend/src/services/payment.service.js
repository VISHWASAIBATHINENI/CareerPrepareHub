const createRazorpayOrder = async ({ amount, currency = 'INR', userId, purpose = 'premium_upgrade' }) => {
  return {
    provider: 'razorpay',
    status: 'stubbed',
    orderId: `rzp_stub_${Date.now()}`,
    amount,
    currency,
    userId,
    purpose,
    message: 'Payment service scaffold ready. Integrate Razorpay SDK and keys to enable live payments.',
  };
};

export {
  createRazorpayOrder,
};
