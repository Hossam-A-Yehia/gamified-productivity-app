import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage as FormikErrorMessage } from "formik";
import { useAuth } from "../../../hooks/useAuth";
import ProgressBar from "../../../components/common/ProgressBar";
import ConfettiPopup from "../../../components/common/ConfettiPopup";
import GoogleSignIn from "../../../components/auth/GoogleSignIn";
import { ROUTES } from "../../../utils/constants";
import type { FormData } from "./utils";
import {
  validationSchema,
  initialValues,
  createHandleSubmit,
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
} from "./utils";
import FeatureCards from "./FeatureCards";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isRegistering, error, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = createHandleSubmit(register, navigate, setShowSuccess);

  const formSteps = [
    { label: "Personal Info", fields: ["name", "email"] },
    { label: "Security", fields: ["password", "confirmPassword"] },
  ];

  const validateCurrentStep = (
    values: FormData,
    currentStep: number
  ): boolean => {
    if (currentStep === 0) {
      return !!(values.name && values.email);
    }
    if (currentStep === 1) {
      return !!(values.password && values.confirmPassword);
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-blue-300/20 dark:bg-blue-400/10 rounded-full blur-2xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/3 right-16 w-24 h-24 bg-purple-300/20 dark:bg-purple-400/10 rounded-full blur-2xl"
        animate={{
          y: [0, 25, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute bottom-32 left-1/4 w-28 h-28 bg-indigo-300/20 dark:bg-indigo-400/10 rounded-full blur-2xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 25, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      <ConfettiPopup show={showSuccess} />
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hidden lg:flex flex-col space-y-6"
        >
          <FeatureCards side="left" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: [0, -8, 0]
          }}
          transition={{ 
            opacity: { duration: 0.5 },
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }
          }}
          className="w-full max-w-md mx-auto"
        >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              scale: { delay: 0.2, type: 'spring', stiffness: 200 },
              rotate: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }
            }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span 
              className="text-2xl"
              animate={{
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            >
              🎮
            </motion.span>
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join the Game
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Start your productivity journey and level up your life!
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, isValid, dirty }) => (
              <Form className="space-y-6">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <Field name="name">
                          {({ field }: any) => (
                            <motion.input
                              {...field}
                              whileFocus={{ scale: 1.02 }}
                              type="text"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                                errors.name && touched.name
                                  ? "border-red-500 dark:border-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                              placeholder="Enter your full name"
                            />
                          )}
                        </Field>
                        <FormikErrorMessage
                          name="name"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <Field name="email">
                          {({ field }: any) => (
                            <motion.input
                              {...field}
                              whileFocus={{ scale: 1.02 }}
                              type="email"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                                errors.email && touched.email
                                  ? "border-red-500 dark:border-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                              placeholder="Enter your email"
                            />
                          )}
                        </Field>
                        <FormikErrorMessage
                          name="email"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </motion.div>
                  )}
                  {currentStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Field name="password">
                            {({ field }: any) => (
                              <motion.input
                                {...field}
                                whileFocus={{ scale: 1.02 }}
                                type={showPassword ? "text" : "password"}
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                                  errors.password && touched.password
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Create a strong password"
                              />
                            )}
                          </Field>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                          </button>
                        </div>
                        {values.password && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Password Strength
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  calculatePasswordStrength(values.password) <
                                  40
                                    ? "text-red-500"
                                    : calculatePasswordStrength(
                                        values.password
                                      ) < 80
                                    ? "text-yellow-500"
                                    : "text-green-500"
                                }`}
                              >
                                {getPasswordStrengthText(
                                  calculatePasswordStrength(values.password)
                                )}
                              </span>
                            </div>
                            <ProgressBar
                              progress={calculatePasswordStrength(
                                values.password
                              )}
                              color={getPasswordStrengthColor(
                                calculatePasswordStrength(values.password)
                              )}
                              size="sm"
                            />
                          </motion.div>
                        )}
                        <FormikErrorMessage
                          name="password"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Field name="confirmPassword">
                            {({ field }: any) => (
                              <motion.input
                                {...field}
                                whileFocus={{ scale: 1.02 }}
                                type={showConfirmPassword ? "text" : "password"}
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                                  errors.confirmPassword &&
                                  touched.confirmPassword
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Confirm your password"
                              />
                            )}
                          </Field>
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                          </button>
                        </div>
                        <FormikErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <ErrorMessage message={error} />
                <div className="flex gap-4">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}

                  {currentStep < formSteps.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (validateCurrentStep(values, currentStep)) {
                          setCurrentStep(currentStep + 1);
                        }
                      }}
                      disabled={!validateCurrentStep(values, currentStep)}
                      className="flex-1"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isRegistering || isSubmitting || !isValid || !dirty}
                      loading={isRegistering || isSubmitting}
                      className="flex-1 whitespace-nowrap"
                    >
                      Create Account 🚀
                    </Button>
                  )}
                </div>
              </Form>
            )}
          </Formik>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleSignIn
                text="signup_with"
                onSuccess={() => navigate(ROUTES.DASHBOARD)}
                onError={(error) => console.error('Google Sign-Up failed:', error)}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to={ROUTES.LOGIN}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="hidden lg:flex flex-col space-y-6"
        >
          <FeatureCards side="right" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:hidden col-span-1 mt-8"
        >
          <FeatureCards side="mobile" />
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
