
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import NewsSection from '../components/NewsSection';
import QuickLinks from '../components/QuickLinks';
import OperativesShowcase from '../components/OperativesShowcase';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Resident Evil: Survival Unit Wiki & Database Hub</title>
        <meta name="description" content="Wiki oficial de la comunidad y base de datos completa de Resident Evil: Survival Unit. Tier List actualizada, comparador de héroes, guías de eventos y calculadoras." />
        <link rel="canonical" href="https://resudb.com/" />
        <meta property="og:title" content="Resident Evil: Survival Unit Wiki & Database Hub" />
        <meta property="og:description" content="Wiki y base de datos de Resident Evil: Survival Unit. Tier List, comparador de héroes, guías y calculadoras tácticas." />
        <meta property="og:url" content="https://resudb.com/" />
        <meta property="og:image" content="https://resudb.com/metadata-img.png" />
      </Helmet>
      <Hero />
      <NewsSection />
      <QuickLinks />
      <OperativesShowcase />
    </>
  );
};

export default Home;
