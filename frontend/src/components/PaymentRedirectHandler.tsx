import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🔍 Payment Redirect - Full URL:', window.location.href);
    console.log('🔍 Query Parameters:', Object.fromEntries(new URLSearchParams(location.search)));
    
    // إضافة listener للـ messages من IFRAME كحل احتياطي
    const handleMessage = (event: MessageEvent) => {
      console.log('🔍 IFrame Message:', event.data, 'from:', event.origin);
      if (event.origin.includes('paymobsolutions') || event.origin.includes('paymob.com')) {
        const data = event.data;
        if (data.success) {
          console.log('🔍 IFrame Success - Redirecting to Thank You with order:', data.order);
          navigate(`/thank-you?order=${encodeURIComponent(data.order)}`);
        } else {
          console.log('🔍 IFrame Failure - Redirecting to Payment Result');
          navigate(`/payment-result?success=false&reason=${encodeURIComponent(data.reason || 'unknown')}`);
        }
      }
    };
    
    window.addEventListener('message', handleMessage, false);
    
    const urlParams = new URLSearchParams(location.search);
    const paymobSuccess = urlParams.get('success') === 'true';
    const paymobOrder = urlParams.get('order') || urlParams.get('merchant_order_id');
    const paymobTransactionId = urlParams.get('id');
    const paymobAmount = urlParams.get('amount_cents');
    const paymobCurrency = urlParams.get('currency');
    
    console.log('🔍 Extracted Data:', {
      success: paymobSuccess,
      order: paymobOrder,
      transactionId: paymobTransactionId,
      amount: paymobAmount,
      currency: paymobCurrency
    });

    if (paymobSuccess && paymobOrder) {
      console.log('🔍 Redirecting to Thank You with order:', paymobOrder);
      const orderData = {
        orderId: paymobOrder,
        amount: paymobAmount ? parseInt(paymobAmount) / 100 : 0,
        transactionId: paymobTransactionId || '',
        currency: paymobCurrency || 'EGP',
        status: 'completed'
      };
      localStorage.setItem('lastCompletedOrder', JSON.stringify(orderData));
      navigate(`/thank-you?order=${encodeURIComponent(paymobOrder)}&amount=${orderData.amount}&transaction=${encodeURIComponent(paymobTransactionId || '')}&currency=${paymobCurrency || 'EGP'}`, { replace: true });
    } else {
      console.log('🔍 Redirecting to Payment Result with order:', paymobOrder);
      navigate(`/payment-result?success=false&order=${encodeURIComponent(paymobOrder || '')}&reason=payment_failed`, { replace: true });
    }
    
    // Cleanup function لإزالة الـ event listener
    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">جاري معالجة الدفع...</h2>
        <p className="text-gray-600">يرجى الانتظار بينما نقوم بمعالجة عملية الدفع وتوجيهك للصفحة المناسبة.</p>
      </div>
    </div>
  );
};

export default PaymentRedirectHandler;