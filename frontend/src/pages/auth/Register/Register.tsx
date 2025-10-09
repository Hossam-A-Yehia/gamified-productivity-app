import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../hooks/useAuth";
import ProgressBar from "../../../components/common/ProgressBar";
import ConfettiPopup from "../../../components/common/ConfettiPopup";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <ConfettiPopup show={showSuccess} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl">🎮</span>
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
            {({ values, errors, touched, isSubmitting }) => (
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
                        <ErrorMessage
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
                        <ErrorMessage
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
                        <ErrorMessage
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
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                    >
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">⚠️</span>
                        <p className="text-red-700 dark:text-red-400 text-sm">
                          {error}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-4">
                  {currentStep > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Back
                    </motion.button>
                  )}

                  {currentStep < formSteps.length - 1 ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        if (validateCurrentStep(values, currentStep)) {
                          setCurrentStep(currentStep + 1);
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                    >
                      Next
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isRegistering || isSubmitting}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRegistering || isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating Account...
                        </div>
                      ) : (
                        "Create Account 🚀"
                      )}
                    </motion.button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
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
        <FeatureCards />
      </motion.div>
    </div>
  );
};

export default Register;
