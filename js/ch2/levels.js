/* Chương II · Chữ Là Luật 字即法 — vocabulary and the 14 maps (8 Nhập môn + 6 Cao thủ). */
/* ================= Chương II: Chữ Là Luật (rules-as-words puzzle) ================= */
const C2K = {
  mouse: { han: '鼠', vi: 'CHUỘT' }, cat: { han: '貓', vi: 'MÈO' }, wall: { han: '牆', vi: 'TƯỜNG' }, water: { han: '水', vi: 'NƯỚC' },
  fire: { han: '火', vi: 'LỬA' }, fish: { han: '魚', vi: 'CÁ' }, gate: { han: '門', vi: 'CỔNG' }, hay: { han: '草', vi: 'RƠM' }, jar: { han: '缸', vi: 'CHUM' },
  key: { han: '鑰', vi: 'CHÌA' }, door: { han: '戶', vi: 'CỬA' }, rock: { han: '石', vi: 'ĐÁ' }, cloud: { han: '雲', vi: 'MÂY' }, text: { han: '字', vi: 'CHỮ' },
};
const C2P = { you: { han: '行', vi: 'ĐI' }, push: { han: '推', vi: 'ĐẨY' }, stop: { han: '止', vi: 'CHẶN' }, sink: { han: '沉', vi: 'CHÌM' }, hot: { han: '熱', vi: 'NÓNG' }, win: { han: '勝', vi: 'THẮNG' },
  open: { han: '開', vi: 'MỞ' }, shut: { han: '鎖', vi: 'KHOÁ' }, float: { han: '飛', vi: 'BAY' }, pull: { han: '拉', vi: 'KÉO' }, move: { han: '走', vi: 'CHẠY' }, weak: { han: '弱', vi: 'YẾU' } };
// the little words between: LÀ, VÀ, KHÔNG, CÓ
const C2OPS = { is: { han: '是', vi: 'LÀ' }, and: { han: '和', vi: 'VÀ' }, not: { han: '不', vi: 'KHÔNG' }, has: { han: '有', vi: 'CÓ' } };
const C2THING = { m: 'mouse', c: 'cat', w: 'wall', '~': 'water', f: 'fire', s: 'fish', g: 'gate', h: 'hay', j: 'jar', k: 'key', d: 'door', r: 'rock', o: 'cloud' };
const C2NOUN = { M: 'mouse', C: 'cat', W: 'wall', N: 'water', F: 'fire', S: 'fish', G: 'gate', H: 'hay', J: 'jar', K: 'key', D: 'door', R: 'rock', O: 'cloud', T: 'text' };
const C2PROP = { 1: 'you', 2: 'push', 3: 'stop', 4: 'sink', 5: 'hot', 6: 'win', 7: 'open', 8: 'shut', 9: 'float', '<': 'pull', '^': 'move', '!': 'weak' };
const C2OP = { '=': 'is', '&': 'and', '-': 'not', '+': 'has' };

/* map legend: lowercase = objects (k chìa, d cửa, r đá, o mây too), UPPERCASE = noun words (T = CHỮ), = LÀ, & VÀ, - KHÔNG, + CÓ,
   1..9 = ĐI ĐẨY CHẶN CHÌM NÓNG THẮNG MỞ KHOÁ BAY, < KÉO, ^ CHẠY, ! YẾU. dirs: [[x, y, 'L']] faces a thing (CHẠY). */
