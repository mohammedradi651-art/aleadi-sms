import { getDb } from "@/lib/firebase-admin";
import { isReaderConnected, pushMessageToReaders, pushUpdateToDashboards, MessageType, isMaintenanceMode } from "@/lib/server-state";
import { NextResponse } from "next/server";

// مفتاح API المسموح للمرسل
const API_KEY = "ALWADI-OTP-771176611";

// مدة الحفظ: شهر كامل
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    // =====================================================
    // حماية الإرسال وصيانة النظام
    // =====================================================

    if (isMaintenanceMode()) {
      const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحت الصيانة</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #ffffff;
        }
        .glass-container {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px 30px;
            text-align: center;
            max-width: 90%;
            width: 400px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.8s ease-out forwards;
        }
        .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: rgba(239, 68, 68, 0.15);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ef4444;
            animation: pulse 2s infinite;
        }
        .icon svg {
            width: 40px;
            height: 40px;
        }
        h1 {
            font-size: 24px;
            margin-bottom: 12px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 15px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 0;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
    </style>
</head>
<body>
    <div class="glass-container">
        <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.83M11.42 15.17l-3.976-3.976m3.976 3.976l-1.414 1.414a1.5 1.5 0 01-2.122 0l-5.656-5.656a1.5 1.5 0 010-2.122l1.414-1.414m11.314 0l-3.976 3.976m-3.976-3.976l1.414-1.414a1.5 1.5 0 012.122 0l5.656 5.656a1.5 1.5 0 010 2.122l-1.414 1.414" />
            </svg>
        </div>
        <h1>نظام تحت الصيانة</h1>
        <p>نعتذر، التطبيق حالياً تحت الصيانة وسيعود للعمل قريباً. نشكركم على صبركم وتفهمكم.</p>
    </div>
</body>
</html>
      `;

      return new NextResponse(htmlContent, {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const apiKey = request.headers.get("x-api-key");

    if (apiKey !== API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // =====================================================
    // قراءة الطلب
    // =====================================================

    const body = await request.json();

    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "phone and message are required",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // إنشاء الرسالة في Firestore ودفعها عبر SSE إن أمكن
    // =====================================================

    const db = getDb();
    const now = Date.now();
    const expiresAt = now + ONE_MONTH_MS;

    const readerConnected = isReaderConnected();
    const status = "pending";
    const deliveredAt = null;

    const docRef = await db.collection("messages").add({
      phone: String(phone),
      message: String(message),
      createdAt: now,
      expiresAt,
      status,
      deliveredAt,
    });

    const data: MessageType = {
      id: docRef.id,
      phone: String(phone),
      message: String(message),
      createdAt: now,
      status,
      deliveredAt: deliveredAt ?? undefined,
    };

    // دفع مباشر للقارئ عبر SSE
    if (readerConnected) {
      pushMessageToReaders({ ...data, type: "NEW_MESSAGE" } as any);
    }
    
    // إشعار اللوحة بالرسالة الجديدة
    pushUpdateToDashboards({ type: "NEW_MESSAGE", message: data });

    // =====================================================
    // نجاح
    // =====================================================

    return NextResponse.json({
      success: true,
      message: "Message received",
      data,
    });
  } catch (error) {
    console.error("MESSAGE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}