"use client"

import { useEffect, useState, useRef } from 'react';
import {
    DailyProvider,
    useDaily,
    useParticipantIds,
    useLocalParticipant,
    DailyVideo,
    useVideoTrack,
    useAudioTrack
} from '@daily-co/daily-react';
import Daily, { DailyCall } from '@daily-co/daily-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, Users, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VideoSessionProps {
    roomUrl: string;
    onLeave: () => void;
}

function CallInterface({ onLeave }: { onLeave: () => void }) {
    const daily = useDaily();
    const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
    const localParticipant = useLocalParticipant();

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    const toggleAudio = () => {
        const newState = !isMuted;
        daily?.setLocalAudio(!newState);
        setIsMuted(newState);
    };

    const toggleVideo = () => {
        const newState = !isCameraOff;
        daily?.setLocalVideo(!newState);
        setIsCameraOff(newState);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            {/* Main Video Area */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {/* Remote Participants */}
                {remoteParticipantIds.length > 0 ? (
                    remoteParticipantIds.map((id) => (
                        <div key={id} className="relative bg-slate-900 rounded-xl overflow-hidden border border-white/5 aspect-video">
                            <DailyVideo automirror sessionId={id} type="video" className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-semibold text-white">Patient</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="relative bg-slate-900/50 rounded-xl overflow-hidden border border-white/5 aspect-video flex items-center justify-center border-dashed border-white/20">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                <Users className="w-8 h-8 text-white/40" />
                            </div>
                            <p className="text-white/40 text-sm font-medium">Waiting for participant to join...</p>
                        </div>
                    </div>
                )}

                {/* Local Video */}
                <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-white/5 aspect-video group">
                    <DailyVideo automirror sessionId={localParticipant?.session_id || ''} type="video" className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <span className="text-xs font-semibold text-white">You</span>
                    </div>
                    {isCameraOff && (
                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <VideoOff className="w-12 h-12 text-white/10" />
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="h-24 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">Clinical Consultation</span>
                        <span className="text-white/40 text-xs">Live Session</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleAudio}
                        className={cn(
                            "w-12 h-12 rounded-2xl transition-all duration-300",
                            isMuted ? "bg-rose-500/20 border-rose-500/50 text-rose-500 hover:bg-rose-500/30" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        )}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleVideo}
                        className={cn(
                            "w-12 h-12 rounded-2xl transition-all duration-300",
                            isCameraOff ? "bg-rose-500/20 border-rose-500/50 text-rose-500 hover:bg-rose-500/30" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        )}
                    >
                        {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </Button>
                    <div className="w-[1px] h-8 bg-white/10 mx-2" />
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={onLeave}
                        className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/20"
                    >
                        <PhoneOff size={24} />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                        <Settings size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                        <Maximize2 size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function VideoSession({ roomUrl, onLeave }: VideoSessionProps) {
    const [daily, setDaily] = useState<DailyCall | null>(null);

    useEffect(() => {
        if (!roomUrl) return;

        const call = Daily.createCallObject({
            url: roomUrl,
        });

        setDaily(call);
        call.join();

        return () => {
            call.leave();
            call.destroy();
        };
    }, [roomUrl]);

    if (!daily) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center bg-slate-950 rounded-2xl border border-white/10 italic text-white/40">
                Initializing encrypted connection...
            </div>
        );
    }

    return (
        <DailyProvider callObject={daily}>
            <CallInterface onLeave={onLeave} />
        </DailyProvider>
    );
}
