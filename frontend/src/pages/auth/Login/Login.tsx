import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage as FormikErrorMessage } from 'formik';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../utils/constants';
import { validationSchema, initialValues, createHandleSubmit } from './utils';
import StatsCards from './StatsCards';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn, error, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = createHandleSubmit(login);

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
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hidden lg:flex flex-col space-y-6"
        >
          <StatsCards side="left" />
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
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <motion.span 
              className="text-2xl font-bold text-white"
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
            Welcome Back!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Continue your productivity journey
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, isValid, dirty }) => (
              <Form className="space-y-6">
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
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter your email"
                      />
                    )}
                  </Field>
                  <FormikErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
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
                          type={showPassword ? 'text' : 'password'}
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                            errors.password && touched.password
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter your password"
                        />
                      )}
                    </Field>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <FormikErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="flex items-center justify-between">
                  <Field name="rememberMe">
                    {({ field }: any) => (
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          {...field}
                          type="checkbox"
                          checked={field.value}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          Remember me
                        </span>
                      </motion.label>
                    )}
                  </Field>

                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <ErrorMessage message={error} />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoggingIn || isSubmitting || !isValid || !dirty}
                  loading={isLoggingIn || isSubmitting}
                  fullWidth
                  className="shadow-lg font-semibold"
                >
                  Sign In
                </Button>
              </Form>
            )}
          </Formik>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
        </motion.div>

        {/* Right Stats */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="hidden lg:flex flex-col space-y-6"
        >
          <StatsCards side="right" />
        </motion.div>

        {/* Mobile Stats - shown below form on smaller screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:hidden col-span-1 mt-8"
        >
          <StatsCards side="mobile" />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
