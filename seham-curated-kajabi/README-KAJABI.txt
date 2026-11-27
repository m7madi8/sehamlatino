SEHAM LATINO — حزمة تعديل قسم «طرق أخرى للتحرك معا» (Kajabi / السحابة)
================================================================================

المحتويات:
- snippets/curated-section-only-ar.html   — القسم فقط (عربي) للصق في كتلة HTML
- snippets/curated-section-only-en.html — القسم فقط (إنجليزي)
- snippets/curated-with-silk-ar.html    — القسم + خلفية الحرير (عربي)
- snippets/curated-with-silk-en.html    — القسم + خلفية الحرير (إنجليزي)
- css/curated-kajabi.css                — كل التنسيقات اللازمة
- js/curated-kajabi.js                  — حركة الظهور (اختياري)
- img/                                  — صور البطاقات الثلاث
- assets/decorative/                    — موجات الحرير SVG
- preview-ar.html / preview-en.html     — معاينة محلية قبل الرفع

خطوات Kajabi (مختصرة):
1. ارفعي مجلد img و assets إلى مكتبة الملفات (أو استضيفيها بنفس الروابط).
2. في صفحة الهبوط: أضيفي كتلة «Custom Code» أو «Code» والصقي محتوى
   curated-with-silk-ar.html (أو القسم فقط إن كان القماش موجوداً مسبقاً).
3. عدّلي روابط href للبطاقات (classes.html, coaching.html, gift.html)
   إلى روابط Kajabi الفعلية (دورات / صفحات / checkout).
4. عدّلي src للصور إذا استخدمتِ روابط CDN من Kajabi بدل المسارات النسبية.
5. الصقي css/curated-kajabi.css في: إعدادات الصفحة → Custom CSS
   (أو Theme → Custom CSS إن أردتِ تطبيقاً أوسع).
6. أضيفي js/curated-kajabi.js في Footer tracking / Custom script (اختياري).

الخطوط (Google Fonts — نفس الموقع):
  Tajawal + Aref Ruqaa (عربي)
  Jost + Cormorant Garamond (إنجليزي)

معاينة محلية:
  افتحي preview-ar.html أو preview-en.html من هذا المجلد عبر Live Server.

ملاحظة: هذا القسم كان داخل .closing-canvas على الموقع الأصلي؛
استخدمي نسخة with-silk إن أردتِ نفس المظهر العاجي مع موجات الحرير.
