// Shared, React-side validation rules used by Login, Registration and Profile
// editing so the same field always follows the same rule.

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const LETTERS_AND_SPACES = /^[A-Za-z ]+$/;
const INDIAN_PHONE = /^[6-9]\d{9}$/;

// Returns an error message, or "" when the value is acceptable.
export function validateName(value, label) {
  const text = String(value || "").trim();
  if (!text) return `Enter your ${label}.`;
  if (text.length < 2) return `Your ${label} needs at least 2 characters.`;
  if (!LETTERS_AND_SPACES.test(text)) return `Use letters and spaces only in your ${label}.`;
  return "";
}

export function validatePlace(value, label) {
  const text = String(value || "").trim();
  if (!text) return `Enter your ${label}.`;
  if (text.length < 2) return `Your ${label} needs at least 2 characters.`;
  if (!LETTERS_AND_SPACES.test(text)) return `Use letters and spaces only in your ${label}.`;
  return "";
}

export function validateEmail(value) {
  const text = String(value || "").trim();
  if (!text) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(text)) return "Enter a valid email address, for example you@example.com.";
  return "";
}

export function validatePhone(value) {
  const text = String(value || "").trim();
  if (!text) return "Enter your phone number.";
  if (!/^\d+$/.test(text)) return "Use digits only — no spaces, +, letters or symbols.";
  if (text.length !== 10) return "Enter exactly 10 digits.";
  if (!INDIAN_PHONE.test(text)) return "An Indian number must start with 6, 7, 8 or 9.";
  return "";
}

export function validatePassword(value) {
  const text = String(value || "");
  if (!text) return "Enter a password.";
  if (text.length < 8) return "Use at least 8 characters.";
  if (!/[A-Z]/.test(text)) return "Add at least 1 uppercase letter.";
  if (!/[a-z]/.test(text)) return "Add at least 1 lowercase letter.";
  if (!/\d/.test(text)) return "Add at least 1 number.";
  if (!/[^A-Za-z0-9]/.test(text)) return "Add at least 1 special character.";
  return "";
}

// Login only checks that a password was typed — strength rules belong to signup.
export function validateLoginPassword(value) {
  if (!String(value || "")) return "Enter your password.";
  return "";
}

export function validateBio(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length < 10) return "Write at least 10 characters, or leave this empty.";
  if (text.length > 300) return "Keep this under 300 characters.";
  if (!/[A-Za-z]{2,}/.test(text)) return "Write a short sentence about yourself.";
  return "";
}

// Photo files are read in the browser, so only format and size are checkable.
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function validatePhotoFile(file) {
  if (!file) return "";
  const name = String(file.name || "").toLowerCase();
  const hasAllowedType = ALLOWED_PHOTO_TYPES.includes(String(file.type).toLowerCase());
  const hasAllowedName = /\.(jpg|jpeg|png)$/.test(name);
  if (!hasAllowedType && !hasAllowedName) return "Choose a JPG, JPEG or PNG image.";
  if (file.size > MAX_PHOTO_BYTES) return "That image is larger than 2 MB.";
  return "";
}

// Shared field map for Registration and Profile editing.
export function validateProfileField(field, values) {
  if (field === "firstName") return validateName(values.firstName, "first name");
  if (field === "lastName") return validateName(values.lastName, "last name");
  if (field === "email") return validateEmail(values.email);
  if (field === "phone") return validatePhone(values.phone);
  if (field === "city") return validatePlace(values.city, "city");
  if (field === "country") return validatePlace(values.country, "country");
  if (field === "bio") return validateBio(values.bio);
  if (field === "password") return validatePassword(values.password);
  return "";
}

export function validateFields(fields, values) {
  const errors = {};
  fields.forEach((field) => {
    const message = validateProfileField(field, values);
    if (message) errors[field] = message;
  });
  return errors;
}
