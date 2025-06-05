import { NextResponse } from 'next/server';
import axios from "axios";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const response = await axios.post(process.env.API_URL + '/v1/login', { email, password });

        if (response.data.status !== "success") {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const data = response.data.result;
        
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
