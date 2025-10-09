import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage as FormikErrorMessage } from 'formik';
import { ROUTES } from '../../../utils/constants';
import { validationSchema, initialValues, createHandleSubmit, type ForgotPasswordFormValues } from './utils';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';

const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
    setIsSubmitting(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(null);
    setIsSubmitting(false);
  };

  const handleSubmit = createHandleSubmit(handleSuccess, handleError);

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    await handleSubmit(values);
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
        className="w-full max-w-md mx-auto relative z-10"
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
              🔐
            </motion.span>
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4"
              >
                <span className="text-2xl">✅</span>
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Email Sent!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {success}
              </p>
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ isValid, dirty }) => (
                <Form className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    />
                    <FormikErrorMessage
                      name="email"
                      component="div"
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    />
                  </div>

                  {error && <ErrorMessage message={error} />}

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || !isValid || !dirty}
                    loading={isSubmitting}
                    className="w-full"
                  >
                    Send Reset Link 📧
                  </Button>
                </Form>
              )}
            </Formik>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
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
    </div>
  );
};

export default ForgotPassword;
