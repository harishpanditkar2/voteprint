import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to search page on homepage load
    router.push('/search');
  }, [router]);

  useEffect(() => {
    // Redirect to search page on homepage load
    router.push('/search');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Head>
        <title>Voter PDF Generator - Redirecting...</title>
        <meta name="description" content="Upload and parse voter list PDFs" />
      </Head>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', color: '#666' }}>Redirecting to search page...</h1>
      </div>
    </div>
  );
}
