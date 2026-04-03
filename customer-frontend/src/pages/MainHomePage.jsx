import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

// IMPORTANT: adjust this import to point to your real API/service file
import { restaurantService, pincodeService } from '../services/api'; // <-- change path if necessary

// --- 🍑 WARM PEACH & DEEP WARM DARK THEME COLORS ---
const bgMain = '#FFF3E8';          // Section BG (warm peach light)
const bgCard = '#1C1410';          // Card BG (deep warm dark)
const borderOrange = '#E85D04';    // Card Border & Quote Mark
const accentAmber = '#F48C06';     // Top Accent & Stars
const glowOrange = 'rgba(232, 93, 4, 0.15)';
const glowOrangeHover = 'rgba(232, 93, 4, 0.25)';

// Typography for Light Background (Main Page)
const textOnMain = '#2C1810';      // Deep espresso for readability on peach
const textMutedOnMain = '#5C3D2E'; // Muted brown for subtext on peach
const outlineLight = 'rgba(44, 24, 16, 0.15)'; // Subtle border for light elements

// Typography for Dark Background (Cards)
const textOnCardName = '#FFE8D6';  // Name Text (warm cream white)
const textOnCardReview = '#EDCFB8';// Review Text (soft warm beige)
const textOnCardRole = '#A07850';  // Role Text (muted warm brown)

// Avatar colors for testimonials
const avatarColors = ['#E85D04', '#C1440E', '#8B5E3C'];

// Sample data
const cuisines = [
  { emoji: '🍕', name: 'Italian' },
  { emoji: '🍣', name: 'Japanese' },
  { emoji: '🍔', name: 'Burgers' },
  { emoji: '🌮', name: 'Mexican' },
  { emoji: '🍜', name: 'Thai' },
  { emoji: '🥗', name: 'Healthy' },
  { emoji: '🍦', name: 'Desserts' },
];

const testimonials = [
  {
    quote: "The quality of restaurants on QuickBite is unmatched. It's my go-to for planning high-end weekend dinners at home.",
    name: "Julian S.",
    role: "Tech Entrepreneur",
    initials: "JS"
  },
  {
    quote: "Insanely fast delivery and the app interface is beautiful. Finally a food app that matches my aesthetic standards.",
    name: "Aria M.",
    role: "Creative Director",
    initials: "AM"
  },
  {
    quote: "Customer service is actually helpful. Had a small issue once and it was resolved in minutes. Highly recommend!",
    name: "David B.",
    role: "Restaurant Critic",
    initials: "DB"
  }
];

