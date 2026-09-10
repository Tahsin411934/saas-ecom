"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { submitProductRequest, type ProductRequestFormState } from "@/app/actions/product-request";

const initialState: ProductRequestFormState = {
  success: false,
  message: "",
};

export default function ProductRequestPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitProductRequest, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#10B981",
          color: "#fff",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: 500,
          boxShadow: "0 8px 32px rgba(16, 185, 129, 0.25)",
        },
      });

      // Auto close form after successful submission
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state.success, state.message, router]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-[var(--color-primary)]">OneHaatbd</h1>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Request a Product</h2>
            <p className="mt-3 text-base text-gray-500 max-w-md mx-auto">
              Can't find what you're looking for? Let us know and we'll do our best to source it for you.
            </p>
          </div>

          {/* Form */}
          <form
            ref={formRef}
            action={formAction}
            noValidate
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 space-y-6"
          >
            {/* Error Banner */}
            {state.message && !state.success && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">{state.message}</p>
                  {state.errors && Object.keys(state.errors).length > 0 && (
                    <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                      {Object.entries(state.errors).map(([field, msgs]) => (
                        <li key={field}>{msgs[0]}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Your Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customer_name"
                    name="customer_name"
                    type="text"
                    required
                    defaultValue={state.fieldValues?.customer_name || ""}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                    placeholder="John Doe"
                  />
                  {state.errors?.customer_name && (
                    <p className="mt-1 text-xs text-red-600">{state.errors.customer_name[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    required
                    defaultValue={state.fieldValues?.customer_email || ""}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                    placeholder="john@example.com"
                  />
                  {state.errors?.customer_email && (
                    <p className="mt-1 text-xs text-red-600">{state.errors.customer_email[0]}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="customer_phone"
                    name="customer_phone"
                    type="tel"
                    defaultValue={state.fieldValues?.customer_phone || ""}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                    placeholder="+880 1XXX-XXXXXX"
                  />
                  {state.errors?.customer_phone && (
                    <p className="mt-1 text-xs text-red-600">{state.errors.customer_phone[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Product Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                Product Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product_name"
                    name="product_name"
                    type="text"
                    required
                    defaultValue={state.fieldValues?.product_name || ""}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                    placeholder="e.g., iPhone 15 Pro Max"
                  />
                  {state.errors?.product_name && (
                    <p className="mt-1 text-xs text-red-600">{state.errors.product_name[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="product_description" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Description
                  </label>
                  <textarea
                    id="product_description"
                    name="product_description"
                    rows={3}
                    defaultValue={state.fieldValues?.product_description || ""}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow resize-none"
                    placeholder="Describe the product you're looking for (brand, model, specifications, etc.)"
                  />
                  {state.errors?.product_description && (
                    <p className="mt-1 text-xs text-red-600">{state.errors.product_description[0]}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min={1}
                      defaultValue={state.fieldValues?.quantity || "1"}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                    />
                    {state.errors?.quantity && (
                      <p className="mt-1 text-xs text-red-600">{state.errors.quantity[0]}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="expected_price" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expected Price (BDT)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 text-sm">৳</span>
                      <input
                        id="expected_price"
                        name="expected_price"
                        type="number"
                        min={0}
                        step={0.01}
                        defaultValue={state.fieldValues?.expected_price || ""}
                        className="block w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                        placeholder="0.00"
                      />
                    </div>
                    {state.errors?.expected_price && (
                      <p className="mt-1 text-xs text-red-600">{state.errors.expected_price[0]}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="product_image" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Image
                  </label>
                  <div className="relative">
                    <input
                      id="product_image"
                      name="product_image"
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 cursor-pointer file:cursor-pointer"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">Accepted: JPG, PNG, WEBP. Max 5MB.</p>
                  {state.errors?.product_image && (
                    <p className="mt-1 text-xs text-red-600">{state.errors.product_image[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                defaultValue={state.fieldValues?.notes || ""}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow resize-none"
                placeholder="Any other details or special requests..."
              />
              {state.errors?.notes && (
                <p className="mt-1 text-xs text-red-600">{state.errors.notes[0]}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={pending}
                className="w-full py-3 px-6 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/20"
              >
                {pending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Submit Product Request
                  </>
                )}
              </button>
            </div>

            {/* Back Link */}
            <div className="text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                &larr; Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}