import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { expires, sg } = body;
        
        const response = NextResponse.json(
            {},
            { status: 200, statusText: "Set cookie successfully" }
        );

        response.cookies.set({
            name: "_sg",
            value: sg,
            path: '/',
            maxAge: expires - Date.now(),
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
        });
        return response;
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const response = NextResponse.json(
            {},
            { status: 200, statusText: "Cookie deleted successfully" }
        );

        response.cookies.delete("_sg");
        return response;
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}