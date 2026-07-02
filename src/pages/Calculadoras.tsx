import TrainingCalculator from '../components/TrainingCalculator';
import RedQueenAI from '../components/RedQueenAI';


const Calculadoras = () => {
  return (
    <div className="pt-24 min-h-screen">
      <div className="text-center px-6 mb-4">
        <h1 className="font-bebas text-5xl md:text-7xl tracking-widest text-white uppercase mb-4">Herramientas Tácticas</h1>
        <p className="font-inter text-gray-400 max-w-2xl mx-auto">Calcula la producción de tropas y simula escenarios de combate con la asistencia directa de la IA Red Queen.</p>
      </div>
      <TrainingCalculator />
      <RedQueenAI />
    </div>
  );
};

export default Calculadoras;
