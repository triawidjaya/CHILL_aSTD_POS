import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import StaffGrid from '../components/Staff/StaffGrid';
import AddStaffModal from '../components/Modal/AddStaffModal';
import Button from '../components/Common/Button';
import { useOutlet } from '../hooks/useOutlet';
import { useUsers } from '../hooks/useUsers';
import { logActivity } from '../services/activityLogs';
import { useTranslation } from '../context/LanguageContext';

export default function StaffPage() {
  const { outletId, userId, userRole } = useOutlet();
  const { users, loading, error, addUser, deleteUserData } = useUsers(outletId);
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  const handleAddStaff = async (formData) => {
    try {
      await addUser(formData);
      await logActivity(outletId, userId, 'add_staff', { staff_name: formData.name, role: formData.role });
      setShowModal(false);
    } catch (err) {
      alert('Failed to add staff: ' + err.message);
      throw err;
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteUserData(staffId);
        await logActivity(outletId, userId, 'delete_staff', { staff_id: staffId });
      } catch (err) {
        alert('Failed to delete staff: ' + err.message);
      }
    }
  };

  const canManageStaff = userRole === 'Admin' || userRole === 'Manager';

  return (
    <MainLayout title={t('staff_page_title')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>{t('staff_management_title')}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage staff accounts and permissions for this outlet.
          </p>
        </div>
        {canManageStaff && (
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
          >
            {t('btn_add_staff')}
          </Button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <StaffGrid
        staff={users}
        loading={loading}
        onEdit={(staff) => { console.log('Edit staff:', staff); }}
        onDelete={handleDeleteStaff}
      />

      {showModal && (
        <AddStaffModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddStaff}
        />
      )}
    </MainLayout>
  );
}
