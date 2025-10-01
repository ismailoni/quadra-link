'use client';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Register() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [institutionShortcode, setInstitutionShortcode] = useState('');
  const [institutions, setInstitutions] = useState<{ name: string; shortcode: string; placeholder: string; emailPattern: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await axios.get(`${API_BASE}/institutions`);
        setInstitutions(res.data);
      } catch (err) {
        toast.error('Failed to load institutions');
      }
    };
    fetchInstitutions();
  }, []);

  const selectedInstitution = institutions.find(inst => inst.shortcode === institutionShortcode);
  const emailPlaceholder = selectedInstitution ? selectedInstitution.placeholder : 'Email';

  // compute email validity live for inline validation
  const emailRegex = selectedInstitution ? new RegExp(selectedInstitution.emailPattern) : null;
  const isEmailEntered = email.trim().length > 0;
  const isEmailValid = !emailRegex ? true : (isEmailEntered ? emailRegex.test(email) : true);

  // lightweight password strength
  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0..4
  }, [password]);

  const passwordStrengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordScore];
  const passwordStrengthColor = ['bg-red-400','bg-red-300','bg-yellow-300','bg-blue-300','bg-blue-600'][passwordScore];

  const isFormValid = firstname.trim() && lastname.trim() && email.trim() && password.length >= 6 && isEmailValid && institutionShortcode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    if (selectedInstitution && !isEmailValid) {
      toast.error('Email does not match the institution format');
      return;
    }

    if (!isFormValid) {
      toast.error('Please complete the form correctly');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        firstname,
        lastname,
        email,
        password,
        institutionShortcode,
        role: 'student'
      });
      const message = res?.data?.message ?? 'Registered! Please login.';
      toast.success(message);
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <Card className="w-full max-w-md border border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-700">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="signup-help">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">First name</label>
              <Input
                placeholder="First Name"
                value={firstname}
                onChange={e => setFirstname(e.target.value)}
                required
                className="focus:ring-2 focus:ring-blue-200"
                disabled={loading}
                aria-invalid={!firstname && undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Last name</label>
              <Input
                placeholder="Last Name"
                value={lastname}
                onChange={e => setLastname(e.target.value)}
                required
                className="focus:ring-2 focus:ring-blue-200"
                disabled={loading}
              />
            </div>

            {/* Combobox using shadcn Popover + Command */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Institution</label>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      placeholder="Search or select institution"
                      value={selectedInstitution ? selectedInstitution.name : ''}
                      readOnly
                      className="cursor-pointer focus:ring-2 focus:ring-blue-200"
                      aria-label="Select institution"
                      disabled={loading}
                    />
                    {selectedInstitution && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setInstitutionShortcode(''); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 text-sm"
                        aria-label="Clear institution"
                        disabled={loading}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-full max-w-md p-0">
                  <Command>
                    <CommandInput placeholder="Search institutions..." />
                    <CommandList>
                      <CommandEmpty>No institutions found.</CommandEmpty>
                      {institutions.map(inst => {
                        const selected = inst.shortcode === institutionShortcode;
                        return (
                          <CommandItem
                            key={inst.shortcode}
                            value={inst.shortcode}
                            onSelect={(value) => {
                              setInstitutionShortcode(value);
                            }}
                            className={`cursor-pointer ${selected ? 'bg-blue-50' : 'hover:bg-blue-50'} px-3 py-2`}
                          >
                            <div className="flex w-full justify-between items-center">
                              <span className={selected ? 'font-medium text-blue-700' : 'text-foreground'}>{inst.name}</span>
                              <span className="text-xs text-muted-foreground">{inst.shortcode}</span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
              <Input
                placeholder={emailPlaceholder}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={`focus:ring-2 ${isEmailValid ? 'focus:ring-blue-200' : 'border-red-500 focus:ring-red-200'}`}
                aria-invalid={!isEmailValid}
                disabled={loading}
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm text-blue-600">{selectedInstitution ? `Example: ${selectedInstitution.placeholder}` : 'Enter your institutional email'}</p>
                {selectedInstitution && <p className="text-xs text-muted-foreground">Pattern: <span className="font-mono ml-1">{selectedInstitution.emailPattern}</span></p>}
              </div>
              {!isEmailValid && isEmailEntered && (
                <p className="text-sm text-red-600 mt-1">Email does not match the selected institution's format.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
              <div className="relative">
                <Input
                  placeholder="Password (min 6 chars)"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-blue-200 pr-12"
                  disabled={loading}
                  aria-describedby="pwd-strength"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div id="pwd-strength" className="mt-2">
                <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                  <div className={`h-2 ${passwordStrengthColor} rounded`} style={{ width: `${(passwordScore/4)*100}%` }} />
                </div>
                <p className="text-xs mt-1">{password ? `Strength: ${passwordStrengthLabel}` : 'Password strength will appear here'}</p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={!isFormValid || loading}
              aria-busy={loading}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              <span>{loading ? 'Registering...' : 'Register'}</span>
            </Button>

            <p id="signup-help" className="text-center text-xs text-muted-foreground mt-2">
              By registering you agree to QuadraLink's terms. Use your institutional email to verify membership.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
