import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymobTestRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // محاكاة البيانات الفعلية من Paymob كما قدمها المستخدم
    const paymobData = {
      id: '325580950',
      pending: 'false',
      amount_cents: '32400',
      success: 'true',
      is_auth: 'false',
      is_capture: 'false',
      is_standalone_payment: 'true',
      is_voided: 'false',
      is_refunded: 'false',
      is_3d_secure: 'true',
      integration_id: '5222059',
      profile_id: '1064902',
      has_parent_transaction: 'false',
      order: '364745636',
      created_at: '2025-08-03T00:23:20.198567',
      currency: 'EGP',
      merchant_commission: '0',
      discount_details: '[]',
      is_void: 'false',
      is_refund: 'false',
      error_occured: 'false',
      refunded_amount_cents: '0',
      captured_amount: '0',
      updated_at: '2025-08-03T00:23:44.899098',
      is_settled: 'false',
      bill_balanced: 'false',
      is_bill: 'false',
      owner: '2014116',
      merchant_order_id: 'temp_1754169777628_heqb9n2yr',
      'data.message': 'Approved',
      'source_data.type': 'card',
      'source_data.pan': '4242',
      'source_data.sub_type': 'Visa',
      acq_response_code: '00',
      txn_response_code: 'APPROVED',
      hmac: '64f1250c3c08d4c7ea575d833fc560c115d246674321101d635405d6aa33f643d3fbce6b88488615e3e226e12ef28ac621a12a690c3fcf81e0ec19dd448b8ac5'
    };

    // تحويل البيانات إلى query parameters
    const params = new URLSearchParams(paymobData);
    
    // إعادة التوجيه إلى PaymentRedirectHandler مع البيانات
    const redirectUrl = `/payment-redirect?${params.toString()}`;
    
    console.log('Redirecting to:', redirectUrl);
    navigate(redirectUrl);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">معالجة البيانات من Paymob</h2>
        <p className="text-gray-600">جاري إعادة التوجيه...</p>
      </div>
    </div>
  );
};

export default PaymobTestRedirect;