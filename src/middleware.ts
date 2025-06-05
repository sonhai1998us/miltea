import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
 
  const cookie =  req.cookies.get('_sg');
  const { pathname } = req.nextUrl;
  
  if (pathname === '/signin' || pathname == "/signup") {
    if (cookie) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.next();
  }
  
  if (cookie) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL('/signin', req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/signin", "/signup"],
};