export default function Homepage() {
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);

  // New state for dynamic restaurants
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll Tracking State
  const [activeSection, setActiveSection] = useState('explore');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Refs for scroll navigation & tracking
  const heroRef = useRef(null);
  const offersRef = useRef(null);
  const restaurantsRef = useRef(null);
  const appRef = useRef(null);
  const navRefs = useRef({}); // To store nav link elements for slider calculation

  // State for copy code button
  const [isCopied, setIsCopied] = useState(false);

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // replace non-digits
    if (val.length <= 6) {
      setDeliveryAddress(val);
      setAvailabilityStatus(null);
      setAvailabilityMessage('');
    }
  };

  const handleCheckAvailability = async () => {
    if (deliveryAddress.length !== 6) {
      setAvailabilityStatus('not_available');
      setAvailabilityMessage('Please enter a valid 6-digit pincode');
      return;
    }

    setCheckingPincode(true);
    setAvailabilityStatus(null);
    try {
      const res = await pincodeService.checkAvailability(deliveryAddress);
      if (res.available) {
        setAvailabilityStatus('available');
        setAvailabilityMessage(`We are available in your area`);
      } else {
        setAvailabilityStatus('not_available');
        setAvailabilityMessage('Not available in your area');
      }
    } catch (err) {
      console.error(err);
      setAvailabilityStatus('not_available');
      setAvailabilityMessage('Error checking availability');
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  // Smooth scroll to section
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Setup Intersection Observer for scroll tracking
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Triggers when section is halfway in viewport
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (heroRef.current) observer.observe(heroRef.current);
    if (restaurantsRef.current) observer.observe(restaurantsRef.current);
    if (offersRef.current) observer.observe(offersRef.current);
    if (appRef.current) observer.observe(appRef.current);

    return () => observer.disconnect();
  }, []);

  // Update sliding indicator position
  useEffect(() => {
    const activeElement = navRefs.current[activeSection];
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
        opacity: 1
      });
    }
  }, [activeSection]);

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText('QUICKSTART50');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Fetch restaurants from backend on mount
  useEffect(() => {
    let mounted = true;
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await restaurantService.getRestaurants
          ? await restaurantService.getRestaurants({ limit: 8, page: 1 })
          : null;

        if (mounted) {
          if (response) {
            const data =
              response.success && response.data
                ? response.data
                : response.data
                  ? response.data
                  : Array.isArray(response)
                    ? response
                    : null;

            if (data && Array.isArray(data)) {
              setRestaurants(data);
            } else {
              setRestaurants([]);
              setError('Unexpected response shape from API.');
            }
          } else {
            setRestaurants([]);
            setError('restaurantService.getRestaurants not available.');
          }
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        if (mounted) {
          setError('Failed to load restaurants.');
          setRestaurants([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRestaurants();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: bgMain,
      color: textOnMain,
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .ignite-gradient {
          background: linear-gradient(135deg, ${borderOrange} 0%, ${accentAmber} 100%);
        }

        .ignite-text {
          background: linear-gradient(135deg, ${borderOrange} 0%, ${accentAmber} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Top Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 50,
        backgroundColor: 'rgba(255, 243, 232, 0.85)', // translucent peach
        backdropFilter: 'blur(20px)',
        boxShadow: `0 4px 30px rgba(0, 0, 0, 0.05)`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 48px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            <img
              src="/quickbite_logo.svg"
              alt="QuickBite Logo"
              style={{ width: '35px', height: '35px', objectFit: 'contain' }}
            />
            <span>
              <span className="ignite-text">Quick</span>
              <span style={{ color: textOnMain }}>Bite</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div style={{ display: 'none', gap: '32px', alignItems: 'center', position: 'relative' }} className="desktop-nav">
            {/* Sliding Underline Indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: '-4px',
                height: '2px',
                backgroundColor: accentAmber,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.opacity,
              }}
            />

            {[
              { id: 'explore', label: 'Explore', ref: heroRef },
              { id: 'restaurants', label: 'Restaurants', ref: restaurantsRef },
              { id: 'offers', label: 'Offers', ref: offersRef },
              { id: 'app', label: 'App', ref: appRef }
            ].map((item) => (
              <a
                key={item.id}
                ref={(el) => (navRefs.current[item.id] = el)}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.ref);
                }}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: activeSection === item.id ? accentAmber : textMutedOnMain,
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                  cursor: 'pointer',
                  paddingBottom: '4px'
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={handleLoginClick}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: textOnMain,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              Login
            </button>
            <button
              onClick={handleSignupClick}
              className="ignite-gradient"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 'bold',
                padding: '10px 24px',
                borderRadius: '9999px',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: `0 4px 15px ${glowOrange}`
              }}
            >
              Sign Up
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                color: textOnMain,
                display: 'none'
              }}
              className="mobile-menu-btn"
            >
              {isMobileNavOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {isMobileNavOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1001,
            background: 'rgba(0,0,0,0.6)',
          }}
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '260px',
              height: '100%',
              background: bgMain,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontWeight: 700, fontSize: '18px', color: textOnMain }}>Menu</span>
              <button onClick={() => setIsMobileNavOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textOnMain }}>✕</button>
            </div>
            {[
              { id: 'explore', label: 'Explore', ref: heroRef },
              { id: 'restaurants', label: 'Restaurants', ref: restaurantsRef },
              { id: 'offers', label: 'Offers', ref: offersRef },
              { id: 'app', label: 'App', ref: appRef }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setIsMobileNavOpen(false); scrollToSection(item.ref); }}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '12px 8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: activeSection === item.id ? accentAmber : textOnMain,
                  cursor: 'pointer',
                  borderRadius: '8px',
                  width: '100%',
                }}
              >
                {item.label}
              </button>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: `1px solid ${outlineLight}` }}>
              <button
                onClick={() => { setIsMobileNavOpen(false); handleLoginClick(); }}
                className="ignite-gradient"
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ paddingTop: '96px', overflowX: 'hidden' }}>
        {/* Hero Section */}
        <section id="explore" ref={heroRef} style={{
          position: 'relative',
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          padding: '48px',
          maxWidth: '1400px',
          margin: '0 auto',
          background: `radial-gradient(circle at center, ${glowOrangeHover} 0%, transparent 70%)`
        }}>
          <div style={{ zIndex: 10, maxWidth: '600px' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 16px',
              borderRadius: '9999px',
              backgroundColor: bgCard,
              color: accentAmber,
              fontSize: '12px',
              fontWeight: 'bold',
              letterSpacing: '0.2em',
              marginBottom: '24px',
              border: `1px solid ${borderOrange}`,
              textTransform: 'uppercase'
            }}>
              Premium Food Delivery
            </span>

            <h1 style={{
              fontSize: '60px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              lineHeight: 0.9,
              marginBottom: '32px',
              color: textOnMain
            }}>
              Cravings <br />
              <span className="ignite-text">Delivered Fast</span>
            </h1>

            <p style={{
              color: textMutedOnMain,
              fontSize: '18px',
              maxWidth: '500px',
              marginBottom: '48px',
              lineHeight: 1.6
            }}>
              Experience the pinnacle of culinary convenience. Midnight munchies or executive lunch—the city's finest flavors are a tap away.
            </p>

            <div style={{
              position: 'relative',
              maxWidth: '600px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                padding: '8px',
                borderRadius: '9999px',
                border: `1px solid ${outlineLight}`,
                boxShadow: `0 10px 40px ${glowOrange}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 24px' }}>
                  <span className="material-symbols-outlined" style={{ color: borderOrange, marginRight: '12px' }}>
                    location_on
                  </span>
                  <input
                    value={deliveryAddress}
                    onChange={handlePincodeChange}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: textOnMain,
                      width: '100%',
                      fontSize: '16px'
                    }}
                    placeholder="Enter your Pincode"
                    type="text"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleCheckAvailability}
                  disabled={checkingPincode}
                  className="ignite-gradient"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 'bold',
                    padding: '16px 40px',
                    borderRadius: '9999px',
                    border: 'none',
                    color: '#fff',
                    cursor: checkingPincode ? 'not-allowed' : 'pointer',
                    opacity: checkingPincode ? 0.7 : 1,
                    transition: 'all 0.2s',
                    boxShadow: `0 4px 15px ${glowOrangeHover}`
                  }}
                >
                  {checkingPincode ? 'Checking...' : 'Check Availability'}
                </button>
              </div>
            </div>
            {availabilityStatus && (
              <div style={{
                marginTop: '16px',
                padding: '12px 24px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: availabilityStatus === 'available' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(232, 93, 4, 0.15)',
                color: availabilityStatus === 'available' ? '#2e7d32' : borderOrange,
                fontWeight: 'bold',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                border: `1px solid ${availabilityStatus === 'available' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(232, 93, 4, 0.3)'}`,
                boxShadow: `0 4px 12px ${availabilityStatus === 'available' ? 'rgba(76, 175, 80, 0.1)' : glowOrange}`
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {availabilityStatus === 'available' ? 'check_circle' : 'error'}
                </span>
                {availabilityMessage}
              </div>
            )}
          </div>

          <div style={{
            position: 'absolute',
            right: '-80px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '500px',
            height: '500px',
            display: 'none'
          }} className="hero-image">
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, ${borderOrange} 0%, ${accentAmber} 100%)`,
                borderRadius: '50%',
                filter: 'blur(120px)',
                opacity: 0.25
              }}></div>
              <img
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: `8px solid ${bgCard}`,
                  boxShadow: `0 20px 60px rgba(0, 0, 0, 0.2)`
                }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6YsOLPBQKQ64mNG6Y001vIAsRGm84ZQVr0ImoGa3B7askZTTzv7G0R4b6nfH5JTHfEDODCyyjd_2ZBRwWBit2D9WUQiCTsBglCoxHSJ6Kbl5xYlcjeB_JVXFqjpBg67T8iDiJyMK8xR15mc8SpMEKhlxJY0G81Gkzoj8ubcGU5szilLNhPb9Nm-M4kShaOoqKs0gqJHgeRkMCFUoAKbYKOCzs4HkBpxvtyObK6cXuhk5N_zPBrM_uoQnTI6QsdHrS70kEGv0kqjAi"
                alt="Gourmet food"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ padding: '48px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px'
          }}>
            {[
              { value: '500+', label: 'Restaurants' },
              { value: '20k+', label: 'Daily Orders' },
              { value: '15m', label: 'Avg. Delivery' },
              { value: '4.9', label: 'User Rating' }
            ].map((stat, idx) => (
              <div key={idx} style={{
                backgroundColor: bgCard,
                border: `1px solid ${borderOrange}`,
                borderTop: `3px solid ${accentAmber}`,
                padding: '32px',
                borderRadius: '24px',
                textAlign: 'center',
                transition: 'transform 0.3s',
                boxShadow: `0 10px 30px ${glowOrange}`
              }}>
                <div style={{
                  fontSize: '36px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  color: accentAmber,
                  marginBottom: '8px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  color: textOnCardReview,
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cuisines Horizontal Scroll */}
        <section style={{ padding: '48px 0', overflow: 'hidden' }}>
          <div style={{ padding: '0 48px', maxWidth: '1400px', margin: '0 auto 32px' }}>
            <h2 style={{
              fontSize: '30px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 'bold',
              color: textOnMain
            }}>
              Cuisines for <span style={{ color: borderOrange }}>Every Mood</span>
            </h2>
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            padding: '0 48px 16px',
            overflowX: 'auto',
            maxWidth: '1400px',
            margin: '0 auto'
          }} className="no-scrollbar">
            {cuisines.map((cuisine, idx) => (
              <div key={idx} style={{
                flexShrink: 0,
                backgroundColor: bgCard,
                padding: '16px 32px',
                borderRadius: '9999px',
                border: `1px solid ${borderOrange}`,
                borderTop: `3px solid ${accentAmber}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: `0 4px 15px ${glowOrange}`
              }}>
                <span style={{ fontSize: '24px' }}>{cuisine.emoji}</span>
                <span style={{ fontWeight: 600, color: textOnCardName }}>{cuisine.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Section (Staff Picks) - Dynamic Restaurants */}
        <section id="restaurants" ref={restaurantsRef} style={{
          padding: '96px 48px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            <h2 style={{
              fontSize: '36px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 'bold',
              marginBottom: '16px',
              color: textOnMain
            }}>
              Restaurants
            </h2>
            <p style={{ color: textMutedOnMain }}>
              Hand-picked selections from the local culinary masters.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              gap: '16px',
              flexDirection: 'column'
            }}>
              <CircularProgress style={{ color: borderOrange }} />
              <p style={{ color: textMutedOnMain, fontSize: '18px' }}>Loading restaurants...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: 'rgba(232, 93, 4, 0.1)',
              borderRadius: '16px',
              marginBottom: '32px'
            }}>
              <p style={{ color: borderOrange, fontSize: '16px', marginBottom: '16px' }}>{error}</p>
            </div>
          )}

          {/* Restaurant Cards Grid */}
          {!loading && restaurants.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              {restaurants.map((restaurant, idx) => {
                const id = restaurant._id || restaurant.id || idx;
                const name = restaurant.name || 'Restaurant';
                const image = restaurant.image || 'https://via.placeholder.com/400x300?text=Restaurant';
                const cuisines = Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : (restaurant.cuisine || 'Multi-Cuisine');
                const rating = restaurant.rating || 4.5;
                const deliveryTime = restaurant.deliveryTime || '30-45 min';
                const minOrder = restaurant.minOrder;

                return (
                  <div
                    key={id}
                    onClick={() => navigate(`/menu/${id}`)}
                    style={{
                      position: 'relative',
                      backgroundColor: bgCard,
                      borderRadius: '32px',
                      border: `1px solid ${borderOrange}`,
                      borderTop: `3px solid ${accentAmber}`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      boxShadow: `0 10px 30px ${glowOrange}`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = `0 20px 40px ${glowOrangeHover}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 10px 30px ${glowOrange}`;
                    }}
                  >
                    <div style={{ height: '256px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to top, ${bgCard}, transparent 70%)`,
                        zIndex: 1
                      }}></div>
                      <img
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.7s ease'
                        }}
                        src={image}
                        alt={name}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Restaurant'; }}
                      />
                    </div>
                    <div style={{ padding: '32px', position: 'relative', zIndex: 2 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            marginBottom: '4px',
                            color: textOnCardName
                          }}>
                            {name}
                          </h3>
                          <p style={{ color: textOnCardReview, fontSize: '14px' }}>{cuisines}</p>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '14px',
                          color: textOnCardName
                        }}>
                          <StarIcon style={{ color: accentAmber, fontSize: '18px' }} />
                          <span style={{ fontWeight: 'bold' }}>{rating}</span>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        fontSize: '14px',
                        color: textOnCardReview
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: borderOrange }}>schedule</span>
                          {deliveryTime}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: borderOrange }}>restaurant</span>
                          {minOrder}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Restaurants Found */}
          {!loading && !error && restaurants.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 40px'
            }}>
              <p style={{
                color: textMutedOnMain,
                fontSize: '18px'
              }}>
                No restaurants found. Please add restaurants to your database.
              </p>
            </div>
          )}
        </section>

        {/* How It Works */}
        <section style={{ padding: '128px 48px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '96px' }}>
            <h2 style={{
              fontSize: '48px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              marginBottom: '24px',
              color: textOnMain
            }}>
              Your Journey to <span className="ignite-text">Great Taste</span>
            </h2>
            <p style={{ color: textMutedOnMain, fontSize: '18px' }}>
              Simplified for the modern connoisseur.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '48px'
          }}>
            {[
              { icon: 'search', title: 'Select Cravings', desc: 'Browse through thousands of local menus and discover hidden culinary gems in your city.' },
              { icon: 'shopping_bag', title: 'Instant Order', desc: 'Customize your dish to perfection and pay securely with your preferred digital wallet.' },
              { icon: 'moped', title: 'Doorstep Bliss', desc: 'Track your delivery in real-time as our logistics network brings your meal fresh to your door.' }
            ].map((step, idx) => (
              <div key={idx} style={{
                backgroundColor: bgCard,
                padding: '48px',
                borderRadius: '40px',
                border: `1px solid ${borderOrange}`,
                borderTop: `3px solid ${accentAmber}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s',
                boxShadow: `0 10px 30px ${glowOrange}`
              }}>
                <div className="ignite-gradient" style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 32px',
                  boxShadow: `0 10px 20px ${glowOrange}`
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#fff' }}>
                    {step.icon}
                  </span>
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginBottom: '16px',
                  color: textOnCardName
                }}>
                  {step.title}
                </h3>
                <p style={{ color: textOnCardReview, lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Premium Offer */}
        <section id="offers" ref={offersRef} style={{ padding: '48px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            position: 'relative',
            background: `linear-gradient(to right, ${borderOrange}, ${accentAmber})`,
            borderRadius: '48px',
            padding: '64px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '48px',
            flexWrap: 'wrap',
            boxShadow: `0 20px 40px ${glowOrangeHover}`
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              mixBlendMode: 'overlay',
              pointerEvents: 'none',
              backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)',
              backgroundSize: '24px 24px'
            }}></div>
            <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px', color: '#fff' }}>
              <h2 style={{
                fontSize: '48px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                marginBottom: '24px',
                lineHeight: 1.2
              }}>
                Join the Elite <br />Get 50% Off First Order
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                marginBottom: '32px'
              }}>
                Elevate your dining experience today. Limited time invitation for new QuickBite members.
              </p>
              <div
                onClick={handleCopyCode}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '9999px',
                  padding: '8px',
                  paddingRight: '32px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  backgroundColor: bgCard,
                  color: accentAmber,
                  fontWeight: 'bold',
                  padding: '12px 32px',
                  borderRadius: '9999px',
                  letterSpacing: '0.1em',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  marginRight: '24px'
                }}>
                  QUICKSTART50
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: bgCard, fontWeight: 'bold', fontSize: '14px' }}>
                    {isCopied ? 'Copied!' : 'Copy Code'}
                  </span>
                  {isCopied && (
                    <span style={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold' }}>✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ padding: '128px 48px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px'
          }}>
            {testimonials.map((testimonial, idx) => (
              <div key={idx} style={{
                backgroundColor: bgCard,
                padding: '48px',
                borderRadius: '40px',
                border: `1px solid ${borderOrange}`,
                borderTop: `3px solid ${accentAmber}`,
                position: 'relative',
                boxShadow: `0 10px 30px ${glowOrange}`
              }}>
                <span className="material-symbols-outlined" style={{
                  color: borderOrange,
                  fontSize: '64px',
                  position: 'absolute',
                  top: '-20px',
                  left: '-16px',
                  opacity: 0.9
                }}>
                  format_quote
                </span>
                <p style={{
                  fontSize: '18px',
                  fontStyle: 'italic',
                  marginBottom: '40px',
                  lineHeight: 1.6,
                  color: textOnCardReview
                }}>
                  "{testimonial.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: avatarColors[idx % avatarColors.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    color: '#fff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontFamily: "'Plus Jakarta Sans', sans-serif", color: textOnCardName }}>
                      {testimonial.name}
                    </div>
                    <div style={{ color: textOnCardRole, fontSize: '14px', opacity: 0.9 }}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* App Section */}
        <section id="app" ref={appRef} style={{
          padding: '96px 48px',
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '96px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, textAlign: 'center', minWidth: '300px' }}>
            <h2 style={{
              fontSize: '48px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              marginBottom: '32px',
              color: textOnMain
            }}>
              Cuisine in your <span className="ignite-text">Pocket</span>
            </h2>
            <p style={{
              color: textMutedOnMain,
              fontSize: '18px',
              marginBottom: '48px',
              lineHeight: 1.6
            }}>
              Download the QuickBite app for exclusive mobile-only deals, live tracking, and curated dining lists based on your taste profile.
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button style={{
                backgroundColor: bgCard,
                border: `1px solid ${borderOrange}`,
                padding: '16px 32px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'border-color 0.3s',
                boxShadow: `0 4px 15px ${glowOrange}`
              }}>
                <img
                  src="/appstore.svg"
                  alt="App Store"
                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: textOnCardReview
                  }}>
                    Download on the
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1, color: textOnCardName }}>
                    App Store
                  </div>
                </div>
              </button>
              <button style={{
                backgroundColor: bgCard,
                border: `1px solid ${borderOrange}`,
                padding: '16px 32px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'border-color 0.3s',
                boxShadow: `0 4px 15px ${glowOrange}`
              }}>
                <img
                  src="/playstore.svg"
                  alt="Google Play"
                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: textOnCardReview
                  }}>
                    Get it on
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1, color: textOnCardName }}>
                    Google Play
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: '300px' }}>
            <div style={{
              width: '300px',
              height: '600px',
              backgroundColor: bgCard,
              borderRadius: '48px',
              border: `8px solid ${bgMain}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                width: '100%',
                height: '32px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end'
              }}>
                <div style={{
                  width: '96px',
                  height: '20px',
                  backgroundColor: bgMain,
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px'
                }}></div>
              </div>
              <div style={{ padding: '48px 16px 16px' }}>
                <div style={{
                  height: '128px',
                  borderRadius: '16px',
                  background: `linear-gradient(to bottom right, ${borderOrange}, ${accentAmber})`,
                  padding: '16px',
                  marginBottom: '24px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Special Deal
                  </div>
                  <div style={{
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    lineHeight: 1.2
                  }}>
                    30% OFF <br />Your Lunch
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        width: '100%',
        background: bgCard,
        borderTop: `3px solid ${accentAmber}`,
        color: textOnCardName,
        textAlign: 'center',
        padding: '80px 48px 32px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '48px',
          maxWidth: '1200px',
          margin: '0 auto 80px',
          textAlign: 'left'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '24px',
              fontWeight: 900,
              letterSpacing: '1px',
              marginBottom: '16px',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              <img
                src="/quickbite_logo.svg"
                alt="QuickBite Logo"
                style={{ width: '35px', height: '35px', objectFit: 'contain' }}
              />
              <span>
                <span className="ignite-text">Quick</span>
                <span style={{ color: textOnCardName }}>Bite</span>
              </span>
            </div>
            <p style={{
              color: textOnCardReview,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}>
              The premier platform for high-end culinary delivery. Trusted by top-tier chefs and foodies globally.
            </p>
          </div>

          <div>
            <h4 style={{
              color: textOnCardName,
              fontWeight: 'bold',
              marginBottom: '32px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontSize: '12px'
            }}>
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['About', 'Careers', 'Press', 'Investors'].map((item) => (
                <a key={item} href="#" style={{
                  color: textOnCardReview,
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = accentAmber}
                  onMouseLeave={(e) => e.currentTarget.style.color = textOnCardReview}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{
              color: textOnCardName,
              fontWeight: 'bold',
              marginBottom: '32px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontSize: '12px'
            }}>
              Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['Help Center', 'Safety', 'Privacy', 'Terms'].map((item) => (
                <a key={item} href="#" style={{
                  color: textOnCardReview,
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = accentAmber}
                  onMouseLeave={(e) => e.currentTarget.style.color = textOnCardReview}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '32px',
          borderTop: `1px solid rgba(255,255,255,0.05)`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{
            color: textOnCardReview,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
            opacity: 0.7
          }}>
            © 2026 QuickBite. Crafted for excellence.
          </p>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="#" style={{
              color: textOnCardReview,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'color 0.2s',
              opacity: 0.7
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = accentAmber; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = textOnCardReview; }}
            >
              Privacy Policy
            </a>
            <a href="#" style={{
              color: textOnCardReview,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'color 0.2s',
              opacity: 0.7
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = accentAmber; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = textOnCardReview; }}
            >
              Cookies
            </a>
          </div>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .hero-image {
            display: block !important;
          }
        }

        @media (max-width: 767px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }

        @media (max-width: 640px) {
          h1 {
            fontSize: 40px !important;
          }
          section {
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}