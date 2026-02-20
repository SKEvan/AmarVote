// Shared validation utilities for consistent validation across frontend and backend

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ValidationUtils {
  
  /**
   * Comprehensive email validation
   */
  static validateEmail(email: string): ValidationResult {
    if (!email?.trim()) {
      return { isValid: false, error: 'Email is required' };
    }

    const emailTrim = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(emailTrim)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    const emailParts = emailTrim.split('@');
    if (emailParts.length !== 2) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    const [localPart, domainPart] = emailParts;
    
    // Local part validations
    if (localPart.length < 1 || localPart.length > 64) {
      return { isValid: false, error: 'Email username must be 1-64 characters' };
    }
    
    if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
      return { isValid: false, error: 'Invalid email format (dots cannot be consecutive or at edges)' };
    }
    
    // Domain part validations
    const domainParts = domainPart.split('.');
    if (domainParts.length < 2) {
      return { isValid: false, error: 'Email must have a valid domain' };
    }
    
    // Check domain name length
    if (domainParts[0].length < 2) {
      return { isValid: false, error: 'Domain name must be at least 2 characters (e.g., gmail.com, not g.com)' };
    }
    
    // Check each domain part
    for (const part of domainParts) {
      if (part.length < 1 || part.length > 63) {
        return { isValid: false, error: 'Invalid domain format' };
      }
      if (!/^[a-zA-Z0-9-]+$/.test(part)) {
        return { isValid: false, error: 'Domain can only contain letters, numbers, and hyphens' };
      }
      if (part.startsWith('-') || part.endsWith('-')) {
        return { isValid: false, error: 'Domain parts cannot start or end with hyphens' };
      }
    }
    
    // Check TLD
    const tld = domainParts[domainParts.length - 1];
    if (!/^[a-zA-Z]{2,}$/.test(tld)) {
      return { isValid: false, error: 'Top-level domain must be at least 2 letters' };
    }
    
    return { isValid: true };
  }

  /**
   * Phone number validation for Bangladesh
   */
  static validatePhone(phone: string): ValidationResult {
    if (!phone?.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }

    const cleanPhone = phone.trim().replace(/\s/g, '');
    
    // Check for +8801 format (14 characters total)
    if (cleanPhone.startsWith('+8801')) {
      if (cleanPhone.length === 14 && /^\+8801[3-9]\d{8}$/.test(cleanPhone)) {
        return { isValid: true };
      }
    }
    
    // Check for 01 format (11 digits)
    if (cleanPhone.startsWith('01')) {
      if (cleanPhone.length === 11 && /^01[3-9]\d{8}$/.test(cleanPhone)) {
        return { isValid: true };
      }
    }
    
    return { 
      isValid: false, 
      error: 'Phone number must be 11 digits starting with 01 (e.g., 01712345678) or 14 characters starting with +8801' 
    };
  }

  /**
   * NID validation for Bangladesh
   */
  static validateNID(nid: string): ValidationResult {
    if (!nid?.trim()) {
      return { isValid: false, error: 'NID is required' };
    }

    if (!/^\d{10}$/.test(nid.trim())) {
      return { isValid: false, error: 'NID must be exactly 10 digits' };
    }

    return { isValid: true };
  }

  /**
   * Name validation
   */
  static validateName(name: string, minLength: number = 3, maxLength: number = 50): ValidationResult {
    if (!name?.trim()) {
      return { isValid: false, error: 'Name is required' };
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < minLength) {
      return { isValid: false, error: `Name must be at least ${minLength} characters` };
    }
    
    if (trimmedName.length > maxLength) {
      return { isValid: false, error: `Name cannot exceed ${maxLength} characters` };
    }
    
    if (!/^[a-zA-Z\s.]+$/.test(trimmedName)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, and dots' };
    }

    return { isValid: true };
  }

  /**
   * Enhanced password validation with combination requirements
   */
  static validatePassword(password: string, minLength: number = 6): ValidationResult {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < minLength) {
      return { isValid: false, error: `Password must be at least ${minLength} characters` };
    }

    // Check for combination requirements
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const combinationCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

    if (combinationCount < 3) {
      return { 
        isValid: false, 
        error: 'Password must contain at least 3 of the following: lowercase letter, uppercase letter, number, special character' 
      };
    }

    return { isValid: true };
  }

  /**
   * File validation
   */
  static validateFile(file: File, maxSizeMB: number = 5, allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']): ValidationResult {
    if (!file) {
      return { isValid: false, error: 'File is required' };
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes.map(type => {
        switch (type) {
          case 'image/jpeg': return 'JPG';
          case 'image/png': return 'PNG';
          case 'application/pdf': return 'PDF';
          default: return type;
        }
      }).join(', ');
      return { isValid: false, error: `Only ${allowedExtensions} files are allowed` };
    }

    return { isValid: true };
  }
}