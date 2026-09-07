import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

// تهيئة Firebase Admin SDK مرة واحدة فقط
function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath) {
    const absolutePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), serviceAccountPath);
    if (existsSync(absolutePath)) {
      const serviceAccount = JSON.parse(readFileSync(absolutePath, "utf8"));

      return initializeApp({
        credential: cert(serviceAccount),
      });
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK: متغيرات البيئة غير مكتملة. تأكد من وجود FIREBASE_PROJECT_ID و FIREBASE_CLIENT_EMAIL و FIREBASE_PRIVATE_KEY في ملف .env.local"
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

// الحصول على مثيل Firestore
export function getDb() {
  getFirebaseAdmin();
  return getFirestore();
}
