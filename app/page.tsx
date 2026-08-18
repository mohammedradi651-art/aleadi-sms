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

export default function Home() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  async function loadMessages() {
    try {
      const response = await fetch("/api/messages/history", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const result: HistoryResponse = await response.json();

      if (result.success) {
        setData(result);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();

    const interval = setInterval(loadMessages, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredMessages = useMemo(() => {
    const messages = data?.messages ?? [];

    if (!search.trim()) {
      return messages;
    }

    const query = search.toLowerCase();

    return messages.filter(
      (item) =>
        item.phone.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query),
    );
  }, [data, search]);

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString("ar-YE", {
      dateStyle: "medium",
      timeStyle: "short",
      numberingSystem: "latn",
    });
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f8f7fb] text-slate-900"
    >
      {/* خلفية ناعمة */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-200/30 blur-[110px]" />

        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-[110px]" />

        <div className="absolute left-[45%] top-[35%] h-[300px] w-[300px] rounded-full bg-fuchsia-100/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">

        {/* ================= HEADER ================= */}
        <header className="relative mb-7 overflow-hidden rounded-[32px] border border-purple-100 bg-white shadow-[0_20px_60px_rgba(91,33,182,0.08)]">

          {/* خط علوي */}
          <div className="h-1.5 bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500" />

          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-5">

              {/* Logo */}
              <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500 text-lg font-black text-white shadow-xl shadow-purple-200">

                OTP

                <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-white bg-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>

              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />

                  <span className="text-xs font-bold tracking-wide text-purple-600">
                    منظومة الوادي
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  OTP منظومة الوادي
                </h1>

                <p className="mt-1.5 text-sm text-slate-400">
                  لوحة التحكم في رسائل ورموز التحقق
                </p>
              </div>

            </div>

            {/* حالة النظام */}
            <div className="flex items-center justify-between gap-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-3.5">

              <div className="flex items-center gap-3">

                <div className="relative flex h-3 w-3">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative h-3 w-3 rounded-full bg-emerald-500" />
                </div>

                <div>
                  <p className="text-sm font-bold text-emerald-700">
                    النظام متصل
                  </p>

                  <p className="mt-0.5 text-[11px] text-emerald-600/60">
                    يعمل بشكل طبيعي
                  </p>
                </div>

              </div>

              <div className="border-r border-emerald-200 pr-4 text-left">

                <p className="text-[10px] text-slate-400">
                  آخر تحديث
                </p>

                <p
                  dir="ltr"
                  className="mt-0.5 text-xs font-semibold text-slate-600"
                >
                  {lastUpdate
                    ? lastUpdate.toLocaleTimeString("en-US", {
                        numberingSystem: "latn",
                      })
                    : "--:--"}
                </p>

              </div>

            </div>

          </div>
        </header>

        {/* ================= STATS ================= */}
        <section className="mb-7 grid gap-4 sm:grid-cols-3">

          {/* Total */}
          <StatCard
            title="إجمالي الرسائل"
            value={loading ? "—" : data?.stats.total ?? 0}
            icon="✉"
            gradient="from-purple-600 to-violet-500"
            light="bg-purple-50"
          />

          {/* Pending */}
          <StatCard
            title="قيد الانتظار"
            value={loading ? "—" : data?.stats.pending ?? 0}
            icon="◷"
            gradient="from-violet-600 to-fuchsia-500"
            light="bg-violet-50"
          />

          {/* Delivered */}
          <StatCard
            title="تم السحب"
            value={loading ? "—" : data?.stats.delivered ?? 0}
            icon="✓"
            gradient="from-fuchsia-600 to-purple-500"
            light="bg-fuchsia-50"
          />

        </section>

        {/* ================= MESSAGES ================= */}
        <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">

          {/* Toolbar */}
          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-purple-600">
                    ✉
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      الرسائل الواردة
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      جميع الرسائل المستلمة من النظام
                    </p>
                  </div>

                </div>

              </div>

              <div className="flex w-full gap-2 sm:w-auto">

                {/* Search */}
                <div className="relative flex-1 sm:w-[320px]">

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ⌕
                  </span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث برقم الجوال أو محتوى الرسالة"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-50"
                  />

                </div>

                {/* Refresh */}
                <button
                  onClick={loadMessages}
                  className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-purple-300 active:translate-y-0"
                >
                  <span>↻</span>
                  تحديث
                </button>

              </div>

            </div>

          </div>

          {/* Message List */}
          <div className="divide-y divide-slate-100">

            {loading && (
              <div className="p-20 text-center">

                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-purple-100 border-t-purple-600" />

                <p className="text-sm font-medium text-slate-400">
                  جاري تحميل الرسائل...
                </p>

              </div>
            )}

            {!loading && filteredMessages.length === 0 && (
              <div className="p-20 text-center">

                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-purple-50 to-fuchsia-50 text-3xl">
                  📨
                </div>

                <h3 className="font-bold text-slate-700">
                  لا توجد رسائل
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {search
                    ? "لم يتم العثور على رسالة مطابقة للبحث"
                    : "ستظهر الرسائل هنا عند وصولها"}
                </p>

              </div>
            )}

            {filteredMessages.map((item) => (
              <MessageRow
                key={item.id}
                item={item}
                formatDate={formatDate}
              />
            ))}

          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center">

          <div className="mx-auto mb-4 h-px max-w-xs bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

          <p className="text-xs font-bold text-purple-500">
            OTP منظومة الوادي
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            نظام إدارة واستقبال رموز التحقق
          </p>

        </footer>

      </div>
    </main>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  icon,
  gradient,
  light,
}: {
  title: string;
  value: number | string;
  icon: string;
  gradient: string;
  light: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(91,33,182,0.10)]">

      <div className={`absolute -left-10 -top-10 h-32 w-32 rounded-full ${light} opacity-70 blur-3xl`} />

      <div className="relative flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
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
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl font-bold text-white shadow-lg`}
        >
          {icon}
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

/* ================= MESSAGE ROW ================= */

function MessageRow({
  item,
  formatDate,
}: {
  item: Message;
  formatDate: (timestamp: number) => string;
}) {
  const pending = item.status === "pending";

  return (
    <div className="group p-5 transition duration-200 hover:bg-purple-50/30 sm:p-6">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

        {/* Main */}
        <div className="min-w-0 flex-1">

          {/* Top */}
          <div className="mb-3 flex flex-wrap items-center gap-3">

            {/* Phone */}
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-sm">
                📱
              </div>

              <span
                dir="ltr"
                className="font-mono text-sm font-bold tracking-wide text-purple-700"
              >
                {item.phone}
              </span>

            </div>

            {/* Status */}
            {pending ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
                قيد الانتظار
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
                <span>✓</span>
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
  {/* الشريط الجانبي */}
  <div
    className={`absolute right-0 top-0 h-full w-1 ${
      pending
        ? "bg-gradient-to-b from-purple-500 to-violet-500"
        : "bg-gradient-to-b from-emerald-400 to-green-500"
    }`}
  />

  <div className="flex items-start gap-4">

    {/* أيقونة الحالة */}
    <div
      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        pending
          ? "bg-violet-100 text-violet-600"
          : "bg-emerald-100 text-emerald-600"
      }`}
    >
      {pending ? "◷" : "✓"}
    </div>

    <div className="min-w-0 flex-1">

      <div className="mb-1 flex items-center justify-between gap-3">

        <span
          className={`text-[10px] font-bold ${
            pending
              ? "text-violet-500"
              : "text-emerald-500"
          }`}
        >
          {pending ? "رسالة بانتظار القارئ" : "تم سحب الرسالة"}
        </span>

      </div>

      <p className="break-words text-[15px] font-medium leading-8 text-slate-700">
        {item.message}
      </p>

    </div>

  </div>
</div>

        </div>

        {/* Date */}
        <div className="shrink-0 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 lg:w-[190px] lg:text-center">

          <p className="text-[10px] font-bold text-slate-400">
            وقت الاستلام
          </p>

          <p
            dir="ltr"
            className="mt-1 text-xs font-semibold text-slate-600"
          >
            {formatDate(item.createdAt)}
          </p>

          {item.deliveredAt && (
            <p className="mt-2 text-[10px] font-medium text-emerald-500">
              تم السحب بنجاح
            </p>
          )}

        </div>

      </div>

    </div>
  );
}