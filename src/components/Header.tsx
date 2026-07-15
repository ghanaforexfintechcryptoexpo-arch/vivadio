import React, { useState, useRef, useEffect } from "react";
import { Search, ShoppingBag, User, ChevronDown, Check, Beaker, Shield, Calendar, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Product } from "../types";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { CurrencyType, formatPrice } from "../utils";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, productId?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser?: any;
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
  products: Product[];
}

export default function Header({ 
  currentView, 
  onNavigate, 
  cartCount, 
  onOpenCart, 
  currentUser,
  currency,
  onCurrencyChange,
  products
}: HeaderProps) {
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const isLoggedIn = !!currentUser;
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Close search suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update suggestions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestedProducts([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = products.filter((p) => {
      return (
        p.name.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query) ||
        p.goal.toLowerCase().includes(query) ||
        p.shortHook.toLowerCase().includes(query) ||
        p.benefits.some((b) => b.toLowerCase().includes(query)) ||
        p.activeIngredients.some((i) => i.name.toLowerCase().includes(query))
      );
    });
    setSuggestedProducts(filtered);
  }, [searchQuery]);

  const handleSearchSelect = (productId: string) => {
    onNavigate("pdp", productId);
    setSearchQuery("");
    setSearchFocused(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      setLoginSuccess(true);
      setTimeout(() => {
        setAccountModalOpen(false);
        setLoginSuccess(false);
      }, 1500);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setAccountModalOpen(false);
    } catch (err) {
      console.error("Google Sign-In Error: ", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAccountModalOpen(false);
    } catch (err) {
      console.error("Logout Error: ", err);
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div 
        id="announcement-bar"
        className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-sans tracking-wide border-b border-slate-800 flex justify-center items-center gap-6"
      >
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Free shipping on orders over $50
        </span>
        <span className="hidden sm:inline-block text-slate-400">|</span>
        <span className="flex items-center gap-1.5">
          <Beaker className="w-3.5 h-3.5 text-emerald-400" />
          100% Certified Natural Ingredients
        </span>
      </div>

      {/* Main Header Header container */}
      <header id="global-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* BRAND LOGO */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("homepage")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-sans font-extrabold text-slate-950 tracking-tight block leading-tight">
                  ProViva
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 block leading-none">
                  CLINICAL BOTANICALS
                </span>
              </div>
            </div>

            {/* PRIMARY NAVIGATION (Center) */}
            <nav id="primary-nav" className="hidden md:flex items-center space-x-8">
              
              {/* SHOP ALL DROPDOWN */}
              <div 
                className="relative"
                onMouseEnter={() => setShopDropdownOpen(true)}
                onMouseLeave={() => setShopDropdownOpen(false)}
              >
                <button 
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                    currentView === "pdp" || shopDropdownOpen ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Shop Formulas
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${shopDropdownOpen ? "rotate-180 text-emerald-600" : ""}`} />
                </button>

                <AnimatePresence>
                  {shopDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-3"
                    >
                      <div className="px-4 pb-2 mb-2 border-b border-slate-100">
                        <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">Categorized by Health Goal</span>
                      </div>
                      <div className="space-y-1">
                        {products.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              onNavigate("pdp", prod.id);
                              setShopDropdownOpen(false);
                            }}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                                {prod.name}
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono font-normal">
                                  {prod.goal}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-sans">{prod.tagline}</p>
                            </div>
                            <span className="text-emerald-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              &rarr;
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* OTHER PAGES */}
              <button 
                onClick={() => onNavigate("homepage")}
                className={`text-sm font-medium transition-colors ${currentView === "homepage" ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Our Science
              </button>
              
              <button 
                onClick={() => onNavigate("about")}
                className={`text-sm font-medium transition-colors ${currentView === "about" ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"}`}
              >
                About Us
              </button>

              <button 
                onClick={() => onNavigate("contact")}
                className={`text-sm font-medium transition-colors ${currentView === "contact" ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Contact Us
              </button>

              <button 
                onClick={() => onNavigate("faq")}
                className={`text-sm font-medium transition-colors ${currentView === "faq" ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Support / FAQ
              </button>

              <button 
                onClick={() => onNavigate("slides")}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${currentView === "slides" ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Clinical Slides
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  New
                </span>
              </button>

              <button 
                onClick={() => onNavigate("admin")}
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${currentView === "admin" ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Admin Panel
                {currentUser?.email === "ghanaforexfintechcryptoexpo@gmail.com" ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Admin
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
                    Guest
                  </span>
                )}
              </button>
            </nav>

            {/* UTILITY NAVIGATION (Right) */}
            <div className="flex items-center space-x-4">
              
              {/* SEARCH BAR (PREDICTIVE AUTO-SUGGEST) */}
              <div ref={searchRef} className="relative hidden lg:block w-72">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search health goals, herbs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all duration-200"
                  />
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {searchFocused && searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 py-3"
                    >
                      <div className="px-4 pb-2 mb-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">Predictive Results</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono">
                          {suggestedProducts.length} Match{suggestedProducts.length !== 1 ? "es" : ""}
                        </span>
                      </div>
                      
                      {suggestedProducts.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto space-y-1">
                          {suggestedProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleSearchSelect(p.id)}
                              className="px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex-1 min-w-0 pr-4">
                                <span className="text-sm font-semibold text-slate-900 block truncate">
                                  {p.name}
                                </span>
                                <span className="text-xs text-slate-500 block truncate">
                                  {p.tagline}
                                </span>
                              </div>
                              <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex-shrink-0">
                                {formatPrice(p.basePrice, currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-slate-500 font-sans">No matching formulations found.</p>
                          <p className="text-xs text-slate-400 mt-1">Try searching "Immune", "CoQ10", "Liver", or "Senna"</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ACCOUNT LOGIN TRIGGER */}
              <button 
                onClick={() => setAccountModalOpen(true)}
                className="p-1.5 text-slate-600 hover:text-slate-950 transition-colors focus:outline-none relative group flex items-center justify-center"
                title="Account"
              >
                {isLoggedIn && currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="User Avatar" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full border border-emerald-500" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                {isLoggedIn && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* SHOPPING CART DRAWER TRIGGER */}
              <button 
                onClick={onOpenCart}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-full transition-colors focus:outline-none relative flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-200"
                title="Cart"
              >
                <ShoppingBag className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-mono font-bold text-slate-900">{cartCount}</span>
              </button>

              {/* CURRENCY TOGGLE PILL */}
              <div className="flex bg-slate-100 p-0.5 rounded-full border border-slate-200 shadow-3xs flex-shrink-0">
                <button
                  onClick={() => onCurrencyChange("USD")}
                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer ${
                    currency === "USD"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Switch to USD"
                >
                  $ USD
                </button>
                <button
                  onClick={() => onCurrencyChange("GHS")}
                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer ${
                    currency === "GHS"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Switch to Ghana Cedis"
                >
                  ₵ GHS
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE HEADER UTILITY RAIL (Allows search & shop on mobile tabs) */}
      <div className="lg:hidden bg-slate-50 border-b border-slate-200 py-2.5 px-4 flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search symptoms or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className="w-full bg-white text-xs text-slate-900 pl-8 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
          />
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
        <button 
          onClick={() => onNavigate("slides")}
          className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600"
        >
          Slides
        </button>
        <button 
          onClick={() => onNavigate("faq")}
          className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600"
        >
          FAQ
        </button>
      </div>

      {/* PREDICTIVE SEARCH SUGGESTIONS PORTAL FOR MOBILE */}
      <AnimatePresence>
        {searchFocused && searchQuery.trim() && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm pt-20 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">Search Results</span>
                <button onClick={() => setSearchFocused(false)} className="text-slate-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto space-y-1">
                {suggestedProducts.length > 0 ? (
                  suggestedProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSearchSelect(p.id)}
                      className="px-3 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between border-b border-slate-50"
                    >
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-xs text-slate-500 block truncate max-w-[250px]">{p.tagline}</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-emerald-600">${p.basePrice}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-6 text-center">No matching formulations found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ACCOUNT MODAL SIMULATION */}
      <AnimatePresence>
        {accountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAccountModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 border border-slate-100"
            >
              <button 
                onClick={() => setAccountModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {isLoggedIn ? (
                <div className="text-center py-6">
                  {currentUser?.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="User Profile" 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full mx-auto border-2 border-emerald-500 mb-4 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">Welcome back, Health Pioneer!</h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{currentUser?.displayName || currentUser?.email || "clinical.user@proviva.com"}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{currentUser?.email}</p>
                  
                  <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-left border border-slate-100 space-y-3">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">Your Scientific Wellness Profile</span>
                    <div className="flex justify-between text-xs font-sans text-slate-600">
                      <span>Verification Status:</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Approved
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-sans text-slate-600">
                      <span>Next Suggested Renewal:</span>
                      <span className="text-slate-900 font-medium">Aug 15, 2026</span>
                    </div>
                    <div className="flex justify-between text-xs font-sans text-slate-600">
                      <span>Affiliated Practitioner:</span>
                      <span className="text-slate-900 font-medium">Dr. E. Vance, MD</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white font-sans text-sm font-semibold py-3 px-4 rounded-xl transition-colors"
                  >
                    Logout Account
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-6">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 uppercase">Secure Portal</span>
                    <h3 className="text-2xl font-sans font-extrabold text-slate-900 mt-1">Practitioner & Patient Login</h3>
                    <p className="text-xs text-slate-500 mt-1">Access clinical dosage metrics, lab test results, and order logs.</p>
                  </div>

                  {loginSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-emerald-800 font-sans text-sm font-medium my-4 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Secure authentication approved. Entering panel...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Real Google Auth Action */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-sans text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-all duration-200"
                      >
                        <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        Sign In with Google
                      </button>

                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-3 text-slate-400 font-mono text-[9px] uppercase tracking-wider">Or simulation bypass</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="physician@proviva.com"
                            className="w-full border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider mb-1">Access PIN / Password</label>
                          <input
                            type="password"
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" defaultChecked />
                            Remember secure device
                          </label>
                          <a href="#" className="hover:text-emerald-600 transition-colors">Forgot credentials?</a>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-sans text-sm font-semibold py-3 px-4 rounded-xl transition-all"
                        >
                          Authorize Sandbox Sign In
                        </button>
                      </form>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
                    Need a professional practitioner account? <a href="#" className="text-emerald-600 hover:underline font-semibold">Apply here</a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
