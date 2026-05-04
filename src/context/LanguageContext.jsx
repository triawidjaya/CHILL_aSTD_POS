import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    app_title: "CHILL aSTD POS Dashboard",
    menu_ongoing_shift: "Ongoing Shift",
    menu_history_shift: "History Shift",
    menu_staff_management: "Staff Management",
    menu_system_config: "System Config",
    dashboard_title: "Ongoing Shift Dashboard",
    staff_page_title: "Staff Management",
    config_page_title: "System Configuration",
    history_page_title: "Shift History",
    btn_logout: "Logout",
    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_add: "Add",
    btn_delete: "Delete",
    btn_edit: "Edit",
    label_name: "Name",
    label_email: "Email",
    label_role: "Role",
    label_status: "Status",
    label_pin: "PIN",
    // ... I will add more as needed
  },
  id: {
    app_title: "Dashboard CHILL aSTD POS",
    menu_ongoing_shift: "Shift Berjalan",
    menu_history_shift: "Riwayat Shift",
    menu_staff_management: "Manajemen Staf",
    menu_system_config: "Konfigurasi Sistem",
    dashboard_title: "Dashboard Shift Berjalan",
    staff_page_title: "Manajemen Staf",
    config_page_title: "Konfigurasi Sistem",
    history_page_title: "Riwayat Shift",
    btn_logout: "Keluar",
    btn_save: "Simpan",
    btn_cancel: "Batal",
    btn_add: "Tambah",
    btn_delete: "Hapus",
    btn_edit: "Edit",
    label_name: "Nama",
    label_email: "Email",
    label_role: "Peran",
    label_status: "Status",
    label_pin: "PIN",
    // ... I will add more as needed
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang][key] || key;
  };

  const value = {
    lang,
    setLang,
    t,
    translations: translations[lang]
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}
