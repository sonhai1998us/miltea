"use client"

import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminGateProps {
    children: React.ReactNode;
    isCustomer: boolean;
}

export function AdminGate({ children, isCustomer }: AdminGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const authStatus = localStorage.getItem('shop_admin_auth');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const correctPin = process.env.ADMIN_PIN || '';

        if (pin === correctPin) {
            localStorage.setItem('shop_admin_auth', 'true');
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Mã PIN không chính xác.');
            setPin('');
        }
    };

    if (!mounted) return null;

    // If it's a customer via QR, they bypass this gate (LocationGate handles them)
    if (isCustomer) {
        return <>{children}</>;
    }

    // If staff is already authenticated, allow them in
    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-auto">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Vùng Quản Trị</h2>
                <p className="text-gray-500 text-center mb-8 text-sm">
                    Vui lòng nhập mã PIN bảo mật của cửa hàng để truy cập hệ thống.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Nhập mã PIN..."
                            className="w-full text-center text-xs tracking-[0.5em] px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm mt-3 text-center animate-pulse">{error}</p>}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                        disabled={pin.length < 4}
                    >
                        Xác nhận
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    Phần mềm quản lý Lá và Sương
                </div>
            </div>
        </div>
    );
}
