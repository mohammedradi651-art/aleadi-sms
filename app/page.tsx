"use client";

import { useEffect, useMemo, useState } from "react";

type Message = {
  id: string;
  phone: string;
  message: string;
  createdAt: number;
  status: string;
  deliveredAt?: number;
};

type HistoryResponse = {
  success: boolean;
  stats: {
    total: number;
    pending: number;
    delivered: number;
  };
  messages: Message[];
};

const LOGIN_PHONE = "771176611";
const LOGIN_PASSWORD = "Aa771176611";

const API_KEY = "ALWADI-OTP-771176611";

/* =========================================================
   ICON
========================================================= */

function Icon({
  name,
  size = 18,
}: {
  name:
    | "message"
    | "clock"
    | "check"
    | "search"
    | "refresh"
    | "shield"
    | "logout"
    | "lock"
    | "phone"
    | "key"
    | "copy"
    | "checkCopy";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "message":
      return (
        <svg {...common}>
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-5.2A7.5 7.5 0 0 1 4.5 8.5 7.5 7.5 0 0 1 12 1a7.5 7.5 0 0 1 8 7.5Z" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
          <path d="M21 19v-5h-5" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6l8-3Z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
          <path d="m15 8 4 4-4 4" />
          <path d="M19 12H9" />
        </svg>
      );

    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <path d="M12 14v3" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
          <path d="M10 5h4" />
          <path d="M11 18.5h2" />
        </svg>
      );

    case "key":
      return (
        <svg {...common}>
          <circle cx="8" cy="15" r="4" />
          <path d="m11 12 9-9" />
          <path d="m17 6 2 2" />
          <path d="m14 9 2 2" />
        </svg>
      );

    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
        </svg>
      );

    case "checkCopy":
      return (
        <svg {...common}>
          <path d="m5 12 3 3 6-7" />
          <path d="M13 5h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
          <path d="M4 5h5" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   LOGIN PAGE
========================================================= */

function LoginPage({
  onLogin,
}: {
  onLogin: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    setTimeout(() => {
      if (
        phone.trim() === LOGIN_PHONE &&
        password === LOGIN_PASSWORD
      ) {
        localStorage.setItem("alwadi_logged_in", "true");
        onLogin();
      } else {
        setError("بيانات الدخول غير صحيحة");
      }

      setLoading(false);
    }, 350);
  }

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f2f8] px-5 py-10"
    >
      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full bg-purple-200/40 blur-[130px]" />

        <div className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-violet-200/40 blur-[130px]" />

        <div className="absolute left-[45%] top-[35%] h-[300px] w-[300px] rounded-full bg-fuchsia-100/30 blur-[110px]" />
      </div>

      <div className="relative w-full max-w-[410px]">
        {/* Logo */}

        <div className="mb-7 flex justify-center">
          <div className="flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-white shadow-[0_25px_70px_rgba(91,33,182,0.18)]">
            <img
              src="/icon.png"
              alt="منظومة الوادي"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Login Card */}

        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.11)]">
          <div className="h-1.5 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500" />

          <div className="p-7 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Phone */}

              <div>
                <label className="mb-2.5 block text-[12px] font-black text-slate-800">
                  رقم الهاتف
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-purple-600">
                    <Icon name="phone" size={18} />
                  </div>

                  <input
                    dir="ltr"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="username"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="771176611"
                    className="h-[56px] w-full rounded-xl border-2 border-slate-200 bg-slate-50 pr-12 pl-4 text-left font-mono text-[15px] font-black tracking-wider text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-50"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <label className="mb-2.5 block text-[12px] font-black text-slate-800">
                  كلمة المرور
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-purple-600">
                    <Icon name="lock" size={18} />
                  </div>

                  <input
                    dir="ltr"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="كلمة المرور"
                    className="h-[56px] w-full rounded-xl border-2 border-slate-200 bg-slate-50 pr-12 pl-4 text-left font-mono text-[15px] font-black tracking-[2px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-50"
                  />
                </div>
              </div>

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-[11px] font-black text-red-600">
                  {error}
                </div>
              )}

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-[56px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 text-[13px] font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    جاري التحقق
                  </>
                ) : (
                  <>
                    تسجيل الدخول
                    <span className="text-base">
                      ←
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Home() {
  const [loggedIn, setLoggedIn] =
    useState<boolean | null>(null);

  const [data, setData] =
    useState<HistoryResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [copiedApi, setCopiedApi] =
    useState(false);

  /* Check Login */

  useEffect(() => {
    const session =
      localStorage.getItem("alwadi_logged_in");

    setLoggedIn(session === "true");
  }, []);

  /* Load Messages */

  async function loadMessages() {
    try {
      const response =
        await fetch("/api/messages/history", {
          cache: "no-store",
        });

      if (!response.ok) {
        throw new Error(
          "Failed to load messages"
        );
      }

      const result: HistoryResponse =
        await response.json();

      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  /* Auto Refresh */

  useEffect(() => {
    if (!loggedIn) return;

    loadMessages();

    const interval =
      setInterval(loadMessages, 3000);

    return () =>
      clearInterval(interval);
  }, [loggedIn]);

  /* Search */

  const filteredMessages =
    useMemo(() => {
      const messages =
        data?.messages ?? [];

      if (!search.trim()) {
        return messages;
      }

      const query =
        search.toLowerCase();

      return messages.filter(
        (item) =>
          item.phone
            .toLowerCase()
            .includes(query) ||
          item.message
            .toLowerCase()
            .includes(query)
      );
    }, [data, search]);

  /* Time */

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        numberingSystem: "latn",
      }
    );
  }

  /* Logout */

  function logout() {
    localStorage.removeItem(
      "alwadi_logged_in"
    );

    setLoggedIn(false);
  }

  /* Copy API */

  async function copyApiKey() {
    try {
      await navigator.clipboard.writeText(
        API_KEY
      );

      setCopiedApi(true);

      setTimeout(() => {
        setCopiedApi(false);
      }, 2000);
    } catch {
      console.error(
        "Could not copy API key"
      );
    }
  }

  /* Loading */

  if (loggedIn === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f2f8]">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-purple-100 border-t-purple-600" />
      </div>
    );
  }

  /* Login */

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={() =>
          setLoggedIn(true)
        }
      />
    );
  }

  /* Dashboard */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f8f7fb] text-slate-900"
    >
      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-200/30 blur-[110px]" />

        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-[110px]" />

        <div className="absolute left-[45%] top-[35%] h-[300px] w-[300px] rounded-full bg-fuchsia-100/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
        {/* HEADER */}

        <header className="relative mb-7 overflow-hidden rounded-[32px] border border-purple-100 bg-white shadow-[0_20px_60px_rgba(91,33,182,0.08)]">
          <div className="h-1.5 bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500" />

          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Brand */}

            <div className="flex items-center gap-5">
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-white shadow-xl shadow-purple-100">
                <img
                  src="/icon.png"
                  alt="منظومة الوادي"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />

                  <span className="text-xs font-black tracking-wide text-purple-600">
                    منظومة الوادي
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  OTP منظومة الوادي
                </h1>

                <p className="mt-1.5 text-sm font-bold text-slate-400">
                  لوحة التحكم في رسائل ورموز التحقق
                </p>
              </div>
            </div>

            {/* Logout */}

            <button
              onClick={logout}
              className="flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 text-[11px] font-black text-red-600 transition hover:bg-red-100"
            >
              <Icon
                name="logout"
                size={15}
              />

              تسجيل الخروج
            </button>
          </div>
        </header>

        {/* API KEY */}

        <section className="mb-7 overflow-hidden rounded-[28px] border border-purple-100 bg-white shadow-[0_15px_50px_rgba(91,33,182,0.06)]">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500" />

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-purple-700">
                <Icon
                  name="key"
                  size={20}
                />
              </div>

              <div>
                <h2 className="text-sm font-black text-slate-900">
                  مفتاح API
                </h2>

                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  المفتاح المستخدم لربط قارئ الرسائل بالنظام
                </p>
              </div>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <div className="flex h-12 min-w-0 flex-1 items-center rounded-xl border border-purple-100 bg-purple-50 px-4 sm:w-[350px]">
                <code
                  dir="ltr"
                  className="w-full truncate text-left font-mono text-[11px] font-black tracking-wide text-purple-800"
                >
                  {API_KEY}
                </code>
              </div>

              <button
                onClick={copyApiKey}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-100 transition hover:bg-purple-700"
                title="نسخ مفتاح API"
              >
                <Icon
                  name={
                    copiedApi
                      ? "checkCopy"
                      : "copy"
                  }
                  size={17}
                />
              </button>
            </div>
          </div>

          {copiedApi && (
            <div className="border-t border-emerald-100 bg-emerald-50 px-6 py-2.5 text-[9px] font-black text-emerald-600">
              تم نسخ مفتاح API
            </div>
          )}
        </section>

        {/* STATS */}

        <section className="mb-7 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="إجمالي الرسائل"
            value={
              loading
                ? "—"
                : data?.stats.total ?? 0
            }
            icon="message"
            gradient="from-purple-600 to-violet-500"
            light="bg-purple-50"
          />

          <StatCard
            title="قيد الانتظار"
            value={
              loading
                ? "—"
                : data?.stats.pending ?? 0
            }
            icon="clock"
            gradient="from-violet-600 to-fuchsia-500"
            light="bg-violet-50"
          />

          <StatCard
            title="تم السحب"
            value={
              loading
                ? "—"
                : data?.stats.delivered ?? 0
            }
            icon="check"
            gradient="from-fuchsia-600 to-purple-500"
            light="bg-fuchsia-50"
          />
        </section>

        {/* MESSAGES */}

        <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          {/* Toolbar */}

          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-purple-600">
                    <Icon
                      name="message"
                      size={18}
                    />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      الرسائل الواردة
                    </h2>

                    <p className="mt-0.5 text-xs font-bold text-slate-400">
                      جميع الرسائل المستلمة من النظام
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex w-full gap-2 sm:w-auto">
                {/* Search */}

                <div className="relative flex-1 sm:w-[320px]">
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon
                      name="search"
                      size={16}
                    />
                  </span>

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="ابحث برقم الجوال أو محتوى الرسالة"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-50"
                  />
                </div>

                {/* Refresh */}

                <button
                  onClick={loadMessages}
                  className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-purple-300 active:translate-y-0"
                >
                  <Icon
                    name="refresh"
                    size={16}
                  />

                  تحديث
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}

          <div className="divide-y divide-slate-100">
            {loading && (
              <div className="p-20 text-center">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-purple-100 border-t-purple-600" />

                <p className="text-sm font-bold text-slate-400">
                  جاري تحميل الرسائل...
                </p>
              </div>
            )}

            {!loading &&
              filteredMessages.length === 0 && (
                <div className="p-20 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-purple-50 to-fuchsia-50 text-purple-400">
                    <Icon
                      name="message"
                      size={30}
                    />
                  </div>

                  <h3 className="font-black text-slate-700">
                    لا توجد رسائل
                  </h3>

                  <p className="mt-2 text-sm font-bold text-slate-400">
                    {search
                      ? "لم يتم العثور على رسالة مطابقة للبحث"
                      : "ستظهر الرسائل هنا عند وصولها"}
                  </p>
                </div>
              )}

            {filteredMessages.map(
              (item) => (
                <MessageRow
                  key={item.id}
                  item={item}
                  formatDate={formatDate}
                />
              )
            )}
          </div>
        </section>

        {/* Footer */}

        <footer className="py-8 text-center">
          <div className="mx-auto mb-4 h-px max-w-xs bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

          <div className="mb-2 flex items-center justify-center gap-2">
            <img
              src="/icon.png"
              alt=""
              className="h-6 w-6 rounded-lg object-cover"
            />

            <p className="text-xs font-black text-purple-500">
              OTP منظومة الوادي
            </p>
          </div>

          <p className="text-[10px] font-bold text-slate-400">
            نظام إدارة واستقبال رموز التحقق
          </p>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  gradient,
  light,
}: {
  title: string;
  value: number | string;
  icon: "message" | "clock" | "check";
  gradient: string;
  light: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(91,33,182,0.10)]">
      <div
        className={`absolute -left-10 -top-10 h-32 w-32 rounded-full ${light} opacity-70 blur-3xl`}
      />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">
            {title}
          </p>

          <p
            dir="ltr"
            className="mt-3 text-[38px] font-black leading-none tracking-tight text-slate-900"
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          <Icon
            name={icon}
            size={21}
          />
        </div>
      </div>

      <div className="relative mt-6 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full w-full rounded-full bg-gradient-to-r ${gradient}`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MESSAGE ROW
