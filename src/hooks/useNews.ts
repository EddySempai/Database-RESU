import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { NEWS_DATA, type NewsArticle } from '../data/newsData';

const STORAGE_KEY = 'resu_news_articles_cache';

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const missingStatic = NEWS_DATA.filter(n => !parsed.some((p: NewsArticle) => p.id === n.id));
          if (missingStatic.length === 0) {
            return parsed;
          }
          return [...missingStatic, ...parsed];
        }
      }
    } catch {
      // Ignore cache error
    }
    return NEWS_DATA;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('guild_settings')
        .select('value')
        .eq('key', 'news_articles')
        .maybeSingle();

      if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
        const dbArticles = data.value as NewsArticle[];
        const missingStatic = NEWS_DATA.filter(n => !dbArticles.some(d => d.id === n.id));
        const merged = [...missingStatic, ...dbArticles];
        setArticles(merged);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // Ignore storage error
        }
      } else {
        setArticles(NEWS_DATA);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(NEWS_DATA));
        } catch {
          // Ignore storage error
        }
      }
    } catch (err) {
      console.warn('Fallback to local NEWS_DATA:', err);
      setArticles(NEWS_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const saveNewsList = async (newList: NewsArticle[]) => {
    setSaving(true);
    setArticles(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch {
      // Ignore localStorage error
    }

    try {
      const { error } = await supabase
        .from('guild_settings')
        .upsert({ key: 'news_articles', value: newList });

      if (error) {
        throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error saving news to Supabase:', err);
      return { success: false, error: err?.message || 'Error guardando en Supabase' };
    } finally {
      setSaving(false);
    }
  };

  const publishArticle = async (article: NewsArticle, makeFeatured = false) => {
    let nextList = [...articles];
    if (makeFeatured || article.isFeatured) {
      nextList = nextList.map(item => ({ ...item, isFeatured: false }));
      article.isFeatured = true;
    }

    const existingIdx = nextList.findIndex(item => item.id === article.id);
    if (existingIdx >= 0) {
      nextList[existingIdx] = article;
    } else {
      nextList = [article, ...nextList];
    }

    return saveNewsList(nextList);
  };

  const deleteArticle = async (id: string) => {
    const nextList = articles.filter(item => item.id !== id);
    return saveNewsList(nextList);
  };

  const setFeaturedArticle = async (id: string) => {
    const nextList = articles.map(item => ({
      ...item,
      isFeatured: item.id === id
    }));
    return saveNewsList(nextList);
  };

  const resetToDefaults = async () => {
    return saveNewsList(NEWS_DATA);
  };

  return {
    articles,
    loading,
    saving,
    refreshNews: fetchNews,
    publishArticle,
    deleteArticle,
    setFeaturedArticle,
    resetToDefaults
  };
}
