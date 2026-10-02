/**
 * English dictionary. This file defines the SHAPE of every translation —
 * `hi.ts` is typed as `Dictionary`, so a missing or misspelled Hindi key is a
 * compile error rather than a string that silently falls back to English.
 *
 * Values that need interpolation are functions, which keeps them type-safe
 * instead of relying on `{placeholder}` substitution at runtime.
 */
export const en = {
  common: {
    appName: "Quick Bites",
    loading: "Loading…",
    retry: "Try again",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    required: "Required",
    optional: "optional",
    somethingWentWrong: "Something went wrong.",
    show: "Show",
    hide: "Hide",
  },

  nav: {
    menu: "Menu",
    offers: "Offers",
    about: "About",
    gallery: "Gallery",
    contact: "Contact",
    bookTable: "Book a table",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },

  language: {
    label: "Language",
    english: "EN",
    hindi: "हिं",
    switchToHindi: "Switch to Hindi",
    switchToEnglish: "Switch to English",
  },

  account: {
    signIn: "Sign in",
    signUp: "Create account",
    signOut: "Logout",
    myOrders: "My orders",
    profile: "Profile",
    accountMenu: "Account menu",
    openAdminPanel: "Open admin panel",
    greeting: (name: string) => `Hello, ${name}`,
    signedInAs: (email: string) => `Signed in as ${email}`,
  },

  auth: {
    // Customer sign-in
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to order and track your takeaway.",
    loginCta: "Sign in",
    noAccount: "New to Quick Bites?",
    createOne: "Create an account",

    // Customer sign-up
    signupTitle: "Create your account",
    signupSubtitle: "It takes a minute. You'll need it to place an order.",
    signupCta: "Create account",
    haveAccount: "Already have an account?",
    signInInstead: "Sign in",

    // Admin
    adminTitle: "Staff sign-in",
    adminSubtitle: "Quick Bites admin panel — Bombay Bazar, Khandwa.",
    adminCta: "Sign in to admin",
    backToSite: "Back to the website",

    // Fields
    name: "Full name",
    namePlaceholder: "e.g. Rohit Verma",
    email: "Email",
    emailPlaceholder: "you@example.com",
    phone: "Mobile number",
    phonePlaceholder: "10-digit number",
    password: "Password",
    passwordPlaceholder: "At least 8 characters",
    confirmPassword: "Confirm password",
    showPassword: "Show password",
    hidePassword: "Hide password",

    // Outcomes
    signingIn: "Signing in…",
    creatingAccount: "Creating your account…",
    welcomeBack: (name: string) => `Welcome back, ${name}`,
    accountCreated: "Account created. You're signed in.",
    signedOut: "You've been signed out.",
  },

  validation: {
    nameRequired: "Please enter your name.",
    nameTooShort: "That name looks too short.",
    emailRequired: "Please enter your email.",
    emailInvalid: "That doesn't look like a valid email.",
    phoneRequired: "Please enter your mobile number.",
    phoneInvalid: "Enter a 10-digit Indian mobile number starting with 6–9.",
    passwordRequired: "Please enter a password.",
    passwordTooShort: "Use at least 8 characters.",
    passwordNeedsNumber: "Include at least one number.",
    confirmRequired: "Please confirm your password.",
    passwordsDoNotMatch: "Those passwords don't match.",
  },

  guard: {
    checkingAccess: "Checking your access…",
    signInRequired: "Please sign in to continue",
    signInRequiredBody: "You need an account to get to this page.",
    forbiddenTitle: "You don't have access to this",
    forbiddenBody: (module: string) =>
      `Your account doesn't include the ${module} permission. Ask the owner if you need it.`,
    backToDashboard: "Back to dashboard",
  },

  demo: {
    title: "Demo accounts",
    subtitle: "Prototype only — these are seeded test logins, not real accounts.",
    superAdmin: "Super admin",
    admin: "Admin (limited)",
    customer: "Customer",
    fill: "Use this",
    filled: "Filled in",
  },

  admin: {
    panel: "Admin panel",
    dashboard: "Dashboard",
    signedInAs: "Signed in as",
    role: "Role",
    permissions: "Permissions",
    noPermissions: "No module permissions assigned.",
    allPermissions: "Full access to every module.",
    settings: "Settings",
    staff: "Staff",
    viewSite: "View website",
  },

  roles: {
    CUSTOMER: "Customer",
    ADMIN: "Admin",
    SUPER_ADMIN: "Super admin",
  },

  permissions: {
    ORDERS: "Orders",
    MENU: "Menu & categories",
    INVENTORY: "Inventory",
    COUPONS: "Coupons",
    CUSTOMERS: "Customers",
    ENQUIRIES: "Enquiries",
    BOOKINGS: "Table bookings",
    CONTENT: "Website content",
    REPORTS: "Reports",
    SETTINGS: "Settings",
  },
};

export type Dictionary = typeof en;
