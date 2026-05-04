import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import CategoryManager from '../components/Config/CategoryManager';
import BusinessIdentity from '../components/Config/BusinessIdentity';
import LanguageSettings from '../components/Config/LanguageSettings';
import { useOutlet } from '../hooks/useOutlet';
import { useCategories } from '../hooks/useCategories';
import { updateOutletSettings } from '../services/users';
import { logActivity } from '../services/activityLogs';
import { useTranslation } from '../context/LanguageContext';

export default function ConfigPage() {
  const { outlet, outletId, userId } = useOutlet();
  const { categories, addCategory, deleteCategory, loading: catsLoading } = useCategories(outletId);
  const { t } = useTranslation();

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleUpdateIdentity = async (settings) => {
    try {
      await updateOutletSettings(outletId, settings);
      await logActivity(outletId, userId, 'update_outlet_identity', settings);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  const handleAddCategory = async (name, type) => {
    try {
      await addCategory(name, type);
      await logActivity(outletId, userId, 'add_category', { category_name: name, type });
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(categoryId);
      await logActivity(outletId, userId, 'delete_category', { category_id: categoryId });
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  return (
    <MainLayout title={t('config_page_title')}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>{t('system_config_title')}</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Manage outlet categories, business identity, and system preferences.
        </p>
      </div>

      <div className="config-grid">
        <div className="config-main">
          <BusinessIdentity 
            outlet={outlet} 
            onSave={handleUpdateIdentity} 
          />
          
          <div style={{ marginTop: '1.5rem' }}>
            <CategoryManager
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              loading={catsLoading}
            />
          </div>
        </div>

        <div className="config-side">
          <LanguageSettings />
        </div>
      </div>

      <style>{`
        .config-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 1024px) {
          .config-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
}
