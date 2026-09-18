"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, Check, CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole, Package, Store } from "lucide-react";
import { registerPartner, type PartnerFormState } from "@/app/actions/partner";

const initialState: PartnerFormState = { success: false, message: "" };
const fields = [
  { name: "store_name", label: "Store / company name", placeholder: "e.g. Rahim Electronics", autoComplete: "organization", maxLength: 160, minLength: 2, wide: true },
  { name: "first_name", label: "First name", placeholder: "Rahim", autoComplete: "given-name", maxLength: 255 },
  { name: "last_name", label: "Last name", placeholder: "Uddin", autoComplete: "family-name", maxLength: 255 },
  { name: "email", label: "Email address", placeholder: "you@company.com", autoComplete: "email", type: "email", maxLength: 255, wide: true },
  { name: "phone", label: "Phone number", placeholder: "01XXXXXXXXX", autoComplete: "tel", type: "tel", maxLength: 20, optional: true, wide: true },
  { name: "password", label: "Password", placeholder: "At least 8 characters", autoComplete: "new-password", type: "password", minLength: 8 },
  { name: "password_confirmation", label: "Confirm password", placeholder: "Re-enter password", autoComplete: "new-password", type: "password", minLength: 8 },
] as const;

function PartnerFields({ state, pending, action }: {
  state: PartnerFormState;
  pending: boolean;
  action: (formData: FormData) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.success) {
      const target = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?? formRef.current?.querySelector<HTMLElement>('[role="alert"]');
      target?.focus();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} aria-busy={pending} className="mt-7">
      {state.message && !state.success && (
        <Alert variant="destructive" tabIndex={-1} className="mb-5 rounded-xl outline-none">
          {state.message}
        </Alert>
      )}
      <fieldset disabled={pending} className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 disabled:opacity-70">
        <legend className="sr-only">Store and account details</legend>
        {fields.map((field) => {
          const error = state.errors?.[field.name]?.[0];
          const isPassword = "type" in field && field.type === "password";
          const id = `partner-${field.name}`;
          return (
            <div key={field.name} className={"wide" in field ? "sm:col-span-2" : ""}>
              <Label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                {field.label}{"optional" in field && <span className="ml-1 font-normal text-slate-400">(optional)</span>}
              </Label>
              <div className="relative">
                <Input
                  id={id}
                  name={field.name}
                  type={isPassword ? (showPassword ? "text" : "password") : "type" in field ? field.type : "text"}
                  autoComplete={field.autoComplete}
                  required={!("optional" in field)}
                  minLength={"minLength" in field ? field.minLength : undefined}
                  maxLength={"maxLength" in field ? field.maxLength : undefined}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(event) => setValues((previous) => ({ ...previous, [field.name]: event.target.value }))}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={`h-12 w-full rounded-xl border bg-white px-3.5 text-base text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 sm:text-sm ${isPassword ? "pr-12" : ""} ${error ? "border-red-400" : "border-slate-200"}`}
                />
                {isPassword && (
                  <Button variant="ghost" size="icon" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? `Hide ${field.label.toLowerCase()}` : `Show ${field.label.toLowerCase()}`} aria-pressed={showPassword} className="absolute right-0 top-0 flex h-12 w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </Button>
                )}
              </div>
              {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">{error}</p>}
            </div>
          );
        })}
      </fieldset>
      <Button type="submit" disabled={pending} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:cursor-wait disabled:opacity-70">
        {pending ? <><LoaderCircle size={18} className="animate-spin" />Creating your store…</> : <>Create partner account<ArrowRight size={17} /></>}
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500"><LockKeyhole size={12} />Your password is stored securely.</p>
    </form>
  );
}

export default function BecomePartner({ siteName, sellerLoginUrl }: { siteName: string; sellerLoginUrl: string }) {
  const [state, action, pending] = useActionState(registerPartner, initialState);

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm sm:rounded-3xl">
      {state.success ? (
        <CardContent className="px-6 py-14 text-center sm:px-16 sm:py-20">
          <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><CheckCircle2 size={38} strokeWidth={1.5} /></span>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Welcome, partner</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Your store starts here.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500"><strong className="font-semibold text-slate-800">{state.storeName}</strong> has been registered. Sign in to the seller panel with your new email and password to manage your store.</p>
          <Button asChild className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"><a href={sellerLoginUrl}>Go to seller sign in<ArrowRight size={16} /></a></Button>
          <div><Button asChild variant="link" className="mt-5 text-slate-500 underline hover:text-slate-900"><Link href="/">Continue shopping</Link></Button></div>
        </CardContent>
      ) : (
        <CardContent className="grid p-0 md:grid-cols-[0.8fr_1.2fr]">
          <aside className="relative hidden overflow-hidden bg-[var(--color-primary)] p-9 text-white md:flex md:flex-col md:justify-between">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full border border-white/10" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-12 h-72 w-72 rounded-full border border-white/10" />
            <div className="relative">
              <div className="mb-16 flex items-center gap-2.5 text-sm font-semibold"><Store size={22} className="text-white/90" />{siteName}</div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.23em] text-white/90">For businesses like yours</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.15] tracking-tight">Your business.<br />Its next chapter.</h2>
              <p className="mt-5 text-sm leading-7 text-white/85">Bring your products to our marketplace. Start with a store that’s yours to build.</p>
              <div className="mt-9 space-y-4">
                {["Your own store profile", "Manage your product catalog", "Keep track of your orders"].map((text) => <div key={text} className="flex items-center gap-3 text-sm text-white"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white/90"><Check size={12} /></span>{text}</div>)}
              </div>
            </div>
            <div className="relative mt-16 flex items-center gap-3 border-t border-white/10 pt-6"><Package size={25} strokeWidth={1.3} className="text-white/90" /><p className="text-xs leading-5 text-white/80">Built for local businesses.<br /><span className="text-white">Ready for your next step.</span></p></div>
          </aside>
          <div className="px-5 py-8 sm:px-9 sm:py-10">
            <p className="mb-3 pr-9 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Seller registration</p>
            <h1 className="pr-6 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">Become a partner</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Tell us a little about you and your business.<br className="hidden sm:block" /> Let’s get your store set up.</p>
            <PartnerFields state={state} pending={pending} action={action} />
            <p className="mt-5 text-center text-xs text-slate-500">Already a partner? <Button asChild variant="link" className="h-auto p-0 text-xs font-semibold text-[var(--color-primary)]"><a href={sellerLoginUrl}>Sign in to your store</a></Button></p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
