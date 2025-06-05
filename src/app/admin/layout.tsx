import React from "react";
import ClientLayout from './ClientLayout';
import Providers from './Providers';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sg = cookieStore.get('_sg')?.value;

  return (
    <Providers>
      <ClientLayout sg={sg || ''}>
        {children}
      </ClientLayout>
    </Providers>
  );
}
