nomnatong-subset.woff2: the Nôm Na Tong font (v5.18, https://github.com/nomfoundation/font, MIT licence, see NomNaTong-LICENSE.txt),
cut down to the Hán / Nôm characters the game draws. Rebuild it when a new character is added:
  npm install subset-font ; subset NomNaTong-Regular.otf to the characters in index.html FONT_CHARS.
