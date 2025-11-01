'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, verifyOTPAndLogin, selectError, selectIsLoading } from '../../lib/redux/authSlice';
import { isAuthenticated } from '../../lib/auth';
import { AppDispatch } from '../../lib/store';

const LoginPage = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!emailOrPhone.trim()) {
      return;
    }

    const result = await dispatch(sendOTP(emailOrPhone.trim()));

    if (result?.success) {
      setOtpSent(true);
      setSuccessMessage(result.message || 'OTP sent successfully');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!otp.trim()) {
      return;
    }

    const result = await dispatch(verifyOTPAndLogin({ emailOrPhone: emailOrPhone.trim(), otp: otp.trim() }));

    if (result?.user) {
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp('');
    setSuccessMessage('');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-100 via-white to-blue-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-red-700">Admin Login</h2>
        {!otpSent ? (
          <form className="space-y-5" onSubmit={handleSendOTP}>
            <div>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone
              </label>
              <input
                type="text"
                id="emailOrPhone"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter your email or phone number"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            {successMessage && <div className="text-green-600 text-sm text-center">{successMessage}</div>}
            <button
              type="submit"
              className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition"
              disabled={loading || !emailOrPhone.trim()}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 0 018-8v8z"/>
                </svg>
              ) : null}
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleVerifyOTP}>
            <div>
              <label htmlFor="emailOrPhoneDisplay" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone
              </label>
              <input
                type="text"
                id="emailOrPhoneDisplay"
                className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
                value={emailOrPhone}
                disabled
                readOnly
              />
            </div>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter the OTP sent to your email/phone"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            {successMessage && <div className="text-green-600 text-sm text-center">{successMessage}</div>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 flex justify-center items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-md transition"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition"
                disabled={loading || !otp.trim()}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 0 018-8v8z"/>
                  </svg>
                ) : null}
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;


            