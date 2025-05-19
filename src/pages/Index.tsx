import React from 'react';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface FormValues {
  name: string;
  website: string;
  about: string;
  contactNumber: string;
}

const StarField = () => {
  const stars = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 3 + 2
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

const LoadingSequence = () => {
  const [step, setStep] = React.useState(0);
  const steps = [
    "Initializing connection...",
    "Connecting to database...",
    "Saving your information...",
    "Thank you for your submission! 🎉"
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 border-8 border-blue-500 rounded-full border-t-transparent mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="w-24 h-24 border-8 border-blue-300 rounded-full border-b-transparent absolute top-0 left-1/2 -translate-x-1/2"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full opacity-20" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {steps.map((text, index) => (
            <motion.p
              key={index}
              className={`text-xl font-medium ${index === step ? 'text-blue-400' : 'text-gray-500'} ${
                index < step ? 'text-green-500' : ''
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: index <= step ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {text}
              {index === step && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ...
                </motion.span>
              )}
              {index < step && " ✓"}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setShowSuccess(true);
    try {
      const { error } = await supabase.from('listings').insert([{
        name: data.name,
        website: data.website,
        about: data.about,
        contact_number: data.contactNumber
      }]);
      
      if (error) throw error;
      
      await new Promise(resolve => setTimeout(resolve, 4000)); // Show animation sequence
      reset();
      navigate('/thank-you');
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 relative">
      <StarField />
      <AnimatePresence>
        {showSuccess && <LoadingSequence />}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="w-full bg-zinc-900 border-zinc-800 text-white shadow-2xl shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Submit Your Listing
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Label htmlFor="name" className="text-zinc-300">Name</Label>
                <Input 
                  id="name"
                  type="text" 
                  placeholder="Your name or company name"
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Label htmlFor="website" className="text-zinc-300">Website URL</Label>
                <Input 
                  id="website"
                  type="url" 
                  placeholder="https://your-website.com"
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("website", { 
                    required: "Website URL is required",
                    pattern: {
                      value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+/,
                      message: "Please enter a valid URL"
                    }
                  })}
                />
                {errors.website && (
                  <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                )}
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Label htmlFor="about" className="text-zinc-300">About Your Product/Service</Label>
                <Textarea 
                  id="about"
                  placeholder="Tell us about your product or service"
                  className="min-h-32 bg-zinc-800 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("about", { 
                    required: "Description is required",
                    minLength: {
                      value: 20,
                      message: "Please provide at least 20 characters"
                    }
                  })}
                />
                {errors.about && (
                  <p className="text-sm text-red-500 mt-1">{errors.about.message}</p>
                )}
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Label htmlFor="contactNumber" className="text-zinc-300">Contact Number</Label>
                <Input 
                  id="contactNumber"
                  type="tel" 
                  placeholder="Enter your contact number"
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("contactNumber", { 
                    required: "Contact number is required",
                    pattern: {
                      value: /^\d{10,15}$/,
                      message: "Please enter a valid phone number"
                    }
                  })}
                />
                {errors.contactNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactNumber.message}</p>
                )}
              </motion.div>
            </CardContent>
            <CardFooter>
              <motion.div 
                className="w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-lg shadow-blue-500/25 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span> : 
                    "Submit"
                  }
                </Button>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Index;