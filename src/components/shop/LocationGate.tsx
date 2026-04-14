"use client"
import React, { useEffect, useState } from 'react';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useSession } from '@/hooks/useSession';
import { Loader2, MapPin } from 'lucide-react';

interface LocationGateProps {
    children: React.ReactNode;
    isCustomer?: boolean; // Flag to enable/disable gate for customers vs admin
}

export function LocationGate({ children, isCustomer = true }: LocationGateProps) {
    const { inRange, error, checking } = useGeoLocation();
    const { session, loading: sessionLoading, initSession } = useSession();
    // To avoid hydration mismatches, only render after mount
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isCustomer) return;
        if (inRange === true && !session && !sessionLoading) {
            initSession();
        }
    }, [inRange, isCustomer, session, sessionLoading, initSession]);

    if (!mounted) return null;

    // Admin/Staff bypass
    if (!isCustomer) {
        return <>{children}</>;
    }

    if (checking) {
        return (
            <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                <p className="text-gray-600 text-center text-lg">Đang kiểm tra vị trí của bạn...</p>
                <p className="text-sm text-gray-400 mt-2 text-center">Hệ thống yêu cầu xác nhận GPS để đặt món tại quán.</p>
            </div>
        );
    }

    if (error || inRange === false) {
        return (
            <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin className="w-10 h-10 text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Bạn ở ngoài không gian quán!</h2>
                    <p className="text-gray-600 mb-6">
                        {error ? error : "Mã QR này chỉ khả dụng khi bạn đang có mặt tại cửa hàng Lá và Sương. Vui lòng đến quán để tiếp tục quét mã."}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (sessionLoading || !session) {
        return (
            <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                <p className="text-gray-600 text-center text-lg">Đang kết nối hàng chờ...</p>
            </div>
        );
    }

    // Success! Wrap children and perhaps inject session somewhere if needed
    return <>{children}</>;
}
