/* Chương II · Chữ Là Luật 字即法 — vocabulary and the 14 maps (8 Nhập môn + 6 Cao thủ). */
/* ================= Chương II: Chữ Là Luật (rules-as-words puzzle) ================= */
const C2K = {
  mouse: { han: '鼠', vi: 'CHUỘT' }, cat: { han: '貓', vi: 'MÈO' }, wall: { han: '牆', vi: 'TƯỜNG' }, water: { han: '水', vi: 'NƯỚC' },
  fire: { han: '火', vi: 'LỬA' }, fish: { han: '魚', vi: 'CÁ' }, gate: { han: '門', vi: 'CỔNG' }, hay: { han: '草', vi: 'RƠM' }, jar: { han: '缸', vi: 'CHUM' },
};
const C2P = { you: { han: '行', vi: 'ĐI' }, push: { han: '推', vi: 'ĐẨY' }, stop: { han: '止', vi: 'CHẶN' }, sink: { han: '沉', vi: 'CHÌM' }, hot: { han: '熱', vi: 'NÓNG' }, win: { han: '勝', vi: 'THẮNG' } };
const C2THING = { m: 'mouse', c: 'cat', w: 'wall', '~': 'water', f: 'fire', s: 'fish', g: 'gate', h: 'hay', j: 'jar' };
const C2NOUN = { M: 'mouse', C: 'cat', W: 'wall', N: 'water', F: 'fire', S: 'fish', G: 'gate', H: 'hay', J: 'jar' };
const C2PROP = { 1: 'you', 2: 'push', 3: 'stop', 4: 'sink', 5: 'hot', 6: 'win' };

/* map legend: lowercase = objects, UPPERCASE = noun words, = is "LÀ", 1..6 = ĐI ĐẨY CHẶN CHÌM NÓNG THẮNG */
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
];
const C2_FIRST_HARD = C2LEVELS.findIndex(l => l.hard);
