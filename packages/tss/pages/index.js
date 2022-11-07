import Head from 'next/head'
import App from './App'

export default function Home() {
  return (
    <div className="w-full h-screen">
      <Head>
        <title>TSS</title>
        <meta name="description" content="TSS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <App />
    </div>
  )
}
