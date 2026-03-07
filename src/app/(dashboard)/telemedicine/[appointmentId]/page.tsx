"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { VideoSession } from '@/components/telemedicine/video-session';
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TelemedicinePage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [roomUrl, setRoomUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const appointmentId = params.appointmentId as string;

    useEffect(() => {
        const joinSession = async () => {
            try {
                // 1. Get or create room URL
                const response = await fetch('/api/telemedicine/create-room', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appointmentId }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to join session');
                }

                setRoomUrl(data.url);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (appointmentId) {
            joinSession();
        }
    }, [appointmentId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-ping absolute" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin relative" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white">Establishing Secure Link</h2>
                    <p className="text-muted-foreground text-sm mt-1">Verifying clinical credentials and preparing room...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 max-w-md mx-auto text-center">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <ShieldAlert className="w-10 h-10 text-rose-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Connection Failed</h2>
                    <p className="text-muted-foreground mt-2">{error}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="gap-2 border-white/10 text-white"
                >
                    <ArrowLeft size={18} />
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Telemedicine Portal</h1>
                    <p className="text-muted-foreground text-sm italic">HIPAA-Compliant Encrypted Session</p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-muted-foreground hover:text-white hover:bg-white/5"
                >
                    Exit Session
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                {roomUrl && (
                    <VideoSession
                        roomUrl={roomUrl}
                        onLeave={() => router.push('/appointments')}
                    />
                )}
            </div>
        </div>
    );
}
