/** Транслитерация заголовка услуги в URL-slug (латиница и дефисы). */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const MAX_SLUG_LENGTH = 80;

export function slugifyTitle(title: string): string {
  const lowered = title.trim().toLowerCase();
  let slug = "";

  for (const char of lowered) {
    if (CYRILLIC_TO_LATIN[char] !== undefined) {
      slug += CYRILLIC_TO_LATIN[char];
      continue;
    }

    if (/[a-z0-9]/.test(char)) {
      slug += char;
      continue;
    }

    if (/[\s._/\\]+/.test(char) || char === "-") {
      slug += "-";
    }
  }

  slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (slug.length > MAX_SLUG_LENGTH) {
    slug = slug.slice(0, MAX_SLUG_LENGTH).replace(/-$/, "");
  }

  return slug || "usluga";
}
