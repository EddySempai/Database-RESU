import os

file_path = 'src/components/Treasures.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace(
    'className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"',
    'className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm tour-treasures-modal-overlay"'
)

txt = txt.replace(
    'className="bg-[#0f0f0f] border border-gray-700 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"',
    'className="bg-[#0f0f0f] border border-gray-700 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col tour-treasures-modal-content"'
)

# Insert the step in the steps array
old_steps = """  const steps: Step[] = [
    {
      target: '.tour-treasures-slots',
      content: 'Configura el nivel actual y el nivel meta (al que quieres llegar) de cada uno de tus 6 tesoros.',
      
      buttons: ['close', 'skip'],
    },
    {
      target: '.tour-treasures-results',
      content: 'Verás automáticamente la cantidad exacta de fragmentos, planos y esmaltes necesarios para esa mejora.',
    }
  ];"""

new_steps = """  const steps: Step[] = [
    {
      target: '.tour-treasures-slots',
      content: t('tour.treasures_step1', 'Configura el nivel actual y el nivel meta (al que quieres llegar) de cada uno de tus 6 tesoros. Haz clic en un recuadro para empezar.'),
      buttons: ['close', 'skip'],
    },
    {
      target: '.tour-treasures-modal-content',
      content: t('tour.treasures_step2', 'Selecciona el nivel deseado de la lista para este tesoro.'),
      buttons: ['close', 'skip'],
    },
    {
      target: '.tour-treasures-results',
      content: t('tour.treasures_step3', 'Al seleccionar los niveles, verás automáticamente la cantidad exacta de fragmentos, planos y esmaltes necesarios para las mejoras.'),
    }
  ];"""

txt = txt.replace(old_steps, new_steps)

# We must also change the onClick logic!
# In the original Treasures, clicking the target opens the modal and advances the tour.
# But then when they click an item inside the modal, it should advance the tour to step 2!
# Let's see the item click in modal.

with open('src/components/Treasures.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
