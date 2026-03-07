import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const DAILY_API_KEY = process.env.DAILY_API_KEY;

export async function POST(req: Request) {
    try {
        const { appointmentId } = await req.json();

        if (!appointmentId) {
            return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
        }

        const supabase = createClient();

        // 1. Check if appointment exists and already has a URL
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select('meeting_url, is_telemedicine')
            .eq('id', appointmentId)
            .single();

        if (fetchError || !appointment) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        if (appointment.meeting_url) {
            return NextResponse.json({ url: appointment.meeting_url });
        }

        // 2. Create room in Daily.co
        // Note: For actual production, you'd use the Daily.co REST API.
        // We'll simulate/placeholder the Daily.co API call.

        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${DAILY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                properties: {
                    enable_chat: true,
                    enable_knocking: true,
                    exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
                },
            }),
        });

        const room = await response.json();

        if (!response.ok) {
            console.error('Daily.co Error:', room);
            return NextResponse.json({ error: 'Failed to create video room' }, { status: 500 });
        }

        // 3. Update appointment with the meeting URL
        const { error: updateError } = await supabase
            .from('appointments')
            .update({
                meeting_url: room.url,
                is_telemedicine: true,
            })
            .eq('id', appointmentId);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
        }

        return NextResponse.json({ url: room.url });
    } catch (error) {
        console.error('Telemedicine Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
