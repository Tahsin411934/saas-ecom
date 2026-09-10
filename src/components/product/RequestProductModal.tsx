"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { X, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { submitProductRequest, type ProductRequestFormState } from "@/app/actions/product-request";

interface RequestProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillProductName?: string;
}

const initialState: ProductRequestFormState = {
  success: false,
  message: "",
};

export default function RequestProductModal({
  isOpen,
  onClose,
  prefillProductName,
}: RequestProductModalProps) {
  const [imageName, setImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitProductRequest, initialState);
  const handledRef = useRef(false);

  // Handle form submission result: show toast (only once per submission)
  useEffect(() => {
    if (state.success && state.message && !handledRef.current) {
      handledRef.current = true;
      toast.success(state.message, { toastId: "product-request-success" });
      formRef.current?.reset();
      setImageName(null);
      onClose();
    } else if (state.message && !state.success && !handledRef.current) {
      handledRef.current = true;
      toast.error(state.message, { toastId: "product-request-error" });
    }
  }, [state.success, state.message, onClose]);

  // Reset handled flag when modal opens (new submission cycle)
  useEffect(() => {
    if (isOpen) {
      handledRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onPointerDown={onClose}>
        <div
          className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0FDF4]">
                <Package className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Request a Product</h2>
                <p className="text-xs text-gray-500">Let us know what you're looking for</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form ref={formRef} action={formAction} className="space-y-4 p-6 max-h-[70vh] overflow-y-auto" noValidate>
            {/* Error Banner */}
            {state.message && !state.success && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-medium text-red-800">{state.message}</p>
                {state.errors && Object.keys(state.errors).length > 0 && (
                  <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                    {Object.entries(state.errors).map(([field, msgs]) => (
                      <li key={field}>{msgs[0]}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  defaultValue={state.fieldValues?.customer_name || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="Enter your name"
                />
                {state.errors?.customer_name && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.customer_name[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="customer_email"
                  required
                  defaultValue={state.fieldValues?.customer_email || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="your@email.com"
                />
                {state.errors?.customer_email && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.customer_email[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  defaultValue={state.fieldValues?.customer_phone || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="01XXXXXXXXX"
                />
                {state.errors?.customer_phone && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.customer_phone[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  defaultValue={state.fieldValues?.quantity || "1"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
                {state.errors?.quantity && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.quantity[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_name"
                required
                defaultValue={prefillProductName || state.fieldValues?.product_name || ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="What product are you looking for?"
              />
              {state.errors?.product_name && (
                <p className="mt-1 text-xs text-red-600">{state.errors.product_name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Description (optional)
              </label>
              <textarea
                name="product_description"
                rows={3}
                defaultValue={state.fieldValues?.product_description || ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="Describe the product you want (brand, model, size, color, etc.)"
              />
              {state.errors?.product_description && (
                <p className="mt-1 text-xs text-red-600">{state.errors.product_description[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Price (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">৳</span>
                <input
                  type="number"
                  name="expected_price"
                  min="0"
                  step="0.01"
                  defaultValue={state.fieldValues?.expected_price || ""}
                  className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              {state.errors?.expected_price && (
                <p className="mt-1 text-xs text-red-600">{state.errors.expected_price[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (optional)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-[var(--color-primary)] transition-colors"
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {imageName || "Click to upload an image"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                name="product_image"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setImageName(file ? file.name : null);
                }}
              />
              {state.errors?.product_image && (
                <p className="mt-1 text-xs text-red-600">{state.errors.product_image[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={state.fieldValues?.notes || ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="Any other details..."
              />
              {state.errors?.notes && (
                <p className="mt-1 text-xs text-red-600">{state.errors.notes[0]}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="flex-1 h-11 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white font-semibold"
              >
                {pending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}