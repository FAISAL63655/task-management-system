# نظام إدارة المهام

نظام متكامل لإدارة المهام والموظفين مع دعم كامل للغة العربية.

## المميزات

- إدارة المهام (إنشاء، تعديل، حذف)
- إدارة الموظفين والأقسام
- نظام إشعارات متكامل
- لوحة تحكم تحليلية
- واجهة مستخدم عربية بالكامل
- نظام صلاحيات (مدير / موظف)

## المتطلبات

- Node.js v14 أو أحدث
- MongoDB
- NPM أو Yarn

## تثبيت المشروع محلياً

1. نسخ المستودع
```bash
git clone [repository-url]
cd task-management-system
```

2. تثبيت اعتماديات الخادم
```bash
cd server
npm install
```

3. تثبيت اعتماديات الواجهة
```bash
cd client
npm install
```

4. إعداد متغيرات البيئة
- نسخ ملف `.env.example` إلى `.env` في مجلد `server`
- تعديل المتغيرات حسب إعدادات بيئتك

5. تشغيل المشروع محلياً
```bash
# تشغيل الخادم
cd server
npm run dev

# تشغيل الواجهة
cd client
npm run dev
```

## نشر المشروع

### نشر الخادم (Backend)

1. إنشاء قاعدة بيانات MongoDB Atlas:
   - إنشاء حساب على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - إنشاء مشروع جديد وقاعدة بيانات
   - نسخ رابط الاتصال (URI)

2. نشر الخادم على Render:
   - إنشاء حساب على [Render](https://render.com)
   - إنشاء Web Service جديد
   - ربط المستودع
   - إضافة متغيرات البيئة:
     ```
     NODE_ENV=production
     PORT=5000
     MONGODB_URI=your_mongodb_atlas_uri
     JWT_SECRET=your_secret
     CLIENT_URL=your_frontend_url
     ```
   - النشر تلقائياً

### نشر الواجهة (Frontend)

1. نشر الواجهة على Netlify:
   - إنشاء حساب على [Netlify](https://www.netlify.com)
   - ربط المستودع
   - تعيين أوامر البناء:
     ```
     Build command: npm run build
     Publish directory: dist
     ```
   - إضافة متغيرات البيئة:
     ```
     VITE_API_URL=your_backend_url
     ```
   - النشر تلقائياً

2. تحديث عنوان الواجهة في إعدادات الخادم:
   - تحديث `CLIENT_URL` في إعدادات Render ليطابق عنوان Netlify

## الاستخدام

1. تسجيل الدخول كمدير:
   - البريد: admin@example.com
   - كلمة المرور: admin123

2. إضافة موظفين وأقسام
3. إنشاء وتوزيع المهام
4. إرسال الإشعارات

## الأمان

- استخدام JWT للمصادقة
- تشفير كلمات المرور
- حماية نقاط النهاية API
- التحقق من الصلاحيات

## الدعم

للمساعدة والاستفسارات، يرجى فتح issue في المستودع.
