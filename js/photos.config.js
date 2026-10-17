// عکس‌ها فعال‌اند؛ فایل ناموجود خودکار پنهان می‌شود. نام فایل‌ها و ابعاد در originals/IMAGES.md آمده است.
const PHOTOS = { enabled: true, dir: 'assets/photos/' };
// اعتبار عکس‌ها (پس از افزودن عکس‌های مجوزدار پر شود): { 'drink-24.png': ['نام صاحب', 'مجوز', 'لینک صفحه'] }
const PHOTO_CREDITS = {};
function photoHtml(file, cls){
  if (!PHOTOS.enabled) return '';
  return `<figure class="photo ${cls || ''}"><img src="${PHOTOS.dir}${file}" alt="" loading="lazy" onerror="this.closest('figure').remove()"></figure>`;
}
