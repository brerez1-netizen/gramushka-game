// התשריט של "צובעים את הגרמושקה", שיעור 15.
//
// כל התשריט מצויר ב-SVG ולא נוצר במודל תמונה. הסיבה זהה לזו שבמשחקי שיעור 10
// ו-11: מה שנושא את התשובה חייב להיות מדויק. כאן התשובה היא **איזה רכיב זה**,
// ולכן כל רכיב הוא צורה נפרדת עם מזהה משלו, ואי אפשר לטעות בגבולות שלו.
//
// שכבת הרקע (רחוב, שכנים, כיתוב) אינה ניתנת לצביעה. רק שמונת הרכיבים שברשימה.

console.log("[plan] טוען: התשריט");

window.planSvg = (function () {
  const W = 1000, H = 720;

  // הגוונים. שלושת הראשונים מעוגנים בתקנות רישוי בנייה, שניים האחרונים מוסכמה.
  const SHADES = {
    dark:   { key: "dark",   label: "גוון כהה",  hex: "#3b3b3b", note: "מעוגן בתקנה" },
    yellow: { key: "yellow", label: "צהוב",      hex: "#e0b616", note: "מעוגן בתקנה" },
    orange: { key: "orange", label: "כתום",      hex: "#d97828", note: "מעוגן בתקנה" },
    red:    { key: "red",    label: "אדום",      hex: "#c33227", note: "מוסכמה משרדית" },
    blue:   { key: "blue",   label: "כחול",      hex: "#2472ad", note: "מוסכמה משרדית" },
  };

  const BLANK = "#efe9dc";   // רכיב שטרם נצבע
  const INK = "#2a2118";

  /** הרכיבים לצביעה. d הוא הצורה, hit היא אזור ההקשה כשהצורה דקה מדי לאצבע. */
  const PARTS = [
    {
      id: "existing",
      label: "קירות הבית הקיים",
      short: "קירות קיימים",
      shape: '<path d="M240 330 h420 v230 h-420 z M268 358 h364 v174 h-364 z" fill-rule="evenodd"/>',
      tag: [450, 300],
    },
    {
      id: "addition",
      label: "תוספת חדר מבוקשת",
      short: "תוספת חדר",
      shape: '<rect x="660" y="384" width="148" height="132"/>',
      tag: [800, 356],
    },
    {
      id: "demolish",
      label: "מחיצה פנימית שנהרסת",
      short: "מחיצה להריסה",
      shape: '<rect x="424" y="358" width="16" height="174"/>',
      hit: '<rect x="404" y="358" width="56" height="174"/>',
      tag: [560, 614],
    },
    {
      id: "asbestos",
      label: "גג האסבסט של המחסן, לפירוק",
      short: "גג אסבסט",
      shape: '<rect x="120" y="120" width="130" height="112"/>',
      tag: [190, 100],
    },
    {
      id: "pergola",
      label: "פרגולה מבוקשת בחצר",
      short: "פרגולה",
      shape: '<path d="M330 150 h210 v112 h-210 z" /><path d="M330 178 h210 M330 206 h210 M330 234 h210 M372 150 v112 M414 150 v112 M456 150 v112 M498 150 v112" stroke-width="4"/>',
      tag: [435, 134],
    },
    {
      id: "window",
      label: "חלון חדש שנפתח בקיר קיים",
      short: "חלון חדש",
      shape: '<rect x="330" y="532" width="92" height="28"/>',
      hit: '<rect x="322" y="520" width="108" height="52"/>',
      tag: [250, 614],
    },
    {
      id: "stairs",
      label: "מדרגות חוץ קיימות שנשארות",
      short: "מדרגות",
      shape: '<path d="M700 566 h90 v13 h-90 z M700 583 h90 v13 h-90 z M700 600 h90 v13 h-90 z"/>',
      tag: [848, 543],
    },
    {
      id: "boundary",
      label: "גבול המגרש",
      short: "גבול המגרש",
      shape: '<path d="M60 40 h880 v600 h-880 z M74 54 h852 v572 h-852 z" fill-rule="evenodd"/>',
      hit: '<path d="M46 26 h908 v628 h-908 z M88 68 h824 v544 h-824 z" fill-rule="evenodd"/>',
      tag: [500, 26],
    },
  ];

  /** רקע קבוע: רחוב, מגרשים שכנים ושושנת רוחות. לא ניתן לצביעה. */
  function backdrop() {
    return (
      '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#f6f2e8"/>' +
      '<rect x="0" y="654" width="' + W + '" height="66" fill="#ded7c7"/>' +
      '<line x1="0" y1="686" x2="' + W + '" y2="686" stroke="#fff" stroke-width="3" stroke-dasharray="26 22"/>' +
      '<text x="500" y="702" fill="#6b6255" font-size="20" text-anchor="middle" ' +
      'font-family="Heebo, Arial, sans-serif" direction="rtl">רחוב</text>' +
      // שבילים וחצר, רקע בלבד
      '<rect x="716" y="613" width="58" height="41" fill="#e6dfd0"/>' +
      '<circle cx="840" cy="180" r="26" fill="#c3cdb0"/>' +
      '<circle cx="880" cy="250" r="18" fill="#c3cdb0"/>' +
      '<text x="128" y="640" fill="#8d8577" font-size="22" text-anchor="start" ' +
      'font-family="Heebo, Arial, sans-serif" direction="rtl">צפון למעלה</text>'
    );
  }

  /** בונה את ה-SVG. colors הוא מיפוי id לגוון שנבחר, או ריק. */
  function render(colors, selectedId) {
    let out = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="plan" role="img" ' +
      'aria-label="תשריט הגשה: בית קיים, תוספת מבוקשת, מחסן, פרגולה וגבול מגרש">';
    out += backdrop();
    for (const p of PARTS) {
      const shade = colors[p.id] ? SHADES[colors[p.id]].hex : BLANK;
      const on = p.id === selectedId;
      out += '<g class="part' + (on ? ' sel' : '') + '" data-part="' + p.id + '" ' +
        'fill="' + shade + '" stroke="' + INK + '" stroke-width="3">' + p.shape + '</g>';
      if (p.hit) {
        out += '<g class="hit" data-part="' + p.id + '" fill="transparent" stroke="none">' + p.hit + '</g>';
      }
      // הכיתוב על השרטוט: מספר ושם קצר. בלעדיו צריך לנוע הלוך ושוב בין
      // הציור לרשימה כדי לדעת מה כל צורה.
      out += '<text class="ptag" data-part="' + p.id + '" x="' + p.tag[0] + '" y="' + p.tag[1] +
        '" font-size="30" font-weight="700" text-anchor="middle" fill="' + INK + '" ' +
        'font-family="Heebo, Arial, sans-serif" direction="rtl" paint-order="stroke" ' +
        'stroke="#f6f2e8" stroke-width="8">' + (PARTS.indexOf(p) + 1) + '. ' + p.short + '</text>';
    }
    out += '</svg>';
    return out;
  }

  return { PARTS, SHADES, render, W, H };
})();

console.log("[plan] " + window.planSvg.PARTS.length + " רכיבים לצביעה");
