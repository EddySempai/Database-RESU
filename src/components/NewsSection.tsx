import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const NewsSection = () => {
  const { t } = useTranslation();
  const news = [
    {
      date: "15 NOV 2025",
      tag: t('home.update'),
      title: t('home.news_1_title'),
      excerpt: t('home.news_1_desc')
    },
    {
      date: "02 NOV 2025",
      tag: t('home.new_op'),
      title: t('home.news_2_title'),
      excerpt: t('home.news_2_desc')
    },
    {
      date: "28 OCT 2025",
      tag: t('home.community'),
      title: t('home.news_3_title'),
      excerpt: t('home.news_3_desc')
    }
  ];

  return (
    <section className="relative z-10 py-16 px-6 md:px-12 max-w-7xl mx-auto bg-black/40">
      <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
        <h2 className="font-bebas text-4xl text-white tracking-widest">{t('home.news_title')}</h2>
        <a href="#" className="font-mono text-sm text-blood-red hover:text-neon-red transition-colors uppercase tracking-widest">
          {t('home.view_all')}
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {news.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#0a0a0a] border-l-2 border-l-gray-800 hover:border-l-blood-red p-6 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-xs text-gray-500">{item.date}</span>
              <span className="px-2 py-0.5 bg-gray-900 text-gray-300 font-mono text-[10px] uppercase tracking-wider">
                {item.tag}
              </span>
            </div>
            <h3 className="font-bebas text-xl text-white tracking-wide mb-3 leading-tight">
              {item.title}
            </h3>
            <p className="font-inter text-sm text-gray-400">
              {item.excerpt}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;
