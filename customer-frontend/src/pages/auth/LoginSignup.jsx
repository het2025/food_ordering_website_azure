import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { authService } from "../../services/api";
import { Loader, Eye, EyeOff } from "lucide-react";

// --- 🍑 WARM PEACH & DEEP WARM DARK THEME COLORS ---
const bgMain = '#FFF3E8';          // Page BG (warm peach light)
const bgCard = '#1C1410';          // Card BG (deep warm dark)
const borderOrange = '#E85D04';    // Primary Accent / Borders
const accentAmber = '#F48C06';     // Secondary Accent / Glows
const glowOrange = 'rgba(232, 93, 4, 0.15)';

// Typography for inside the dark card
const textName = '#FFE8D6';        // Primary text (warm cream white)
const textReview = '#EDCFB8';      // Subtext / Labels (soft warm beige)
const textRole = '#A07850';        // Muted details / Placeholders (muted warm brown)

// Input specific styling
const inputBg = '#261C16';         // Slightly lighter than card BG for contrast
const outlineVariant = '#3D2A20';  // Subtle border for inputs

// Helper: Prevent XSS/injection in inputs
const safeValue = s => (typeof s === "string" ? s.replace(/[<>\"'`]/g, "") : "");

export default function LoginSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, user } = useUser();

  // Throttle submissions (rate limit per session)
  const lastSubmitRef = useRef(Date.now());
  const [throttle, setThrottle] = useState(false);

  const defaultMode = location.pathname === "/signup" ? "signup" : "login";
  const [mode, setMode] = useState(defaultMode);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validation hints state
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValidLength: false
  });

  // ✅ Handle browser back button - redirect to home page
  useEffect(() => {
    // Push current state to history
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event) => {
      event.preventDefault();
      // When back button is clicked, redirect to appropriate home
      if (user) {
        // If user is logged in, go to authenticated home
        navigate("/home", { replace: true });
      } else {
        // If user is not logged in, go to main landing page
        navigate("/", { replace: true });
      }
    };

    // Listen for back button
    window.addEventListener("popstate", handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, user]);

  // Password: at least 8 chars, upper, lower, number, special
  const isStrongPassword = pass =>
    /[A-Z]/.test(pass) &&
    /[a-z]/.test(pass) &&
    /[0-9]/.test(pass) &&
    /[@$!%*?&]/.test(pass) &&
    pass.length >= 8;

  const handleChange = e => {
    const { name, value } = e.target;

    // Phone number: only allow numeric input
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      setError("");
      setSuccess("");
      return;
    }

    // Password: update validation hints
    if (name === "password") {
      const cleanValue = safeValue(value);
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue
      }));

      // Update password validation state
      setPasswordValidation({
        hasUpperCase: /[A-Z]/.test(cleanValue),
        hasNumber: /[0-9]/.test(cleanValue),
        hasSpecialChar: /[@$!%*?&]/.test(cleanValue),
        isValidLength: cleanValue.length >= 8 && cleanValue.length <= 32
      });

      setError("");
      setSuccess("");
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: safeValue(value)
    }));
    setError("");
    setSuccess("");
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function validateForm() {
    if (mode === "login") {
      if (!formData.email.trim() || !emailRegex.test(formData.email)) {
        setError("Please enter a valid email.");
        return false;
      }
      if (!formData.password || formData.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return false;
      }
    } else {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        setError("Enter a valid name (2+ chars).");
        return false;
      }
      if (!formData.email.trim() || !emailRegex.test(formData.email)) {
        setError("Enter a valid email address.");
        return false;
      }
      if (!isStrongPassword(formData.password)) {
        setError(
          "Password must be at least 8 characters, include upper, lower, number, and symbol."
        );
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
      if (formData.phone && formData.phone.replace(/\D/g, "").length !== 10) {
        setError("Phone number (optional) must be 10 digits.");
        return false;
      }
    }
    return true;
  }

  const handleSubmit = async e => {
    e.preventDefault();

    // Throttle: block if less than 2 seconds since last submit
    const now = Date.now();
    if (throttle || now - lastSubmitRef.current < 2000) {
      setError("Please wait before trying again.");
      return;
    }
    lastSubmitRef.current = now;
    setThrottle(true);
    setTimeout(() => setThrottle(false), 2500);

    if (!validateForm()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      let response;
      // Only allow alphanum and valid characters (block obvious SQL injection etc)
      const emailSafe = safeValue(formData.email.trim().toLowerCase());
      if (!emailRegex.test(emailSafe)) {
        setError("Invalid email address.");
        return;
      }
      if (mode === "login") {
        response = await authService.login({
          email: emailSafe,
          password: formData.password
        });
        if (response.success && response.data?.token) {
          setUser(response.data.user);
          setSuccess("Login successful! Redirecting...");
          setTimeout(() => navigate("/home"), 800);
        } else {
          setError("Invalid login credentials."); // never reveal if user/email exists
        }
      } else {
        response = await authService.register({
          name: safeValue(formData.name.trim()),
          email: emailSafe,
          password: formData.password,
          phone: safeValue(formData.phone.trim().replace(/\D/g, ""))
        });
        if (response.success && response.data?.token) {
          setUser(response.data.user);
          setSuccess("Account created! Redirecting...");
          setTimeout(() => navigate("/home"), 1000);
        } else {
          setError("Signup failed. Please try again."); // never reveal details
        }
      }
    } catch (err) {
      console.error('Login/Signup error:', err);
      // Use the server-provided error message if available, otherwise fallback
      setError(err.message || "An unknown error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = targetMode => {
    setMode(targetMode);
    setError("");
    setSuccess("");
    navigate(targetMode === "login" ? "/login" : "/signup", { replace: true });
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen relative"
      style={{
        backgroundColor: bgMain,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        
        .ignite-gradient {
          background: linear-gradient(135deg, ${borderOrange} 0%, ${accentAmber} 100%);
        }

        .dark-input::placeholder {
          color: ${textRole};
          opacity: 0.8;
        }

        /* Prevent autofill from ruining the dark theme background */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px ${inputBg} inset !important;
            -webkit-text-fill-color: ${textName} !important;
            transition: background-color 5000s ease-in-out 0s;
        }

        /* Hide native password reveal icons */
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Optional subtle background glow matching the warm peach aesthetic */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: `radial-gradient(circle at center, rgba(232, 93, 4, 0.08) 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0
      }}></div>

      <div
        className="w-full max-w-md px-6 pt-6 pb-8 mx-4 rounded-3xl sm:px-8 sm:mx-0 relative z-10"
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${borderOrange}`,
          borderTop: `3px solid ${accentAmber}`,
          boxShadow: `0 20px 60px rgba(28, 20, 16, 0.4)` // Deep warm shadow
        }}
      >
        <div className="mb-6 text-center">
          <img
            src="/quickbite_logo.svg"
            alt="QuickBite"
            className="object-contain w-12 h-12 mx-auto mb-2 cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate('/')}
          />
          <h1
            className="mb-1 text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: textName }}
          >
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p style={{ color: textReview, fontSize: '14px' }}>
            {mode === "login"
              ? "Sign in to your QuickBite account"
              : "Join QuickBite and discover amazing food"}
          </p>
        </div>

        {success && (
          <div
            className="flex items-center justify-center gap-2 px-4 py-2 mb-4 text-center rounded-xl text-sm"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399' }}
          >
            {success}
          </div>
        )}
        {error && (
          <div
            className="flex items-center justify-center gap-2 px-4 py-2 mb-4 text-center rounded-xl text-sm"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {mode === "signup" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium" style={{ color: textName }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  autoComplete="name"
                  disabled={loading}
                  onChange={handleChange}
                  required
                  maxLength={128}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all dark-input"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${outlineVariant}`,
                    color: textName,
                    outlineColor: accentAmber,
                    '--tw-ring-color': accentAmber
                  }}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium" style={{ color: textName }}>Phone <span style={{ color: textRole }}>(optional)</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  autoComplete="off"
                  disabled={loading}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all dark-input"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${outlineVariant}`,
                    color: textName,
                    '--tw-ring-color': accentAmber
                  }}
                  placeholder="10-digit phone"
                  maxLength={10}
                  pattern="\d{10}"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1.5 text-sm font-medium" style={{ color: textName }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              autoComplete="email"
              disabled={loading}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all dark-input"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${outlineVariant}`,
                color: textName,
                '--tw-ring-color': accentAmber
              }}
              placeholder="Enter your email"
              spellCheck={false}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium" style={{ color: textName }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                disabled={loading}
                onChange={handleChange}
                onFocus={() => mode === "signup" && setShowPasswordHints(true)}
                onBlur={() => mode === "signup" && setShowPasswordHints(false)}
                required
                minLength={8}
                maxLength={32}
                className="w-full px-4 py-2.5 pr-12 rounded-xl focus:outline-none focus:ring-2 transition-all dark-input"
                style={{
                  backgroundColor: inputBg,
                  border: `1px solid ${outlineVariant}`,
                  color: textName,
                  '--tw-ring-color': accentAmber
                }}
                placeholder={mode === "login" ? "Enter your password" : "Create a strong password"}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors flex items-center justify-center"
                onClick={() => setShowPassword(s => !s)}
                style={{ color: textReview, background: "none", border: "none" }}
                onMouseEnter={(e) => e.currentTarget.style.color = accentAmber}
                onMouseLeave={(e) => e.currentTarget.style.color = textReview}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {mode === "signup" && (showPasswordHints || formData.password.length > 0) && (
              <div
                className="p-3 mt-2 rounded-xl"
                style={{ backgroundColor: inputBg, border: `1px solid ${outlineVariant}` }}
              >
                <p className="mb-1.5 text-xs font-semibold" style={{ color: textName }}>Password must contain:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <p className={`text-xs flex items-center gap-1.5 ${passwordValidation.hasUpperCase ? 'text-[#34d399]' : ''}`} style={{ color: passwordValidation.hasUpperCase ? '' : textReview }}>
                    <span>{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                    One capital letter
                  </p>
                  <p className={`text-xs flex items-center gap-1.5 ${passwordValidation.hasNumber ? 'text-[#34d399]' : ''}`} style={{ color: passwordValidation.hasNumber ? '' : textReview }}>
                    <span>{passwordValidation.hasNumber ? '✓' : '○'}</span>
                    One number (0-9)
                  </p>
                  <p className={`text-xs flex items-center gap-1.5 ${passwordValidation.hasSpecialChar ? 'text-[#34d399]' : ''}`} style={{ color: passwordValidation.hasSpecialChar ? '' : textReview }}>
                    <span>{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                    One special char
                  </p>
                  <p className={`text-xs flex items-center gap-1.5 ${passwordValidation.isValidLength ? 'text-[#34d399]' : ''}`} style={{ color: passwordValidation.isValidLength ? '' : textReview }}>
                    <span>{passwordValidation.isValidLength ? '✓' : '○'}</span>
                    8-32 chars ({formData.password.length})
                  </p>
                </div>
              </div>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: textName }}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  autoComplete="new-password"
                  disabled={loading}
                  onChange={handleChange}
                  required
                  minLength={8}
                  maxLength={32}
                  className="w-full px-4 py-2.5 pr-12 rounded-xl focus:outline-none focus:ring-2 transition-all dark-input"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${outlineVariant}`,
                    color: textName,
                    '--tw-ring-color': accentAmber
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors flex items-center justify-center"
                  onClick={() => setShowConfirmPassword(s => !s)}
                  style={{ color: textReview, background: "none", border: "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = accentAmber}
                  onMouseLeave={(e) => e.currentTarget.style.color = textReview}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword.length > 0 && (
                <p className={`mt-2 text-xs flex items-center gap-1.5 ${formData.password === formData.confirmPassword ? 'text-[#34d399]' : 'text-[#f87171]'
                  }`}>
                  <span>{formData.password === formData.confirmPassword ? '✓' : '✗'}</span>
                  {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || throttle}
            className="ignite-gradient flex items-center justify-center w-full gap-2 py-3 mt-4 text-base font-bold transition-all duration-200 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginTop: '24px',
              color: bgCard, // High contrast text on orange button
              boxShadow: `0 4px 15px ${glowOrange}`
            }}
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm" style={{ color: textReview }}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-semibold transition-colors"
                disabled={loading}
                style={{ color: borderOrange, background: "none", border: "none", padding: "0 4px", margin: 0, textDecoration: 'underline' }}
                onMouseEnter={(e) => e.currentTarget.style.color = accentAmber}
                onMouseLeave={(e) => e.currentTarget.style.color = borderOrange}
              >
                Sign up here
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-semibold transition-colors"
                disabled={loading}
                style={{ color: borderOrange, background: "none", border: "none", padding: "0 4px", margin: 0, textDecoration: 'underline' }}
                onMouseEnter={(e) => e.currentTarget.style.color = accentAmber}
                onMouseLeave={(e) => e.currentTarget.style.color = borderOrange}
              >
                Log in here
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}