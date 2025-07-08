import supabase from '../lib/supabase';

// User Management
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  
  return session?.user || null;
};

export const signUpWithEmail = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Profile Management
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
    
  if (error) throw error;
  return data;
};

// Design Management
export const saveDesign = async (userId, designData) => {
  const { data, error } = await supabase
    .from('designs_pf7b3x9c4k')
    .insert([{
      user_id: userId,
      ...designData,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getUserDesigns = async (userId) => {
  const { data, error } = await supabase
    .from('designs_pf7b3x9c4k')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching designs:', error);
    return [];
  }
  
  return data || [];
};

export const getDesignById = async (designId) => {
  const { data, error } = await supabase
    .from('designs_pf7b3x9c4k')
    .select('*')
    .eq('id', designId)
    .single();
    
  if (error) {
    console.error('Error fetching design:', error);
    return null;
  }
  
  return data;
};

export const updateDesign = async (designId, updates) => {
  const { data, error } = await supabase
    .from('designs_pf7b3x9c4k')
    .update({
      ...updates,
      updated_at: new Date(),
    })
    .eq('id', designId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteDesign = async (designId) => {
  const { error } = await supabase
    .from('designs_pf7b3x9c4k')
    .delete()
    .eq('id', designId);
    
  if (error) throw error;
  return true;
};

export const incrementDownloadCount = async (designId) => {
  const { data, error } = await supabase.rpc('increment_download_count', {
    design_id: designId
  });
  
  if (error) {
    console.error('Error incrementing download count:', error);
    // Fallback method if RPC is not available
    const design = await getDesignById(designId);
    if (design) {
      return updateDesign(designId, { downloads: (design.downloads || 0) + 1 });
    }
  }
  
  return data;
};