========================================================= */

function MessageRow({
  item,
  formatDate,
}: {
  item: Message;
  formatDate: (
    timestamp: number
  ) => string;
}) {
  const pending =
    item.status === "pending";

  return (
    <div className="group p-5 transition duration-200 hover:bg-purple-50/30 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          {/* Phone */}

          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-purple-600">
                <Icon
                  name="phone"
                  size={17}
                />
              </div>

              <span
                dir="ltr"
                className="font-mono text-sm font-black tracking-wide text-purple-700"
              >
                {item.phone}
              </span>
            </div>

            {/* Status */}

            {pending ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[11px] font-black text-violet-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />

                قيد الانتظار
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-600">
                <Icon
                  name="check"
                  size={12}
                />

                تم السحب
              </span>
            )}
          </div>

          {/* Message */}

          <div
            className={`relative overflow-hidden rounded-2xl border px-5 py-4 transition-all duration-200 ${
              pending
                ? "border-violet-100 bg-violet-50/40 group-hover:border-violet-200 group-hover:bg-violet-50/70"
                : "border-emerald-100 bg-emerald-50/40 group-hover:border-emerald-200 group-hover:bg-emerald-50/70"
            }`}
          >
            <div
              className={`absolute right-0 top-0 h-full w-1 ${
                pending
                  ? "bg-gradient-to-b from-purple-500 to-violet-500"
                  : "bg-gradient-to-b from-emerald-400 to-green-500"
              }`}
            />

            <div className="flex items-start gap-4">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  pending
                    ? "bg-violet-100 text-violet-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <Icon
                  name={
                    pending
                      ? "clock"
                      : "check"
                  }
                  size={17}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1">
                  <span
                    className={`text-[10px] font-black ${
                      pending
                        ? "text-violet-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {pending
                      ? "رسالة بانتظار القارئ"
                      : "تم سحب الرسالة"}
                  </span>
                </div>

                <p className="break-words text-[15px] font-black leading-8 text-slate-700">
                  {item.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time */}

        <div className="shrink-0 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 lg:w-[150px] lg:text-center">
          <p className="text-[10px] font-black text-slate-400">
            وقت الاستلام
          </p>

          <p
            dir="ltr"
            className="mt-1 text-xs font-black text-slate-600"
          >
            {formatDate(
              item.createdAt
            )}
          </p>

          {item.deliveredAt && (
            <p className="mt-2 text-[10px] font-black text-emerald-500">
              تم السحب بنجاح
            </p>
          )}
        </div>
      </div>
    </div>
  );
}