const C2LEVELS = [
  {
    han: '尋門', name: 'Tìm cổng', paper: 'yellow', key: 0,
    hint: "CHUỘT LÀ ĐI nên chuột đi được, nhưng cổng chưa phải đích vì ba chữ CỔNG, LÀ, THẮNG còn nằm rải rác. Đẩy chúng thành một hàng để ghép CỔNG LÀ THẮNG, rồi đưa chuột tới cổng.",
    map: ["..........",".W=3ww..w.",".w..w..w..","..wM=1.w..",".w..w...w.",".m.wG.6=g.",".........."],
    fixed: [],
  },
  {
    han: '拼字', name: 'Ghép chữ', paper: 'pink', key: 2,
    hint: "Ghép lại CỔNG LÀ THẮNG, lần này có tường cản. Tính trước đường đẩy: đẩy nhầm một chữ vào góc là phải hoàn tác (Z).",
    map: ["..........",".W=3G...g.","..w.wwww..",".w.wM=1.w.",".w.w.ww.m.","...ww.w6=.",".........."],
    fixed: [],
  },
  {
    han: '破律', name: 'Phá luật', paper: 'blue', key: -3,
    hint: "Cổng bị tường vây kín vì TƯỜNG LÀ CHẶN. Tách một chữ ra khỏi câu đó thì tường thành vật đi xuyên qua được, nhưng câu luật nằm ở chỗ khó với tới.",
    map: ["..........",".w...=www.","..wG..wgw.","..wM..www.",".m.=.W=36.","..w1.www..",".........."],
    fixed: [],
  },
  {
    han: '我勝', name: 'Ta là thắng', paper: 'white', key: 0,
    hint: "Cổng bị vây bởi tường không phá được (chữ có đinh ghim ở góc). Đổi đích: nếu ghép được CHUỘT LÀ THẮNG thì chính con chuột là đích.",
    map: ["..........","....m.www.",".6....wgw.",".w.M.wwww.","..M=1..w..",".=G.....=.","W=3......."],
    fixed: [[0,6],[1,6],[2,6]],
  },
  {
    han: '變形', name: 'Biến hình', paper: 'sage', key: -2,
    hint: "Mèo rất nóng, chạm vào là chết (MÈO LÀ NÓNG). Nếu ghép được MÈO LÀ CÁ thì mèo hóa cá, đi qua thoải mái.",
    map: ["...=.w....","m.C.Gw....","M=1.ww....","w.S=.c...g","w...6w....",".....w....","C=5..wW=3."],
    fixed: [[0,6],[1,6],[2,6],[6,6],[7,6],[8,6]],
  },
  {
    han: '沉水', name: 'Chìm', paper: 'lilac', key: -1,
    hint: "Nước là CHÌM: thứ gì rơi xuống nước thì cả hai cùng biến mất. Chum chỉ đẩy được khi có luật CHUM LÀ ĐẨY.",
    map: ["w=ww6~....","wwJMm~....","ww2==~..g.","w..1.~....","w..wG~....","jw.w.~....",".....~N=4."],
    fixed: [[6,6],[7,6],[8,6]],
  },
  {
    han: '火門', name: 'Lửa thành cổng', paper: 'pink', key: 2,
    hint: "Lửa cháy rực chắn đường (LỬA LÀ NÓNG). Nếu ghép được LỬA LÀ CỔNG thì mọi ngọn lửa hóa thành cổng, chạm vào là thắng.",
    map: ["Gw...f....","ww..mf....","=F...f..g.",".w..Mf....","6www=f....",".=..1f....",".....fF=5."],
    fixed: [[6,6],[7,6],[8,6]],
  },
  {
    han: '全圖', name: 'Trọn bức tranh', paper: 'yellow', key: 0,
    hint: "Bức cuối phần Nhập môn: chìm nước và biến hình, cùng với nghệ thuật đẩy chữ.",
    map: [".G.~wwww...","=S.~jw.w...",".=J~M=1w...","...~C.wc..g","w..~m=.w...","w..~2.6w...","N=4~C=5wW=3"],
    fixed: [[0,6],[1,6],[2,6],[4,6],[5,6],[6,6],[8,6],[9,6],[10,6]],
  },
  {
    han: "推牆", name: "Tường đẩy được", paper: "sage", key: -2, hard: true,
    riddle: "Tường chặn thì đã sao? Thứ gì chặn đường cũng có lúc phải nhường.",
    hint: "Ghép dọc TƯỜNG / LÀ / ĐẨY ngay dưới chữ TƯỜNG cố định. Tường vẫn chặn, nhưng đẩy được, nên xô tường ra khỏi cổng.",
    map: ["M=1.....W=3",".........w.",".=..w.2....",".w...wwwwww","w..w.wwgwww",".m.wwwwwwww",".......G=6."],
    fixed: [[0,0],[1,0],[2,0],[8,0],[9,0],[10,0],[7,6],[8,6],[9,6]],
  },
  {
    han: "借還", name: "Mượn tạm", paper: "pink", key: 2, hard: true,
    riddle: "Cổng bị tường vây kín. Có mượn thì phải có trả.",
    hint: "Mượn chữ CỔNG và LÀ để ghép dọc TƯỜNG LÀ CỔNG: mọi bức tường hóa thành cổng, và vẫn là cổng dù luật mất. Rồi trả hai chữ về để ghép lại CỔNG LÀ THẮNG.",
    map: ["ww.W=3ww","ww...m.w","w.G..w.w","w6.=..ww","w...w..w","wM=1.wgw","wwwwwwww"],
    fixed: [[3,0],[4,0],[5,0],[1,5],[2,5],[3,5]],
  },
  {
    han: "水火", name: "Nước dập lửa", paper: "blue", key: -3, hard: true,
    riddle: "Nước lấy đâu mà dập lửa? Nước ở ngay đó thôi, chỉ là chưa chịu đi.",
    hint: "Ghép dọc NƯỚC / LÀ / ĐẨY dưới chữ NƯỚC cố định, rồi đẩy một ô nước vào ô lửa. Thứ gì rơi vào chỗ CHÌM cũng biến mất cùng nó.",
    map: ["N=4...~f..","w...2w~f..",".m.www~f.g","...w=.~f..",".w...w~f..","F=5M=1~f..","G=6...~f.."],
    fixed: [[0,0],[1,0],[2,0],[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[0,6],[1,6],[2,6]],
  },
  {
    han: "自焚", name: "Lửa tự thiêu", paper: "white", key: 0, hard: true,
    riddle: "Lửa nóng đến mức đốt cả chính mình, nếu nó chịu làm chủ.",
    hint: "Ghép dọc LỬA / LÀ / ĐI ngay trên chữ ĐI cố định. Lửa vừa là mình vừa NÓNG nên tự thiêu rụi. (Ghép LỬA LÀ CHUỘT cũng là một cách.)",
    map: ["...w..f...","w.F...f...","..w...f.g.","m..=w.f...","..w...f...","M=1F=5f...","G=6W=3fwww"],
    fixed: [[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6]],
  },
  {
    han: "渡河", name: "Qua sông", paper: "lilac", key: -1, hard: true,
    riddle: "Qua sông phải bỏ lại một thứ, mà thứ nào cũng đang cần.",
    hint: "Dựng CỔNG LÀ THẮNG theo chiều dọc, dùng chung chữ LÀ của CHUỘT LÀ ĐI. Chữ LÀ dư ra đem thả xuống sông: chữ cũng chìm được.",
    map: ["......~.",".w....~.",".M=1..~g",".w....~.","...G..~.",".m.=6.~.","W=3...~.","N=4...~."],
    fixed: [[0,6],[1,6],[2,6],[0,7],[1,7],[2,7],[1,2],[2,2],[3,2]],
  },
  {
    han: "雙身", name: "Hai thân", paper: "yellow", key: 0, hard: true,
    riddle: "Chuột bị nhốt trong hộp, nhưng con cá ngoài kia thì tự do.",
    hint: "Xếp CÁ LÀ ĐI trong chiếc hộp chật để con cá ngoài kia cũng thành mình. Chữ vào góc là không kéo ra được nữa, nên tính trước từng nước đẩy.",
    map: ["wwwwwww.....","w.ww..w..s..","w.1S.mw.....","w.=w..w.w.w.","w.....w.wgw.","wwwwwww.www.","M=1...W=3G=6"],
    fixed: [[0,6],[1,6],[2,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6]],
  },
  /* ---- Biến hoá (owner: more words, after Baba Is You); every map checked by tools/c2-solve.js ---- */
  {
    han: "開門", name: "Chìa mở cửa", paper: "yellow", key: 0, bh: true,
    hint: "CỬA LÀ KHOÁ: cửa chặn mọi thứ, trừ thứ MỞ. Ghép CHÌA LÀ MỞ rồi đẩy chìa vào cửa: chìa và cửa cùng mất.",
    map: ["M=1.....W=3.", "K=2.....D=8.", "G=6.........", ".K=....wwwww", ".....7.w...w", ".mk....d.g.w", ".......wwwww"],
    fixed: [[0, 0], [1, 0], [2, 0], [8, 0], [9, 0], [10, 0], [0, 1], [1, 1], [2, 1], [8, 1], [9, 1], [10, 1], [0, 2], [1, 2], [2, 2]],
  },
  {
    han: "破缸", name: "Vò vỡ", paper: "pink", key: 2, bh: true,
    hint: "CHUM CÓ CHÌA: chum mất đi thì để lại chìa. Đổi CHUM LÀ CHẶN thành CHUM LÀ YẾU, rồi bước vào chum cho vỡ.",
    map: ["M=1...W=3...", "G=6...D=8...", "K=7&2.J+K...", "............", "J=3....wwwww", "..!....w...w", ".m..j..d.g.w", ".......wwwww"],
    fixed: [[0, 0], [1, 0], [2, 0], [6, 0], [7, 0], [8, 0], [0, 1], [1, 1], [2, 1], [6, 1], [7, 1], [8, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [6, 2], [7, 2], [8, 2]],
  },
  {
    han: "拉石", name: "Kéo đá", paper: "blue", key: -3, bh: true,
    hint: "Đá CHẶN nên không đẩy được. Ghép thêm ĐÁ LÀ KÉO: đứng sát đá rồi bước đi, đá lẽo đẽo theo sau, ngõ sẽ trống.",
    map: ["M=1....G=6", "W=3...R=3.", "..........", ".R..=..www", ".m..<..rrg", ".......www"],
    fixed: [[0, 0], [1, 0], [2, 0], [7, 0], [8, 0], [9, 0], [0, 1], [1, 1], [2, 1], [6, 1], [7, 1], [8, 1]],
  },
  {
    han: "拉字", name: "Chữ kéo", paper: "white", key: 0, bh: true,
    hint: "Chữ nằm trong góc thì không đẩy ra được. Nhưng CHỮ LÀ KÉO: đứng cạnh chữ rồi bước ra xa là chữ đi theo.",
    map: ["G.......6", ".........", ".........", ".....g...", ".........", ".m.......", "=..T=<M=1"],
    fixed: [[3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6]],
  },
  {
    han: "不止", name: "Không chặn", paper: "sage", key: -2, bh: true,
    hint: "TƯỜNG LÀ CHẶN bị ghim cứng. Xếp dọc TƯỜNG / LÀ / KHÔNG ngay trên chữ CHẶN ấy: TƯỜNG LÀ KHÔNG CHẶN thắng luật cũ.",
    map: ["G=6.......", ".....W....", "M...=..www", "=......wgw", "1.m....www", "....-.....", "...W=3...."],
    fixed: [[0, 0], [1, 0], [2, 0], [0, 2], [0, 3], [0, 4], [3, 6], [4, 6], [5, 6]],
  },
  {
    han: "貓推", name: "Mèo đẩy chữ", paper: "lilac", key: -1, bh: true,
    hint: "Chữ THẮNG nằm trong hộp của mèo, chuột không vào được. Ghép MÈO LÀ CHẠY: mèo tự đi và đẩy chữ hộ.",
    map: ["M=1...W=3..", ".........g.", "C........G.", ".=.wwwwww=w", "...wc.6...w", ".^.wwwwwwww", ".m........."],
    fixed: [[0, 0], [1, 0], [2, 0], [6, 0], [7, 0], [8, 0], [9, 2], [9, 3]],
  },
  {
    han: "有門", name: "Lửa có cổng", paper: "pink", key: 2, bh: true,
    hint: "Chẳng có cổng nào, nhưng LỬA CÓ CỔNG: lửa mất đi thì hiện ra cổng. Ghép LỬA LÀ YẾU rồi đẩy chum vào lửa.",
    map: ["M=1..F+G..", "G=6..F=5..", "..........", "J=2....fff", ".m.j...f.f", "....!..fff", "F=........"],
    fixed: [[0, 0], [1, 0], [2, 0], [5, 0], [6, 0], [7, 0], [0, 1], [1, 1], [2, 1], [5, 1], [6, 1], [7, 1], [0, 3], [1, 3], [2, 3]],
  },
  {
    han: "生鑰", name: "Chìa đẻ chìa", paper: "yellow", key: 0, bh: true,
    hint: "Ba lớp cửa mà chỉ một chìa. Ghép CHÌA CÓ CHÌA trước đã: mỗi lần chìa mở một cửa lại để lại một chìa mới.",
    map: ["M=1...W=3....", "G=6...D=8....", "K=7&2........", "wwwwwwwwwwwww", "..k..d.d.d.g.", "..wwwwwwwwwww", ".m..K......K.", ".......+.....", "............."],
    fixed: [[0, 0], [1, 0], [2, 0], [6, 0], [7, 0], [8, 0], [0, 1], [1, 1], [2, 1], [6, 1], [7, 1], [8, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
  },
  {
    han: "飛河", name: "Bay qua sông", paper: "blue", key: -3, bh: true,
    hint: "CHUỘT LÀ BAY thì qua được sông, nhưng thứ BAY chỉ chạm được thứ cũng BAY: cổng cũng phải bay. Ghép CHUỘT VÀ CỔNG LÀ BAY.",
    map: ["M=1...~~~~....", "N=4...~~~~....", "G=6...~~~~..g.", "..9...~~~~....", ".m.=..~~~~....", "M&..G.~~~~....", "......~~~~...."],
    fixed: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2], [0, 5], [1, 5]],
  },
  {
    han: "石橋", name: "Bắc cầu đá", paper: "sage", key: -2, bh: true,
    hint: "Bay qua sông, kéo đá theo sau: đá không bay nên rơi xuống nước, nước chìm theo. Lấp đủ hai ô rồi bỏ chữ BAY để vào cổng.",
    map: ["M=1...~~...", "N=4...~~...", "R=<...~~.g.", "R=3...~~...", "rr.m..~~G=6", "M=..9.~~...", "......~~..."],
    fixed: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2], [0, 3], [1, 3], [2, 3], [8, 4], [9, 4], [10, 4], [0, 5], [1, 5]],
  },
  {
    han: "字行", name: "Chữ là mình", paper: "white", key: 0, bh: true,
    hint: "CHỮ LÀ ĐI: mọi chữ cùng đi theo phím. Cho mây chặn bớt vài chữ để xếp CỔNG LÀ THẮNG, nhưng giữ câu CHỮ LÀ ĐI liền một hàng, rồi cho một chữ chạm vào cổng.",
    map: ["ooooooooooo", "o.........o", "oGT=1oo6.=o", "o..o......o", "o.........o", "o..o.g..o.o", "o.........o", "ooooooooooo", "O=3........"],
    fixed: [[0, 8], [1, 8], [2, 8]],
  },
  {
    han: "守身", name: "Chuột là chuột", paper: "lilac", key: -1, bh: true,
    hint: "Đẩy chữ CHUỘT qua ngõ hẹp là tự ghép thành CHUỘT LÀ MÈO. Ghép trước CHUỘT LÀ CHUỘT: chuột giữ nguyên là chuột, không hoá thành gì khác.",
    map: ["W=3.G=6....", "M=1...=....", "..M.m...M..", "wwwwww.wwww", ".....wMw...", ".....w.w...", "..g.......w", ".......=C.w"],
    fixed: [[0, 0], [1, 0], [2, 0], [4, 0], [5, 0], [6, 0], [0, 1], [1, 1], [2, 1], [7, 7], [8, 7]],
  },
];
// the bought hint (owner): just the chain of rules to make, map by map
const C2_CHAIN = [
  "Ghép CỔNG LÀ THẮNG → đưa chuột tới cổng",
  "Phá TƯỜNG LÀ CHẶN → ghép CỔNG LÀ THẮNG",
  "Phá TƯỜNG LÀ CHẶN → ghép TƯỜNG LÀ THẮNG",
  "Ghép CHUỘT LÀ THẮNG",
  "Ghép MÈO LÀ CÁ → ghép CÁ LÀ THẮNG",
  "Ghép CHUM LÀ THẮNG",
  "Ghép CỔNG LÀ THẮNG → ghép LỬA LÀ CHUỘT",
  "Ghép CHUM LÀ THẮNG",
  "Ghép TƯỜNG LÀ ĐẨY → xô tường khỏi cổng",
  "Ghép TƯỜNG LÀ CỔNG → phá TƯỜNG LÀ CỔNG (trả chữ về) → ghép CỔNG LÀ THẮNG",
  "Ghép NƯỚC LÀ ĐẨY → đẩy nước vào lửa",
  "Ghép LỬA LÀ CHUỘT",
  "Ghép CỔNG LÀ THẮNG → thả chữ thừa xuống sông",
  "Ghép CÁ LÀ ĐI",
  "Ghép CHÌA LÀ MỞ → đẩy chìa vào cửa",
  "Phá CHUM LÀ CHẶN → ghép CHUM LÀ YẾU → bước vào chum → đẩy chìa vào cửa",
  "Ghép ĐÁ LÀ KÉO → kéo đá ra khỏi ngõ",
  "Kéo chữ ra khỏi góc → ghép CỔNG LÀ THẮNG",
  "Ghép TƯỜNG LÀ KHÔNG CHẶN",
  "Ghép MÈO LÀ CHẠY → mèo đẩy chữ → CỔNG LÀ THẮNG",
  "Ghép LỬA LÀ YẾU → đẩy chum vào lửa → cổng hiện ra",
  "Ghép CHÌA CÓ CHÌA → đẩy chìa qua ba cửa",
  "Ghép CHUỘT VÀ CỔNG LÀ BAY → bay qua sông",
  "Ghép CHUỘT LÀ BAY → kéo hai hòn đá xuống sông → phá CHUỘT LÀ BAY",
  "Giữ CHỮ LÀ ĐI → ghép CỔNG LÀ THẮNG → cho một chữ chạm cổng",
  "Ghép CHUỘT LÀ CHUỘT → đẩy chữ CHUỘT qua ngõ",
];
const C2_FIRST_HARD = C2LEVELS.findIndex(l => l.hard);
const C2_FIRST_BH = C2LEVELS.findIndex(l => l.bh);   // Biến hoá: the Baba-style words (owner)
