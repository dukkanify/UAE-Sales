"use client";

import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import "./admin-login.css";

export function AdminLoginStage() {
  return (
    <main className="admin-login">
      <div className="admin-login__glow admin-login__glow--a" aria-hidden />
      <div className="admin-login__glow admin-login__glow--b" aria-hidden />
      <div className="admin-login__grid" aria-hidden />

      <div className="admin-login__stage">
        <div className="admin-login__brand">
          <BrandMark className="admin-login__mark" size={56} variant="gold" />
          <h1 className="admin-login__name">{BRAND.nameAr}</h1>
          <p className="admin-login__tag">غرفة التحكم — دخول المدير</p>
        </div>

        <div className="admin-login__box">
          <Suspense
            fallback={
              <p className="admin-login__loading">جاري تحميل نموذج الدخول...</p>
            }
          >
            <LoginForm variant="admin" />
          </Suspense>
        </div>

        <Link className="admin-login__back" href="/">
          العودة إلى السوق
        </Link>
      </div>
    </main>
  );
}
