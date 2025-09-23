"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import schools from "@/data/schools.json";

const baseSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  Firstname: z.string().min(2, "First name is required"),
  Lastname: z.string().min(2, "Surname is required"),
  Pseudoname: z.string().min(2, "Pseudoname is required"),
  school: z.string().min(1, "School is required"),
  email: z.string().min(1, "Email is required"), // refined later
});

export default function SignupPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(schools[0]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) window.location.href = "/feed";
  }, [user]);

  const schema = baseSchema.refine(
    (data) => {
      const school = schools.find((s) => s.shortcode === data.school);
      if (!school) return false;
      const regex = new RegExp(school.emailPattern);
      return regex.test(data.email);
    },
    {
      message: "Email format does not match the selected school",
      path: ["email"],
    }
  );

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const school = schools.find(s => s.shortcode === e.target.value);
    if (school) {
      setSelectedSchool(school);
      setEmail(""); // reset email when school changes
      setError("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    const regex = new RegExp(selectedSchool.emailPattern);
    if (!regex.test(value)) {
      setError(`Email must match format: ${selectedSchool.placeholder}`);
    } else {
      setError("");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      school: selectedSchool.shortcode,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || "Signup failed");
      }

      toast.success("Account created! Redirecting to login...");
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center">Create Account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* School Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">School</label>
            <select
              {...register("school")}
              onChange={(e) => {
                const school = schools.find(
                  (s) => s.shortcode === e.target.value
                );
                setSelectedSchool(school || schools[0]);
                setValue("school", e.target.value);
                handleSchoolChange(e);
              }}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {schools.map((s) => (
                <option key={s.shortcode} value={s.shortcode}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.school && (
              <p className="text-sm text-red-600">{errors.school.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">School Email</label>
            <input
              type="email"
              placeholder={selectedSchool.placeholder}
              {...register("email", {
                onChange: (e) => {
                  handleEmailChange(e);
                }
              })}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full border rounded p-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                {...register("Firstname")}
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.Firstname && (
                <p className="text-sm text-red-600">{errors.Firstname.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Surname</label>
              <input
                type="text"
                {...register("Lastname")}
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.Lastname && (
                <p className="text-sm text-red-600">{errors.Lastname.message}</p>
              )}
            </div>
          </div>

          {/* Pseudoname */}
          <div>
            <label className="block text-sm font-medium mb-1">Pseudoname</label>
            <input
              type="text"
              {...register("Pseudoname")}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.Pseudoname && (
              <p className="text-sm text-red-600">{errors.Pseudoname.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
