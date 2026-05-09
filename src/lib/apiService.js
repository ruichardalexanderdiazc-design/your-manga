import { supabase } from './supabase';

export const fetchObras = async (params = {}) => {
  try {
    const { data, error } = await supabase
      .from('manga_works')
      .select('*');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching obras from Supabase:", error);
    return [];
  }
};

export const fetchObraById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('manga_works')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching obra by id:", err);
    return null;
  }
};

export const fetchChapters = async (work_id) => {
  try {
    const { data, error } = await supabase
      .from('manga_chapters')
      .select('*')
      .eq('manga_work_id', work_id)
      .order('chapter_number', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
};

export const fetchLibrary = async (userEmail) => {
  if (!userEmail) return [];
  try {
    const { data, error } = await supabase
      .from('manga_library')
      .select('*')
      .eq('user_id', userEmail);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching library:", error);
    return [];
  }
};

export const addToLibrary = async (work_id, userEmail) => {
  if (!userEmail) return;
  try {
    // Check if it already exists
    const { data: existing } = await supabase
      .from('manga_library')
      .select('id')
      .eq('manga_work_id', work_id)
      .eq('user_id', userEmail);
      
    if (!existing || existing.length === 0) {
      const { error } = await supabase
        .from('manga_library')
        .insert([{ manga_work_id: work_id, user_id: userEmail }]);
        
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error adding to library:", error);
  }
};

export const postInteraction = async (interactionData) => {
  try {
    const { data, error } = await supabase
      .from('manga_interactions')
      .insert([interactionData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error posting interaction:", error);
    throw error;
  }
};

export const publishWork = async (workData, adminEmail) => {
  try {
    const { data, error } = await supabase
      .from('manga_work')
      .insert([{ ...workData, admin_email: adminEmail }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error publishing work:", error);
    throw error;
  }
};

export const addChapter = async (chapterData, adminEmail) => {
  try {
    const { data, error } = await supabase
      .from('manga_chapter')
      .insert([{ ...chapterData, admin_email: adminEmail }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding chapter:", error);
    throw error;
  }
};
