// عکس‌ها فعال‌اند؛ فایل ناموجود خودکار پنهان می‌شود. نام فایل‌ها و ابعاد در originals/IMAGES.md آمده است.
const PHOTOS = { enabled: true, dir: 'assets/photos/', cards: true };  // cards: عکس روی کارت نوشیدنی‌ها و نوشیدنی‌های ویژه؛ false = ظاهر قبلی (فقط آیکون)
// اعتبار عکس‌ها (پس از افزودن عکس‌های مجوزدار پر شود): { 'drink-24.png': ['نام صاحب', 'مجوز', 'لینک صفحه'] }
const PHOTO_CREDITS = {};
function photoHtml(file, cls){
  if (!PHOTOS.enabled) return '';
  return `<figure class="photo ${cls || ''}"><img src="${PHOTOS.dir}${file}" alt="" loading="lazy" onerror="this.closest('figure').remove()"></figure>`;
}

// عکس کارت: اگر فایل نباشد، کارت به حالت آیکون برمی‌گردد
function cardPhotoHtml(id, cls){
  if (!PHOTOS.enabled || !PHOTOS.cards) return '';
  return `<figure class="card-photo ${cls || ''}"><img src="${PHOTOS.dir}drink-${id}.png" alt="" loading="lazy" onerror="var c=this.closest('[data-open]');if(c)c.classList.remove('has-photo');this.closest('figure').remove()"></figure>`;
}
const cardHasPhoto = () => PHOTOS.enabled && PHOTOS.cards;
