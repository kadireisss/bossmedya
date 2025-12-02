Bossmedya Realtime Analytics (Vercel)
=====================================

- /api/track  : Ziyaretçi takibi ve online sayaç
- /api/stats  : Admin paneli için JSON istatistik
- /public/widget.js : Sitenize ekleyeceğiniz online sayaç widget
- /public/admin.html : Grafikli admin panel

Kurulum:
1. Bu projeyi GitHub'a yükleyip Vercel'e import et.
2. Environment Variables:
   - KV_REST_API_URL
   - KV_REST_API_TOKEN
   - KV_REST_API_READ_ONLY_TOKEN
   - ADMIN_KEY  (panel şifresi)

3. Sitenizin HTML'ine (takip edilmesini istediğiniz her site):
   <script src="https://bossmedya.vercel.app/widget.js" async></script>

4. Panele erişim:
   https://bossmedya.vercel.app/admin.html?key=ADMIN_KEY
