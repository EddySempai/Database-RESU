import { useTranslation } from 'react-i18next';
import operativosES from '../data/operativos.json';
import operativosEN from '../locales/en/operativos.json';
import operativosJA from '../locales/ja/operativos.json';

export const useOperativos = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'es';

  if (lang.startsWith('es')) return operativosES;

  const targetLoc = lang.startsWith('ja') ? operativosJA : operativosEN;
  const locMap = new Map((targetLoc as any[]).map(o => [o.id, o]));

  return (operativosES as any[]).map(esOp => {
    const locOp = locMap.get(esOp.id);
    if (!locOp) return esOp;

    const locSkillsList = locOp.skills || [];

    const mergedSkills = (esOp.skills || []).map((esSkill: any, idx: number) => {
      const locSkill = locSkillsList[idx] || locSkillsList.find((s: any) => s.name === esSkill.name);
      return {
        ...esSkill,
        name: locSkill?.name || esSkill.name,
        description: locSkill?.description || esSkill.description,
        iconUrl: esSkill.iconUrl || locSkill?.iconUrl || '',
        type: esSkill.type || locSkill?.type || 'Campo',
        isArmaEspecial: esSkill.isArmaEspecial ?? locSkill?.isArmaEspecial ?? false,
        isVipSkill: esSkill.isVipSkill ?? locSkill?.isVipSkill ?? false,
      };
    });

    return {
      ...esOp,
      name: locOp.name || esOp.name,
      unitType: locOp.unitType || esOp.unitType,
      rarity: locOp.rarity || esOp.rarity,
      fieldStats: locOp.fieldStats && locOp.fieldStats.length > 0 ? locOp.fieldStats : esOp.fieldStats,
      skills: mergedSkills,
    };
  });
};
