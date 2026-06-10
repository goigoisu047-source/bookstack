import { useState, useEffect, useRef } from "react";

const BOOK_COLORS = [
  "#C4543A","#2D5A3D","#3A5A8C","#7A4A2A","#6B3A7A",
  "#A67C52","#3A7A6B","#8C5A2A","#5A3A8C","#2A6B5A",
  "#8C3A3A","#4A7A3A","#3A4A8C","#7A6B2A","#3A6B7A",
];
const PX_PER_100_PAGES = 8;
const DEFAULT_TOWER_ID = "default";

function getThickness(pages) {
  if (!pages || pages <= 0) return 6;
  return Math.max(6, Math.round((pages / 100) * PX_PER_100_PAGES));
}
function seededRand(seed, min, max) {
  const x = Math.sin(seed + 1) * 10000;
  const r = x - Math.floor(x);
  return min + r * (max - min);
}

const COMPARISONS = [
  { heightCm:5,    emoji:"📎", name:"クリップ",             desc:"約5cm" },
  { heightCm:12,   emoji:"📱", name:"スマートフォン",       desc:"約12cm" },
  { heightCm:20,   emoji:"📒", name:"A5ノート",             desc:"約20cm" },
  { heightCm:30,   emoji:"📏", name:"30cm定規",             desc:"30cm" },
  { heightCm:45,   emoji:"🎸", name:"ウクレレ",             desc:"約45cm" },
  { heightCm:60,   emoji:"🪑", name:"椅子の座面",           desc:"約60cm" },
  { heightCm:90,   emoji:"🚪", name:"ドアノブの高さ",       desc:"約90cm" },
  { heightCm:120,  emoji:"🧒", name:"小学1年生の身長",      desc:"約1.2m" },
  { heightCm:150,  emoji:"🧍", name:"平均的な女性の身長",   desc:"約1.5m" },
  { heightCm:180,  emoji:"🏀", name:"バスケットゴールの高さ", desc:"約3m（180cmは中間点）" },
  { heightCm:250,  emoji:"🦒", name:"キリン",               desc:"約2.5m" },
  { heightCm:333,  emoji:"🗼", name:"東京タワー（1/100）",  desc:"333m" },
  { heightCm:500,  emoji:"🏔️", name:"東京スカイツリー（1/127）", desc:"634m" },
  { heightCm:1000, emoji:"🏙️", name:"ビル10階建て",        desc:"約30m（1000cmは10m）" },
];
function getComparison(cm) {
  if (cm <= 0) return null;
  return COMPARISONS.reduce((b,c) => Math.abs(c.heightCm-cm)<Math.abs(b.heightCm-cm)?c:b);
}

function ComparisonBadge({ totalCm }) {
  const comp = getComparison(totalCm);
  if (!comp) return null;
  return (
    <div style={{ background:"rgba(0,0,0,0.28)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"10px 16px",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",gap:12,maxWidth:300 }}>
      <div style={{ fontSize:38,lineHeight:1,flexShrink:0 }}>{comp.emoji}</div>
      <div>
        <div style={{ fontSize:11,color:"rgba(180,150,80,0.7)",fontFamily:"'Shippori Mincho',serif",marginBottom:2 }}>現在の高さは…</div>
        <div style={{ fontSize:14,color:"#EDD9B0",fontFamily:"'Shippori Mincho',serif",lineHeight:1.4 }}>
          <strong style={{ color:"#F0C060" }}>{comp.name}</strong>くらい
        </div>
        <div style={{ fontSize:11,color:"rgba(160,130,70,0.55)",fontFamily:"'Shippori Mincho',serif",marginTop:2 }}>{comp.desc} · {totalCm}cm</div>
      </div>
    </div>
  );
}

