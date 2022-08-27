import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import LotteryEntrance from '../components/LotteryEntrance';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Smart Contract Lottery</title>
        <meta name="description" content="Smart Contract Lottery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <LotteryEntrance />
    </div>
  )
}

export default Home;

// import ManualHeader from '../components/ManualHeader';
{/* <ManualHeader /> */}
