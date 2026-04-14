"use client"
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { Users } from 'lucide-react';

export function QueueBadge() {
    const { session } = useSession();

    if (!session?.queue_position) return null;

    return (
        <div className="fixed bottom-24 right-4 z-40 bg-emerald-600 shadow-xl rounded-full px-4 py-2 flex items-center space-x-2 animate-bounce hover:animate-none transition-all cursor-pointer">
            <div className="bg-white/20 p-1.5 rounded-full">
                <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-emerald-100 uppercase font-bold leading-none">Vị trí của bạn</span>
                <span className="text-white font-black text-sm leading-tight text-center">#{session.queue_position}</span>
            </div>
        </div>
    );
}