// ---- 本の編集モーダル ----
function EditModal({ book, onSave, onClose }) {
  const [form, setForm] = useState({ title:book.title, author:book.author, pages:book.pages??""  });
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
      onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"#1A1208",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"22px 20px",width:"100%",maxWidth:340 }}>
        <div style={{ fontSize:13,color:"rgba(180,150,80,0.7)",fontFamily:"'Shippori Mincho',serif",marginBottom:14,letterSpacing:"0.05em" }}>本の情報を編集</div>
        <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
          {[
            {key:"title",placeholder:"タイトル",type:"text"},
            {key:"author",placeholder:"著者名",type:"text"},
            {key:"pages",placeholder:"ページ数",type:"number"},
          ].map(({key,placeholder,type})=>(
            <input key={key} type={type} placeholder={placeholder} value={form[key]}
              onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
              style={{ background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"9px 13px",color:"#EDD9B0",fontSize:14,fontFamily:"'Shippori Mincho',serif",width:"100%" }}
            />
          ))}
          <div style={{ display:"flex",gap:8,marginTop:4 }}>
            <button onClick={()=>onSave({...book,title:form.title.trim()||book.title,author:form.author.trim()||book.author,pages:form.pages?parseInt(form.pages):null})}
              style={{ flex:1,background:"linear-gradient(135deg,#6B3A1A,#9A5528)",border:"none",borderRadius:8,padding:"10px",color:"#F5E8C8",fontSize:13,fontFamily:"'Shippori Mincho',serif",cursor:"pointer" }}>
              保存
            </button>
            <button onClick={onClose}
              style={{ flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px",color:"rgba(180,150,90,0.7)",fontSize:13,cursor:"pointer" }}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableTop() {
  return <div style={{ width:280,height:16,background:"linear-gradient(180deg,#6B4422 0%,#4A2E10 55%,#321B08 100%)",borderRadius:"3px 3px 6px 6px",boxShadow:"0 6px 18px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,255,255,0.1)",flexShrink:0,zIndex:10,position:"relative" }} />;
}

function Book({ book, index, isNew, onRemove, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const color = BOOK_COLORS[index % BOOK_COLORS.length];
  const thick = getThickness(book.pages);
  const offsetX  = seededRand(index*2,   -10, 10);
  const widthVar = seededRand(index*2+1, -14, 14);
  return (
    <div style={{ position:"relative",display:"flex",transform:`translateX(${offsetX}px)`,marginBottom:-1,zIndex:index+10 }}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      <div title={`${book.title} / ${book.author}${book.pages?` · ${book.pages}p`:""}`}
        style={{ width:210+widthVar,height:thick,backgroundColor:color,borderRadius:"2px 2px 1px 1px",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px",
          boxShadow:["inset 0 2px 5px rgba(255,255,255,0.14)","inset 0 -2px 5px rgba(0,0,0,0.28)",hovered?"0 0 0 2px rgba(255,220,120,0.55),0 4px 14px rgba(0,0,0,0.5)":"0 2px 6px rgba(0,0,0,0.45)"].join(","),
          position:"relative",overflow:"hidden",animation:isNew?"dropIn 0.4s cubic-bezier(0.34,1.4,0.64,1)":"none",userSelect:"none",cursor:"default",transition:"box-shadow 0.15s" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"rgba(255,255,255,0.2)" }} />
        <div style={{ position:"absolute",left:9,top:0,bottom:0,width:2,background:"rgba(0,0,0,0.2)" }} />
        <div style={{ position:"absolute",left:11,top:0,bottom:0,width:1,background:"rgba(255,255,255,0.1)" }} />
        {thick>=14&&<span style={{ fontSize:Math.max(8,Math.min(12,thick*0.28)),color:"rgba(255,255,255,0.93)",fontFamily:"'Noto Serif JP',serif",fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"58%",marginLeft:10,textShadow:"0 1px 3px rgba(0,0,0,0.5)" }}>{book.title}</span>}
        {thick>=18&&<span style={{ fontSize:Math.max(7,Math.min(10,thick*0.22)),color:"rgba(255,255,255,0.58)",fontFamily:"'Noto Serif JP',serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"34%",textShadow:"0 1px 2px rgba(0,0,0,0.4)" }}>{book.author}</span>}
        <div style={{ position:"absolute",right:0,top:0,bottom:0,width:7,background:"rgba(0,0,0,0.18)" }} />
      </div>
      {/* 編集・削除ボタン */}
      {hovered && <>
        <button onClick={onEdit} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:20,height:20,borderRadius:"50%",background:"#4A7A3A",border:"none",color:"white",fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.5)",zIndex:101,lineHeight:1 }} title="編集">✎</button>
        <button onClick={onRemove} style={{ position:"absolute",right:-11,top:"50%",transform:"translateY(-50%)",width:20,height:20,borderRadius:"50%",background:"#C4543A",border:"none",color:"white",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.5)",zIndex:100,lineHeight:1 }} title="削除">✕</button>
      </>}
    </div>
  );
}

// ---- タワー詳細（スワイプ内の1ページ） ----
function TowerView({ tower, allBooks, onUpdateBooks }) {
  const [form, setForm]           = useState({ title:"",author:"",pages:"" });
  const [newId, setNewId]         = useState(null);
  const [error, setError]         = useState("");
  const [filterAuthor, setFilter] = useState(null);
  const [editingBook, setEditing] = useState(null);

  // デフォルトタワーは全タワーの本を集約（読み取り専用）
  const books = tower.id === DEFAULT_TOWER_ID ? allBooks : tower.books;
  const isDefault = tower.id === DEFAULT_TOWER_ID;

  const handleAdd = () => {
    if (!form.title.trim())  { setError("タイトルを入力してください"); return; }
    if (!form.author.trim()) { setError("著者名を入力してください");   return; }
    setError("");
    const book = { id:Date.now(), title:form.title.trim(), author:form.author.trim(), pages:form.pages?parseInt(form.pages):null };
    onUpdateBooks(tower.id, [...tower.books, book]);
    setNewId(book.id);
    setForm({ title:"",author:"",pages:"" });
    setTimeout(()=>setNewId(null),500);
  };

  const handleRemove = id => onUpdateBooks(tower.id, tower.books.filter(b=>b.id!==id));
  const handleSaveEdit = updated => {
    onUpdateBooks(tower.id, tower.books.map(b=>b.id===updated.id?updated:b));
    setEditing(null);
  };

  const authors = [...new Set(books.map(b=>b.author))].sort();
  const filtered = filterAuthor ? books.filter(b=>b.author===filterAuthor) : books;
  const totalPages = filtered.reduce((s,b)=>s+(b.pages||0),0);
  const totalCm = parseFloat((totalPages/100).toFixed(1));
  const reversed = [...filtered].reverse();

  return (
    <div style={{ width:"100%",display:"flex",flexDirection:"column",alignItems:"center" }}>
      {editingBook && <EditModal book={editingBook} onSave={handleSaveEdit} onClose={()=>setEditing(null)} />}

      {/* フォーム（デフォルトタワーは非表示） */}
      {isDefault ? (
        <div style={{ background:"rgba(0,0,0,0.15)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"14px 18px",width:"100%",marginBottom:20,textAlign:"center" }}>
          <div style={{ fontSize:12,color:"rgba(180,150,80,0.5)",fontFamily:"'Shippori Mincho',serif",lineHeight:1.7,letterSpacing:"0.04em" }}>
            すべてのタワーの本をまとめて表示しています。<br/>本を追加するには各タワーに移動してください。
          </div>
        </div>
      ) : (
        <div style={{ background:"rgba(0,0,0,0.22)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 18px",width:"100%",marginBottom:20,backdropFilter:"blur(8px)" }}>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {[
              {key:"title",placeholder:"タイトル",type:"text"},
              {key:"author",placeholder:"著者名",type:"text"},
              {key:"pages",placeholder:"ページ数",type:"number"},
            ].map(({key,placeholder,type})=>(
              <input key={key} type={type} placeholder={placeholder} value={form[key]}
                onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                onKeyDown={e=>{if(e.key==="Enter")handleAdd();}}
                style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 13px",color:"#EDD9B0",fontSize:14,fontFamily:"'Shippori Mincho',serif",width:"100%",letterSpacing:"0.04em" }}
              />
            ))}
            {error&&<div style={{ color:"#E06050",fontSize:12,fontFamily:"'Shippori Mincho',serif" }}>{error}</div>}
            <button onClick={handleAdd} style={{ background:"linear-gradient(135deg,#6B3A1A,#9A5528)",border:"none",borderRadius:8,padding:"10px",color:"#F5E8C8",fontSize:13,fontFamily:"'Shippori Mincho',serif",cursor:"pointer",letterSpacing:"0.1em",marginTop:2,boxShadow:"0 2px 10px rgba(0,0,0,0.4)" }}>
              読了として積む
            </button>
          </div>
        </div>
      )}

      {/* 著者フィルター */}
      {authors.length>1&&(
        <div style={{ width:"100%",marginBottom:14 }}>
          <div style={{ fontSize:10,color:"rgba(180,150,80,0.45)",fontFamily:"'Shippori Mincho',serif",letterSpacing:"0.1em",marginBottom:5,textTransform:"uppercase" }}>著者で絞り込む</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
            {[null,...authors].map(a=>(
              <button key={a??"__all__"} onClick={()=>setFilter(a)} style={{ background:filterAuthor===a?"rgba(160,100,40,0.6)":"rgba(255,255,255,0.05)",border:`1px solid ${filterAuthor===a?"rgba(200,140,60,0.7)":"rgba(255,255,255,0.1)"}`,borderRadius:20,padding:"4px 11px",color:filterAuthor===a?"#F0D89A":"rgba(180,150,90,0.6)",fontSize:11,cursor:"pointer",fontFamily:"'Shippori Mincho',serif" }}>
                {a??"すべて"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 比較バッジ */}
      {totalCm>0&&<div style={{ marginBottom:18,animation:"fadeSlide 0.5s ease" }}><ComparisonBadge totalCm={totalCm} /></div>}

      {/* 塔 */}
      <div style={{ display:"flex",alignItems:"flex-end",gap:14 }}>
        {totalCm>0&&(
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,marginBottom:16 }}>
            <div style={{ fontSize:20,color:"#D4A84A",fontFamily:"'Shippori Mincho',serif",lineHeight:1 }}>{totalCm}</div>
            <div style={{ fontSize:9,color:"rgba(180,150,80,0.5)" }}>cm</div>
            <div style={{ width:1,background:"rgba(180,150,80,0.2)",height:30 }} />
            <div style={{ fontSize:8,color:"rgba(160,130,70,0.45)",textAlign:"center",lineHeight:1.5,fontFamily:"'Shippori Mincho',serif" }}>積み上げ<br/>高さ</div>
          </div>
        )}
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
          {books.length===0?(
            <div style={{ color:"rgba(160,130,70,0.3)",fontSize:12,marginBottom:10,width:220,textAlign:"center",fontFamily:"'Shippori Mincho',serif" }}>ここに本が積み上がっていきます</div>
          ):filtered.length===0?(
            <div style={{ color:"rgba(160,130,70,0.3)",fontSize:12,marginBottom:10,width:220,textAlign:"center",fontFamily:"'Shippori Mincho',serif" }}>該当する本がありません</div>
          ):(
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",paddingBottom:2 }}>
              {reversed.map(book=>{
                const idx=books.findIndex(b=>b.id===book.id);
                // デフォルトタワーでは編集・削除不可
                return <Book key={book.id} book={book} index={idx} isNew={book.id===newId}
                  onRemove={isDefault?()=>{}:()=>handleRemove(book.id)}
                  onEdit={isDefault?()=>{}:()=>setEditing(book)} />;
              })}
            </div>
          )}
          <TableTop />
        </div>
      </div>

      {/* 統計 */}
      {books.length>0&&(
        <div style={{ marginTop:20,display:"flex",gap:24,fontSize:11,letterSpacing:"0.05em",color:"rgba(160,120,50,0.6)",fontFamily:"'Shippori Mincho',serif" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:20,color:"#C4A060" }}>{filtered.length}</div>
            <div>冊</div>
          </div>
          {totalPages>0&&<div style={{ textAlign:"center" }}>
            <div style={{ fontSize:20,color:"#C4A060" }}>{totalPages.toLocaleString()}</div>
            <div>総ページ</div>
          </div>}
        </div>
      )}
    </div>
  );
}

// ---- スワイプ切り替えコンテナ ----
function SwipeContainer({ towers, activeIdx, setActiveIdx, allBooks, onUpdateBooks, onRenameRequest }) {
  const startX = useRef(null);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const startY = useRef(null);
  const isHorizontal = useRef(null);

  const handleTouchStart = e => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
    isHorizontal.current = null;
  };
  const handleTouchMove = e => {
    if (!isDragging.current || startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (isHorizontal.current === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontal.current) return;
    e.preventDefault();
    setDragOffset(dx);
  };
  const handleTouchEnd = () => {
    if (isHorizontal.current && Math.abs(dragOffset) > 60) {
      if (dragOffset < 0 && activeIdx < towers.length - 1) setActiveIdx(i => i + 1);
      if (dragOffset > 0 && activeIdx > 0) setActiveIdx(i => i - 1);
    }
    setDragOffset(0);
    isDragging.current = false;
    startX.current = null;
    startY.current = null;
    isHorizontal.current = null;
  };

  // マウスドラッグ対応
  const handleMouseDown = e => { startX.current = e.clientX; isDragging.current = true; };
  const handleMouseMove = e => {
    if (!isDragging.current) return;
    setDragOffset(e.clientX - startX.current);
  };
  const handleMouseUp = () => {
    if (Math.abs(dragOffset) > 60) {
      if (dragOffset < 0 && activeIdx < towers.length - 1) setActiveIdx(i => i + 1);
      if (dragOffset > 0 && activeIdx > 0) setActiveIdx(i => i - 1);
    }
    setDragOffset(0);
    isDragging.current = false;
    startX.current = null;
  };

  return (
    <div style={{ width:"100%",maxWidth:420,overflow:"hidden" }}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div style={{ display:"flex", transform:`translateX(calc(${activeIdx * -100}% + ${dragOffset}px))`, transition: isDragging.current && Math.abs(dragOffset)>0 ? "none" : "transform 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        {towers.map((tower, i) => (
          <div key={tower.id} style={{ minWidth:"100%",padding:"0 2px" }}>
            <TowerView tower={tower} allBooks={allBooks} onUpdateBooks={onUpdateBooks} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- メインアプリ ----
const STORAGE_KEY = "readingstack-v2";
const DEFAULT_TOWER = { id: DEFAULT_TOWER_ID, name:"読書の塔", books:[], isDefault:true };

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { towers: [DEFAULT_TOWER] };
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export default function App() {
  const [towers, setTowers]     = useState(() => loadData().towers);
  const [activeIdx, setActiveIdx] = useState(0);
  const [creatingTower, setCreating] = useState(false);
  const [newTowerName, setNewTowerName] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => { saveData({ towers }); }, [towers]);

  // デフォルトタワーが常に先頭にあるよう保証
  const orderedTowers = [
    towers.find(t => t.id === DEFAULT_TOWER_ID) ?? DEFAULT_TOWER,
    ...towers.filter(t => t.id !== DEFAULT_TOWER_ID),
  ];

  // 全タワーの全本（デフォルトタワー用）
  const allBooks = towers.filter(t=>t.id!==DEFAULT_TOWER_ID).flatMap(t=>t.books);

  const createTower = () => {
    if (!newTowerName.trim()) return;
    const t = { id:Date.now().toString(), name:newTowerName.trim(), books:[], isDefault:false };
    setTowers(prev=>[...prev, t]);
    setActiveIdx(orderedTowers.length); // 新しいタワーへ
    setNewTowerName("");
    setCreating(false);
  };

  const deleteTower = (id) => {
    if (!window.confirm("このタワーを削除しますか？")) return;
    const idx = orderedTowers.findIndex(t=>t.id===id);
    setTowers(prev=>prev.filter(t=>t.id!==id));
    setActiveIdx(Math.max(0, idx-1));
  };

  const renameTower = (id) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    setTowers(prev=>prev.map(t=>t.id===id?{...t,name:renameValue.trim()}:t));
    setRenamingId(null);
  };

  const updateBooks = (towerId, books) => {
    // デフォルトタワーへの書き込みはしない
    if (towerId === DEFAULT_TOWER_ID) return;
    setTowers(prev=>prev.map(t=>t.id===towerId?{...t,books}:t));
  };

  const currentTower = orderedTowers[activeIdx] ?? orderedTowers[0];

  return (
    <div style={{ minHeight:"100vh",background:"linear-gradient(160deg,#1A1108 0%,#0E0A04 100%)",display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 64px",fontFamily:"'Noto Serif JP',Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&family=Shippori+Mincho:wght@400;600&display=swap');
        @keyframes dropIn{from{transform:translateY(-28px) scaleY(0.65);opacity:0}to{transform:translateY(0) scaleY(1);opacity:1}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        html,body{background:#0E0A04;margin:0;padding:0;}
        input::placeholder{color:rgba(180,150,100,0.4);font-family:'Shippori Mincho',serif;}
        input:focus{outline:none;border-color:#A0784A!important;}
        *{box-sizing:border-box;}
      `}</style>

      {/* ヘッダー（固定） */}
      <div style={{ width:"100%",maxWidth:420,padding:"28px 16px 0",position:"sticky",top:0,zIndex:200,background:"linear-gradient(180deg,#1A1108 80%,transparent 100%)" }}>
        <div style={{ textAlign:"center",marginBottom:14 }}>
          <div style={{ fontSize:10,letterSpacing:"0.3em",color:"rgba(180,140,80,0.5)",textTransform:"uppercase",marginBottom:4 }}>Reading Stack</div>

          {/* タワー名 + リネーム */}
          {renamingId===currentTower?.id ? (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
              <input autoFocus value={renameValue} onChange={e=>setRenameValue(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")renameTower(currentTower.id);if(e.key==="Escape")setRenamingId(null);}}
                style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"6px 12px",color:"#EDD9B0",fontSize:18,fontFamily:"'Shippori Mincho',serif",textAlign:"center",width:200 }}
              />
              <button onClick={()=>renameTower(currentTower.id)} style={{ background:"none",border:"none",color:"#C4A060",fontSize:14,cursor:"pointer" }}>✓</button>
              <button onClick={()=>setRenamingId(null)} style={{ background:"none",border:"none",color:"rgba(180,100,80,0.7)",fontSize:14,cursor:"pointer" }}>✕</button>
            </div>
          ) : (
            <div style={{ position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>
              <h1 style={{ fontSize:22,margin:0,fontWeight:400,fontFamily:"'Shippori Mincho',serif",color:"#EDD9B0",letterSpacing:"0.06em" }}>
                {currentTower?.name}
              </h1>
              {!currentTower?.isDefault && (
                <button onClick={()=>{setRenamingId(currentTower.id);setRenameValue(currentTower.name);}}
                  style={{ position:"absolute",left:"calc(100% + 6px)",background:"none",border:"none",color:"rgba(180,150,80,0.4)",fontSize:11,cursor:"pointer",padding:"2px 4px",whiteSpace:"nowrap" }} title="名前を変更">✎</button>
              )}
            </div>
          )}
          <div style={{ fontSize:11,color:"rgba(160,120,60,0.5)",marginTop:4 }}>
            {currentTower?.id===DEFAULT_TOWER_ID ? "すべてのタワーの記録" : `${currentTower?.books.length??0}冊 読了`}
          </div>
        </div>

        {/* タブ（ドット） */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:14,flexWrap:"wrap" }}>
          {orderedTowers.map((t,i)=>(
            <button key={t.id} onClick={()=>setActiveIdx(i)} style={{
              padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",
              background:activeIdx===i?"rgba(160,100,40,0.55)":"rgba(255,255,255,0.05)",
              border:`1px solid ${activeIdx===i?"rgba(200,140,60,0.6)":"rgba(255,255,255,0.08)"}`,
              color:activeIdx===i?"#F0D89A":"rgba(180,150,80,0.45)",
              fontFamily:"'Shippori Mincho',serif",letterSpacing:"0.04em",
              transition:"all 0.15s",whiteSpace:"nowrap",
            }}>{t.name}</button>
          ))}
          {/* 新タワー追加 */}
          {creatingTower ? (
            <div style={{ display:"flex",gap:4 }}>
              <input autoFocus placeholder="名前" value={newTowerName} onChange={e=>setNewTowerName(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")createTower();if(e.key==="Escape")setCreating(false);}}
                style={{ background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"4px 10px",color:"#EDD9B0",fontSize:12,fontFamily:"'Shippori Mincho',serif",width:110 }}
              />
              <button onClick={createTower} style={{ background:"rgba(160,100,40,0.5)",border:"none",borderRadius:8,padding:"4px 8px",color:"#F0D89A",fontSize:12,cursor:"pointer" }}>✓</button>
              <button onClick={()=>setCreating(false)} style={{ background:"none",border:"none",color:"rgba(180,100,80,0.6)",fontSize:14,cursor:"pointer" }}>✕</button>
            </div>
          ) : (
            <button onClick={()=>setCreating(true)} style={{ padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",background:"rgba(255,255,255,0.03)",border:"1px dashed rgba(255,255,255,0.1)",color:"rgba(180,150,80,0.35)",fontFamily:"'Shippori Mincho',serif",transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color="rgba(200,170,100,0.7)";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";}}
              onMouseLeave={e=>{e.currentTarget.style.color="rgba(180,150,80,0.35)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
              ＋
            </button>
          )}
          {/* 削除（デフォルト以外） */}
          {currentTower && !currentTower.isDefault && (
            <button onClick={()=>deleteTower(currentTower.id)} style={{ padding:"4px 8px",borderRadius:20,fontSize:11,cursor:"pointer",background:"none",border:"1px solid rgba(180,60,40,0.25)",color:"rgba(180,80,60,0.45)",fontFamily:"'Shippori Mincho',serif",transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color="rgba(220,80,60,0.8)";e.currentTarget.style.borderColor="rgba(220,80,60,0.5)";}}
              onMouseLeave={e=>{e.currentTarget.style.color="rgba(180,80,60,0.45)";e.currentTarget.style.borderColor="rgba(180,60,40,0.25)";}}>
              削除
            </button>
          )}
        </div>
      </div>

      {/* スワイプコンテナ */}
      <div style={{ width:"100%",maxWidth:420,padding:"0 16px" }}>
        <SwipeContainer
          towers={orderedTowers}
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          allBooks={allBooks}
          onUpdateBooks={updateBooks}
        />
      </div>
    </div>
  );
}
