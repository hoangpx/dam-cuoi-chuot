nomnatong-subset.woff2: the Nôm Na Tong font (v5.18, https://github.com/nomfoundation/font, MIT licence, see NomNaTong-LICENSE.txt),
cut down to the Hán / Nôm characters the game draws. Rebuild it when a new character is added:
  npm install subset-font ; subset NomNaTong-Regular.otf to the characters in index.html FONT_CHARS.

hanwangyankai-subset.woff2: HanWangYanKai (王漢宗顏楷體, (C) Dr. Hann-Tzong Wang 2002-2004, maintained by the CLE Project), GNU GPL version 2 or later
(see HanWangYanKai-GPL-2.0.txt; HanWangYanKai is a registered trademark of HtWang Graphics Laboratory). It is the first Hán/Nôm font since 2026-10-11 (owner);
the few characters it lacks (糁 𡑓 燶) fall back to Nôm Na Tong. Cut down the same way from HanWangYanKai.otf (the full font, kept by the owner) to FONT_CHARS
with subset-font; the unmodified source font is the one distributed by the CLE Project.
