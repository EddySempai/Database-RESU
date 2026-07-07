import TrainingCalculator from '../components/TrainingCalculator';
import RedQueenAI from '../components/RedQueenAI';
import { useTranslation } from 'react-i18next';


const Calculadoras = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-24 min-h-screen">
      <div className="text-center px-6 mb-4">
        <h1 className="font-bebas text-5xl md:text-7xl tracking-widest text-white uppercase mb-4">{t('tools_page.tactical_tools')}</h1>
        <p className="font-inter text-gray-400 max-w-2xl mx-auto">{t('tools_page.tools_desc')}</p>
      </div>
      <TrainingCalculator />
      <RedQueenAI />
    </div>
  );
};

export default Calculadoras;
