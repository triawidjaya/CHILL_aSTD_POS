import { supabase } from './supabase';

export async function fetchCategories(outletId) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('outlet_id', outletId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data;
}

export async function addCategory(outletId, name, type) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      outlet_id: outletId,
      name,
      type,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return data;
}

export async function updateCategory(categoryId, updates) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return data;
}

export function subscribeToCategories(outletId, callback) {
  return supabase
    .channel(`categories-${outletId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
        filter: `outlet_id=eq.${outletId}`,
      },
      callback
    )
    .subscribe();
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}
