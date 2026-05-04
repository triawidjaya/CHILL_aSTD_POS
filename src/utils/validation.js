/**
 * Form validation utilities for CHILL aSTD POS
 */

export const validators = {
  /**
   * Validate email format
   */
  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email format';
    return '';
  },

  /**
   * Validate password strength
   * Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
   */
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain number';
    return '';
  },

  /**
   * Validate password confirmation match
   */
  passwordMatch: (password, confirm) => {
    if (password !== confirm) return 'Passwords do not match';
    return '';
  },

  /**
   * Validate business name
   */
  businessName: (value) => {
    if (!value) return 'Business name is required';
    if (value.trim().length < 2) return 'Business name must be at least 2 characters';
    return '';
  },

  /**
   * Validate PIN (4 digits)
   */
  pin: (value) => {
    if (!value) return 'PIN is required';
    if (!/^\d{4}$/.test(value)) return 'PIN must be exactly 4 digits';
    return '';
  },

  /**
   * Validate staff name
   */
  staffName: (value) => {
    if (!value) return 'Staff name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  },

  /**
   * Validate transaction amount
   */
  amount: (value) => {
    if (!value) return 'Amount is required';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Amount must be a number';
    if (numValue <= 0) return 'Amount must be greater than 0';
    if (numValue > 999999999) return 'Amount exceeds maximum limit';
    return '';
  },

  /**
   * Validate category selection
   */
  category: (value) => {
    if (!value) return 'Category is required';
    return '';
  },

  /**
   * Validate staff selection
   */
  staff: (value) => {
    if (!value) return 'Staff selection is required';
    return '';
  },

  /**
   * Validate shift opening amount
   */
  shiftAmount: (value) => {
    if (!value) return 'Opening balance is required';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Opening balance must be a number';
    if (numValue < 0) return 'Opening balance cannot be negative';
    return '';
  },
};

/**
 * Validate all fields in an object
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules { fieldName: validator }
 * @returns {Object} - Errors object { fieldName: 'error message' }
 */
export function validateForm(data, rules) {
  const errors = {};
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    if (typeof rule === 'function') {
      errors[field] = rule(data[field]);
    }
  });
  return Object.keys(errors).reduce((acc, key) => {
    if (errors[key]) acc[key] = errors[key];
    return acc;
  }, {});
}

/**
 * Check if there are any errors
 */
export function hasErrors(errors) {
  return Object.values(errors).some(error => error && error.length > 0);
}
