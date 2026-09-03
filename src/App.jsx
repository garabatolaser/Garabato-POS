import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ============================================================
//  GARABATO POS v12.1  -  Sistema de gestion comercial
//  Modelo financiero:
//    clientPrice   = precio que paga el cliente final
//    promoterPrice = monto neto que entrega la promotora a tienda
//    cost          = costo de material e insumos
//    commission    = clientPrice - promoterPrice  (se queda la promotora)
//    profit        = promoterPrice - cost          (ganancia bruta tienda)
//    split 50/50 entre socios
// ============================================================

// ============================================================
//  CSS  (solo ASCII, sin caracteres especiales en JSX)
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
:root {
  --bg:#0a0a08; --s1:#111108; --s2:#1a1a10; --s3:#222218;
  --b1:#2a2a18; --b2:#343428;
  --gold:#e0c611; --gd:#8a7800;
  --teal:#11c8b8; --td:#0a6a60;
  --red:#e05555;  --rd:#6b2020;
  --grn:#2ecc71;  --grd:#1a6e3a;
  --blu:#4a9ee0;
  --txt:#f0edd8; --muted:#8a8660; --dim:#3a3820;
  --r:13px; --rsm:8px;
  --sh-sm:0 1px 4px rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.2);
  --sh-md:0 2px 10px rgba(0,0,0,.45),0 4px 20px rgba(0,0,0,.25);
  --sh-lg:0 4px 24px rgba(0,0,0,.55),0 8px 40px rgba(0,0,0,.3);
  --sh-gold:0 2px 16px rgba(224,198,17,.2),0 4px 24px rgba(0,0,0,.3);
  --lbg:#faf8f0; --ls1:#ffffff; --ls2:#f0ede4; --ls3:#e8e4d8;
  --lb1:#ede8d0; --lb2:#ddd8c0;
  --ltxt:#1a1a00; --lmuted:#8a8668; --ldim:#b8b4a0;
  --lsh-sm:0 1px 4px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04);
  --lsh-md:0 2px 10px rgba(0,0,0,.08),0 4px 20px rgba(0,0,0,.05);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--txt);min-height:100dvh;overflow-x:hidden}
button,input,select,textarea{font-family:'DM Sans',sans-serif}
.app{max-width:430px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column}

/* RESPONSIVE LAYOUT */
@media(min-width:768px){
  .app{max-width:100%;flex-direction:row;align-items:stretch}
  .topbar{display:none !important}
  .bnav{display:none !important}
  .fab{display:none !important}
  .fab-sec{display:none !important}
  .content{flex:1;padding:28px 32px 28px;overflow-y:auto;height:100dvh}
  .toast-wrap{top:20px;left:260px;transform:none}
  .overlay{align-items:center;justify-content:center}
  .sheet{border-radius:20px;max-width:560px;width:100%;max-height:90dvh;margin:auto}
  .sh-hd{display:none}
  .kanban-wrap{margin-left:0;margin-right:0;padding-left:0;padding-right:0}
  .g2{grid-template-columns:1fr 1fr 1fr 1fr}
  .inv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
}

/* SIDEBAR */
.sidebar{display:none}
@media(min-width:768px){
  .sidebar{
    display:flex;flex-direction:column;
    width:240px;min-width:240px;
    background:var(--bg);border-right:1px solid var(--b1);
    padding:0;position:sticky;top:0;height:100dvh;overflow:hidden;flex-shrink:0;
  }
  .app-light .sidebar{background:var(--ls1);border-right:1px solid var(--lb1);box-shadow:var(--lsh-md)}
  .sb-header{padding:24px 20px 20px;border-bottom:1px solid var(--b1);display:flex;align-items:center;gap:10px}
  .app-light .sb-header{border-bottom:1px solid var(--lb1)}
  .sb-logo{width:38px;height:38px;border-radius:10px;object-fit:cover;flex-shrink:0}
  .sb-brand{font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:800;color:#e0c611;letter-spacing:.5px}
  .sb-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:3px;overflow-y:auto}
  .sb-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;
    cursor:pointer;border:none;background:none;color:#888;font-size:.86rem;font-weight:700;
    width:100%;text-align:left;transition:.15s;letter-spacing:.2px;-webkit-appearance:none;outline:none;
    position:relative}
  .sb-item:hover{background:rgba(255,255,255,.04);color:#ccc}
  .sb-item.act{background:rgba(224,198,17,.12);color:#e0c611}
  .app-light .sb-item.act{background:rgba(224,198,17,.15);color:#8a7800}
  .app-light .sb-item{color:var(--lmuted)}
  .app-light .sb-item:hover{background:var(--ls2);color:var(--ltxt)}
  .sb-badge{position:absolute;right:12px;top:50%;transform:translateY(-50%);
    background:#e05555;color:#fff;font-size:.68rem;font-weight:800;
    min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px}
  .sb-footer{padding:14px 10px;border-top:1px solid var(--b1);display:flex;flex-direction:column;gap:8px}
  .app-light .sb-footer{border-top:1px solid var(--lb1)}
  .sb-user{display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:10px;background:rgba(255,255,255,.04)}
  .app-light .sb-user{background:var(--ls2)}
  .sb-uname{font-size:.86rem;font-weight:700;color:#e0c611;flex:1}
  .app-light .sb-uname{color:var(--gd)}
.app-light .sb-hist{border-color:var(--lb1);color:var(--lmuted)}
.app-light .sb-hist:hover{border-color:var(--lb2);color:var(--ltxt)}
.app-light .sb-btn{border-color:var(--lb1);color:var(--lmuted)}
.app-light .sb-btn:hover{border-color:var(--lb2);color:var(--ltxt)}
.app-light .sb-sync{background:rgba(138,120,0,.06);border-color:rgba(138,120,0,.2);color:var(--gd)}
  .sb-urole{font-size:.68rem;color:#666;margin-top:1px}
  .sb-actions{display:flex;gap:6px}
  .sb-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
    padding:7px;border-radius:8px;border:1px solid #2a2a18;background:none;
    color:#666;font-size:.76rem;font-weight:700;cursor:pointer;-webkit-appearance:none;outline:none;transition:.15s}
  .sb-btn:hover{border-color:#444;color:#aaa}
  .sb-new-sale{width:100%;padding:11px;border-radius:10px;background:#e0c611;border:none;
    color:#0a0a00;font-size:.86rem;font-weight:800;cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:7px;
    -webkit-appearance:none;outline:none;transition:.15s;margin-bottom:4px}
  .sb-new-sale:hover{background:#c8b000}
  .sb-hist{width:100%;padding:8px;border-radius:8px;background:none;border:1px solid #2a2a18;
    color:#666;font-size:.76rem;font-weight:700;cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:6px;
    -webkit-appearance:none;outline:none;transition:.15s}
  .sb-hist:hover{border-color:#444;color:#aaa}
  .sb-sync{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;
    background:rgba(224,198,17,.08);border:1px solid rgba(224,198,17,.2);
    font-size:.76rem;color:#8a7800;font-weight:700;cursor:pointer;-webkit-appearance:none;outline:none}
  .sb-sync.spin svg{animation:spin .9s linear infinite}
}

/* MODO CLARO - dentro de la app una vez logueado */
.app-light{background:var(--lbg);color:var(--ltxt)}
.app-light .topbar{background:var(--ls1);border-bottom:1px solid var(--lb1);box-shadow:var(--lsh-sm)}
.app-light .bnav{background:var(--ls1);border-top:1px solid var(--lb1);box-shadow:0 -2px 12px rgba(0,0,0,.06)}
.app-light .content{background:var(--lbg)}
.app-light .card{background:var(--ls1);border-color:var(--lb1)}
.app-light .card-gold{background:linear-gradient(145deg,#fffde6,#fff8cc);border-color:var(--gold)}
.app-light .sc{background:var(--ls1);border-color:var(--lb1);box-shadow:var(--lsh-sm)}
.app-light .sc.hg{background:linear-gradient(145deg,#fffde6,#fff8cc);border-color:var(--gold)}
.app-light .sc.ht{background:linear-gradient(145deg,#e6faf8,#ccf5f0);border-color:var(--teal)}
.app-light .sc.hr{background:linear-gradient(145deg,#fff0f0,#ffe8e8);border-color:var(--red)}
.app-light .sl{color:var(--lmuted)}
.app-light .sv{color:var(--ltxt)}
.app-light .sv.gold{color:var(--gd)}
.app-light .sv.teal{color:var(--td)}
.app-light .sv.red{color:var(--red)}
.app-light .sv.grn{color:#1e5c3a}
.app-light .ss{color:#aaa}
.app-light .si{background:var(--ls1);border-color:var(--lb1);box-shadow:var(--lsh-sm)}
.app-light .si-prod{color:#1a1a1a}
.app-light .si-cust{color:#666}
.app-light .si-meta{color:#999}
.app-light .si-amt{color:var(--gd)}
.app-light .si-sub{color:#aaa}
.app-light .si-ico{background:var(--ls2);border-color:var(--lb1);color:var(--gold)}
.app-light .pc{background:var(--ls1);border-color:var(--lb1);box-shadow:var(--lsh-sm)}
.app-light .pc-img-ph{background:#f5f0e8;border-color:#e8e0cc;color:#ccc}
.app-light .prc{background:var(--ls1);border-color:var(--lb1);box-shadow:var(--lsh-sm)}
.app-light .prc-av{background:linear-gradient(145deg,var(--gold),var(--ls2));color:var(--gd)}
.app-light .prs{background:var(--ls2)}
.app-light .prs-v{color:var(--gd)}
.app-light .prs-l{color:#aaa}
.app-light .ei{background:var(--ls1);border-color:var(--lb1)}
.app-light .ei-ico{background:var(--ls2)}
.app-light .ei-type{color:#1a1a1a}
.app-light .ei-desc{color:#666}
.app-light .ei-date{color:#aaa}
.app-light .shd{color:#1a1a1a}
.app-light .ni{color:var(--ldim)}
.app-light .ni.act{color:var(--gold)}
.app-light .tbtn{background:#f5f0e8;border-color:#e8e0cc;color:#666}
.app-light .ubtn{background:#f5f0e8;border-color:#e8e0cc}
.app-light .np-on{color:#0d5c53;border-color:#29b8a866;background:rgba(41,184,168,.08)}
.app-light .np-off{color:#aaa;border-color:#e8e0cc;background:#f5f5f5}
.app-light .fi,.app-light .fs,.app-light .fta{background:var(--ls2);border-color:var(--lb1);color:var(--ltxt)}
.app-light .fi:focus,.app-light .fs:focus,.app-light .fta:focus{border-color:var(--gold)}
.app-light .fl{color:#888}
.app-light .fi-hint{color:#bbb}
.app-light .pill{background:var(--ls1);border-color:var(--lb1);color:var(--lmuted)}
.app-light .pill.act{background:#fffde6;border-color:var(--gold);color:var(--gd)}
.app-light .tab{color:#bbb}
.app-light .tab.act{background:#fffde6;color:var(--gd)}
.app-light .tabs{background:var(--ls3)}
.app-light .chip.ch-gold{background:#fffde6;color:var(--gd)}
.app-light .chip.ch-grn{background:#d8f5e8;color:#1e5c3a}
.app-light .chip.ch-red{background:#ffe8e8;color:#b03030}
.app-light .chip.ch-teal{background:#d8f5f0;color:#0d5c53}
.app-light .chip.ch-blu{background:#e8eeff;color:#2a4a9a}
.app-light .chip.ch-dim{background:#f0ede8;color:#888}
.app-light .pb{background:var(--ls2)}
.app-light .pbr{border-bottom-color:var(--lb1)}
.app-light .pbk{color:#888}
.app-light .fb{background:var(--ls2)}
.app-light .fr{border-bottom-color:var(--lb1)}
.app-light .fk{color:#888}
.app-light .rbar-t{background:var(--lb1)}
.app-light .rbar-l{color:#666}
.app-light .rbar-v{color:#888}
.app-light .price-box{background:var(--ls2)}
.app-light .dvd{background:var(--lb1)}
.app-light .empty{color:#bbb}
.app-light .locked{color:#bbb}
.app-light .grp-header{background:var(--ls2);border-color:var(--lb1)}
.app-light .grp-body{border-color:var(--lb1)}
.app-light .order-row{background:var(--ls1)}
.app-light .order-name{color:#1a1a1a}
.app-light .order-prod{color:#666}
.app-light .order-meta{color:#aaa}
.app-light .order-amt{color:var(--gd)}
.app-light .order-detail{border-top-color:#e8e0cc;background:#fafaf8}
.app-light .kanban-head{background:var(--ls3)}
.app-light .kanban-card{background:var(--ls1);border-color:var(--lb1)}
.app-light .kanban-empty{border-color:#e8e0cc;color:#bbb}
.app-light .notify-bar{background:linear-gradient(145deg,#e6faf8,#ccf5f0);border-color:var(--teal)}
.app-light .pay-row{background:var(--ls1);border-color:var(--lb1)}
.app-light .pay-av{background:linear-gradient(145deg,#d4a017,#f5f0e8);color:#8a6500}
.app-light .id-tag{background:#f0ede8;color:#888}
.app-light .hist-tag{background:#e8eeff;color:#2a4a9a}
.app-light .sheet{background:var(--ls1);border-top:1px solid var(--lb1)}
.app-light .sh-hd{background:#e8e0cc}
.app-light .overlay{background:rgba(0,0,0,.5)}
.app-light .prod-card{background:var(--ls2);border-color:var(--lb1)}
.app-light .prod-card.sel{background:#fffde6;border-color:var(--gold)}
.app-light .prod-card-ph{background:#eee;color:#ccc}
.app-light .prod-card-name{color:#1a1a1a}
.app-light .prod-card-price{color:#8a6500}
.app-light .prod-card-sub{color:#aaa}
.app-light .photo-upload{border-color:#e8e0cc;background:#f7f5f0;color:#888}
.app-light .pcs{background:var(--ls2)}
.app-light .pcs-l{color:#aaa}
.app-light .al-warn{background:#fff0f0;border-color:var(--red);color:var(--red)}
.app-light .al-info{background:#fffde6;border-color:var(--gold);color:var(--gd)}
.app-light .al-ok{background:#e6faf8;border-color:var(--teal);color:var(--td)}
.app-light .lp{background:#fffde6;border-color:var(--gold)}
.app-light .suc-ring{background:linear-gradient(145deg,#45b87c,#1e5c3a)}
.app-light .view-toggle{background:var(--ls3)}
.app-light .vt-btn.act{background:#ffffff;color:#8a6500}
.app-light .vt-btn.off{color:#bbb}
.app-light .step.s-done{background:var(--gold);border-color:var(--gold);color:#0a0a00}
.app-light .step.s-cur{background:#fffde6;border-color:var(--gold);color:var(--gd)}
.app-light .step.s-fut{background:#f0ede8;border-color:#e8e0cc;color:#bbb}
.app-light .s-line.sl-done{background:var(--gold)}
.app-light .s-line.sl-fut{background:#e8e0cc}
.app-light .uname{color:#888}
.app-light .rbadge.rb-admin{background:#fffde6;color:var(--gd)}
.app-light .rbadge.rb-socio{background:#e6faf8;color:var(--td)}
.app-light .rbadge.rb-employee{background:#e8eeff;color:#2a4a9a}
.app-light .rbadge.rb-promoter{background:#d8f5e8;color:#1e5c3a}
.app-light .tb-brand{color:var(--gd)}
.app-light .nbadge{background:#d95555}
.app-light .btn-out{border-color:var(--lb1);color:var(--lmuted)}
.app-light .btn-out:active{background:#f0ede8}
.app-light .fab-sec{background:var(--ls1);border-color:var(--lb1)}

/* LOGIN */
.splash{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:#0a0a08;padding:32px 24px}
.splash-mark{width:88px;height:88px;background:#e0c611;border-radius:18px;
  display:flex;align-items:center;justify-content:center;margin-bottom:22px;
  box-shadow:0 0 60px rgba(212,160,23,.35),0 8px 32px rgba(0,0,0,.7)}
.splash-title{font-family:'Playfair Display',serif;font-size:2.8rem;font-weight:900;color:#d4a017;letter-spacing:2px;margin-bottom:4px}
.splash-sub{font-size:.76rem;color:var(--muted);letter-spacing:2px;margin-bottom:40px;text-transform:uppercase}
.ugrid{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px}
.ub{background:#e0c611;border:none;border-radius:var(--r);padding:20px 12px;
  cursor:pointer;text-align:center;transition:.2s;-webkit-appearance:none;outline:none;
  user-select:none;-webkit-user-select:none}
.ub.sel{background:#c8b000;box-shadow:0 0 0 3px #e0c61166}
.ub-ico{display:none}
.ub-name{font-size:.86rem;font-weight:700;color:#0a0a00;user-select:none;-webkit-user-select:none}
.ub.sel .ub-name{color:#0a0a00}
.ub-role{font-size:.68rem;margin-top:6px;user-select:none;-webkit-user-select:none}
.pin-hd{text-align:center;font-size:.86rem;color:var(--muted);margin-bottom:14px}
.pin-hd b{color:var(--gold)}
.pin-dots{display:flex;justify-content:center;gap:12px;margin-bottom:20px}
.pd{width:16px;height:16px;border-radius:50%;background:var(--b1);border:1px solid var(--b2);transition:.2s}
.pd.on{background:var(--gold);border-color:var(--gold);box-shadow:0 0 10px rgba(200,168,75,.5)}
.pin-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:336px;margin:0 auto}
.pk{aspect-ratio:1/1;background:var(--s2);border:1px solid var(--b1);border-radius:20px;
  font-size:1.8rem;font-weight:700;color:var(--txt);cursor:pointer;transition:.15s;-webkit-appearance:none;outline:none;
  user-select:none;-webkit-user-select:none}
.pk:active{background:var(--s3);transform:scale(.93)}
.pk.del{font-size:.86rem;color:var(--muted)}
.pin-err{text-align:center;font-size:.86rem;color:var(--red);margin-top:10px;min-height:18px}


/* TOP BAR */
.topbar{display:flex;align-items:center;justify-content:space-between;padding:13px 16px 10px;
  position:sticky;top:0;z-index:200;background:var(--bg);border-bottom:1px solid var(--b1)}
.tb-l{display:flex;align-items:center;gap:9px}
.tb-logo{width:30px;height:30px;background:#d4a017;
  border-radius:8px;display:flex;align-items:center;justify-content:center}
.tb-brand{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:900;color:#d4a017;letter-spacing:1px}
.tb-r{display:flex;align-items:center;gap:7px}
.np{display:flex;align-items:center;gap:4px;font-size:.68rem;font-weight:700;
  padding:4px 9px;border-radius:20px;border:1px solid}
.np-on{color:var(--teal);border-color:var(--td);background:rgba(41,184,168,.07)}
.np-off{color:var(--muted);border-color:var(--b1);background:rgba(255,255,255,.03)}
.tbtn{display:flex;align-items:center;gap:5px;padding:5px 9px;background:var(--s2);
  border:1px solid var(--b2);border-radius:20px;font-size:.76rem;font-weight:700;
  color:var(--muted);cursor:pointer;-webkit-appearance:none;outline:none}
.tbtn.spin svg{animation:spin .9s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ubtn{display:flex;align-items:center;gap:5px;padding:4px 9px;background:var(--s2);
  border:1px solid var(--b1);border-radius:20px;cursor:pointer;-webkit-appearance:none;outline:none}
.rbadge{padding:2px 7px;border-radius:10px;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.4px}
.rb-admin{background:rgba(0,0,0,.15);color:#0a0a00}
.rb-socio{background:rgba(17,200,184,.15);color:#0a6a60}
.rb-employee{background:rgba(0,0,0,.15);color:#0a0a00}
.rb-promoter{background:rgba(0,0,0,.15);color:#0a0a00}
.uname{font-size:.76rem;color:var(--muted)}

/* BOTTOM NAV */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;
  background:var(--s1);border-top:1px solid var(--b1);display:flex;
  padding:6px 0 max(16px,env(safe-area-inset-bottom));z-index:200}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 4px;
  cursor:pointer;border:none;background:none;color:var(--dim);font-size:.68rem;font-weight:700;
  letter-spacing:.3px;text-transform:uppercase;transition:.2s;outline:none;-webkit-appearance:none}
.ni.act{color:var(--gold)}
.ni-w{position:relative}
.nbadge{position:absolute;top:-4px;right:-7px;background:var(--red);color:#fff;
  font-size:.68rem;font-weight:800;min-width:15px;height:15px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;padding:0 3px}

/* CONTENT */
.content{flex:1;padding:18px 16px 90px;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.pe{animation:pe .2s ease}
@keyframes pe{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

/* TYPOGRAPHY / SECTION HEADERS */
.shd{font-family:'DM Sans',sans-serif;font-size:1.1rem;font-weight:800;color:var(--txt);
  margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
.shd-l{display:flex;align-items:center;gap:7px}

/* STAT CARDS */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px}
.sc{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:14px 15px;box-shadow:var(--sh-sm)}
.sc.hg{background:linear-gradient(145deg,#111000,#1c1a00);border-color:#8a7800}
.sc.ht{background:linear-gradient(145deg,#081312,#0e1e1c);border-color:var(--td)}
.sc.hr{background:linear-gradient(145deg,#120909,#1a0e0e);border-color:var(--rd)}
.sl{font-size:.68rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.sv{font-family:'DM Sans',sans-serif;font-size:1.5rem;font-weight:800;color:var(--txt);line-height:1}
.sv.gold{color:var(--gold)}.sv.teal{color:var(--teal)}.sv.sv.grn{color:var(--grn)}
.ss{font-size:.68rem;color:var(--dim);margin-top:3px}

/* BUTTONS */
.btn{display:flex;align-items:center;justify-content:center;gap:7px;padding:14px 18px;
  border-radius:var(--rsm);font-size:1rem;font-weight:700;cursor:pointer;border:none;
  transition:.2s;width:100%;letter-spacing:.2px;-webkit-appearance:none;outline:none}
.btn:disabled{opacity:.4;pointer-events:none}
.btn:active{transform:scale(.97)}
.btn-gold{background:#e0c611;color:#0a0a00;font-weight:800;box-shadow:var(--sh-gold)}
.btn-teal{background:linear-gradient(145deg,var(--teal),var(--td));color:#020f0e}
.btn-red{background:linear-gradient(145deg,var(--red),var(--rd));color:#fff}
.btn-grn{background:linear-gradient(145deg,var(--grn),var(--grd));color:#fff}
.btn-out{background:transparent;border:1px solid var(--b2);color:var(--muted)}
.btn-out:active{background:var(--s2)}
.btn-sm{padding:7px 12px;font-size:.76rem;width:auto}

/* FAB */
.fab{position:fixed;bottom:82px;right:calc(50% - 215px + 16px);width:50px;height:50px;
  border-radius:50%;background:#e0c611;border:none;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:0 4px 24px rgba(224,198,17,.55);z-index:198;transition:.2s;outline:none}
.fab:active{transform:scale(.88)}
.fab-sec{position:fixed;bottom:82px;right:calc(50% - 215px + 74px);width:36px;height:36px;
  border-radius:50%;background:var(--s2);border:1px solid var(--b2);
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:0 2px 10px rgba(0,0,0,.4);z-index:198;outline:none}

/* FORM ELEMENTS */
.fg{margin-bottom:14px}
.fl{font-size:.68rem;font-weight:800;color:var(--muted);text-transform:uppercase;
  letter-spacing:.5px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between}
.fi,.fs,.fta{width:100%;background:var(--s2);border:1px solid var(--b1);border-radius:var(--rsm);
  color:var(--txt);font-size:1rem;padding:11px 13px;outline:none;transition:border-color .2s;-webkit-appearance:none}
.fi:focus,.fs:focus,.fta:focus{border-color:var(--gd)}
.fta{resize:vertical;min-height:68px;font-family:'DM Sans',sans-serif}
.fs option{background:var(--s2)}
.fi-hint{font-size:.76rem;color:var(--dim);margin-top:5px}
.fi2{display:grid;grid-template-columns:1fr 1fr;gap:8px}

/* PILLS / TABS */
.pills{display:flex;gap:7px;flex-wrap:wrap}
.pill{padding:7px 14px;border-radius:20px;border:1px solid var(--b1);background:var(--s2);
  color:var(--muted);font-size:.86rem;font-weight:700;cursor:pointer;transition:.2s;
  white-space:nowrap;-webkit-appearance:none;outline:none}
.pill.act{background:#1e1b00;border-color:#a08200;color:#e0c611}
.pill.act-red{background:linear-gradient(145deg,#180a0a,#200e0e);border-color:var(--rd);color:var(--red)}
.tabs{display:flex;background:var(--s2);border-radius:var(--rsm);padding:3px;margin-bottom:13px}
.tab{flex:1;padding:7px;text-align:center;font-size:.76rem;font-weight:800;border-radius:6px;
  cursor:pointer;color:var(--dim);transition:.2s;border:none;background:none;
  letter-spacing:.3px;text-transform:uppercase;-webkit-appearance:none;outline:none}
.tab.act{background:rgba(224,198,17,.12);color:var(--gold)}

/* CHIPS */
.chip{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:10px;
  font-size:.68rem;font-weight:800;letter-spacing:.3px;text-transform:uppercase}
.ch-gold{background:rgba(200,168,75,.15);color:var(--gold)}
.ch-grn{background:rgba(69,184,124,.15);color:var(--grn)}
.ch-red{background:rgba(217,85,85,.15);color:var(--red)}
.ch-teal{background:rgba(41,184,168,.12);color:var(--teal)}
.ch-blu{background:rgba(91,139,232,.12);color:var(--blu)}
.ch-dim{background:rgba(255,255,255,.06);color:var(--muted)}
.ch-laser{background:rgba(180,120,255,.15);color:#b47fff}
.app-light .chip.ch-laser{background:#f3eaff;color:#7c28c8}
.hist-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:8px;
  font-size:.68rem;font-weight:800;background:rgba(91,139,232,.15);color:var(--blu)}

/* SALE ROW */
.si{display:flex;align-items:flex-start;gap:10px;padding:13px 14px;background:var(--s1);
  border:1px solid var(--b1);border-radius:var(--r);margin-bottom:8px;position:relative;
  box-shadow:var(--sh-sm)}
.si-ico{width:36px;height:36px;border-radius:9px;background:var(--s2);border:1px solid var(--b1);
  display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0}
.si-body{flex:1;min-width:0}
.si-prod{font-weight:700;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.si-cust{font-size:.76rem;color:var(--muted);font-style:italic;margin-top:1px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.si-meta{font-size:.68rem;color:var(--dim);margin-top:3px;display:flex;gap:7px;flex-wrap:wrap}
.si-r{text-align:right;flex-shrink:0}
.si-amt{font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:800;color:var(--gold)}
.si-sub{font-size:.68rem;color:var(--muted);margin-top:1px}
.sdot{position:absolute;top:9px;right:9px;width:6px;height:6px;border-radius:50%}
.sd-ok{background:var(--grn)}.sd-no{background:var(--red)}

/* PRODUCT CARDS */
.pc{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:13px;margin-bottom:8px;box-shadow:var(--sh-sm)}
.pc-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.pc-img{width:56px;height:56px;border-radius:10px;object-fit:cover;flex-shrink:0;border:1px solid var(--b1)}
.pc-img-ph{width:56px;height:56px;border-radius:10px;background:var(--s2);border:1px solid var(--b1);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-size:1.5rem;font-weight:800;color:var(--dim)}
.pc-name{font-weight:700;font-size:1rem}
.pc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.pcs{background:var(--s2);border-radius:6px;padding:8px 6px;text-align:center}
.pcs-v{font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:800}
.pcs-l{font-size:.68rem;color:var(--dim);margin-top:2px}

/* VISUAL PRODUCT GRID (selector) */
.prod-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.prod-card{border-radius:var(--r);border:1px solid var(--b1);cursor:pointer;
  transition:.2s;overflow:hidden;background:var(--s2);-webkit-appearance:none;outline:none}
.prod-card.sel{border-color:var(--gd);background:linear-gradient(145deg,#18140a,#201c0e)}
.prod-card-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.prod-card-ph{width:100%;aspect-ratio:1/1;background:var(--s3);
  display:flex;align-items:center;justify-content:center;
  font-size:2rem;font-weight:800;color:var(--b2)}
.prod-card-info{padding:9px 10px}
.prod-card-name{font-size:.86rem;font-weight:700;line-height:1.2;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prod-card-price{font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:800;color:var(--gold);margin-top:3px}
.prod-card-sub{font-size:.68rem;color:var(--dim);margin-top:1px}

/* PHOTO UPLOAD */
.photo-upload{width:100%;padding:14px;border:2px dashed var(--b2);
  border-radius:var(--r);background:var(--s2);cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:10px;
  font-size:.86rem;color:var(--muted);font-weight:700;
  -webkit-appearance:none;outline:none;transition:.2s}
.photo-upload:active{border-color:var(--gd);color:var(--gold)}
.photo-preview{position:relative;display:inline-block;width:100%}
.photo-preview img{width:100%;max-height:200px;object-fit:cover;border-radius:var(--r);border:1px solid var(--b1)}
.photo-remove{position:absolute;top:6px;right:6px;width:26px;height:26px;
  border-radius:50%;background:rgba(0,0,0,.7);border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;color:#fff;
  font-size:.86rem;font-weight:800;-webkit-appearance:none;outline:none}

/* PROMOTER CARD */
.prc{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:14px;margin-bottom:9px;box-shadow:var(--sh-sm)}
.prc-h{display:flex;align-items:center;gap:10px;margin-bottom:11px}
.prc-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(145deg,var(--gd),var(--s3));
  display:flex;align-items:center;justify-content:center;
  font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:800;color:var(--gold);flex-shrink:0}
.prc-name{font-weight:700;font-size:1rem}
.prc-ph{font-size:.76rem;color:var(--muted);margin-top:2px}
.prc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.prs{background:var(--s2);border-radius:7px;padding:9px 7px;text-align:center}
.prs-v{font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:800;color:var(--gold)}
.prs-l{font-size:.68rem;color:var(--dim);margin-top:2px}

/* EXPENSE ROW */
.ei{display:flex;align-items:center;gap:10px;padding:11px 13px;background:var(--s1);
  border:1px solid var(--b1);box-shadow:var(--sh-sm);border-radius:var(--r);margin-bottom:7px;position:relative}
.ei-ico{width:34px;height:34px;background:var(--s2);border-radius:8px;
  display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.ei-body{flex:1}
.ei-type{font-weight:700;font-size:.86rem}
.ei-desc{font-size:.76rem;color:var(--muted);margin-top:1px}
.ei-date{font-size:.68rem;color:var(--dim);margin-top:2px}
.ei-amt{font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:800;color:var(--red);text-align:right;flex-shrink:0}

/* MODAL / SHEET */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:300;
  display:flex;flex-direction:column;justify-content:flex-end}
.sheet{background:var(--s1);border-radius:20px 20px 0 0;
  padding:18px 18px max(18px,env(safe-area-inset-bottom));
  max-height:94dvh;overflow-y:auto;border-top:1px solid var(--b2);box-shadow:var(--sh-lg)}
.sh-hd{width:32px;height:3px;background:var(--b2);border-radius:2px;margin:0 auto 18px}
.sh-title{font-family:'DM Sans',sans-serif;font-size:1.1rem;font-weight:800;margin-bottom:16px}

/* SALE STEPS */
.steps{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:18px}
.step{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:.76rem;font-weight:800;transition:.2s;border:1.5px solid}
.s-done{background:var(--gold);border-color:var(--gold);color:#100d02}
.s-cur{background:var(--s3);border-color:var(--gd);color:var(--gold)}
.s-fut{background:var(--s2);border-color:var(--b1);color:var(--dim)}
.s-line{flex:1;max-width:22px;height:1px}
.sl-done{background:var(--gd)}.sl-fut{background:var(--b1)}

/* PRICE BREAKDOWN */
.pb{background:var(--s2);border-radius:var(--r);padding:13px}
.pbr{display:flex;justify-content:space-between;align-items:center;
  padding:5px 0;border-bottom:1px solid var(--b1);font-size:.86rem}
.pbr:last-child{border-bottom:none}
.pbr.sep{border-top:1px solid var(--b2);margin-top:5px;padding-top:10px}
.pbk{color:var(--muted)}.pbv{font-weight:700}
.pbv-gold{color:var(--gold)}.pbv-red{color:var(--red)}.pbv-grn{color:var(--grn)}.pbv-teal{color:var(--teal)}

/* FINANCIAL TABLE */
.fb{background:var(--s2);border-radius:var(--r);padding:14px}
.fr{display:flex;justify-content:space-between;align-items:center;
  padding:6px 0;border-bottom:1px solid var(--b1);font-size:.86rem}
.fr:last-child{border-bottom:none}
.fr.total{font-weight:800;font-size:1rem;padding-top:9px;margin-top:4px}
.fk{color:var(--muted)}.fv{font-weight:700}

/* BAR CHART */
.rbar{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.rbar-l{font-size:.76rem;color:var(--muted);width:95px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0}
.rbar-t{flex:1;background:var(--s2);border-radius:4px;height:6px;overflow:hidden}
.rbar-f{height:100%;border-radius:4px;transition:width .9s ease}
.rbar-v{font-size:.76rem;color:var(--muted);width:60px;text-align:right;flex-shrink:0}

/* LASER PREVIEW */
.lp{background:var(--s2);border:1px dashed #8a6500;border-radius:var(--r);
  padding:16px;text-align:center;margin:8px 0}
.lp-txt{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:900;color:#d4a017;
  letter-spacing:4px;animation:glow 2s ease-in-out infinite alternate}
@keyframes glow{from{text-shadow:0 0 6px rgba(212,160,23,.3)}to{text-shadow:0 0 24px rgba(212,160,23,.9)}}

/* SUCCESS SCREEN */
.suc{display:flex;flex-direction:column;align-items:center;padding:30px 16px;text-align:center}
.suc-ring{width:72px;height:72px;background:linear-gradient(145deg,var(--grn),var(--grd));
  border-radius:50%;display:flex;align-items:center;justify-content:center;
  margin-bottom:16px;animation:pop .4s cubic-bezier(.175,.885,.32,1.275)}
@keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.suc-title{font-family:'DM Sans',sans-serif;font-size:1.4rem;font-weight:800;margin-bottom:6px}

/* ALERTS */
.al{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:var(--rsm);
  margin-bottom:11px;font-size:.86rem}
.al-warn{background:rgba(217,85,85,.1);border:1px solid var(--rd);color:var(--red)}
.al-info{background:rgba(200,168,75,.1);border:1px solid var(--gd);color:var(--gold)}
.al-ok{background:rgba(69,184,124,.1);border:1px solid var(--grd);color:var(--grn)}

/* TOAST */
.toast-wrap{position:fixed;top:70px;left:50%;transform:translateX(-50%);
  z-index:999;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.toast{padding:10px 18px;border-radius:20px;font-size:.86rem;font-weight:700;
  box-shadow:0 4px 20px rgba(0,0,0,.5);animation:tin .25s ease;pointer-events:none;white-space:nowrap}
@keyframes tin{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
.t-ok{background:var(--grn);color:#fff}
.t-err{background:var(--red);color:#fff}
.t-info{background:var(--gold);color:#100d02}

/* ORDERS */
.grp-header{width:100%;display:flex;align-items:center;gap:8px;padding:9px 12px;
  border-radius:var(--r);cursor:pointer;outline:none;-webkit-appearance:none;
  border:1px solid var(--b1);background:var(--s1);margin-bottom:0}
.grp-header.open{border-radius:var(--r) var(--r) 0 0}
.grp-body{border:1px solid var(--b1);border-top:none;border-radius:0 0 var(--r) var(--r);overflow:hidden;margin-bottom:8px}
.order-row{display:flex;align-items:center;gap:10px;padding:11px 13px;cursor:pointer}
.order-bar{width:4px;align-self:stretch;border-radius:2px;flex-shrink:0;margin:2px 0}
.order-body{flex:1;min-width:0}
.order-name{font-weight:700;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.order-prod{font-size:.76rem;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.order-meta{font-size:.68rem;color:var(--dim);margin-top:2px;display:flex;gap:7px;flex-wrap:wrap}
.order-amt{font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:800;color:var(--gold);flex-shrink:0}
.order-detail{padding:0 13px 12px 27px;border-top:1px solid var(--b1)}
.order-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.kanban-wrap{display:flex;gap:10px;overflow-x:auto;padding-bottom:12px;
  scroll-snap-type:x mandatory;scrollbar-width:none;
  margin-left:-16px;margin-right:-16px;padding-left:16px;padding-right:16px}
.kanban-wrap::-webkit-scrollbar{display:none}
.kanban-col{flex-shrink:0;width:72vw;max-width:280px;scroll-snap-align:start}
.kanban-head{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;
  margin-bottom:8px;background:var(--s2);border-radius:var(--r);border-left:3px solid}
.kanban-card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);box-shadow:var(--sh-sm);
  padding:11px 12px;margin-bottom:8px;border-top:2px solid}
.kanban-empty{border:1px dashed var(--b1);border-radius:var(--r);padding:20px 10px;
  text-align:center;font-size:.76rem;color:var(--dim)}

/* NOTIFY */
.notify-bar{background:linear-gradient(145deg,#0a1408,#101f0e);border:1px solid var(--grd);
  border-radius:var(--r);padding:12px 14px;margin-bottom:10px;display:flex;align-items:center;gap:10px;cursor:pointer}
.notify-dot{width:10px;height:10px;border-radius:50%;background:var(--grn);flex-shrink:0;
  box-shadow:0 0 8px rgba(69,184,124,.6);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* WA BUTTON */
.wa-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:var(--rsm);
  background:#25d366;color:#fff;font-size:.76rem;font-weight:700;cursor:pointer;
  border:none;-webkit-appearance:none;outline:none;white-space:nowrap}
.wa-btn:active{opacity:.85;transform:scale(.97)}

/* VIEW TOGGLE */
.view-toggle{display:flex;background:var(--s2);border-radius:var(--rsm);padding:3px;gap:2px}
.vt-btn{padding:5px 12px;border-radius:5px;border:none;cursor:pointer;
  font-size:.76rem;font-weight:700;transition:.15s;-webkit-appearance:none;outline:none}
.vt-btn.act{background:var(--s3);color:var(--gold)}
.vt-btn.off{background:transparent;color:var(--dim)}

/* PAY ROW */
.pay-row{display:flex;align-items:center;gap:10px;padding:12px 13px;background:var(--s1);
  border:1px solid var(--b1);border-radius:var(--r);margin-bottom:8px;box-shadow:var(--sh-sm)}
.pay-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(145deg,var(--gd),var(--s3));
  display:flex;align-items:center;justify-content:center;
  font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:800;color:var(--gold);flex-shrink:0}

/* MISC */
.price-box{background:var(--s2);border-radius:var(--r);padding:13px;margin-bottom:13px;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.dvd{height:1px;background:var(--b1);margin:12px 0}
.id-tag{font-size:.68rem;font-family:monospace;background:var(--s3);color:var(--muted);
  padding:2px 6px;border-radius:4px;letter-spacing:.5px}
.empty{text-align:center;padding:40px 16px;color:var(--dim)}
.empty p{font-size:.86rem;margin-top:9px}
.locked{text-align:center;padding:48px 20px;color:var(--dim)}
.locked p{font-size:.86rem;margin-top:10px}
.row{display:flex;align-items:center;gap:8px}
.row .btn{flex:1}
.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}
.flt{display:flex;gap:7px;overflow-x:auto;margin-bottom:13px;scrollbar-width:none}
.flt::-webkit-scrollbar{display:none}
.flt > *{flex-shrink:0}
.card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:15px;margin-bottom:11px}
.card-gold{background:linear-gradient(145deg,#0f0e00,#1a1800);border-color:#5a4800}
.var-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:8px}
.var-btn{padding:10px 8px;border-radius:var(--rsm);border:1px solid var(--b1);background:var(--s2);
  text-align:center;cursor:pointer;transition:.2s;-webkit-appearance:none;outline:none}
.var-btn.sel{border-color:var(--gd);background:linear-gradient(145deg,#18140a,#201c0e)}
.var-btn-name{font-size:.76rem;font-weight:700;color:var(--txt)}
.var-btn.sel .var-btn-name{color:var(--gold)}
.var-btn-stock{font-size:.68rem;color:var(--dim);margin-top:2px}
.app-light .var-btn{background:var(--ls2);border-color:var(--lb1)}
.app-light .var-btn.sel{background:#fffde6;border-color:var(--gold)}
.app-light .var-btn-name{color:var(--ltxt)}
.app-light .var-btn.sel .var-btn-name{color:var(--gd)}
.vrow{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.vrow-name{flex:1;font-size:.86rem;font-weight:700}
.ph-badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:.68rem;font-weight:700;background:rgba(255,255,255,.06);color:var(--muted);margin-right:5px}
.app-light .ph-badge{background:var(--ls2);color:var(--lmuted)}
.cfg-row{display:flex;align-items:center;gap:10px;padding:12px 14px;
  background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);margin-bottom:8px}
.cfg-row-name{font-weight:700;font-size:1rem;color:var(--txt)}
.app-light .cfg-row{background:var(--ls1);border-color:var(--lb1)}
.app-light .cfg-row-name{color:var(--ltxt)}

/* VOUCHER ROWS */
.vc-row{display:flex;align-items:stretch;background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);margin-bottom:8px;overflow:hidden;box-shadow:var(--sh-sm)}
.vc-bar{width:4px;flex-shrink:0}
.vc-bar-ok{background:var(--grn)}.vc-bar-no{background:var(--red)}
.vc-thumb{width:56px;height:56px;flex-shrink:0;border:none;cursor:pointer;padding:0;position:relative;background:var(--s2);overflow:hidden;-webkit-appearance:none;outline:none;border-right:1px solid var(--b1);align-self:stretch;display:flex;align-items:center;justify-content:center}
.vc-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.vc-thumb-pdf{display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(217,85,85,.12);color:var(--red);font-size:.58rem;font-weight:800;gap:2px;width:100%;height:100%}
.vc-thumb-ov{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:.15s;font-size:.9rem}
.vc-thumb:hover .vc-thumb-ov,.vc-thumb:active .vc-thumb-ov{opacity:1}
.vc-body{flex:1;padding:10px 12px;min-width:0}
.vc-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;margin-bottom:6px}
.vc-lbl{font-size:.6rem;color:var(--dim);font-weight:700;text-transform:uppercase;letter-spacing:.3px}
.vc-val{font-size:.76rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vc-foot{background:var(--s2);border-top:1px solid var(--b1);padding:9px 16px;font-size:.76rem;color:var(--muted);display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.app-light .vc-row{background:var(--ls1);border-color:var(--lb1)}
.app-light .vc-thumb{background:var(--ls2);border-right-color:var(--lb1)}
.app-light .vc-lbl{color:#aaa}
.app-light .vc-val{color:var(--ltxt)}
.app-light .vc-foot{background:var(--ls2);border-top-color:var(--lb1)}
/* VOUCHER FULLSCREEN */
.vc-fs{position:fixed;inset:0;background:#000;z-index:500;display:flex;flex-direction:column}
.vc-fs-top{position:absolute;top:max(14px,env(safe-area-inset-top));right:16px;z-index:501;display:flex;gap:8px}
.vc-fs-btn{width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,.7);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;-webkit-appearance:none;outline:none}
.vc-fs-img{flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;padding:52px 8px 8px}
.vc-fs-img img{max-width:100%;max-height:100%;object-fit:contain}
.vc-fs-info{background:var(--s1);padding:14px 18px max(14px,env(safe-area-inset-bottom));border-top:1px solid var(--b1);max-height:40vh;overflow-y:auto}
/* SIN COMPROBANTE BADGE en SaleRow */
.vc-missing{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:8px;font-size:.62rem;font-weight:800;background:rgba(217,85,85,.15);color:var(--red);cursor:pointer;border:none;-webkit-appearance:none;outline:none}
.vc-has{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:8px;font-size:.62rem;font-weight:800;background:rgba(69,184,124,.13);color:var(--grn);cursor:pointer;border:none;-webkit-appearance:none;outline:none}
`;

// ============================================================
//  DATABASE  (IndexedDB)
// ============================================================
const DB_NAME   = "garabato_v12";
const DB_VER    = 2;
const DB_STORES = ["users","products","promoters","sales","expenses","commissionPayments","notifications","vouchers"];
let _db = null;

// ============================================================
//  SUPABASE
// ============================================================
const SB_URL = "https://ekdtpgsxlwerdfvshqpj.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZHRwZ3N4bHdlcmRmdnNocXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTc0MDIsImV4cCI6MjA5MDQ3MzQwMn0.rg2hXvFOfSqxinktz_Y1XDdSfdUpeaIVlupkMMUN9pg";

async function uploadVoucherImage(vcId, fileOrBlob, contentType) {
  const ext = contentType==="application/pdf" ? "pdf" : "jpg";
  const res = await fetch(`${SB_URL}/storage/v1/object/vouchers/${vcId}.${ext}`, {
    method: "POST",
    headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": contentType },
    body: fileOrBlob,
  });
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  return `${SB_URL}/storage/v1/object/public/vouchers/${vcId}.${ext}`;
}

async function sbFetch(path, options={}) {
  const res = await fetch(SB_URL + "/rest/v1/" + path, {
    ...options,
    headers: {
      "apikey": SB_KEY,
      "Authorization": "Bearer " + SB_KEY,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...(options.headers||{}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Supabase error: " + err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Mapeo: store local → tabla Supabase
// La app usa camelCase, Supabase acepta cualquier nombre de columna
// Usamos las columnas tal como están en la tabla (las creamos con los mismos nombres)
const SB_MAP = {
  users:              { table:"users",              toSB: r=>({id:r.id,name:r.name,role:r.role,pin:r.pin,promoter_id:r.promoterId||null}), fromSB: r=>({id:r.id,name:r.name,role:r.role,pin:r.pin,promoterId:r.promoter_id||null,synced:true}) },
  products:           { table:"products",           toSB: r=>({id:r.id,name:r.name,photo:r.photo||null,client_price:r.clientPrice,promoter_price:r.promoterPrice,cost:r.cost,stock:r.stock,low_stock_alert:r.lowStockAlert,client_price_usd:r.clientPriceUSD||null,grabado_types_allowed:r.grabadoTypesAllowed||[],has_variants:r.hasVariants||false,variants:r.variants||[],price_history:r.priceHistory||[]}), fromSB: r=>({id:r.id,name:r.name,photo:r.photo,clientPrice:r.client_price,promoterPrice:r.promoter_price,cost:r.cost,stock:r.stock,lowStockAlert:r.low_stock_alert,clientPriceUSD:r.client_price_usd,grabadoTypesAllowed:r.grabado_types_allowed||[],hasVariants:r.has_variants||false,variants:r.variants||[],priceHistory:r.price_history||[]}) },
  promoters:          { table:"promoters",          toSB: r=>({id:r.id,name:r.name,phone:r.phone,active:r.active,custom_promoter_price:r.customPromoterPrice||null}), fromSB: r=>({id:r.id,name:r.name,phone:r.phone,active:r.active,customPromoterPrice:r.custom_promoter_price||null}) },
  sales:              { table:"sales",              toSB: r=>({id:r.id,product_id:r.productId,product_name:r.productName,customization:r.customization||null,client_price:r.clientPrice,promoter_price:r.promoterPrice,cost:r.cost,commission:r.commission,profit:r.profit,profit_owner:r.profitOwner,profit_partner:r.profitPartner,payment_method:r.paymentMethod,promoter_id:r.promoterId||null,promoter_name:r.promoterName||null,is_direct_sale:r.isDirectSale||false,client_name:r.clientName||null,client_phone:r.clientPhone||null,notes:r.notes||null,commission_status:r.commissionStatus,date:r.date,is_historic:r.isHistoric||false,deleted:r.deleted||false,deleted_at:r.deletedAt||null,deleted_reason:r.deletedReason||null,order_id:r.orderId||null,variant_id:r.variantId||null,variant_name:r.variantName||null,voucher_id:r.voucherId||null}), fromSB: r=>({id:r.id,productId:r.product_id,productName:r.product_name,customization:r.customization,clientPrice:r.client_price,promoterPrice:r.promoter_price,cost:r.cost,commission:r.commission,profit:r.profit,profitOwner:r.profit_owner,profitPartner:r.profit_partner,paymentMethod:r.payment_method,promoterId:r.promoter_id,promoterName:r.promoter_name,isDirectSale:r.is_direct_sale,clientName:r.client_name,clientPhone:r.client_phone,notes:r.notes,commissionStatus:r.commission_status,date:r.date,isHistoric:r.is_historic,deleted:r.deleted,deletedAt:r.deleted_at,deletedReason:r.deleted_reason,orderId:r.order_id,variantId:r.variant_id,variantName:r.variant_name,voucherId:r.voucher_id||null,synced:true}) },
  expenses:           { table:"expenses",           toSB: r=>({id:r.id,type:r.type,amount:r.amount,description:r.description||null,date:r.date,afecta_sociedad:r.afectaSociedad!==false}), fromSB: r=>({id:r.id,type:r.type,amount:r.amount,description:r.description,date:r.date,afectaSociedad:r.afecta_sociedad,synced:true}) },
  commissionPayments: { table:"commission_payments", toSB: r=>({id:r.id,promoter_id:r.promoterId,amount:r.amount,sales_ids:r.salesIds||[],date:r.date}), fromSB: r=>({id:r.id,promoterId:r.promoter_id,amount:r.amount,salesIds:r.sales_ids||[],date:r.date}) },
  vouchers:           { table:"vouchers",           toSB: r=>({id:r.id,hash:r.hash||null,file_type:r.fileType||null,file_name:r.fileName||null,amount:r.amount||0,reference:r.reference||null,holder_name:r.holderName||null,bank:r.bank||null,payment_date:r.paymentDate||null,payment_time:r.paymentTime||null,uploaded_at:r.uploadedAt||null,uploaded_by:r.uploadedBy||null,sale_id:r.saleId||null,sale_summary:r.saleSummary||null,notes:r.notes||null,image_url:r.imageUrl||null}), fromSB: r=>({id:r.id,hash:r.hash,image:null,imageUrl:r.image_url||null,fileType:r.file_type,fileName:r.file_name,amount:r.amount,reference:r.reference,holderName:r.holder_name,bank:r.bank,paymentDate:r.payment_date,paymentTime:r.payment_time,uploadedAt:r.uploaded_at,uploadedBy:r.uploaded_by,saleId:r.sale_id,saleSummary:r.sale_summary,notes:r.notes,synced:true}) }
};

async function sbPull(store) {
  const map = SB_MAP[store]; if (!map) return null;
  try {
    const rows = await sbFetch(map.table + "?select=*");
    return (rows||[]).map(map.fromSB);
  } catch(e) { console.warn("sbPull error:", store, e.message); return null; }
}

async function sbPush(store, record) {
  const map = SB_MAP[store]; if (!map) return;
  try {
    const row = map.toSB(record);
    await sbFetch(map.table + "?on_conflict=id", {
      method:"POST", prefer:"resolution=merge-duplicates",
      body: JSON.stringify(row),
    });
  } catch(e) { console.warn("sbPush error:", store, e.message); }
}

async function sbDelete(store, id) {
  const map = SB_MAP[store]; if (!map) return;
  try {
    await sbFetch(map.table + "?id=eq." + id, { method:"DELETE", prefer:"" });
  } catch(e) { console.warn("sbDelete error:", store, e.message); }
}

// Sync completo: baja todo de Supabase y reemplaza IndexedDB local
// Si sbPull devuelve null (error de red), se salta esa tabla (no toca el local)
// Si devuelve [] (tabla vacía en Supabase), limpia el local también
async function syncFromSupabase() {
  // Estrategia: merge inteligente para TODOS los stores
  // - Registros con synced:false (no subidos aún) NUNCA se borran
  // - Registros de Supabase se upsert sobre los locales
  // - Registros locales synced:true que ya no están en Supabase se eliminan (borrados en otro dispositivo)
  // - Si Supabase devuelve null (error de red) o [] (vacío), no se toca el local
  for (const store of ["products","promoters","sales","expenses","commissionPayments","users","vouchers"]) {
    const rows = await sbPull(store);
    if (rows === null) continue; // error de red: mantener datos locales
    // Obtener registros locales ANTES de modificar
    const localAll  = await dbAll(store);
    const unsynced  = localAll.filter(r => r.synced === false);
    const sbIds     = new Set(rows.map(r => r.id));
    const db        = await openDB();
    await new Promise((res,rej)=>{
      const tx = db.transaction(store,"readwrite");
      const st = tx.objectStore(store);
      // 1. Eliminar registros locales que ya estaban en Supabase pero fueron borrados allá
      //    Solo si Supabase devolvió datos (rows.length>0 = Supabase respondió correctamente)
      if (rows.length > 0) {
        localAll
          .filter(r => r.synced !== false && !sbIds.has(r.id))
          .forEach(r => st.delete(r.id));
      }
      // 2. Upsert todos los registros de Supabase (con synced:true)
      //    Para vouchers: preservar imagen base64 local que no viaja a Supabase
      const localById = store==="vouchers" ? Object.fromEntries(localAll.map(r=>[r.id,r])) : {};
      rows.forEach(r => {
        const base = store==="vouchers" && localById[r.id]?.image
          ? {...r, image:localById[r.id].image, synced:true}
          : {...r, synced:true};
        st.put(base);
      });
      // 3. Re-guardar registros locales no sincronizados que NO están en Supabase todavía
      unsynced.filter(r => !sbIds.has(r.id)).forEach(r => st.put(r));
      tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error);
    });
  }
}

// ============================================================
//  SUPABASE REALTIME
// ============================================================
let _realtimeWs = null;
let _reloadCallback = null;

function startRealtime(onReload) {
  _reloadCallback = onReload;
  if (_realtimeWs) return; // ya conectado

  const wsUrl = SB_URL.replace("https://", "wss://") + "/realtime/v1/websocket?apikey=" + SB_KEY + "&vsn=1.0.0";
  const ws = new WebSocket(wsUrl);
  _realtimeWs = ws;

  ws.onopen = () => {
    // Suscribirse a todos los cambios en schema public
    ws.send(JSON.stringify({
      topic: "realtime:public",
      event: "phx_join",
      payload: { config: { broadcast: { self: false }, presence: { key: "" }, postgres_changes: [{ event: "*", schema: "public" }] } },
      ref: "1",
    }));
  };

  ws.onmessage = async (e) => {
    try {
      const msg = JSON.parse(e.data);
      // Heartbeat
      if (msg.event === "heartbeat") {
        ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: "hb" }));
        return;
      }
      // Cambio en base de datos
      if (msg.event === "postgres_changes" && msg.payload?.data) {
        const { table, record, old_record, type } = msg.payload.data;
        // Mapear tabla → store
        const storeMap = {
          users:"users", products:"products", promoters:"promoters",
          sales:"sales", expenses:"expenses", commission_payments:"commissionPayments",
          vouchers:"vouchers",
        };
        const store = storeMap[table];
        if (!store) return;

        const map = SB_MAP[store];
        if (!map) return;

        const db = await openDB();
        if (type === "DELETE") {
          const id = old_record?.id;
          if (id) await new Promise((r)=>{ const q=db.transaction(store,"readwrite").objectStore(store).delete(id); q.onsuccess=r; });
        } else if (record) {
          const localRecord = map.fromSB(record);
          // Para vouchers: preservar imagen base64 local que no viaja a Supabase
          if (store==="vouchers" && !localRecord.image) {
            const existing = await new Promise(r=>{ const q=db.transaction(store,"readonly").objectStore(store).get(localRecord.id); q.onsuccess=()=>r(q.result); });
            if (existing?.image) localRecord.image = existing.image;
          }
          await new Promise((r)=>{ const q=db.transaction(store,"readwrite").objectStore(store).put(localRecord); q.onsuccess=r; });
        }
        // Notificar a React que recargue
        if (_reloadCallback) _reloadCallback();
      }
    } catch(err) { /* silencioso */ }
  };

  ws.onclose = () => {
    _realtimeWs = null;
    // Reconectar en 3 segundos si sigue online
    if (navigator.onLine) setTimeout(() => startRealtime(_reloadCallback), 3000);
  };

  ws.onerror = () => { ws.close(); };
}

function stopRealtime() {
  if (_realtimeWs) { _realtimeWs.close(); _realtimeWs = null; }
}


// Pending deletes queue en localStorage (para sync cuando vuelve conexión)
const _qDel = () => { try { return JSON.parse(localStorage.getItem('_pdel')||'[]'); } catch(e){ return []; } };
const _addDel = (s,i) => { try { const q=_qDel(); if(!q.find(x=>x.s===s&&x.i===i)){q.push({s,i}); localStorage.setItem('_pdel',JSON.stringify(q));} } catch(e){} };
const _rmDel  = (s,i) => { try { localStorage.setItem('_pdel',JSON.stringify(_qDel().filter(x=>!(x.s===s&&x.i===i)))); } catch(e){} };

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      for (const n of DB_STORES)
        if (!db.objectStoreNames.contains(n))
          db.createObjectStore(n, { keyPath:"id" });
    };
    req.onsuccess = () => { _db = req.result; res(_db); };
    req.onerror   = () => rej(req.error);
  });
}
const dbAll = async store => {
  const db = await openDB();
  return new Promise((res,rej) => {
    const r = db.transaction(store,"readonly").objectStore(store).getAll();
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
};
const dbPut = async (store, data) => {
  const db = await openDB();
  await new Promise((res,rej) => {
    const r = db.transaction(store,"readwrite").objectStore(store).put(data);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const _ok = () => { if(data.synced===false) openDB().then(db2=>{ db2.transaction(store,"readwrite").objectStore(store).put({...data,synced:true}); }).catch(()=>{}); };
  sbPush(store, data).then(_ok).catch(()=>{ setTimeout(()=>sbPush(store,data).then(_ok).catch(()=>{}),8000); });
};
const dbDel = async (store, key) => {
  const db = await openDB();
  await new Promise((res,rej) => {
    const r = db.transaction(store,"readwrite").objectStore(store).delete(key);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  sbDelete(store, key).catch(()=>_addDel(store,key)); // Queue si offline
};
const dbGet = async (store, key) => {
  const db = await openDB();
  return new Promise((res,rej) => {
    const r = db.transaction(store,"readonly").objectStore(store).get(key);
    r.onsuccess = () => res(r.result||null); r.onerror = () => rej(r.error);
  });
};

// ============================================================
//  CONSTANTS
// ============================================================
const ORDER_STATES = [
  { id:"nuevo",                label:"Nuevo",               color:"var(--blu)", border:"#4a9ee0" },
  { id:"esperando_foto",       label:"Esperando foto",      color:"#a855f7",    border:"#a855f7" },
  { id:"disenando",            label:"Diseñando",           color:"var(--gold)",border:"#e0c611" },
  { id:"esperando_aprobacion", label:"Esperando aprobación",color:"#f97316",    border:"#f97316" },
  { id:"pago_pendiente",       label:"Pago pendiente",      color:"var(--red)", border:"#e05555" },
  { id:"pago_confirmado",       label:"Pago confirmado",      color:"var(--teal)",border:"#11c8b8" },
  { id:"grabando",             label:"Grabando",            color:"#e0c611",    border:"#e0c611" },
  { id:"listo",                label:"Listo",               color:"var(--grn)", border:"#2ecc71" },
  { id:"enviado",              label:"Enviado",             color:"var(--blu)", border:"#4a9ee0" },
];
const STATE_IDS  = ORDER_STATES.map(s => s.id);
const stateInfo  = id => ORDER_STATES.find(s => s.id === id) || ORDER_STATES[0];
const stateIndex = id => { const i = STATE_IDS.indexOf(id); return i >= 0 ? i : 0; };
const nextState  = id => { const i = STATE_IDS.indexOf(id); return i >= 0 && i < STATE_IDS.length-1 ? STATE_IDS[i+1] : null; };

const ROLE_LABEL = { admin:"Admin", socio:"Socio", employee:"Tienda", promoter:"Promotora" };
const ROLE_CLASS = { admin:"rb-admin", socio:"rb-socio", employee:"rb-employee", promoter:"rb-promoter" };
const EXP_TYPES  = ["Empaques","Electricidad","Internet","Materiales","Marketing","Transporte","Alquiler","Otro"];
const PM_OPTS    = [["efectivo","Efectivo"],["transferencia","Transferencia"],["qr","QR"]];

// ============================================================
//  BUSINESS CONSTANTS
// ============================================================
const BUSINESS = {
  name:     "Garabato",
  tagline:  "Personalización Laser",
  phone:    "59169218766",
  city:     "Santa Cruz de la Sierra, Bolivia",
  mapsUrl:  "https://maps.app.goo.gl/garabato",
  lat:      -17.7798126,
  lng:      -63.1835587,
  schedule: "Lunes a Sabado de 9:00 a 12:00 y de 14:00 a 18:00 hrs",
  currency: "BOB",
  locale:   "es-BO",
  split:    0.5,  // 50/50
  exchangeRate: 6.96, // BOB por USD - actualizar segun necesidad
};

// Permissions
const CAN = {
  seeReports:  r => r === "admin" || r === "socio",
  seeComms:    r => r === "admin" || r === "socio",
  seeInventory:r => r === "admin" || r === "employee" || r === "socio",
  editData:    r => r === "admin" || r === "employee", // employee puede registrar ventas y pedidos
  editConfig:  r => r === "admin",                     // solo admin puede editar productos/usuarios
  seeExpenses: r => r === "admin" || r === "socio",
  seePayments: r => r === "admin" || r === "socio",
  manageConfig:r => r === "admin",
};

// ============================================================
//  UTILITIES
// ============================================================
const uid     = (p="x") => `${p}${Date.now()}${Math.random().toString(36).slice(2,6).toUpperCase()}`;
const r2      = n => Math.round(n*100)/100;
const fmt     = n => new Intl.NumberFormat("es-BO",{style:"currency",currency:"BOB",minimumFractionDigits:2}).format(n??0);
const fmtDate = ts => new Date(ts).toLocaleDateString("es-BO",{day:"2-digit",month:"short",year:"numeric"});
const fmtHora = ts => new Date(ts).toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"});
const todayMs  = () => { const d=new Date(); d.setHours(0,0,0,0); return d.getTime(); };
const todayISO = () => new Date().toISOString().slice(0,10);

function resolvePromoterPrice(product, promoter) {
  if (!product) return 0;
  if (promoter?.customPromoterPrice != null) return promoter.customPromoterPrice;
  return product.promoterPrice;
}
function calcSale(cp, pp, cost) {
  const commission    = r2(cp - pp);
  const profit        = r2(pp - cost);
  const profitOwner   = r2(profit * .5);
  const profitPartner = r2(profit * .5);
  return { commission, profit, profitOwner, profitPartner };
}
function openWhatsApp(phone, message) {
  if (!phone) return;
  const clean = String(phone).replace(/\D/g,"");
  if (!clean) return;
  const full = clean.startsWith("591") ? clean : "591"+clean;
  const text = encodeURIComponent(message||"");
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid) {
    const fallback = encodeURIComponent("https://wa.me/"+full+"?text="+text);
    window.location.href = "intent://send?phone="+full+"&text="+text+"#Intent;scheme=whatsapp;package=com.whatsapp.w4b;S.browser_fallback_url="+fallback+";end";
  } else {
    window.location.href = "https://wa.me/"+full+"?text="+text;
  }
}
async function fileHash(file) {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

function compressImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX=400, canvas=document.createElement("canvas");
        let w=img.width, h=img.height;
        if (w>h) { if(w>MAX){h=h*MAX/w;w=MAX;} } else { if(h>MAX){w=w*MAX/h;h=MAX;} }
        canvas.width=Math.round(w); canvas.height=Math.round(h);
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
function exportBackup(data) {
  const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href=url; a.download="garabato-backup-"+new Date().toISOString().slice(0,10)+".json";
  a.click(); URL.revokeObjectURL(url);
}

// ============================================================
//  BRAND ASSETS
// ============================================================
const LOGO_B64 = "data:image/png;base64,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";

// ============================================================
//  SEED DATA
// ============================================================
async function seed() {
  const ex = await dbAll("users");
  if (ex.length > 0) return;
  // Primera vez — crear usuario Admin con PIN por defecto
  await dbPut("users", {
    id:"u1",
    name:"Admin",
    role:"admin",
    pin:"1234",
    promoterId:null,
    createdAt:Date.now(),
  });
}
// ============================================================
//  REPORT GENERATORS
// ============================================================
function generatePartnerReport(sales, expenses, promoters, period, periodLabel) {
  const now = Date.now();
  const fs  = period==="week"  ? sales.filter(s=>s.date>=now-7*86400000)
            : period==="month" ? sales.filter(s=>s.date>=now-30*86400000)
            : sales;
  const totalSales  = fs.reduce((a,s)=>a+s.clientPrice,0);
  const totalComm   = fs.reduce((a,s)=>a+s.commission,0);
  const totalCost   = fs.reduce((a,s)=>a+s.cost,0);
  const totalProfit = fs.reduce((a,s)=>a+s.profit,0);
  const fe = period==="today" ? expenses.filter(e=>e.date>=todayMs())
           : period==="week"  ? expenses.filter(e=>e.date>=now-7*86400000)
           : period==="month" ? expenses.filter(e=>e.date>=now-30*86400000)
           : expenses;
  const totalExp    = fe.filter(e=>e.afectaSociedad!==false).reduce((a,e)=>a+e.amount,0);
  const totalExpAll = fe.reduce((a,e)=>a+e.amount,0);
  const netFinal    = r2(totalProfit-totalExp);
  const socio       = r2(netFinal*.5);
  const dateStr     = new Date().toLocaleDateString("es-BO",{day:"2-digit",month:"long",year:"numeric"});
  const promos      = promoters.map(pr=>{
    const ps=fs.filter(s=>s.promoterId===pr.id);
    return {name:pr.name,count:ps.length,total:ps.reduce((a,s)=>a+s.clientPrice,0)};
  }).filter(r=>r.count>0).sort((a,b)=>b.total-a.total);
  const prodMap={};
  fs.forEach(s=>{
    if(!prodMap[s.productId]) prodMap[s.productId]={name:s.productName,count:0,rev:0};
    prodMap[s.productId].count++; prodMap[s.productId].rev+=s.clientPrice;
  });
  const topP = Object.values(prodMap).sort((a,b)=>b.count-a.count).slice(0,5);
  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Reporte Garabato</title>
<style>*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,serif;background:#f8f5f0;color:#2a2010;padding:20px;max-width:600px;margin:0 auto}
.hdr{text-align:center;padding:28px 0 20px;border-bottom:2px solid #c8a84b;margin-bottom:24px}
.logo{font-size:2rem;color:#c8a84b;letter-spacing:2px;font-weight:700}
.sub{font-size:.86rem;color:#7a6020;margin-top:4px;text-transform:uppercase;letter-spacing:1px}
.dt{font-size:.86rem;color:#9a8060;margin-top:8px}
.hl{background:linear-gradient(135deg,#fffbf0,#fff8e8);border:2px solid #c8a84b;border-radius:12px;
  padding:20px;margin-bottom:20px;text-align:center}
.hl-lbl{font-size:.76rem;text-transform:uppercase;letter-spacing:1px;color:#7a6020;font-family:sans-serif}
.hl-val{font-size:2rem;color:#c8a84b;font-weight:700;margin-top:6px}
.hl-sub{font-size:.86rem;color:#9a8060;margin-top:6px;font-family:sans-serif}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.card{background:#fff;border:1px solid #e8d8b0;border-radius:10px;padding:14px;text-align:center}
.cv{font-size:1.5rem;font-weight:700}.cv.g{color:#c8a84b}.cv.t{color:#29b8a8}.cv.r{color:#d95555}
.cl{font-size:.68rem;color:#9a8060;margin-top:3px;text-transform:uppercase;letter-spacing:.5px;font-family:sans-serif}
.sec{background:#fff;border:1px solid #e8d8b0;border-radius:12px;padding:18px;margin-bottom:16px}
.sec-t{font-size:.76rem;text-transform:uppercase;letter-spacing:1px;color:#9a8060;margin-bottom:14px;
  font-weight:700;font-family:sans-serif}
.row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;
  border-bottom:1px solid #f0e8d0;font-size:1rem}
.row:last-child{border-bottom:none}
.row.tot{font-weight:700;font-size:1rem;padding-top:10px;margin-top:4px}
.rk{color:#7a6020}.rv{font-weight:700}
.footer{text-align:center;font-size:.76rem;color:#9a8060;margin-top:24px;
  padding-top:16px;border-top:1px solid #e8d8b0;font-family:sans-serif}
</style></head><body>
<div class="hdr"><div class="logo">Garabato</div>
<div class="sub">Reporte para el Socio</div>
<div class="dt">Período: ${periodLabel} - Generado el ${dateStr}</div></div>
<div class="hl"><div class="hl-lbl">Participación del socio</div>
<div class="hl-val">Bs ${socio.toFixed(2)}</div>
<div class="hl-sub">${fs.length} ventas - Ganancia real: Bs ${netFinal.toFixed(2)}</div></div>
<div class="g2">
<div class="card"><div class="cv g">Bs ${totalSales.toFixed(2)}</div><div class="cl">Total vendido</div></div>
<div class="card"><div class="cv t">Bs ${totalProfit.toFixed(2)}</div><div class="cl">Ganancia bruta</div></div>
<div class="card"><div class="cv r">Bs ${totalExp.toFixed(2)}</div><div class="cl">Gastos operativos</div></div>
<div class="card"><div class="cv g">Bs ${netFinal.toFixed(2)}</div><div class="cl">Ganancia real final</div></div>
</div>
<div class="sec"><div class="sec-t">Estado de resultados</div>
<div class="row"><span class="rk">(+) Ingresos brutos</span><span class="rv">Bs ${totalSales.toFixed(2)}</span></div>
<div class="row"><span class="rk">(-) Comisiones promotoras</span><span class="rv" style="color:#d95555">Bs ${totalComm.toFixed(2)}</span></div>
<div class="row"><span class="rk">(-) Costo de materiales</span><span class="rv" style="color:#d95555">Bs ${totalCost.toFixed(2)}</span></div>
<div class="row tot"><span class="rk">= Ganancia bruta</span><span class="rv" style="color:#29b8a8">Bs ${totalProfit.toFixed(2)}</span></div>
<div class="row"><span class="rk">(-) Gastos operativos</span><span class="rv" style="color:#d95555">Bs ${totalExp.toFixed(2)}</span></div>
<div class="row tot"><span class="rk">= Ganancia real final</span><span class="rv" style="color:${netFinal>=0?"#45b87c":"#d95555"}">Bs ${netFinal.toFixed(2)}</span></div>
<div class="row tot"><span class="rk">Socio administrador (50%)</span><span class="rv" style="color:#c8a84b">Bs ${socio.toFixed(2)}</span></div>
<div class="row tot"><span class="rk">Socio (50%)</span><span class="rv" style="color:#29b8a8">Bs ${socio.toFixed(2)}</span></div>
</div>
${promos.length>0?`<div class="sec"><div class="sec-t">Ventas por promotora</div>
${promos.map(r=>`<div class="row"><span class="rk">${r.name} (${r.count} ventas)</span><span class="rv">Bs ${r.total.toFixed(2)}</span></div>`).join("")}
</div>`:""}
${topP.length>0?`<div class="sec"><div class="sec-t">Productos más vendidos</div>
${topP.map((p,i)=>`<div class="row"><span class="rk">${i+1}. ${p.name} (${p.count} u.)</span><span class="rv">Bs ${p.rev.toFixed(2)}</span></div>`).join("")}
</div>`:""}
<div class="footer">Garabato POS - Reporte generado automáticamente - ${dateStr}</div>
</body></html>`;
  const url = URL.createObjectURL(new Blob([html],{type:"text/html"}));
  window.open(url,"_blank"); setTimeout(()=>URL.revokeObjectURL(url),60000);
}

function generateCommissionReport(promoters, sales) {
  const dateStr = new Date().toLocaleDateString("es-BO",{day:"2-digit",month:"long",year:"numeric"});
  const data = promoters.map(pr=>{
    const pend = sales.filter(s=>s.promoterId===pr.id&&s.commissionStatus==="pendiente");
    return {name:pr.name,phone:pr.phone,pending:pend.reduce((a,s)=>a+s.commission,0),
      count:pend.length,sales:pend};
  }).filter(d=>d.count>0);
  const total = data.reduce((a,d)=>a+d.pending,0);
  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Comisiones Garabato</title>
<style>*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,serif;background:#f8f5f0;color:#2a2010;padding:20px;max-width:600px;margin:0 auto}
.hdr{text-align:center;padding:28px 0 20px;border-bottom:2px solid #c8a84b;margin-bottom:24px}
.logo{font-size:2rem;color:#c8a84b;letter-spacing:2px;font-weight:700}
.sub{font-size:.86rem;color:#7a6020;margin-top:4px;text-transform:uppercase;letter-spacing:1px;font-family:sans-serif}
.dt{font-size:.86rem;color:#9a8060;margin-top:8px;font-family:sans-serif}
.total-box{background:linear-gradient(135deg,#fffbf0,#fff8e8);border:2px solid #c8a84b;
  border-radius:12px;padding:20px;margin-bottom:20px;text-align:center}
.tl{font-size:.76rem;text-transform:uppercase;letter-spacing:1px;color:#7a6020;font-family:sans-serif}
.tv{font-size:2rem;color:#d95555;font-weight:700;margin-top:6px}
.pc{background:#fff;border:1px solid #e8d8b0;border-radius:12px;padding:18px;margin-bottom:14px}
.ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;
  padding-bottom:12px;border-bottom:1px solid #f0e8d0}
.pn{font-size:1rem;font-weight:700}.pp{font-size:.76rem;color:#9a8060;margin-top:3px;font-family:sans-serif}
.pa{font-size:1.5rem;color:#d95555;font-weight:700;text-align:right}
.pal{font-size:.68rem;color:#9a8060;text-align:right;font-family:sans-serif}
.sr{display:flex;justify-content:space-between;align-items:center;padding:6px 0;
  border-bottom:1px solid #f8f4ee;font-size:.86rem}
.sr:last-child{border-bottom:none}
.sn{color:#7a6020}.sd{font-size:.76rem;color:#9a8060;margin-top:2px;font-family:sans-serif}
.sc{font-weight:700;color:#d95555}
.footer{text-align:center;font-size:.76rem;color:#9a8060;margin-top:24px;
  padding-top:16px;border-top:1px solid #e8d8b0;font-family:sans-serif}
</style></head><body>
<div class="hdr"><div class="logo">Garabato</div>
<div class="sub">Comisiones pendientes de pago</div>
<div class="dt">${dateStr}</div></div>
<div class="total-box"><div class="tl">Total a liquidar</div>
<div class="tv">Bs ${total.toFixed(2)}</div></div>
${data.map(d=>`<div class="pc"><div class="ph">
<div><div class="pn">${d.name}</div><div class="pp">Tel: ${d.phone}</div></div>
<div><div class="pa">Bs ${d.pending.toFixed(2)}</div>
<div class="pal">${d.count} venta${d.count!==1?"s":""} pendientes</div></div></div>
${d.sales.map(s=>`<div class="sr">
<div><div class="sn">${s.productName}${s.customization?` - "${s.customization}"`:""}
</div><div class="sd">${new Date(s.date).toLocaleDateString("es-BO",{day:"2-digit",month:"short",year:"numeric"})}</div></div>
<div class="sc">Bs ${s.commission.toFixed(2)}</div></div>`).join("")}
</div>`).join("")}
${data.length===0?`<div style="text-align:center;padding:24px;color:#9a8060;font-family:sans-serif">Sin comisiones pendientes.</div>`:""}
<div class="footer">Garabato POS - ${dateStr}</div>
</body></html>`;
  const url = URL.createObjectURL(new Blob([html],{type:"text/html"}));
  window.open(url,"_blank"); setTimeout(()=>URL.revokeObjectURL(url),60000);
}

// ============================================================
//  SVG ICONS
// ============================================================
const PATHS = {
  home:    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>,
  tag:     <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
  cart:    <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></>,
  box:     <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  users:   <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  chart:   <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  check:   <polyline points="20 6 9 17 4 12"/>,
  wifi:    <><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  noWifi:  <><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/><path d="M5 12.55a10.94 10.94 0 015.17-2.39"/><path d="M10.71 5.05A16 16 0 0122.56 9"/><path d="M1.42 9a15.91 15.91 0 014.7-2.88"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  warn:    <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  sync:    <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
  laser:   <><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>,
  receipt: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  lock:    <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
  logout:  <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
  edit:    <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  download:<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  money:   <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
  history: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  send:    <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  phone:   <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>,
  truck:   <><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  star:    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  filter:  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
  clip:    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>,
  eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
};
const Ic = ({n,s=20,c="currentColor"}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {PATHS[n]||null}
  </svg>
);
const WaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.531 5.858L.057 23.676a.75.75 0 00.938.937l5.818-1.474A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.92 0-3.716-.512-5.261-1.403l-.36-.211-3.724.944.963-3.724-.23-.374A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

// ============================================================
//  TOAST HOOK
// ============================================================
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type="ok") => {
    const id = uid("t");
    setToasts(t => [...t, {id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 2800);
  },[]);
  const ToastContainer = () => (
    <div className="toast-wrap">
      {toasts.map(t=><div key={t.id} className={"toast t-"+t.type}>{t.msg}</div>)}
    </div>
  );
  return {show, ToastContainer};
}

// ============================================================
//  APP ROOT
// ============================================================
export default function App() {
  const [user,    setUser]    = useState(null);
  const [page,    setPage]    = useState("home");
  const [online,  setOnline]  = useState(navigator.onLine);
  const [ready,   setReady]   = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSale,setShowSale]= useState(false);
  const [historic,setHistoric]= useState(false);
  const [deleteSale,setDeleteSale]= useState(null);
  const [showOnboarding,setShowOnboarding]= useState(false);
  const [products, setProducts]  = useState([]);
  const [promoters,setPromoters] = useState([]);
  const [sales,    setSales]     = useState([]);
  const [expenses, setExpenses]  = useState([]);
  const [payments, setPayments]  = useState([]);
  const [users,    setUsers]     = useState([]);
  const [vouchers, setVouchers]  = useState([]);
  const {show:toast, ToastContainer} = useToast();

  useEffect(()=>{
    const st=document.createElement("style"); st.textContent=CSS; document.head.appendChild(st);
    (navigator.onLine ? syncFromSupabase() : Promise.resolve())
      .then(()=>seed())
      .then(()=>reload())
      .then(()=>{
        setReady(true);
        // Iniciar realtime si hay conexión
        if (navigator.onLine) startRealtime(()=>reload());
      })
      .catch(err=>{
        console.error("Error inicializando app:", err);
        setReady(true);
      });
    const on=async ()=>{
      setOnline(true);
      try{
        const _SS=["products","promoters","users","sales","expenses","commissionPayments","vouchers"];
        for(const _s of _SS){const _a=await dbAll(_s);for(const _r of _a.filter(x=>x.synced===false)){await sbPush(_s,_r).catch(()=>{});}}
      }catch(e){}
      reload(true);
      startRealtime(()=>reload());
    };
    const off=()=>{setOnline(false); stopRealtime();};
    const onVisible=()=>{
      if(document.visibilityState==="visible"&&navigator.onLine){
        if(!_realtimeWs) startRealtime(()=>reload()); // reconectar si se cayó
        reload(true);
      }
    };
    // Auto-sync silencioso cada 30 segundos
    const _autoSync = async ()=>{
      if(!navigator.onLine) return;
      try{
        const _SS=["products","promoters","users","sales","expenses","commissionPayments","vouchers"];
        for(const _s of _SS){ const _a=await dbAll(_s); for(const _r of _a.filter(x=>x.synced===false)){ await sbPush(_s,_r).catch(()=>{}); } }
        await syncFromSupabase().catch(()=>{});
        reload();
      }catch(e){}
    };
    const _autoTimer = setInterval(_autoSync, 30000);
    window.addEventListener("online",on); window.addEventListener("offline",off);
    document.addEventListener("visibilitychange",onVisible);
    return ()=>{
      clearInterval(_autoTimer);
      window.removeEventListener("online",on); window.removeEventListener("offline",off);
      document.removeEventListener("visibilitychange",onVisible);
      stopRealtime();
    };
  },[]);

  const reload = useCallback(async (fromCloud=false)=>{
    try {
      // Si fromCloud=true o hay conexión, sincronizar desde Supabase primero
      if (fromCloud && navigator.onLine) {
        await syncFromSupabase().catch(()=>{});
      }
      const [pr,prm,sl,ex,pay,usr,vch] = await Promise.all([
        dbAll("products"),dbAll("promoters"),dbAll("sales"),
        dbAll("expenses"),dbAll("commissionPayments"),dbAll("users"),dbAll("vouchers"),
      ]);
      setProducts(pr); setPromoters(prm);
      setSales(sl.sort((a,b)=>b.date-a.date));
      setExpenses(ex.sort((a,b)=>b.date-a.date));
      setPayments(pay.sort((a,b)=>b.date-a.date));
      setUsers(usr);
      setVouchers(vch.sort((a,b)=>(b.uploadedAt||0)-(a.uploadedAt||0)));
    } catch(err) {
      console.error("Error cargando datos:", err);
    }
  },[]);

  const pendingSync = useMemo(()=>
    [...sales,...expenses,...products,...promoters,...vouchers]
      .filter(r=>r.synced===false).length + _qDel().length,
  [sales,expenses,products,promoters,vouchers]);

  const role = user?.role;


  // HANDLERS
    const handleSync = async ()=>{
    if (!online||syncing) return;
    setSyncing(true);
    try {
      // 1. Bajar todo de Supabase
      await syncFromSupabase();
      // 2. Subir TODO lo no sincronizado de TODOS los stores
      const SYNC_STORES = ["products","promoters","users","sales","expenses","commissionPayments","vouchers"];
      let total = 0;
      for (const store of SYNC_STORES) {
        const all = await dbAll(store);
        const unsynced = all.filter(r=>r.synced===false);
        for (const r of unsynced) {
          await dbPut(store,{...r,synced:true});
          total++;
        }
      }
      // 3. Procesar eliminaciones pendientes
      const pDels = _qDel();
      for (const d of pDels) {
        try { await sbDelete(d.s,d.i); _rmDel(d.s,d.i); total++; } catch(e){}
      }
      await reload();
      toast(total>0?total+" registro"+(total!==1?"s":"")+" sincronizados":"✓ Todo sincronizado","ok");
    } catch(e) {
      toast("Error al sincronizar","err");
    } finally {
      setSyncing(false);
    }
  };

  const handleBackup = async ()=>{
    const [pr,prm,sl,ex,pay,usr,vch]=await Promise.all([
      dbAll("products"),dbAll("promoters"),dbAll("sales"),dbAll("expenses"),
      dbAll("commissionPayments"),dbAll("users"),dbAll("vouchers"),
    ]);
    exportBackup({
      version:"garabato-v12",
      exportedAt:new Date().toISOString(),
      products:pr,
      promoters:prm,
      sales:sl,
      expenses:ex,
      commissionPayments:pay,
      users:usr.map(u=>({...u,pin:"[OCULTO]"})),
      vouchers:vch.map(v=>({...v,image:null})), // omitir imágenes base64 del backup
    });
    toast("✓ Backup descargado","ok");
  };

  const handleNewSale = async data=>{
    await dbPut("sales",{...data,synced:false});
    if (!data.isHistoric) {
      const lines = data.items || [{productId:data.productId,qty:1,variantId:data.variantId}];
      for (const line of lines) {
        const prod = products.find(p=>p.id===line.productId);
        if (!prod) continue;
        const qty = line.qty||1;
        if (line.variantId && prod.hasVariants && prod.variants?.length) {
          const variants = prod.variants.map(v=>v.id===line.variantId&&v.stock>0?{...v,stock:Math.max(0,v.stock-qty)}:v);
          const totalStock = variants.reduce((a,v)=>a+(v.stock||0),0);
          await dbPut("products",{...prod,variants,stock:totalStock,synced:false});
        } else if (prod.stock>0) {
          await dbPut("products",{...prod,stock:Math.max(0,prod.stock-qty),synced:false});
        }
      }
    }
    await reload(); setShowSale(false); setPage("sales");
    toast(data.isHistoric?"Venta histórica cargada":"Venta registrada!","ok");
  };

  const handleEditSale = async updated=>{
    await dbPut("sales",{...updated,synced:false});
    await reload(); toast("✓ Venta actualizada","ok");
  };

  const handleDeleteSale = async (id, motivo="")=>{
    const s = await dbGet("sales", id);
    if (s && motivo) {
      await dbPut("sales",{...s,deleted:true,deletedAt:Date.now(),deletedReason:motivo});
      // Devolver stock al inventario (solo ventas no históricas)
      if (!s.isHistoric) {
        const lines = s.items || (s.productId?[{productId:s.productId,qty:1,variantId:s.variantId}]:[]);
        for (const line of lines) {
          const prod = await dbGet("products", line.productId);
          if (!prod) continue;
          const qty = line.qty||1;
          if (line.variantId && prod.hasVariants && prod.variants?.length) {
            const variants = prod.variants.map(v=>v.id===line.variantId?{...v,stock:(v.stock||0)+qty}:v);
            const totalStock = variants.reduce((a,v)=>a+(v.stock||0),0);
            await dbPut("products",{...prod,variants,stock:totalStock,synced:false});
          } else if (prod.stock!=null) {
            await dbPut("products",{...prod,stock:(prod.stock||0)+qty,synced:false});
          }
        }
      }
    } else {
      await dbDel("sales",id);
    }
    await reload(); toast("Venta eliminada","info");
  };

  const handleMarkPaid = async saleId=>{
    const s=await (async()=>{const db=await openDB();return new Promise((r)=>{const q=db.transaction("sales","readonly").objectStore("sales").get(saleId);q.onsuccess=()=>r(q.result);})})();
    if (s) await dbPut("sales",{...s,commissionStatus:"pagado"});
    await reload(); toast("✓ Comisión pagada","ok");
  };

  const handlePayPromoter = async (promoterId,saleIds,total)=>{
    await dbPut("commissionPayments",{id:uid("cp"),promoterId,amount:total,salesIds:saleIds,date:Date.now()});
    for (const sid of saleIds){
      const s=await (async()=>{const db=await openDB();return new Promise((r)=>{const q=db.transaction("sales","readonly").objectStore("sales").get(sid);q.onsuccess=()=>r(q.result);})})();
      if (s) await dbPut("sales",{...s,commissionStatus:"pagado"});
    }
    await reload(); toast("Pago de "+fmt(total)+" registrado","ok");
  };

  if (!ready) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      height:"100dvh",background:"#0a0a08",gap:20}}>
      <img src={LOGO_B64} style={{width:80,height:80,borderRadius:16,
        animation:"pulse 1.5s ease-in-out infinite",objectFit:"cover"}}/>
      <div style={{fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"1.5rem",
        color:"#e0c611",letterSpacing:"3px"}}>GARABATO</div>
      <div style={{fontSize:".76rem",color:"#555",letterSpacing:"1px",
        textTransform:"uppercase"}}>Cargando...</div>
      <style>{`@keyframes pulse{0%,100%{opacity:.6;transform:scale(.95)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );

  if (!user) return <LoginScreen users={users} onLogin={u=>{
    setUser(u);
    setPage("home");
    // Mostrar onboarding si es admin y no hay productos cargados
    if (u.role==="admin" && products.length===0) setShowOnboarding(true);
  }}/>;

  const unassignedVouchers = vouchers.filter(v=>!v.saleId).length;

  const navItems = [
    {id:"home",     icon:"home",    label:"Inicio"},
    {id:"sales",    icon:"cart",    label:"Ventas",   badge:pendingSync},
    CAN.seeInventory(role) && {id:"inventory",icon:"box",   label:"Stock"},
    (role!=="socio") && {id:"promoters",icon:"users",label:role==="promoter"?"Perfil":"Promotoras"},
    CAN.seeExpenses(role)  && {id:"expenses", icon:"receipt",label:"Gastos"},
    CAN.seeReports(role)   && {id:"vouchers", icon:"clip",   label:"Comprobantes", badge:unassignedVouchers||0},
    CAN.seeReports(role)   && {id:"reports",  icon:"chart",  label:"Reportes"},
    CAN.manageConfig(role) && {id:"settings", icon:"settings",label:"Configuración"},
  ].filter(Boolean);

  const PageContent = ()=>(
    <>
      {page==="home"     && <HomePage sales={sales} products={products} promoters={promoters}
        expenses={expenses} role={role} user={user}/>}
      {page==="sales"    && <SalesPage sales={sales} role={role} user={user} promoters={promoters}
        vouchers={vouchers}
        onMarkPaid={handleMarkPaid} onEdit={handleEditSale}
        onDelete={role==="admin"?sale=>setDeleteSale(sale):null}
        onImport={role==="admin"?async rows=>{for(const s of rows){await dbPut("sales",s);}await reload();toast(`✓ ${rows.length} ventas importadas`,"ok");}:null}
        onReload={reload}/>}
      {page==="vouchers" && (CAN.seeReports(role)
        ? <VouchersPage vouchers={vouchers} sales={sales} user={user}
            onSave={async v=>{await dbPut("vouchers",{...v,synced:false});await reload();toast("✓ Comprobante guardado","ok");}}
            onAssign={async(vid,sid)=>{
              const v=await dbGet("vouchers",vid); const s=await dbGet("sales",sid);
              if(v&&s){
                await dbPut("vouchers",{...v,saleId:sid,saleSummary:s.productName+" · "+fmtDate(s.date),synced:false});
                await dbPut("sales",{...s,voucherId:vid,synced:false});
                await reload(); toast("✓ Comprobante asignado","ok");
              }
            }}
            onUnassign={async(vid,sid)=>{
              const v=await dbGet("vouchers",vid); const s=sid?await dbGet("sales",sid):null;
              if(v) await dbPut("vouchers",{...v,saleId:null,saleSummary:"",synced:false});
              if(s) await dbPut("sales",{...s,voucherId:null,synced:false});
              await reload(); toast("Asignación removida","info");
            }}/>
        : <Locked/>)}
      {page==="inventory"&& (CAN.seeInventory(role)
        ? <InventoryPage products={products} role={role}
            onSave={async p=>{
              const existing = await dbGet("products",p.id);
              let toSave = {...p,synced:false};
              if(existing && (existing.clientPrice!==p.clientPrice||existing.promoterPrice!==p.promoterPrice||existing.cost!==p.cost)){
                toSave.priceHistory=[...(existing.priceHistory||[]),
                  {date:Date.now(),clientPrice:existing.clientPrice,promoterPrice:existing.promoterPrice,cost:existing.cost}
                ];
              }
              await dbPut("products",toSave);await reload();toast("✓ Producto guardado","ok");
            }}
            onDelete={CAN.editData(role)?async id=>{await dbDel("products",id);await reload();toast("Producto eliminado","info");}:null}/>
        : <Locked/>)}
      {page==="promoters"&& <PromotersPage promoters={promoters} sales={sales} role={role}
        payments={payments} user={user} onPay={handlePayPromoter}
        onSave={CAN.editData(role)?async p=>{await dbPut("promoters",{...p,synced:false});await reload();toast("✓ Promotora guardada","ok");}:null}/>}
      {page==="expenses" && (CAN.seeExpenses(role)
        ? <ExpensesPage expenses={expenses}
            onAdd={async e=>{await dbPut("expenses",{...e,synced:online});await reload();toast("✓ Gasto registrado","ok");}}
            onDelete={async id=>{await dbDel("expenses",id);await reload();toast("Gasto eliminado","info");}}/>
        : <Locked/>)}
      {page==="reports"  && (CAN.seeReports(role)
        ? <ReportsPage sales={sales} expenses={expenses} promoters={promoters} payments={payments} role={role}/>
        : <Locked/>)}
      {page==="settings" && (CAN.manageConfig(role)
        ? <SettingsPage users={users} products={products} promoters={promoters}
            onSaveUser={async u=>{await dbPut("users",{...u,synced:false});await reload();toast("✓ Usuario guardado","ok");}}
            onDelUser={async id=>{await dbDel("users",id);await reload();toast("Usuario eliminado","info");}}
            onSaveProduct={async p=>{
              if(p._delete){await dbDel("products",p.id);await reload();toast("Producto eliminado","info");}
              else{
                // Guardar historial de precios si cambiaron
                const existing = await dbGet("products",p.id);
                let toSave = {...p,synced:false};
                if(existing && (existing.clientPrice!==p.clientPrice||existing.promoterPrice!==p.promoterPrice||existing.cost!==p.cost)){
                  toSave.priceHistory=[...(existing.priceHistory||[]),
                    {date:Date.now(),clientPrice:existing.clientPrice,promoterPrice:existing.promoterPrice,cost:existing.cost}
                  ];
                }
                await dbPut("products",toSave);await reload();toast("✓ Producto guardado","ok");
              }
            }}/>
        : <Locked/>)}
    </>
  );

  return (
    <div className={"app"+(user?" app-light":"")}>
      <ToastContainer />

      {/* SIDEBAR - solo desktop cuando logueado */}
      {user&&(
        <aside className="sidebar">
          <div className="sb-header">
            <img src={LOGO_B64} className="sb-logo" alt="Garabato"/>
            <span className="sb-brand">GARABATO</span>
          </div>
          <div className="sb-nav">
            {navItems.map(it=>(
              <button key={it.id} className={"sb-item"+(page===it.id?" act":"")} onClick={()=>setPage(it.id)}>
                <Ic n={it.icon} s={18}/>
                <span>{it.label}</span>
                {it.badge>0&&<span className="sb-badge">{it.badge}</span>}
              </button>
            ))}
          </div>
          <div style={{padding:"8px 10px",borderTop:"1px solid var(--b1)"}}>
            <div style={{fontSize:".68rem",color:"#555",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Resumen de hoy</div>
            {(()=>{
              const todaySales = sales.filter(s=>s.date>=todayMs()&&!s.deleted);
              const todayTotal = todaySales.reduce((a,s)=>a+s.clientPrice,0);
              return (
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:".76rem"}}>
                    <span style={{color:"#666"}}>Ventas hoy</span>
                    <span style={{color:"#e0c611",fontWeight:800}}>{todaySales.length}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:".76rem"}}>
                    <span style={{color:"#666"}}>Total hoy</span>
                    <span style={{color:"#e0c611",fontWeight:800}}>{fmt(todayTotal)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="sb-footer">
            {pendingSync>0&&online&&(
              <button className={"sb-sync"+(syncing?" spin":"")} onClick={handleSync} style={{width:"100%"}}>
                <Ic n="sync" s={13}/>
                {syncing?"Sincronizando...":pendingSync+" pendiente"+(pendingSync>1?"s":"")}
              </button>
            )}
            {CAN.seeReports(role)&&(
              <button className="sb-hist" onClick={()=>{setHistoric(true);setShowSale(true);}}>
                <Ic n="history" s={14}/> Venta histórica
              </button>
            )}
            <button className="sb-new-sale" onClick={()=>{setHistoric(false);setShowSale(true);}}>
              <Ic n="plus" s={16} c="#0a0a00"/> Nueva venta
            </button>
            <div className="sb-user">
              <div style={{flex:1}}>
                <div className="sb-uname">{user.name.split(" ")[0]}</div>
                <div className="sb-urole">{ROLE_LABEL[user.role]}</div>
              </div>
              <div className="sb-actions">
                {CAN.manageConfig(role)&&(
                  <button className="sb-btn" onClick={handleBackup} title="Descargar backup">
                    <Ic n="download" s={13}/>
                  </button>
                )}
                <button className="sb-btn" onClick={()=>{setUser(null);setPage("home");}} title="Salir">
                  <Ic n="logout" s={13}/>
                </button>
              </div>
            </div>
            <div style={{textAlign:"center",fontSize:".68rem",
              color:online?"#2ecc71":"#e05555",paddingBottom:2,fontWeight:700}}>
              {online?"● Online":"● Sin conexión"}
            </div>
          </div>
        </aside>
      )}

      {/* TOPBAR - solo mobile */}
      {user&&(
        <TopBar user={user} online={online} pendingSync={pendingSync} syncing={syncing}
          onSync={handleSync}
          onLogout={()=>{setUser(null);setPage("home");}}
          onBackup={CAN.manageConfig(role)?handleBackup:null}
        />
      )}

      <div className="content">
        {PageContent()}
      </div>

      {/* FAB - solo mobile */}
      {user&&(role==="admin"||role==="employee"||role==="promoter") && (
        <>
          <button className="fab" onClick={()=>{setHistoric(false);setShowSale(true);}} aria-label="Nueva venta">
            <Ic n="plus" s={24} c="#0a0a00"/>
          </button>
          {CAN.seeReports(role) && (
            <button className="fab-sec" onClick={()=>{setHistoric(true);setShowSale(true);}} title="Venta histórica">
              <Ic n="history" s={16} c="var(--muted)"/>
            </button>
          )}
        </>
      )}

      {/* BOTTOM NAV - solo mobile */}
      {user&&(
        <nav className="bnav">
          {navItems.map(it=>(
            <button key={it.id} className={"ni"+(page===it.id?" act":"")} onClick={()=>setPage(it.id)}>
              <div className="ni-w">
                <Ic n={it.icon} s={21}/>
                {it.badge>0 && <div className="nbadge">{it.badge}</div>}
              </div>
              <span>{it.label}</span>
            </button>
          ))}
        </nav>
      )}

      {showSale && (
        <NewSaleModal products={products} promoters={promoters} user={user} isHistoric={historic}
          onClose={()=>setShowSale(false)} onSubmit={handleNewSale}/>
      )}
      {deleteSale && (
        <DeleteSaleModal sale={deleteSale}
          onClose={()=>setDeleteSale(null)}
          onConfirm={async(id,motivo)=>{await handleDeleteSale(id,motivo);setDeleteSale(null);}}/>
      )}

      {showOnboarding&&(
        <div className="overlay" style={{background:"rgba(0,0,0,.96)"}}>
          <div className="sheet" style={{borderRadius:"20px 20px 0 0"}}>
            <div className="sh-hd"/>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:"2rem",marginBottom:8}}>🎉</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"1.5rem",color:"var(--gold)",marginBottom:6}}>
                Bienvenido a Garabato POS
              </div>
              <div style={{fontSize:".86rem",color:"var(--muted)",lineHeight:1.6}}>
                Para comenzar, seguí estos pasos rápidos
              </div>
            </div>
            {[
              {n:1, icon:"🔑", title:"Cambia tu PIN", desc:"Ve a Config → Usuarios → edita Admin y pon tu PIN personal"},
              {n:2, icon:"📦", title:"Carga tus productos", desc:"Ve a Config → Productos → Agregar producto con fotos y precios"},
              {n:3, icon:"👤", title:"Agrega tu equipo", desc:"Ve a Config → Usuarios para agregar al socio, empleada y promotoras"},
              {n:4, icon:"🚀", title:"Empieza a vender", desc:"Registra tu primera venta o pedido desde el boton amarillo"},
            ].map(step=>(
              <div key={step.n} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid var(--b1)"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(224,198,17,.15)",
                  border:"1px solid rgba(224,198,17,.3)",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:"1rem",flexShrink:0}}>
                  {step.icon}
                </div>
                <div>
                  <div style={{fontWeight:800,fontSize:".86rem",color:"var(--txt)"}}>{step.title}</div>
                  <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:2,lineHeight:1.4}}>{step.desc}</div>
                </div>
              </div>
            ))}
            <button className="btn btn-gold" style={{marginTop:18}} onClick={()=>{setShowOnboarding(false);setPage("settings");}}>
              <Ic n="settings" s={16} c="#100d02"/> Ir a Configuración
            </button>
            <button className="btn btn-out" style={{marginTop:8}} onClick={()=>setShowOnboarding(false)}>
              Lo hago después
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  LOGIN
// ============================================================
function LoginScreen({users, onLogin}) {
  const [sel,setSel] = useState(null);
  const [pin,setPin] = useState("");
  const [err,setErr] = useState("");
  const press = k => {
    if (!sel) return;
    setErr("");
    if (k==="DEL"){setPin(p=>p.slice(0,-1));return;}
    const next=pin+k;
    if (next.length>4) return;
    setPin(next);
    if (next.length===4){
      if (next===sel.pin) onLogin(sel);
      else {setErr("PIN incorrecto, intentá de nuevo.");setPin("");}
    }
  };
  // Teclado físico (compu)
  useEffect(()=>{
    const handler = e => {
      if (e.key>="0"&&e.key<="9") press(e.key);
      else if (e.key==="Backspace") press("DEL");
      else if (e.key==="Enter") {} // ignorar enter
    };
    window.addEventListener("keydown", handler);
    return ()=>window.removeEventListener("keydown", handler);
  },[sel,pin]);
  return (
    <div className="splash">
      <img src="data:image/png;base64,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" alt="Garabato" style={{width:"220px",height:"220px",borderRadius:"22px",marginBottom:"32px",objectFit:"cover",boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}/>
      <div className="ugrid">
        {users.map(u=>(
          <button key={u.id} className={"ub"+(sel?.id===u.id?" sel":"")}
            onClick={()=>{setSel(u);setPin("");setErr("");}}>
            <div className="ub-ico">{u.name.charAt(0)}</div>
            <div className="ub-name">{u.name}</div>
            <div className="ub-role">
              <span className={"chip "+(ROLE_CLASS[u.role]||"ch-dim")}>{ROLE_LABEL[u.role]||u.role}</span>
            </div>
          </button>
        ))}
      </div>
      {sel && (
        <>
          <div className="pin-hd">PIN para <b>{sel.name}</b></div>
          <div className="pin-dots">
            {[0,1,2,3].map(i=><div key={i} className={"pd"+(pin.length>i?" on":"")}/>)}
          </div>
          <div className="pin-pad">
            {["1","2","3","4","5","6","7","8","9","","0","DEL"].map((k,i)=>(
              k===""?<div key={i}/>:
              <button key={i} className={"pk"+(k==="DEL"?" del":"")} onClick={()=>press(k)}>{k}</button>
            ))}
          </div>
          <div className="pin-err">{err}</div>
        </>
      )}
    </div>
  );
}

// ============================================================
//  TOP BAR
// ============================================================
function TopBar({user, online, pendingSync, syncing, onSync, onLogout, onBackup}) {
  return (
    <div className="topbar">
      <div className="tb-l">
        <img src={LOGO_B64} style={{height:"32px",borderRadius:"6px",objectFit:"cover"}} alt="Garabato"/>
      </div>
      <div className="tb-r">
        {pendingSync>0&&online&&(
          <button className={"tbtn"+(syncing?" spin":"")} onClick={onSync}>
            <Ic n="sync" s={13}/>
            {syncing?"Sincronizando...":pendingSync+" pendiente"+(pendingSync>1?"s":"")}
          </button>
        )}
        {onBackup&&(
          <button className="tbtn" onClick={onBackup} title="Descargar backup"><Ic n="download" s={13}/></button>
        )}
        <div className={"np "+(online?"np-on":"np-off")}>
          <Ic n={online?"wifi":"noWifi"} s={11}/>
          {online?"Online":"Offline"}
        </div>
        <button className="ubtn" onClick={onLogout}>
          <span className={"rbadge "+(ROLE_CLASS[user.role]||"")}>{ROLE_LABEL[user.role]}</span>
          <span className="uname">{user.name.split(" ")[0]}</span>
          <Ic n="logout" s={13} c="var(--muted)"/>
        </button>
      </div>
    </div>
  );
}

// ============================================================
//  HOME PAGE
// ============================================================
function HomePage({sales, products, promoters, expenses, role, user}) {
  const td = todayMs();
  const activeSales = sales.filter(s=>!s.deleted);
  const mySales  = role==="promoter" ? activeSales.filter(s=>s.promoterId===user.promoterId) : activeSales;

  const todaySales = mySales.filter(s=>s.date>=td);
  const totalToday = todaySales.reduce((a,s)=>a+s.clientPrice,0);
  const commToday  = todaySales.reduce((a,s)=>a+s.commission,0);
  const totalAll   = mySales.reduce((a,s)=>a+s.clientPrice,0);
  const netAll     = activeSales.reduce((a,s)=>a+s.profit,0);
  const ownerAll   = activeSales.reduce((a,s)=>a+s.profitOwner,0);
  const pendComm   = activeSales.filter(s=>s.commissionStatus==="pendiente").reduce((a,s)=>a+s.commission,0);
  const myPendComm = mySales.filter(s=>s.commissionStatus==="pendiente").reduce((a,s)=>a+s.commission,0);
  const lowStock   = products.filter(p=>p.stock<=p.lowStockAlert);

  const profitToday  = todaySales.reduce((a,s)=>a+s.profit,0);
  const commGenToday = todaySales.reduce((a,s)=>a+s.commission,0);
  // Ventas de hoy por promotora (para admin/socio)
  const byPromoterToday = promoters.map(pr=>{
    const pSales = todaySales.filter(s=>s.promoterId===pr.id);
    return {name:pr.name.split(" ")[0], count:pSales.length, total:pSales.reduce((a,s)=>a+s.clientPrice,0)};
  }).filter(p=>p.count>0);
  const directToday = todaySales.filter(s=>s.isDirectSale);

  return (
    <div className="pe">
      <div className="card card-gold" style={{marginBottom:14}}>
        <div style={{fontSize:".68rem",color:"var(--gd)",fontWeight:800,textTransform:"uppercase",letterSpacing:.6,marginBottom:4}}>
          {new Date().toLocaleDateString("es-BO",{weekday:"long",day:"numeric",month:"long"})}
        </div>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"2rem",color:"var(--gold)",lineHeight:1}}>
            {fmt(totalToday)}
          </div>
          <div style={{fontSize:".76rem",color:"var(--gd)",fontWeight:700}}>
            Hola, {user.name.split(" ")[0]}!
          </div>
        </div>
        <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:4}}>
          {todaySales.length} {todaySales.length===1?"venta":"ventas"} hoy
          {role==="promoter"
            ? " · Tu comisión: "+fmt(commToday)
            : " · Ganancia: "+fmt(profitToday)}
        </div>
        {(role==="admin"||role==="socio")&&todaySales.length>0&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(224,198,17,.2)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:".68rem",color:"var(--gd)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4}}>Ventas</div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"1.2rem",color:"var(--gold)"}}>{todaySales.length}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:".68rem",color:"var(--gd)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4}}>Ganancia</div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"1.2rem",color:"var(--teal)"}}>{fmt(profitToday)}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:".68rem",color:"var(--gd)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4}}>Comisiones</div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"1.2rem",color:"var(--red)"}}>{fmt(commGenToday)}</div>
              </div>
            </div>
            {(byPromoterToday.length>0||directToday.length>0)&&(
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {directToday.length>0&&(
                  <span style={{fontSize:".68rem",background:"rgba(17,200,184,.12)",color:"var(--teal)",padding:"2px 8px",borderRadius:10,fontWeight:700}}>
                    Tienda: {directToday.length} · {fmt(directToday.reduce((a,s)=>a+s.clientPrice,0))}
                  </span>
                )}
                {byPromoterToday.map(p=>(
                  <span key={p.name} style={{fontSize:".68rem",background:"rgba(224,198,17,.1)",color:"var(--gold)",padding:"2px 8px",borderRadius:10,fontWeight:700}}>
                    {p.name}: {p.count} · {fmt(p.total)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {lowStock.length>0&&CAN.seeInventory(role)&&(
        <div className="al al-warn">
          <Ic n="warn" s={14}/>
          <span>
            <b>{lowStock.slice(0,2).map(p=>p.name).join(", ")}</b>
            {lowStock.length>2?" y "+(lowStock.length-2)+" más":""} - stock bajo
          </span>
        </div>
      )}



      {CAN.seeReports(role)&&(
        <>
          <div className="g2">
            <div className="sc hg"><div className="sl">Total vendido</div><div className="sv gold">{fmt(totalAll)}</div><div className="ss">{activeSales.length} ventas</div></div>
            <div className="sc ht"><div className="sl">Ganancia tienda</div><div className="sv teal">{fmt(netAll)}</div><div className="ss">Antes de gastos fijos</div></div>
          </div>
          <div className="g2">
            <div className="sc hg"><div className="sl">Socio administrador (50%)</div><div className="sv gold">{fmt(ownerAll)}</div><div className="ss">Distribución societaria</div></div>
            <div className="sc hr"><div className="sl">Com. pendientes</div><div className="sv red">{fmt(pendComm)}</div><div className="ss">Por liquidar</div></div>
          </div>
          <div className="g2">
            <div className="sc"><div className="sl">Productos</div><div className="sv gold">{products.length}</div><div className="ss">En catálogo</div></div>
            <div className="sc"><div className="sl">Promotoras</div><div className="sv grn">{promoters.filter(p=>p.active).length}</div><div className="ss">Activas</div></div>
          </div>
        </>
      )}
      {role==="socio"&&(
        <>
          <div className="g2">
            <div className="sc hg"><div className="sl">Total vendido</div><div className="sv gold">{fmt(totalAll)}</div><div className="ss">{activeSales.length} ventas</div></div>
            <div className="sc ht"><div className="sl">Ganancia neta</div><div className="sv teal">{fmt(netAll)}</div><div className="ss">Antes de gastos</div></div>
          </div>
          <div className="g2">
            <div className="sc hg"><div className="sl">Tu parte (50%)</div><div className="sv gold">{fmt(ownerAll*.5)}</div><div className="ss">Distribución societaria</div></div>
            <div className="sc hr"><div className="sl">Com. pendientes</div><div className="sv red">{fmt(pendComm)}</div><div className="ss">Por liquidar a promotoras</div></div>
          </div>
          <div className="shd mt12"><div className="shd-l">Ventas recientes</div></div>
          {activeSales.slice(0,5).map(s=><SaleRow key={s.id} sale={s} role={role}/>)}
        </>
      )}
      {role==="promoter"&&(
        <div className="g2">
          <div className="sc hg"><div className="sl">Mis ventas</div><div className="sv gold">{mySales.length}</div><div className="ss">Total registradas</div></div>
          <div className="sc hr"><div className="sl">Comisión pendiente</div><div className="sv red">{fmt(myPendComm)}</div><div className="ss">Por cobrar</div></div>
        </div>
      )}
      {role==="employee"&&(
        <div className="g2">
          <div className="sc hg"><div className="sl">Ventas hoy</div><div className="sv gold">{todaySales.length}</div><div className="ss">Registradas hoy</div></div>
          <div className="sc"><div className="sl">Ventas hoy</div><div className="sv">{todaySales.length}</div><div className="ss">Registradas</div></div>
        </div>
      )}

      <div className="shd mt12"><div className="shd-l">{role==="promoter"?"Mis ventas recientes":"Ventas recientes"}</div></div>
      {mySales.slice(0,5).map(s=><SaleRow key={s.id} sale={s} role={role}/>)}
    </div>
  );
}

// ============================================================
//  SALESPAGE
// ============================================================
function SalesPage({sales, role, user, promoters, vouchers, onMarkPaid, onEdit, onDelete, onImport, onReload}) {
  const [filter,      setFilter]      = useState("all");
  const [period,      setPeriod]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [hideHist,    setHideHist]    = useState(false);
  const [editSale,    setEditSale]    = useState(null);
  const [qrSinRef,           setQrSinRef]           = useState(false);
  const [showDeleted,        setShowDeleted]        = useState(false);
  const [showImport,         setShowImport]         = useState(false);
  const [viewVoucher,        setViewVoucher]        = useState(null);
  const [assignVoucherForSale,setAssignVoucherForSale] = useState(null);
  const [assignSaleForVoucher,setAssignSaleForVoucher] = useState(null);

  const visible = useMemo(()=>{
    const now = Date.now();
    const base = sales.filter(s=>!s.deleted);
    let list = role==="promoter"
      ? base.filter(s=>s.promoterId===user.promoterId)
      : filter==="all" ? base
      : filter==="DIRECTO" ? base.filter(s=>s.isDirectSale)
      : base.filter(s=>s.promoterId===filter);
    if (period==="today")  list=list.filter(s=>s.date>=todayMs());
    if (period==="week")   list=list.filter(s=>s.date>=now-7*86400000);
    if (period==="month")  list=list.filter(s=>s.date>=now-30*86400000);
    if (hideHist) list=list.filter(s=>!s.isHistoric);
    if (qrSinRef) list=list.filter(s=>
      (s.paymentMethod==="qr"||s.paymentMethod==="transferencia")&&
      (!s.paymentRef||!s.paymentRef.trim())&&!s.voucherId
    );
    if (search.trim()){
      const q=search.toLowerCase();
      list=list.filter(s=>
        s.productName.toLowerCase().includes(q)||
        (s.customization||"").toLowerCase().includes(q)||
        (s.promoterName||"").toLowerCase().includes(q)||
        (s.clientName||"").toLowerCase().includes(q)
      );
    }
    return list;
  },[sales,role,user,filter,period,search,hideHist,qrSinRef]);

  const deletedList = useMemo(()=>{
    if (!showDeleted) return [];
    const now = Date.now();
    let list = sales.filter(s=>s.deleted);
    if (role==="promoter") list=list.filter(s=>s.promoterId===user.promoterId);
    if (period==="today")  list=list.filter(s=>s.date>=todayMs());
    if (period==="week")   list=list.filter(s=>s.date>=now-7*86400000);
    if (period==="month")  list=list.filter(s=>s.date>=now-30*86400000);
    return list.sort((a,b)=>b.date-a.date);
  },[sales,role,user,period,showDeleted]);

  const total   = visible.reduce((a,s)=>a+s.clientPrice,0);
  const profit  = visible.reduce((a,s)=>a+s.profit,0);
  const deletedCount = useMemo(()=>sales.filter(s=>s.deleted).length,[sales]);

  const handleExport = ()=>{
    const header=["ID","Fecha","Producto","Personalizacion","Promotora","Cliente","Telefono","Metodo Pago","Ref Pago","Precio Cliente","Precio Neto","Costo","Comision","Ganancia","Historica","Notas"];
    const rows=visible.map(s=>[
      s.id, fmtDate(s.date), s.productName, s.customization||"",
      s.promoterName||"", s.clientName||"", s.clientPhone||"",
      s.paymentMethod||"", s.paymentRef||"",
      s.clientPrice, s.promoterPrice, s.cost, s.commission, s.profit,
      s.isHistoric?"Si":"No", s.notes||""
    ]);
    const csv=[header,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`garabato-ventas-${new Date().toLocaleDateString("es-BO").replace(/\//g,"-")}.csv`;
    a.click();
  };

  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l">Ventas</div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:"1rem",color:"var(--gold)",fontWeight:800}}>{fmt(total)}</div>
          {CAN.seeReports(role)&&<div style={{fontSize:".68rem",color:"var(--teal)"}}>Ganancia: {fmt(profit)}</div>}
        </div>
      </div>
      {role==="admin"&&(
        <div style={{display:"flex",gap:7,marginBottom:10}}>
          <button className="btn btn-sm btn-out" onClick={handleExport} style={{flex:1}}>
            <Ic n="download" s={13}/> Exportar CSV
          </button>
          <button className="btn btn-sm btn-out" onClick={()=>setShowImport(true)} style={{flex:1}}>
            <Ic n="history" s={13}/> Importar CSV
          </button>
        </div>
      )}
      <div className="fg">
        <input className="fi" placeholder="Buscar producto, cliente, promotora..."
          value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="flt">
        {[["all","Todas"],["today","Hoy"],["week","7 días"],["month","30 días"]].map(([k,v])=>(
          <button key={k} className={"pill"+(period===k?" act":"")} onClick={()=>setPeriod(k)}>{v}</button>
        ))}
      </div>
      {role!=="promoter"&&(
        <div className="flt">
          <button className={"pill"+(filter==="all"?" act":"")} onClick={()=>setFilter("all")}>Todas</button>
          <button className={"pill"+(filter==="DIRECTO"?" act":"")} onClick={()=>setFilter("DIRECTO")}>Tienda</button>
          {promoters.map(pr=>(
            <button key={pr.id} className={"pill"+(filter===pr.id?" act":"")} onClick={()=>setFilter(pr.id)}>
              {pr.name.split(" ")[0]}
            </button>
          ))}
          <button className={"pill"+(hideHist?" act-red":"")} onClick={()=>setHideHist(v=>!v)}>
            {hideHist?"Ocultar históricas":"Ver históricas"}
          </button>
          <button className={"pill"+(qrSinRef?" act-red":"")} onClick={()=>setQrSinRef(v=>!v)}>
            QR sin comprobante
          </button>
          {role==="admin"&&deletedCount>0&&(
            <button className={"pill"+(showDeleted?" act-red":"")} onClick={()=>setShowDeleted(v=>!v)}>
              {showDeleted?"Ocultar eliminadas":`Eliminadas (${deletedCount})`}
            </button>
          )}
        </div>
      )}
      {visible.length===0
        ?<div className="empty"><Ic n="cart" s={38}/><p>Aún no hay ventas registradas.</p></div>
        :visible.map(s=>{
          const saleVoucher = vouchers?.find(v=>v.id===s.voucherId)||null;
          return (
            <SaleRow key={s.id} sale={s} role={role}
              showActions={CAN.seeComms(role)}
              onMarkPaid={s.commissionStatus==="pendiente"?()=>onMarkPaid(s.id):null}
              onEdit={()=>setEditSale(s)}
              onDelete={role==="admin"&&onDelete?()=>onDelete(s):null}
              voucher={saleVoucher}
              onVoucherView={saleVoucher?()=>setViewVoucher(saleVoucher):null}
              onVoucherAssign={CAN.seeReports(role)?()=>setAssignSaleForVoucher(s):null}
            />
          );
        })
      }

      {editSale&&(
        <SaleEditModal sale={editSale} role={role}
          onClose={()=>setEditSale(null)}
          onSave={async u=>{await onEdit(u);setEditSale(null);}}/>
      )}

      {showImport&&onImport&&(
        <CSVImportModal promoters={promoters}
          onClose={()=>setShowImport(false)}
          onImport={async rows=>{await onImport(rows);setShowImport(false);}}/>
      )}

      {viewVoucher&&(
        <VerComprobante voucher={viewVoucher} sales={sales}
          onClose={()=>setViewVoucher(null)}
          onAssign={()=>{setAssignVoucherForSale(viewVoucher);setViewVoucher(null);}}/>
      )}

      {assignVoucherForSale&&(
        <AsignarComprobante voucher={assignVoucherForSale} sales={sales}
          onClose={()=>setAssignVoucherForSale(null)}
          onConfirm={async(vid,sid)=>{
            const v=await dbGet("vouchers",vid); const s2=await dbGet("sales",sid);
            if(v&&s2){
              await dbPut("vouchers",{...v,saleId:sid,saleSummary:s2.productName+" · "+fmtDate(s2.date),synced:false});
              await dbPut("sales",{...s2,voucherId:vid,synced:false});
            }
            setAssignVoucherForSale(null);
            if(onReload) await onReload();
          }}/>
      )}

      {assignSaleForVoucher&&(
        <SubirComprobante
          vouchers={vouchers||[]} user={user}
          prefillSale={assignSaleForVoucher}
          onClose={()=>setAssignSaleForVoucher(null)}
          onSave={async v=>{
            await dbPut("vouchers",{...v,synced:false});
            const s2=await dbGet("sales",assignSaleForVoucher.id);
            if(s2) await dbPut("sales",{...s2,voucherId:v.id,synced:false});
            setAssignSaleForVoucher(null);
            if(onReload) await onReload();
          }}
          onSaveAndAssign={async v=>{
            await dbPut("vouchers",{...v,synced:false});
            const s2=await dbGet("sales",assignSaleForVoucher.id);
            if(s2) await dbPut("sales",{...s2,voucherId:v.id,synced:false});
            setAssignSaleForVoucher(null);
            if(onReload) await onReload();
          }}
        />
      )}

      {showDeleted&&deletedList.length>0&&(
        <div style={{marginTop:18}}>
          <div style={{fontSize:".76rem",fontWeight:800,color:"var(--red)",textTransform:"uppercase",letterSpacing:.5,marginBottom:10,display:"flex",alignItems:"center",gap:7}}>
            <Ic n="trash" s={13} c="var(--red)"/> Ventas eliminadas — solo auditoría
          </div>
          {deletedList.map(s=>(
            <div key={s.id} style={{position:"relative",opacity:.65}}>
              <SaleRow sale={s} role={role} showActions={false}/>
              <div style={{position:"absolute",top:7,right:26,background:"var(--red)",color:"#fff",
                fontSize:".65rem",fontWeight:800,padding:"2px 8px",borderRadius:8,pointerEvents:"none",
                maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                ELIMINADA{s.deletedReason?" · "+s.deletedReason:""}
              </div>
            </div>
          ))}
        </div>
      )}
      {showDeleted&&deletedList.length===0&&(
        <div className="empty" style={{marginTop:12,opacity:.6}}><p>No hay ventas eliminadas en este período.</p></div>
      )}

    </div>
  );
}

// ============================================================
//  SALEEDITMODAL
// ============================================================
function SaleEditModal({sale, role, onClose, onSave}) {
  const [f,setF] = useState({
    customization: sale.customization||"",
    clientPhone:   sale.clientPhone||"",
    clientName:    sale.clientName||"",
    notes:         sale.notes||"",
    paymentMethod: sale.paymentMethod||"efectivo",
    clientPrice:   sale.clientPrice||0,
    promoterPrice: sale.promoterPrice||0,
    cost:          sale.cost||0,
  });
  const set = (k,v)=>setF(x=>({...x,[k]:v}));

  const handleSave = ()=>{
    if (role==="admin"){
      const cp=parseFloat(f.clientPrice)||0, pp=parseFloat(f.promoterPrice)||0, c=parseFloat(f.cost)||0;
      const {commission,profit,profitOwner,profitPartner}=calcSale(cp,pp,c);
      onSave({...sale,...f,clientPrice:cp,promoterPrice:pp,cost:c,commission,profit,profitOwner,profitPartner});
    } else {
      onSave({...sale,...f});
    }
  };

  return (
    <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">Editar venta</div>
        <div style={{background:"var(--s2)",borderRadius:"var(--rsm)",padding:"10px 13px",marginBottom:16,fontSize:".86rem"}}>
          <div style={{fontWeight:700,color:"var(--gold)"}}>{sale.productName}</div>
          <div style={{color:"var(--dim)",fontSize:".76rem",marginTop:2}}>{fmtDate(sale.date)} - {sale.promoterName}</div>
        </div>
        <div className="fg">
          <label className="fl">Texto del grabado</label>
          <input className="fi" value={f.customization} onChange={e=>set("customization",e.target.value)} placeholder="Texto, foto o diseño a grabar"/>
        </div>
        <div className="fg">
          <label className="fl">Método de pago</label>
          <div className="pills">
            {PM_OPTS.map(([v,l])=>(
              <button key={v} className={"pill"+(f.paymentMethod===v?" act":"")} onClick={()=>set("paymentMethod",v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="fi2">
          <div className="fg">
            <label className="fl">Nombre del cliente</label>
            <input className="fi" value={f.clientName} onChange={e=>set("clientName",e.target.value)} placeholder="Nombre"/>
          </div>
          <div className="fg">
            <label className="fl">Teléfono del cliente</label>
            <input className="fi" type="tel" autoComplete="tel" value={f.clientPhone} onChange={e=>set("clientPhone",e.target.value)} placeholder="7XXXXXXX"/>
          </div>
        </div>
        <div className="fg">
          <label className="fl">Notas adicionales</label>
          <textarea className="fta" value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Instrucciones especiales..."/>
        </div>
        {role==="admin"&&(
          <div className="price-box">
            <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
              Precios (solo admin)
            </div>
            <div className="fi2">
              <div className="fg">
                <label className="fl">Precio al cliente</label>
                <input className="fi" type="number" inputMode="decimal" value={f.clientPrice} onChange={e=>set("clientPrice",e.target.value)}/>
              </div>
              <div className="fg">
                <label className="fl">Precio neto recibido</label>
                <input className="fi" type="number" inputMode="decimal" value={f.promoterPrice} onChange={e=>set("promoterPrice",e.target.value)}/>
              </div>
            </div>
            <div className="fg">
              <label className="fl">Costo material</label>
              <input className="fi" type="number" inputMode="decimal" value={f.cost} onChange={e=>set("cost",e.target.value)}/>
            </div>
          </div>
        )}
        <div className="row mt12">
          <button className="btn btn-out" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" onClick={handleSave}>
            <Ic n="check" s={16} c="#100d02"/> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  SALEROW
// ============================================================
function SaleRow({sale, role, showActions, onMarkPaid, onEdit, onDelete, voucher, onVoucherAssign, onVoucherView}) {
  const pm={efectivo:"Efectivo",transferencia:"Transferencia",qr:"QR"};
  const needsVoucher = (sale.paymentMethod==="qr"||sale.paymentMethod==="transferencia") && !sale.voucherId && !sale.isDirectSale;
  return (
    <div className="si">
      <div className="si-ico"><Ic n={sale.isHistoric?"history":"laser"} s={16}/></div>
      <div className="si-body">
        {sale.items?(
          <div className="si-prod">
            {sale.items.map((it,i)=>(
              <div key={i} style={{fontSize:i===0?".86rem":".76rem",color:i===0?"var(--txt)":"var(--muted)",fontWeight:i===0?700:500,lineHeight:1.4}}>
                {it.qty>1&&<span style={{color:"var(--gold)",fontWeight:800}}>{it.qty}× </span>}
                {it.isSoloGrabado?(it.grabadoDesc||"Servicio de grabado"):(it.productName||"Artículo")}
                {it.customization&&<span style={{color:"var(--gold)",fontStyle:"italic"}}> · "{it.customization}"</span>}
              </div>
            ))}
          </div>
        ):(
          <div className="si-prod">{sale.productName}</div>
        )}
        {!sale.items&&sale.customization&&<div className="si-cust">"{sale.customization}"</div>}
        <div className="si-meta">
          <span>{fmtDate(sale.date)}{!sale.isHistoric&&" "+fmtHora(sale.date)}</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:3}}>
            {pm[sale.paymentMethod]||sale.paymentMethod}
            {sale.voucherId&&onVoucherView&&(
              <button className="vc-has" onClick={e=>{e.stopPropagation();onVoucherView();}}>
                <Ic n="clip" s={9}/> Comprobante
              </button>
            )}
            {needsVoucher&&onVoucherAssign&&(
              <button className="vc-missing" onClick={e=>{e.stopPropagation();onVoucherAssign();}}>
                Sin comprobante
              </button>
            )}
          </span>
          <span>{sale.promoterName?.split(" ")[0]}</span>
          {sale.clientName&&<span style={{color:"var(--muted)"}}>{sale.clientName}</span>}
          {sale.isHistoric&&<span className="hist-tag">Histórica</span>}
          {sale.isSoloGrabado&&<span className="chip ch-laser">Solo Grabado</span>}
          {sale.isDirectSale&&!sale.isSoloGrabado&&<span className="chip ch-blu">Tienda directa</span>}
        </div>
        {sale.notes&&<div style={{fontSize:".76rem",color:"var(--dim)",marginTop:4,fontStyle:"italic"}}>{sale.notes}</div>}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
          {showActions&&onMarkPaid&&(
            <button onClick={onMarkPaid} className="btn btn-sm btn-out" style={{padding:"5px 10px",fontSize:".76rem"}}>
              <Ic n="check" s={12}/> Marcar pagada
            </button>
          )}
          {sale.clientPhone&&(
            <button className="wa-btn" style={{fontSize:".76rem",padding:"5px 10px"}}
              onClick={()=>openWhatsApp(sale.clientPhone,"¡Hola "+(sale.clientName||"cliente")+"! Gracias por tu compra en Garabato.")}>
              <WaIcon/> Contactar
            </button>
          )}
          {onEdit&&(
            <button className="btn btn-sm btn-out" style={{padding:"5px 8px"}} onClick={onEdit}>
              <Ic n="edit" s={12}/>
            </button>
          )}
          {role==="admin"&&onDelete&&(
            <button className="btn btn-sm btn-red" style={{padding:"5px 8px"}} onClick={onDelete}>
              <Ic n="trash" s={12}/>
            </button>
          )}
        </div>
      </div>
      <div className="si-r">
        <div className="si-amt">{fmt(sale.clientPrice)}</div>
        {CAN.seeComms(role)&&<div className="si-sub">Comisión: {fmt(sale.commission)}</div>}
        {CAN.seeReports(role)&&<div className="si-sub" style={{color:"var(--teal)"}}>Ganancia: {fmt(sale.profit)}</div>}
        <div className="mt8">
          {!sale.isDirectSale&&(
            <span className={"chip "+(sale.commissionStatus==="pagado"?"ch-grn":"ch-gold")}>
              {sale.commissionStatus==="pagado"?"Com. pagada":"Com. pendiente"}
            </span>
          )}
          {sale.isSoloGrabado&&(
            <span className="chip ch-laser">Solo Grabado 50/50</span>
          )}
          {sale.isDirectSale&&!sale.isSoloGrabado&&(
            <span className="chip ch-blu">Tienda directa</span>
          )}
        </div>
      </div>
      <div className={"sdot "+(sale.synced?"sd-ok":"sd-no")}/>
    </div>
  );
}

// ============================================================
//  INVENTORYPAGE
// ============================================================
function InventoryPage({products, role, onSave, onDelete}) {
  const [editProd,setEditProd] = useState(null);
  const [showForm,setShowForm] = useState(false);
  const [search, setSearch]   = useState("");
  const low = products.filter(p=>
    p.hasVariants
      ? (p.variants||[]).some(v=>v.stock<=(p.lowStockAlert||5))
      : p.stock<=(p.lowStockAlert||5)
  );
  const visible = search.trim()
    ? products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()))
    : products;
  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l">Catálogo</div>
        {CAN.editConfig(role)&&(
          <button className="btn btn-sm btn-gold" style={{width:"auto"}} onClick={()=>{setEditProd(null);setShowForm(true);}}>
            <Ic n="plus" s={14} c="#100d02"/> Nuevo
          </button>
        )}
      </div>
      {products.length>3&&(
        <div className="fg" style={{marginBottom:8}}>
          <input className="fi" placeholder="Buscar producto..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      )}
      {low.length>0&&(
        <div className="al al-warn" style={{marginBottom:10}}>
          <Ic n="warn" s={14}/>
          <span><b>{low.length} producto{low.length>1?"s":""} con stock bajo</b> — revisar antes de vender</span>
        </div>
      )}
      {visible.length===0
        ?<div className="empty"><Ic n="box" s={38}/><p>Todavía no hay productos cargados.</p></div>
        :<div className="inv-grid">{visible.map(p=>{
          const commission=r2(p.clientPrice-p.promoterPrice), profit=r2(p.promoterPrice-p.cost);
          return (
            <div key={p.id} className="pc">
              <div className="pc-top">
                {p.photo?<img src={p.photo} alt={p.name} className="pc-img"/>
                  :<div className="pc-img-ph">{p.name.charAt(0)}</div>}
                <div style={{flex:1}}>
                  <div className="pc-name">{p.name}</div>
                  <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:2}}>
                  {fmt(p.clientPrice)} al cliente
                  {p.clientPriceUSD&&<span style={{marginLeft:6,color:"var(--blu)",fontSize:".68rem"}}>USD {p.clientPriceUSD}</span>}
                </div>
                </div>
                {CAN.editConfig(role)&&(
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn btn-sm btn-out" style={{padding:"5px 8px"}} onClick={()=>{setEditProd(p);setShowForm(true);}}>
                      <Ic n="edit" s={13}/>
                    </button>
                    {onDelete&&<button className="btn btn-sm btn-red" style={{padding:"5px 8px"}} onClick={()=>{if(window.confirm("Eliminar "+p.name+"? Esta acción no se puede deshacer.")) onDelete(p.id);}}><Ic n="trash" s={13}/></button>}
                  </div>
                )}
              </div>
              <div className="pc-grid">
                <div className="pcs"><div className="pcs-v" style={{color:"var(--txt)"}}>{fmt(p.clientPrice)}</div><div className="pcs-l">Precio venta</div></div>
                <div className="pcs"><div className="pcs-v" style={{color:"var(--gold)"}}>{fmt(p.promoterPrice)}</div><div className="pcs-l">Precio neto</div></div>
                <div className="pcs"><div className="pcs-v" style={{color:"var(--red)"}}>{fmt(p.cost)}</div><div className="pcs-l">Costo material</div></div>
              </div>
              {p.hasVariants&&p.variants?.length>0&&(
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
                  {p.variants.map(v=>(
                    <span key={v.id} style={{fontSize:".68rem",padding:"2px 8px",borderRadius:10,fontWeight:700,
                      background:v.stock<=0?"rgba(224,85,85,.12)":v.stock<=(p.lowStockAlert||5)?"rgba(224,198,17,.1)":"rgba(46,204,113,.1)",
                      color:v.stock<=0?"var(--red)":v.stock<=(p.lowStockAlert||5)?"var(--gold)":"var(--grn)"}}>
                      {v.name}: {v.stock}
                    </span>
                  ))}
                </div>
              )}
              {p.grabadoTypesAllowed&&p.grabadoTypesAllowed.length>0&&(
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
                  {p.grabadoTypesAllowed.map(t=>(
                    <span key={t} style={{fontSize:".68rem",fontWeight:800,padding:"2px 7px",borderRadius:10,
                      background:"rgba(224,198,17,.1)",color:"var(--gd)",border:"1px solid rgba(224,198,17,.2)"}}>
                      {t==="foto"?"📷 Foto":t==="texto"?"✏️ Texto":t==="vector"?"🎨 Vector":"🔧 Combinado"}
                    </span>
                  ))}
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8,padding:"7px 10px",background:"var(--s2)",borderRadius:"var(--rsm)",fontSize:".76rem"}}>
                <span style={{color:"var(--muted)"}}>Comisión: <b style={{color:"var(--gold)"}}>{fmt(commission)}</b></span>
                <span style={{color:"var(--muted)"}}>Ganancia: <b style={{color:"var(--teal)"}}>{fmt(profit)}</b></span>
                <span style={{color:p.stock<=(p.lowStockAlert||5)?"var(--red)":"var(--grn)"}}>{p.hasVariants?"Stock total":"Stock"}: <b>{p.stock}</b>{p.stock<=(p.lowStockAlert||5)?" !":""}</span>
              </div>
            </div>
          );
        })}</div>}
      {showForm&&<ProductForm product={editProd} onClose={()=>setShowForm(false)} onSave={async p=>{await onSave(p);setShowForm(false);}}/>}
    </div>
  );
}

function ProductForm({product, onClose, onSave}) {
  const blank={id:uid("p"),name:"",photo:null,clientPrice:"",promoterPrice:"",cost:"",stock:"",lowStockAlert:"5",clientPriceUSD:null,grabadoTypesAllowed:["foto","texto"],hasVariants:false,variants:[],priceHistory:[]};
  const [f,setF]         = useState(product||blank);
  const [uploading,setUploading] = useState(false);
  const fileRef = useRef(null);
  const set = (k,v)=>setF(x=>({...x,[k]:v}));
  const cp=parseFloat(f.clientPrice)||0, pp=parseFloat(f.promoterPrice)||0, c=parseFloat(f.cost)||0;
  const valid=f.name&&cp&&pp&&c&&(f.hasVariants?(f.variants||[]).length>0&&(f.variants||[]).every(v=>v.name):f.stock);

  const handlePhoto = async e=>{
    const file=e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { set("photo",await compressImage(file)); } catch(err){console.error(err);}
    setUploading(false);
  };

  return (
    <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">{product?"Editar producto":"Nuevo producto"}</div>
        <div className="fg">
          <label className="fl">Foto del producto</label>
          {f.photo?(
            <div className="photo-preview">
              <img src={f.photo} alt="producto"/>
              <button className="photo-remove" onClick={()=>set("photo",null)}>x</button>
            </div>
          ):(
            <button className="photo-upload" onClick={()=>fileRef.current?.click()} disabled={uploading}>
              <Ic n="plus" s={18}/>
              {uploading?"Procesando imagen...":"Seleccionar imagen del producto"}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*"
            style={{display:"none"}} onChange={handlePhoto}/>
          <div className="fi-hint">La imagen se comprime automáticamente para no ocupar memoria</div>
        </div>
        <div className="fg">
          <label className="fl">Nombre del producto</label>
          <input className="fi" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nombre del producto o servicio"/>
        </div>
        <div className="price-box">
          <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Precios</div>
          <div className="fi2">
            <div className="fg">
              <label className="fl">Precio al cliente (Bs.)</label>
              <input className="fi" type="number" inputMode="decimal" value={f.clientPrice} onChange={e=>set("clientPrice",e.target.value)} placeholder="Ej: 122"/>
              <div className="fi-hint">Precio de venta al público (PVP)</div>
            </div>
            <div className="fg">
              <label className="fl">Precio neto recibido</label>
              <input className="fi" type="number" inputMode="decimal" value={f.promoterPrice} onChange={e=>set("promoterPrice",e.target.value)} placeholder="Ej: 94"/>
              <div className="fi-hint">Monto que ingresa a la tienda</div>
            </div>
          </div>
          <div className="fg">
            <label className="fl">Precio internacional (USD) — opcional</label>
            <input className="fi" type="number" inputMode="decimal" value={f.clientPriceUSD||""} onChange={e=>set("clientPriceUSD",e.target.value?parseFloat(e.target.value):null)} placeholder="Ej: 18"/>
            <div className="fi-hint">Para pedidos con envío al exterior (DHL/FedEx)</div>
          </div>
          <div className="fg">
            <label className="fl">Costo material (Bs.)</label>
            <input className="fi" type="number" inputMode="decimal" value={f.cost} onChange={e=>set("cost",e.target.value)} placeholder="Ej: 35"/>
          </div>
          {cp>0&&pp>0&&c>0&&(
            <div style={{background:"var(--s1)",borderRadius:"var(--rsm)",padding:"10px 12px",fontSize:".76rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{color:"var(--muted)"}}>Comisión promotora</span>
                <b style={{color:"var(--gold)"}}>{fmt(r2(cp-pp))}</b>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"var(--muted)"}}>Ganancia por venta</span>
                <b style={{color:"var(--teal)"}}>{fmt(r2(pp-c))}</b>
              </div>
            </div>
          )}
        </div>
        <div className="fg">
          <label className="fl">¿Este producto tiene variantes?</label>
          <div className="pills" style={{marginBottom:8}}>
            <button className={"pill"+(!f.hasVariants?" act":"")} onClick={()=>set("hasVariants",false)}>Sin variantes</button>
            <button className={"pill"+(f.hasVariants?" act":"")} onClick={()=>set("hasVariants",true)}>Con variantes (colores/tallas)</button>
          </div>
        </div>
        {!f.hasVariants?(
          <div className="fi2">
            <div className="fg">
              <label className="fl">Stock</label>
              <input className="fi" type="number" inputMode="numeric" value={f.stock} onChange={e=>set("stock",e.target.value)} placeholder="0"/>
            </div>
            <div className="fg">
              <label className="fl">Alerta stock bajo</label>
              <input className="fi" type="number" inputMode="numeric" value={f.lowStockAlert} onChange={e=>set("lowStockAlert",e.target.value)} placeholder="5"/>
            </div>
          </div>
        ):(
          <div className="fg">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <label className="fl" style={{marginBottom:0}}>Variantes</label>
              <button className="btn btn-sm btn-gold" style={{width:"auto",padding:"4px 10px",fontSize:".76rem"}}
                onClick={()=>set("variants",[...(f.variants||[]),{id:uid("v"),name:"",stock:0}])}>
                + Agregar
              </button>
            </div>
            {(f.variants||[]).map((v,i)=>(
              <div key={v.id} className="vrow">
                <input className="fi" style={{flex:2}} placeholder="Nombre (ej: Dorado)" value={v.name}
                  onChange={e=>set("variants",f.variants.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/>
                <input className="fi" style={{width:70,flexShrink:0}} type="number" inputMode="numeric" placeholder="Stock" value={v.stock}
                  onChange={e=>set("variants",f.variants.map((x,j)=>j===i?{...x,stock:parseInt(e.target.value)||0}:x))}/>
                <button className="btn btn-sm btn-red" style={{width:32,padding:"6px",flexShrink:0}}
                  onClick={()=>set("variants",f.variants.filter((_,j)=>j!==i))}>
                  <Ic n="trash" s={12}/>
                </button>
              </div>
            ))}
            {(f.variants||[]).length===0&&<div style={{fontSize:".76rem",color:"var(--dim)"}}>Agregá al menos una variante</div>}
            <div className="fg">
              <label className="fl">Alerta stock bajo (por variante)</label>
              <input className="fi" type="number" inputMode="numeric" value={f.lowStockAlert} onChange={e=>set("lowStockAlert",e.target.value)} placeholder="5"/>
            </div>
          </div>
        )}
        <div className="fg">
          <label className="fl">Tipos de grabado que acepta</label>
          <div className="pills" style={{flexWrap:"wrap"}}>
            {[["foto","📷 Fotograbado"],["texto","✏️ Texto/Nombre"],["vector","🎨 Logo/Dibujo"],["combinado","🔧 Combinado"]].map(([v,l])=>{
              const sel=(f.grabadoTypesAllowed||[]).includes(v);
              return (
                <button key={v} className={"pill"+(sel?" act":"")} onClick={()=>{
                  const curr=f.grabadoTypesAllowed||[];
                  set("grabadoTypesAllowed",sel?curr.filter(x=>x!==v):[...curr,v]);
                }}>{l}</button>
              );
            })}
          </div>
          <div className="fi-hint">Define que tipo de grabado se puede pedir para este producto</div>
        </div>
        <div className="row mt12">
          <button className="btn btn-out" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" disabled={!valid||(!f.hasVariants&&!f.stock)||(f.hasVariants&&!(f.variants||[]).length)} onClick={()=>{
            const totalStock = f.hasVariants?(f.variants||[]).reduce((a,v)=>a+(v.stock||0),0):parseInt(f.stock)||0;
            onSave({...f,clientPrice:cp,promoterPrice:pp,cost:c,stock:totalStock,lowStockAlert:parseInt(f.lowStockAlert)||5});
          }}>
            <Ic n="check" s={16} c="#100d02"/> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  PROMOTERS PAGE
// ============================================================
function PromotersPage({promoters, sales, role, payments, onPay, onSave, user}) {
  const [tab,     setTab]     = useState("promotoras");
  const [showForm,setShowForm]= useState(false);
  const [editPr,  setEditPr]  = useState(null);
  const [payingPr,setPayingPr]= useState(null);

  const statsFor = pid=>{
    const ps=sales.filter(s=>s.promoterId===pid);
    const pend=ps.filter(s=>s.commissionStatus==="pendiente");
    return {
      count:ps.length,
      total:ps.reduce((a,s)=>a+s.clientPrice,0),
      earned:ps.reduce((a,s)=>a+s.commission,0),
      pending:pend.reduce((a,s)=>a+s.commission,0),
      ids:pend.map(s=>s.id),
    };
  };

  // Promotora: solo ve su propio perfil
  if (role==="promoter"){
    const me=promoters.find(p=>p.id===user.promoterId);
    if (!me) return <Locked/>;
    const st=statsFor(me.id);
    const recentSales=sales.filter(s=>s.promoterId===me.id).slice(0,5);
    return (
      <div className="pe">
        <div className="shd"><div className="shd-l">Mi perfil</div></div>
        <div className="prc">
          <div className="prc-h">
            <div className="prc-av" style={{width:52,height:52,fontSize:"1.5rem"}}>{me.name.charAt(0)}</div>
            <div style={{flex:1}}>
              <div className="prc-name" style={{fontSize:"1rem"}}>{me.name}</div>
              <div className="prc-ph">Tel: {me.phone}</div>
              <div style={{marginTop:4}}>
                <span className={"chip "+(me.active?"ch-grn":"ch-red")}>{me.active?"Activa":"Inactiva"}</span>
              </div>
            </div>
          </div>
          <div className="prc-stats">
            <div className="prs"><div className="prs-v">{st.count}</div><div className="prs-l">Ventas totales</div></div>
            <div className="prs"><div className="prs-v" style={{fontSize:".86rem",color:"var(--gold)"}}>{fmt(st.earned)}</div><div className="prs-l">Comisión ganada</div></div>
            <div className="prs">
              <div className="prs-v" style={{fontSize:".86rem",color:st.pending>0?"var(--red)":"var(--grn)"}}>{fmt(st.pending)}</div>
              <div className="prs-l">Por cobrar</div>
            </div>
          </div>
        </div>
        {st.pending>0&&(
          <div className="al al-info">
            <Ic n="money" s={14}/>
            <span>Tenes <b style={{color:"var(--gold)"}}>{fmt(st.pending)}</b> en comisiones pendientes de cobro.</span>
          </div>
        )}
        {st.pending===0&&st.count>0&&(
          <div className="al al-ok">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Todas tus comisiones están al día!</span>
          </div>
        )}
        <div className="shd mt12">
          <div className="shd-l">Mis ventas recientes</div>
          <span style={{fontSize:".76rem",color:"var(--muted)"}}>{st.count} total</span>
        </div>
        {recentSales.length===0
          ?<div className="empty"><Ic n="cart" s={36}/><p>Todavía no hay ventas registradas.</p></div>
          :recentSales.map(s=><SaleRow key={s.id} sale={s} role={role}/>)
        }
      </div>
    );
  }

  // Admin / Tienda: lista completa de promotoras
  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l">Promotoras</div>
        <div style={{display:"flex",gap:7}}>
          {CAN.seePayments(role)&&(
            <button className="wa-btn" style={{fontSize:".76rem",padding:"6px 11px"}}
              onClick={()=>generateCommissionReport(promoters,sales)}>
              <WaIcon/> Reporte comisiones
            </button>
          )}
          {CAN.editData(role)&&(
            <button className="btn btn-sm btn-gold" style={{width:"auto"}} onClick={()=>{setEditPr(null);setShowForm(true);}}>
              <Ic n="plus" s={14} c="#100d02"/> Nueva
            </button>
          )}
        </div>
      </div>

      {CAN.seePayments(role)&&(
        <div className="tabs">
          {["promotoras","pagos"].map(t=>(
            <button key={t} className={"tab"+(tab===t?" act":"")} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      )}

      {tab==="promotoras"&&promoters.map(pr=>{
        const st=statsFor(pr.id);
        return (
          <div key={pr.id} className="prc">
            <div className="prc-h">
              <div className="prc-av">{pr.name.charAt(0)}</div>
              <div style={{flex:1}}>
                <div className="prc-name">{pr.name}</div>
                <div className="prc-ph"><Ic n="phone" s={11}/> {pr.phone}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <span className="chip ch-teal">
                  {pr.customPromoterPrice!=null?"Precio esp: "+fmt(pr.customPromoterPrice):"Precio estándar"}
                </span>
                {!pr.active&&<span className="chip ch-red">Inactiva</span>}
              </div>
            </div>
            <div className="prc-stats">
              <div className="prs"><div className="prs-v">{st.count}</div><div className="prs-l">Ventas</div></div>
              <div className="prs"><div className="prs-v" style={{fontSize:".86rem",color:"var(--gold)"}}>{fmt(st.earned)}</div><div className="prs-l">Comisión total</div></div>
              <div className="prs">
                <div className="prs-v" style={{fontSize:".86rem",color:st.pending>0?"var(--red)":"var(--grn)"}}>{fmt(st.pending)}</div>
                <div className="prs-l">Pendiente</div>
              </div>
            </div>
            {CAN.seePayments(role)&&st.pending>0&&(
              <button className="btn btn-grn mt12" onClick={()=>setPayingPr(pr)}>
                <Ic n="money" s={16} c="#fff"/> Pagar {fmt(st.pending)} a {pr.name.split(" ")[0]}
              </button>
            )}
            <div style={{display:"flex",gap:6,marginTop:8}}>
              {pr.phone&&(
                <button className="wa-btn" style={{fontSize:".76rem",padding:"6px 10px",flex:1}}
                  onClick={()=>openWhatsApp(pr.phone,"¡Hola "+pr.name.split(" ")[0]+"! Te contactamos de Garabato.")}>
                  <WaIcon/> Contactar
                </button>
              )}
              {CAN.editData(role)&&(
                <button className="btn btn-sm btn-out" style={{padding:"7px 10px"}} onClick={()=>{setEditPr(pr);setShowForm(true);}}>
                  <Ic n="edit" s={13}/> Editar
                </button>
              )}
            </div>
          </div>
        );
      })}

      {tab==="pagos"&&CAN.seePayments(role)&&(
        payments.length===0
          ?<div className="empty"><Ic n="money" s={38}/><p>Aún no hay pagos registrados.</p></div>
          :payments.map(pay=>{
            const pr=promoters.find(p=>p.id===pay.promoterId);
            return (
              <div key={pay.id} className="pay-row">
                <div className="pay-av">{pr?.name.charAt(0)||"?"}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:".86rem"}}>{pr?.name||"Promotora"}</div>
                  <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:2}}>
                    {fmtDate(pay.date)} - {pay.salesIds.length} venta{pay.salesIds.length>1?"s":""}
                  </div>
                </div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"1.2rem",color:"var(--grn)"}}>{fmt(pay.amount)}</div>
              </div>
            );
          })
      )}

      {showForm&&<PromoterForm promoter={editPr} onClose={()=>setShowForm(false)} onSave={async p=>{await onSave(p);setShowForm(false);}}/>}

      {payingPr&&(
        <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&setPayingPr(null)}>
          <div className="sheet">
            <div className="sh-hd"/>
            <div className="sh-title">Confirmar pago</div>
            <div className="pb">
              <div className="pbr"><span className="pbk">Promotora</span><span className="pbv">{payingPr.name}</span></div>
              <div className="pbr"><span className="pbk">Total a pagar</span><span className="pbv" style={{color:"var(--grn)"}}>{fmt(statsFor(payingPr.id).pending)}</span></div>
              <div className="pbr"><span className="pbk">Ventas a liquidar</span><span className="pbv">{statsFor(payingPr.id).ids.length}</span></div>
            </div>
            <div className="al al-info mt12"><Ic n="warn" s={14}/> Todas las comisiones pendientes quedarán como pagadas.</div>
            <div className="row mt12">
              <button className="btn btn-out" onClick={()=>setPayingPr(null)}>Cancelar</button>
              <button className="btn btn-grn" onClick={async()=>{
                const st=statsFor(payingPr.id);
                await onPay(payingPr.id,st.ids,st.pending);
                setPayingPr(null);
              }}>
                <Ic n="check" s={16} c="#fff"/> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PromoterForm({promoter, onClose, onSave}) {
  const blank={id:uid("pr"),name:"",phone:"",active:true,customPromoterPrice:null};
  const [f,setF]=useState(promoter||blank);
  const set=(k,v)=>setF(x=>({...x,[k]:v}));
  const hasCustom=f.customPromoterPrice!=null;
  return (
    <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">{promoter?"Editar promotora":"Nueva promotora"}</div>
        <div className="fg">
          <label className="fl">Nombre completo</label>
          <input className="fi" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nombre y apellido"/>
        </div>
        <div className="fg">
          <label className="fl">Teléfono</label>
          <input className="fi" type="tel" autoComplete="tel" value={f.phone} onChange={e=>set("phone",e.target.value)} placeholder="Ej: 70012345 (sin prefijo 591)"/>
        </div>
        <div className="fg">
          <label className="fl">Precio personalizado</label>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <button className={"pill"+(!hasCustom?" act":"")} onClick={()=>set("customPromoterPrice",null)}>Precio estándar del producto</button>
            <button className={"pill"+(hasCustom?" act-red":"")} onClick={()=>set("customPromoterPrice",f.customPromoterPrice||0)}>Precio personalizado</button>
          </div>
          {hasCustom&&(
            <>
              <input className="fi" type="number" inputMode="decimal" value={f.customPromoterPrice} onChange={e=>set("customPromoterPrice",parseFloat(e.target.value)||0)} placeholder="Monto neto recibido (Bs.)"/>
              <div className="fi-hint">Reemplaza el precio estándar del producto para esta promotora en particular</div>
            </>
          )}
        </div>
        <div className="fg">
          <div className="pills">
            <button className={"pill"+(f.active?" act":"")} onClick={()=>set("active",true)}>Activa</button>
            <button className={"pill"+(!f.active?" act-red":"")} onClick={()=>set("active",false)}>Inactiva</button>
          </div>
        </div>
        <div className="row mt12">
          <button className="btn btn-out" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" disabled={!f.name} onClick={()=>onSave(f)}>
            <Ic n="check" s={16} c="#100d02"/> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  EXPENSES PAGE
// ============================================================
function ExpensesPage({expenses, onAdd, onDelete}) {
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({type:"Empaques",amount:"",description:"",date:todayISO(),afectaSociedad:true});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const total=expenses.reduce((a,e)=>a+e.amount,0);
  const monthly=expenses.filter(e=>e.date>=Date.now()-30*86400000).reduce((a,e)=>a+e.amount,0);
  const byType=expenses.reduce((m,e)=>{m[e.type]=(m[e.type]||0)+e.amount;return m;},{});
  const sorted=Object.entries(byType).sort((a,b)=>b[1]-a[1]);
  const maxE=sorted[0]?.[1]||1;
  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l">Gastos</div>
        <button className="btn btn-sm btn-red" style={{width:"auto"}} onClick={()=>setShowForm(true)}>
          <Ic n="plus" s={14} c="#fff"/> Agregar
        </button>
      </div>
      <div className="g2">
        <div className="sc hr"><div className="sl">Total acumulado</div><div className="sv red">{fmt(total)}</div><div className="ss">{expenses.length} registros</div></div>
        <div className="sc"><div className="sl">Este mes</div><div className="sv">{fmt(monthly)}</div><div className="ss">30 días</div></div>
      </div>
      {sorted.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Por categoría</div>
          {sorted.map(([type,amt])=>(
            <div key={type} className="rbar">
              <div className="rbar-l">{type}</div>
              <div className="rbar-t"><div className="rbar-f" style={{width:(amt/maxE*100)+"%",background:"linear-gradient(90deg,var(--rd),var(--red))"}}/></div>
              <div className="rbar-v">{fmt(amt)}</div>
            </div>
          ))}
        </div>
      )}
      {expenses.length===0
        ?<div className="empty"><Ic n="receipt" s={38}/><p>Aún no hay gastos registrados.</p></div>
        :expenses.map(e=>(
          <div key={e.id} className="ei">
            <div className="ei-ico" style={{fontSize:"1.2rem"}}>
              {{"Empaques":"📦","Electricidad":"⚡","Internet":"🌐","Materiales":"🔩","Marketing":"📢","Transporte":"🚗","Alquiler":"🏠"}[e.type]||"📋"}
            </div>
            <div className="ei-body">
              <div className="ei-type">{e.type}</div>
              {e.description&&<div className="ei-desc">{e.description}</div>}
              <div className="ei-date">
                {fmtDate(e.date)}
                {e.afectaSociedad===false&&<span style={{marginLeft:6,fontSize:".68rem",fontWeight:800,color:"var(--muted)",background:"var(--s2)",padding:"1px 5px",borderRadius:4}}>Solo tienda</span>}
              </div>
            </div>
            <div className="ei-amt">{fmt(e.amount)}</div>
            <button onClick={()=>{if(window.confirm("Eliminar este gasto de "+fmt(e.amount)+"?")) onDelete(e.id);}} className="btn btn-sm btn-out" style={{marginLeft:8,padding:"4px 8px",fontSize:".68rem",flexShrink:0}}>
              <Ic n="trash" s={11}/>
            </button>
            <div className={"sdot "+(e.synced?"sd-ok":"sd-no")}/>
          </div>
        ))
      }
      {showForm&&(
        <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&setShowForm(false)}>
          <div className="sheet">
            <div className="sh-hd"/>
            <div className="sh-title">Nuevo gasto</div>
            <div className="fg">
              <label className="fl">Categoría</label>
              <select className="fs" value={form.type} onChange={e=>set("type",e.target.value)}>
                {EXP_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fi2">
              <div className="fg">
                <label className="fl">Monto (Bs.)</label>
                <input className="fi" type="number" inputMode="decimal" value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="0.00"/>
              </div>
              <div className="fg">
                <label className="fl">Fecha</label>
                <input className="fi" type="date" autoComplete="off" value={form.date} onChange={e=>set("date",e.target.value)}/>
              </div>
            </div>
            <div className="fg">
              <label className="fl">Descripción</label>
              <textarea className="fta" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Detalle opcional..."/>
            </div>
            <div className="fg">
              <label className="fl">Afecta distribución societaria</label>
              <div className="pills">
                <button className={"pill"+(form.afectaSociedad!==false?" act":"")} onClick={()=>set("afectaSociedad",true)}>
                  Si — gasto compartido 50/50
                </button>
                <button className={"pill"+(form.afectaSociedad===false?" act":"")} onClick={()=>set("afectaSociedad",false)}>
                  No — gasto solo tienda
                </button>
              </div>
              <div className="fi-hint">Los gastos compartidos se descuentan de la ganancia antes de dividir</div>
            </div>
            <div className="row">
              <button className="btn btn-out" onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className="btn btn-red" disabled={!form.amount} onClick={async()=>{
                if (!form.amount||isNaN(form.amount)) return;
                await onAdd({id:uid("e"),type:form.type,amount:parseFloat(form.amount),
                  description:form.description,date:new Date(form.date).getTime(),
                  afectaSociedad:form.afectaSociedad!==false});
                setForm({type:"Empaques",amount:"",description:"",date:todayISO(),afectaSociedad:true});
                setShowForm(false);
              }}>
                <Ic n="plus" s={16} c="#fff"/> Registrar gasto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  REPORTS PAGE
// ============================================================
function ReportsPage({sales, expenses, promoters, payments, role}) {
  const [tab,   setTab]   = useState("financiero");
  const [period,setPeriod]= useState("month");
  const periodLabel = period==="today"?"Hoy":period==="week"?"Últimos 7 días":period==="month"?"Últimos 30 días":"Todo el período";

  const now = Date.now();
  const fs = useMemo(()=>{
    if (period==="today") return sales.filter(s=>s.date>=todayMs());
    if (period==="week")  return sales.filter(s=>s.date>=now-7*86400000);
    if (period==="month") return sales.filter(s=>s.date>=now-30*86400000);
    return sales;
  },[sales,period]);

  // Mes anterior para comparacion
  const prevMonth = useMemo(()=>
    sales.filter(s=>s.date>=now-60*86400000&&s.date<now-30*86400000)
  ,[sales]);

  const totalSales  = fs.reduce((a,s)=>a+s.clientPrice,0);
  const totalComm   = fs.reduce((a,s)=>a+s.commission,0);
  const totalCost   = fs.reduce((a,s)=>a+s.cost,0);
  const totalProfit = fs.reduce((a,s)=>a+s.profit,0);
  const ownerProfit = fs.reduce((a,s)=>a+s.profitOwner,0);
  const partProfit  = fs.reduce((a,s)=>a+s.profitPartner,0);
  const fe = period==="today" ? expenses.filter(e=>e.date>=todayMs())
           : period==="week"  ? expenses.filter(e=>e.date>=now-7*86400000)
           : period==="month" ? expenses.filter(e=>e.date>=now-30*86400000)
           : expenses;
  const totalExp    = fe.filter(e=>e.afectaSociedad!==false).reduce((a,e)=>a+e.amount,0);
  const totalExpAll = fe.reduce((a,e)=>a+e.amount,0);
  const netFinal    = r2(totalProfit-totalExp);
  const ownerFinal  = r2(netFinal*.5);
  const partFinal   = r2(netFinal*.5);
  const histSales   = fs.filter(s=>s.isHistoric);

  // Comparacion vs mes anterior
  const prevSales   = prevMonth.reduce((a,s)=>a+s.clientPrice,0);
  const prevProfit  = prevMonth.reduce((a,s)=>a+s.profit,0);
  const salesChange = prevSales>0 ? r2((totalSales-prevSales)/prevSales*100) : null;
  const profitChange= prevProfit>0 ? r2((totalProfit-prevProfit)/prevProfit*100) : null;

  // Ventas por dia de semana
  const diasSemana = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];
  const ventasPorDia = diasSemana.map((d,i)=>{
    const daySales = fs.filter(s=>new Date(s.date).getDay()===i);
    return {dia:d, count:daySales.length, total:daySales.reduce((a,s)=>a+s.clientPrice,0)};
  });
  const maxDia = Math.max(...ventasPorDia.map(d=>d.total),1);

  // Ranking promotoras
  const ranking = promoters.map(pr=>{
    const ps=fs.filter(s=>s.promoterId===pr.id);
    const pending=sales.filter(s=>s.promoterId===pr.id&&s.commissionStatus==="pendiente");
    return {
      name:pr.name,
      total:ps.reduce((a,s)=>a+s.clientPrice,0),
      count:ps.length,
      comm:ps.reduce((a,s)=>a+s.commission,0),
      profit:ps.reduce((a,s)=>a+s.profit,0),
      pendingComm:pending.reduce((a,s)=>a+s.commission,0),
    };
  }).filter(r=>r.count>0).sort((a,b)=>b.total-a.total);
  const maxR=ranking[0]?.total||1;

  // Top productos
  const pm={};
  fs.forEach(s=>{
    if(!pm[s.productId]) pm[s.productId]={name:s.productName,count:0,rev:0,profit:0};
    pm[s.productId].count++; pm[s.productId].rev+=s.clientPrice; pm[s.productId].profit+=s.profit;
  });
  const topP=Object.values(pm).sort((a,b)=>b.count-a.count).slice(0,5);
  const maxP=topP[0]?.count||1;

  // Gastos por tipo
  const expByType = {};
  expenses.forEach(e=>{
    if(!expByType[e.type]) expByType[e.type]={type:e.type,total:0,count:0};
    expByType[e.type].total+=e.amount; expByType[e.type].count++;
  });
  const topExp = Object.values(expByType).sort((a,b)=>b.total-a.total);
  const maxExp = topExp[0]?.total||1;

  const Trend = ({val})=>{
    if (val===null) return null;
    const up = val>=0;
    return (
      <span style={{fontSize:".68rem",fontWeight:800,color:up?"var(--grn)":"var(--red)",marginLeft:6}}>
        {up?"↑":"↓"}{Math.abs(val)}% vs mes ant.
      </span>
    );
  };

  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l">Reportes</div>
        <button className="btn btn-sm btn-gold" style={{fontSize:".76rem",padding:"5px 10px"}}
          onClick={()=>{
            const label = new Date().toLocaleDateString("es-BO",{month:"long",year:"numeric"});
            generatePartnerReport(sales,expenses,promoters,"month",label);
          }}>
          Reporte mensual
        </button>
      </div>
      <div className="flt">
        {[["today","Hoy"],["week","7 días"],["month","30 días"],["all","Todo"]].map(([k,v])=>(
          <button key={k} className={"pill"+(period===k?" act":"")} onClick={()=>setPeriod(k)}>{v}</button>
        ))}
      </div>
      <div className="tabs">
        {[["financiero","Financiero"],["promotoras","Promotoras"],["productos","Productos"],["gastos","Gastos"],["semana","Por día"],["socios","Sociedad"]].map(([t,l])=>(
          <button key={t} className={"tab"+(tab===t?" act":"")} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      {tab==="financiero"&&(
        <>
          <div className="g2">
            <div className="sc hg">
              <div className="sl">Total vendido</div>
              <div className="sv gold">{fmt(totalSales)}</div>
              <div className="ss">{fs.length} ventas <Trend val={salesChange}/></div>
            </div>
            <div className="sc ht">
              <div className="sl">Ganancia tienda</div>
              <div className="sv teal">{fmt(totalProfit)}</div>
              <div className="ss">Antes de gastos <Trend val={profitChange}/></div>
            </div>
          </div>
          {histSales.length>0&&(
            <div className="al al-info" style={{marginBottom:12}}>
              <Ic n="history" s={14}/>
              <span>Incluye <b>{histSales.length} ventas históricas</b></span>
            </div>
          )}
          <div className="shd mt8"><div className="shd-l">Estado de resultados</div></div>
          <div className="fb">
            <div className="fr"><span className="fk">(+) Ingresos brutos al cliente</span><span className="fv" style={{color:"var(--gold)"}}>{fmt(totalSales)}</span></div>
            <div className="fr"><span className="fk">(-) Comisiones promotoras</span><span className="fv" style={{color:"var(--red)"}}>{fmt(totalComm)}</span></div>
            <div className="fr"><span className="fk">(=) Lo que entró a la tienda</span><span className="fv">{fmt(r2(totalSales-totalComm))}</span></div>
            <div className="fr"><span className="fk">(-) Costo materiales</span><span className="fv" style={{color:"var(--red)"}}>{fmt(totalCost)}</span></div>
            <div className="fr total"><span className="fk">= Ganancia bruta</span><span className="fv" style={{color:"var(--teal)"}}>{fmt(totalProfit)}</span></div>
            <div className="fr"><span className="fk">(-) Gastos compartidos</span><span className="fv" style={{color:"var(--red)"}}>{fmt(totalExp)}</span></div>
            <div className="fr total"><span className="fk">= Ganancia real final</span>
              <span className="fv" style={{color:netFinal>=0?"var(--grn)":"var(--red)"}}>{fmt(netFinal)}</span>
            </div>
          </div>
          <div className="shd mt16"><div className="shd-l">Distribución entre socios</div></div>
          <div className="g2">
            <div className="sc hg"><div className="sl">Socio admin (50%)</div><div className="sv gold">{fmt(ownerFinal)}</div><div className="ss">Socio administrador</div></div>
            <div className="sc ht"><div className="sl">Socio (50%)</div><div className="sv teal">{fmt(partFinal)}</div><div className="ss">Distribución igualitaria</div></div>
          </div>
          {totalSales>0&&(
            <div className="card">
              <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Distribución del ingreso</div>
              {[
                {label:"Socio admin (50%)", val:ownerProfit,clr:"var(--gold)"},
                {label:"Ganancia socio",   val:partProfit, clr:"var(--teal)"},
                {label:"Comisiones",       val:totalComm,  clr:"var(--blu)"},
                {label:"Materiales",       val:totalCost,  clr:"var(--red)"},
              ].map(row=>(
                <div key={row.label} className="rbar">
                  <div className="rbar-l">{row.label}</div>
                  <div className="rbar-t"><div className="rbar-f" style={{width:(row.val/totalSales*100)+"%",background:row.clr}}/></div>
                  <div className="rbar-v" style={{color:row.clr}}>{fmt(row.val)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab==="promotoras"&&(
        <>
          <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Ranking por volumen</div>
          {ranking.length===0
            ?<div className="empty"><p>Sin datos para este período.</p></div>
            :ranking.map((r,i)=>(
              <div key={r.name}>
                <div className="rbar">
                  <div className="rbar-l">{(i+1)+". "+r.name.split(" ")[0]}</div>
                  <div className="rbar-t"><div className="rbar-f" style={{width:(r.total/maxR*100)+"%"}}/></div>
                  <div className="rbar-v">{r.count}v</div>
                </div>
              </div>
            ))
          }
          <div className="dvd"/>
          <div className="fb">
            {ranking.map(r=>(
              <div key={r.name} className="fr" style={{flexWrap:"wrap",gap:4}}>
                <span className="fk" style={{minWidth:100}}>{r.name.split(" ")[0]}</span>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:".76rem",color:"var(--muted)"}}>Vendido: <b style={{color:"var(--gold)"}}>{fmt(r.total)}</b></span>
                  <span style={{fontSize:".76rem",color:"var(--muted)"}}>Com: <b style={{color:"var(--gold)"}}>{fmt(r.comm)}</b></span>
                  {r.pendingComm>0&&<span style={{fontSize:".68rem",color:"var(--red)",fontWeight:800}}>⏳ {fmt(r.pendingComm)} pendiente</span>}
                </div>
              </div>
            ))}
            <div className="fr total">
              <span className="fk">Ganancia generada</span>
              <span className="fv" style={{color:"var(--teal)"}}>{fmt(ranking.reduce((a,r)=>a+r.profit,0))}</span>
            </div>
          </div>
          <div className="shd mt16"><div className="shd-l">Historial de pagos</div></div>
          {payments.length===0
            ?<div className="empty"><Ic n="money" s={36}/><p>Aún no hay pagos registrados.</p></div>
            :payments.slice(0,10).map(pay=>{
              const pr=promoters.find(p=>p.id===pay.promoterId);
              return (
                <div key={pay.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--b1)",fontSize:".86rem"}}>
                  <div>
                    <div style={{fontWeight:700}}>{pr?.name}</div>
                    <div style={{fontSize:".76rem",color:"var(--dim)",marginTop:2}}>{fmtDate(pay.date)} - {pay.salesIds.length} ventas</div>
                  </div>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"1rem",color:"var(--grn)"}}>{fmt(pay.amount)}</span>
                </div>
              );
            })
          }
        </>
      )}

      {tab==="productos"&&(
        <>
          <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Más vendidos</div>
          {topP.length===0
            ?<div className="empty"><p>Sin datos para este período.</p></div>
            :topP.map(p=>(
              <div key={p.name}>
                <div className="rbar">
                  <div className="rbar-l" style={{maxWidth:110}}>{p.name}</div>
                  <div className="rbar-t"><div className="rbar-f" style={{width:(p.count/maxP*100)+"%",background:"var(--gold)"}}/></div>
                  <div className="rbar-v">{p.count}v</div>
                </div>
                <div style={{fontSize:".76rem",color:"var(--dim)",marginBottom:6,textAlign:"right"}}>
                  {fmt(p.rev)} vendido · {fmt(p.profit)} ganancia
                </div>
              </div>
            ))
          }
        </>
      )}

      {tab==="gastos"&&(
        <>
          <div className="g2" style={{marginBottom:12}}>
            <div className="sc hr">
              <div className="sl">Total gastos</div>
              <div className="sv red">{fmt(totalExp)}</div>
              <div className="ss">{fe.length} registros</div>
            </div>
            <div className="sc">
              <div className="sl">Impacto en ganancia</div>
              <div className="sv" style={{fontSize:"1.2rem",color:totalExp>totalProfit?"var(--red)":"var(--muted)"}}>
                {totalProfit>0?r2(totalExp/totalProfit*100):0}%
              </div>
              <div className="ss">de la ganancia bruta</div>
            </div>
          </div>
          <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Por categoría</div>
          {topExp.length===0
            ?<div className="empty"><p>Aún no hay gastos registrados.</p></div>
            :topExp.map(e=>(
              <div key={e.type} className="rbar">
                <div className="rbar-l">{e.type}</div>
                <div className="rbar-t"><div className="rbar-f" style={{width:(e.total/maxExp*100)+"%",background:"var(--red)"}}/></div>
                <div className="rbar-v" style={{color:"var(--red)"}}>{fmt(e.total)}</div>
              </div>
            ))
          }
          <div className="dvd"/>
          <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10,marginTop:4}}>Ultimos gastos</div>
          {expenses.slice(0,8).map(e=>(
            <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--b1)",fontSize:".86rem"}}>
              <div>
                <div style={{fontWeight:700}}>{e.type}</div>
                <div style={{fontSize:".76rem",color:"var(--dim)",marginTop:1}}>{e.description} · {fmtDate(e.date)}</div>
              </div>
              <span style={{color:"var(--red)",fontWeight:700}}>{fmt(e.amount)}</span>
            </div>
          ))}
        </>
      )}

      {tab==="semana"&&(
        <>
          <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:12}}>Ventas por dia de la semana</div>
          {ventasPorDia.map(d=>(
            <div key={d.dia} className="rbar">
              <div className="rbar-l" style={{width:36,fontWeight:800}}>{d.dia}</div>
              <div className="rbar-t">
                <div className="rbar-f" style={{width:d.total>0?(d.total/maxDia*100)+"%":"2%",background:d.total>0?"var(--gold)":"var(--b2)"}}/>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                <span style={{fontSize:".68rem",color:"var(--dim)"}}>{d.count}v</span>
                <span className="rbar-v" style={{color:d.total>0?"var(--gold)":"var(--dim)"}}>{d.total>0?fmt(d.total):"—"}</span>
              </div>
            </div>
          ))}
          {fs.length>0&&(
            <div className="al al-info" style={{marginTop:12}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>
                Mejor dia: <b>{ventasPorDia.reduce((a,b)=>b.total>a.total?b:a).dia}</b> con {fmt(ventasPorDia.reduce((a,b)=>b.total>a.total?b:a).total)}
              </span>
            </div>
          )}
        </>
      )}

      {tab==="socios"&&(()=>{
        const allS    = sales;
        const tvHist  = allS.reduce((a,s)=>a+s.clientPrice,0);
        const efecS   = allS.filter(s=>s.paymentMethod==="efectivo");
        const qrS     = allS.filter(s=>s.paymentMethod==="qr"||s.paymentMethod==="transferencia");
        const otrosS  = allS.filter(s=>!["efectivo","qr","transferencia"].includes(s.paymentMethod));
        const netEfec = efecS.reduce((a,s)=>a+s.clientPrice,0);
        const netQR   = qrS.reduce((a,s)=>a+s.clientPrice,0);
        const netOtros= otrosS.reduce((a,s)=>a+s.clientPrice,0);
        const gainEfec= efecS.reduce((a,s)=>a+s.profit,0);
        const gainQR  = qrS.reduce((a,s)=>a+s.profit,0);
        const gainTotal= allS.reduce((a,s)=>a+s.profit,0);
        const expSoc  = expenses.filter(e=>e.afectaSociedad!==false).reduce((a,e)=>a+e.amount,0);
        const netFin  = r2(gainTotal-expSoc);
        const porSocio= r2(netFin/2);
        const sergioRec = r2(gainEfec*0.5+gainQR);
        const socioRec  = r2(gainEfec*0.5);
        const saldo     = r2(sergioRec-socioRec-porSocio);
        const qrSinComp = allS.filter(s=>(s.paymentMethod==="qr"||s.paymentMethod==="transferencia")&&(!s.paymentRef||!s.paymentRef.trim()));
        return (
          <>
            <div className="al al-info" style={{marginBottom:14}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Reporte histórico completo — {allS.length} ventas totales</span>
            </div>
            <div className="shd mt8"><div className="shd-l">Total vendido histórico</div></div>
            <div className="g2">
              <div className="sc hg">
                <div className="sl">Vendido total</div>
                <div className="sv gold">{fmt(tvHist)}</div>
                <div className="ss">{allS.length} ventas</div>
              </div>
              <div className="sc ht">
                <div className="sl">Ganancia bruta</div>
                <div className="sv teal">{fmt(gainTotal)}</div>
                <div className="ss">Antes de gastos</div>
              </div>
            </div>
            <div className="shd mt8"><div className="shd-l">Por método de pago</div></div>
            <div className="fb">
              <div className="fr"><span className="fk">Efectivo</span>
                <div style={{textAlign:"right"}}>
                  <span className="fv" style={{color:"var(--grn)"}}>{fmt(netEfec)}</span>
                  <div style={{fontSize:".68rem",color:"var(--dim)"}}>{efecS.length} ventas · ganancia {fmt(gainEfec)}</div>
                </div>
              </div>
              <div className="fr"><span className="fk">QR / Transferencia</span>
                <div style={{textAlign:"right"}}>
                  <span className="fv" style={{color:"var(--blu)"}}>{fmt(netQR)}</span>
                  <div style={{fontSize:".68rem",color:"var(--dim)"}}>{qrS.length} ventas · ganancia {fmt(gainQR)}</div>
                </div>
              </div>
              {netOtros>0&&<div className="fr"><span className="fk">Otros métodos</span><span className="fv">{fmt(netOtros)}</span></div>}
              <div className="fr"><span className="fk">(-) Gastos societarios</span><span className="fv" style={{color:"var(--red)"}}>{fmt(expSoc)}</span></div>
              <div className="fr total"><span className="fk">= Ganancia real neta</span><span className="fv" style={{color:netFin>=0?"var(--grn)":"var(--red)"}}>{fmt(netFin)}</span></div>
            </div>
            <div className="shd mt16"><div className="shd-l">Distribución entre socios</div></div>
            <div className="g2">
              <div className="sc hg">
                <div className="sl">Sergio (Admin)</div>
                <div className="sv gold">{fmt(porSocio)}</div>
                <div className="ss">50% ganancia neta</div>
              </div>
              <div className="sc ht">
                <div className="sl">Socio</div>
                <div className="sv teal">{fmt(porSocio)}</div>
                <div className="ss">50% ganancia neta</div>
              </div>
            </div>
            <div className="shd mt8"><div className="shd-l">Deuda societaria estimada</div></div>
            <div className="fb">
              <div className="fr">
                <span className="fk">Ganancia efectivo recibida por Sergio</span>
                <span className="fv">{fmt(gainEfec*0.5)}</span>
              </div>
              <div className="fr">
                <span className="fk">Ganancia QR/transf. recibida por Sergio</span>
                <span className="fv" style={{color:"var(--blu)"}}>{fmt(gainQR)}</span>
              </div>
              <div className="fr">
                <span className="fk">Total recibido Sergio (estimado)</span>
                <span className="fv" style={{color:"var(--gold)"}}>{fmt(sergioRec)}</span>
              </div>
              <div className="fr">
                <span className="fk">Total recibido Socio (estimado)</span>
                <span className="fv" style={{color:"var(--teal)"}}>{fmt(socioRec)}</span>
              </div>
              <div className="fr total">
                <span className="fk">Saldo a favor de Sergio</span>
                <span className="fv" style={{color:saldo>0?"var(--grn)":"var(--red)",fontSize:"1.1rem",fontWeight:800}}>{fmt(Math.abs(saldo))}</span>
              </div>
              <div style={{fontSize:".68rem",color:"var(--dim)",padding:"6px 0",lineHeight:1.5}}>
                Estimado: QR/transferencias van a cuenta Sergio. Efectivo se asume repartido 50/50 en el momento.
              </div>
            </div>
            {qrSinComp.length>0&&(
              <>
                <div className="shd mt16">
                  <div className="shd-l" style={{color:"var(--red)"}}>QR sin comprobante</div>
                  <span className="chip ch-red">{qrSinComp.length}</span>
                </div>
                <div className="al al-warn" style={{marginBottom:10}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>{qrSinComp.length} ventas QR/transferencia sin comprobante · {fmt(qrSinComp.reduce((a,s)=>a+s.clientPrice,0))} en riesgo</span>
                </div>
                {qrSinComp.slice(0,5).map(s=>(
                  <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--b1)",fontSize:".86rem"}}>
                    <div>
                      <div style={{fontWeight:700}}>{s.productName}</div>
                      <div style={{fontSize:".76rem",color:"var(--dim)",marginTop:1}}>{fmtDate(s.date)} · {s.promoterName?.split(" ")[0]}</div>
                    </div>
                    <span style={{color:"var(--gold)",fontWeight:700}}>{fmt(s.clientPrice)}</span>
                  </div>
                ))}
                {qrSinComp.length>5&&<div style={{fontSize:".76rem",color:"var(--muted)",textAlign:"center",padding:"8px 0"}}>... y {qrSinComp.length-5} más. Usar filtro "QR sin comprobante" en Ventas.</div>}
              </>
            )}
          </>
        );
      })()}
    </div>
  );
}


// ============================================================
//  SETTINGS PAGE
// ============================================================
function SettingsPage({users, products, promoters, onSaveUser, onDelUser, onSaveProduct}) {
  const [tab,         setTab]         = useState("usuarios");
  const [showUserForm,setShowUserForm]= useState(false);
  const [editUser,    setEditUser]    = useState(null);
  const [showProdForm,setShowProdForm]= useState(false);
  const [editProd,    setEditProd]    = useState(null);

  return (
    <div className="pe">
      <div className="shd"><div className="shd-l">Configuración</div></div>
      <div className="tabs">
        {[["usuarios","Usuarios"],["precios","Productos"],["negocio","Negocio"]].map(([k,l])=>(
          <button key={k} className={"tab"+(tab===k?" act":"")} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==="usuarios"&&(
        <>
          <div style={{fontSize:".76rem",color:"var(--muted)",marginBottom:12,lineHeight:1.6}}>
            Administre los usuarios del sistema. Cada usuario accede con su PIN personal.
          </div>
          <button className="btn btn-gold" style={{marginBottom:14}} onClick={()=>{setEditUser(null);setShowUserForm(true);}}>
            <Ic n="plus" s={16} c="#100d02"/> Agregar usuario
          </button>
          {users.map(u=>(
            <div key={u.id} className="cfg-row">
              <div style={{width:34,height:34,borderRadius:"50%",background:"var(--s2)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:800,fontSize:".86rem",color:"var(--gold)",flexShrink:0}}>
                {u.name.charAt(0)}
              </div>
              <div style={{flex:1}}>
                <div className="cfg-row-name">{u.name}</div>
                <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:2}}>
                  <span className={"chip "+(ROLE_CLASS[u.role]||"ch-dim")}>{ROLE_LABEL[u.role]||u.role}</span>
                  {u.promoterId&&<span style={{marginLeft:6,color:"var(--dim)"}}>Promotora vinculada</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="btn btn-sm btn-out" style={{padding:"5px 8px"}} onClick={()=>{setEditUser(u);setShowUserForm(true);}}>
                  <Ic n="edit" s={13}/>
                </button>
                {u.role!=="admin"&&(
                  <button className="btn btn-sm btn-red" style={{padding:"5px 8px"}} onClick={()=>onDelUser(u.id)}>
                    <Ic n="trash" s={13}/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {tab==="precios"&&(
        <>
          <div style={{fontSize:".76rem",color:"var(--muted)",marginBottom:10,lineHeight:1.6}}>
            Administra tu catálogo de productos. <b style={{color:"var(--gold)"}}>Las ventas ya registradas no cambian.</b>
          </div>
          <button className="btn btn-gold" style={{marginBottom:14}} onClick={()=>{setEditProd(null);setShowProdForm(true);}}>
            <Ic n="plus" s={16} c="#100d02"/> Agregar producto
          </button>
          {products.map(p=>{
            const commission=r2(p.clientPrice-p.promoterPrice), profit=r2(p.promoterPrice-p.cost);
            return (
              <div key={p.id} style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:"var(--r)",padding:"14px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {p.photo
                      ?<img src={p.photo} alt={p.name} style={{width:40,height:40,borderRadius:8,objectFit:"cover",border:"1px solid var(--b1)",flexShrink:0}}/>
                      :<div style={{width:40,height:40,borderRadius:8,background:"var(--s2)",border:"1px solid var(--b1)",
                        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:800,color:"var(--dim)"}}>
                        {p.name.charAt(0)}
                      </div>
                    }
                    <div style={{fontWeight:700,fontSize:"1rem"}}>{p.name}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn btn-sm btn-out" style={{padding:"5px 9px"}} onClick={()=>{setEditProd(p);setShowProdForm(true);}}>
                      <Ic n="edit" s={13}/> Editar
                    </button>
                    <button className="btn btn-sm btn-red" style={{padding:"5px 8px"}}
                      onClick={()=>{if(window.confirm("Eliminar "+p.name+"?")) onSaveProduct({...p,_delete:true});}}>
                      <Ic n="trash" s={13}/>
                    </button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:8}}>
                  {[{l:"Precio venta",v:p.clientPrice,c:"var(--txt)"},{l:"Precio neto",v:p.promoterPrice,c:"var(--gold)"},{l:"Costo",v:p.cost,c:"var(--red)"}].map(it=>(
                    <div key={it.l} style={{background:"var(--s2)",borderRadius:"var(--rsm)",padding:"8px 6px",textAlign:"center"}}>
                      <div style={{fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"1rem",color:it.c}}>{fmt(it.v)}</div>
                      <div style={{fontSize:".68rem",color:"var(--dim)",marginTop:2}}>{it.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",background:"var(--s2)",borderRadius:"var(--rsm)",fontSize:".76rem"}}>
                  <span style={{color:"var(--muted)"}}>Comisión: <b style={{color:"var(--gold)"}}>{fmt(commission)}</b></span>
                  <span style={{color:"var(--muted)"}}>Ganancia: <b style={{color:"var(--teal)"}}>{fmt(profit)}</b></span>
                </div>
                {(p.priceHistory||[]).length>0&&(
                  <div style={{marginTop:6,fontSize:".68rem",color:"var(--dim)"}}>
                    <span style={{fontWeight:700}}>Historial:</span>
                    {(p.priceHistory||[]).slice(-3).reverse().map((h,i)=>(
                      <span key={i} className="ph-badge">{fmtDate(h.date)}: {fmt(h.clientPrice)}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {tab==="negocio"&&(
        <>
          <div className="card" style={{marginBottom:12}}>
            <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Datos del negocio</div>
            <div className="fr" style={{padding:"8px 0",borderBottom:"1px solid var(--b1)"}}><span className="fk">Nombre</span><span className="fv">{BUSINESS.name}</span></div>
            <div className="fr" style={{padding:"8px 0",borderBottom:"1px solid var(--b1)"}}><span className="fk">Ciudad</span><span className="fv">{BUSINESS.city}</span></div>
            <div className="fr" style={{padding:"8px 0",borderBottom:"1px solid var(--b1)"}}><span className="fk">Horario</span><span className="fv" style={{fontSize:".76rem",textAlign:"right",maxWidth:180}}>{BUSINESS.schedule}</span></div>
            <div className="fr" style={{padding:"8px 0",borderBottom:"1px solid var(--b1)"}}><span className="fk">Division sociedad</span><span className="fv">{BUSINESS.split*100}% / {BUSINESS.split*100}%</span></div>
            <div className="fr" style={{padding:"8px 0"}}><span className="fk">Tipo de cambio</span><span className="fv">1 USD = {BUSINESS.exchangeRate} BOB</span></div>
            <div className="al al-info" style={{marginTop:10}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Para cambiar estos datos actualiza el código en la constante BUSINESS. El lunes conectamos Supabase para editar desde aqui.</span>
            </div>
          </div>

          <div className="card" style={{marginBottom:12}}>
            <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Mensajes de WhatsApp</div>
            {[
              ["Nuevo","Recibimos tu pedido..."],
              ["Esperando foto","Necesitamos la foto..."],
              ["Diseñando","Estamos trabajando en el diseño..."],
              ["Esperando aprobación","Te enviamos el diseño..."],
              ["Pago pendiente","El diseño fue aprobado..."],
              ["Pago confirmado","Confirmamos el pago..."],
              ["Grabando","Ya estamos grabando..."],
              ["Listo","Tu pedido esta listo..."],
              ["Enviado","Tu pedido fue enviado..."],
            ].map(([estado, preview])=>(
              <div key={estado} style={{padding:"7px 0",borderBottom:"1px solid var(--b1)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <span style={{fontSize:".76rem",fontWeight:700}}>{estado}</span>
                <span style={{fontSize:".68rem",color:"var(--muted)",fontStyle:"italic",textAlign:"right",flex:1}}>{preview}</span>
              </div>
            ))}
            <div className="al al-info" style={{marginTop:10}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Los mensajes se personalizan automáticamente con el nombre del cliente y producto. Cuando conectemos Supabase podras editarlos desde aqui.</span>
            </div>
          </div>

          <div className="card">
            <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Sistema</div>
            <div className="fr" style={{padding:"8px 0",borderBottom:"1px solid var(--b1)"}}><span className="fk">Versión</span><span className="fv" style={{color:"var(--gold)"}}>Garabato POS v12</span></div>
            <div className="fr" style={{padding:"8px 0",borderBottom:"1px solid var(--b1)"}}><span className="fk">Base de datos</span><span className="fv">Local (IndexedDB)</span></div>
            <div className="fr" style={{padding:"8px 0",borderBottom:"1px solid var(--b1)"}}><span className="fk">Sincronización</span><span className="fv" style={{color:"var(--muted)"}}>Supabase — próximamente</span></div>
            <div className="fr" style={{padding:"8px 0"}}><span className="fk">Backup</span><span className="fv" style={{color:"var(--muted)"}}>Descarga manual desde el botón en la app</span></div>
          </div>
        </>
      )}

      {showUserForm&&<UserForm user={editUser} promoters={promoters} onClose={()=>setShowUserForm(false)} onSave={async u=>{await onSaveUser(u);setShowUserForm(false);}}/>}
      {showProdForm&&<ProductForm product={editProd} onClose={()=>setShowProdForm(false)} onSave={async p=>{await onSaveProduct(p);setShowProdForm(false);}}/>}
    </div>
  );
}

function UserForm({user, promoters, onClose, onSave}) {
  const blank={id:uid("u"),name:"",role:"promoter",pin:"",promoterId:null};
  const [f,setF]=useState(user||blank);
  const set=(k,v)=>setF(x=>({...x,[k]:v}));
  const valid=f.name&&f.pin&&f.pin.length>=4;
  return (
    <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">{user?"Editar usuario":"Nuevo usuario"}</div>
        <div className="fg">
          <label className="fl">Nombre</label>
          <input className="fi" value={f.name} onChange={e=>set("name",e.target.value)} autoComplete="name" placeholder="Nombre completo"/>
        </div>
        <div className="fg">
          <label className="fl">Rol</label>
          <select className="fs" value={f.role} onChange={e=>set("role",e.target.value)}>
            <option value="admin">Admin</option>
            <option value="socio">Socio</option>
            <option value="employee">Tienda</option>
            <option value="promoter">Promotora</option>
          </select>
        </div>
        <div className="fg">
          <label className="fl">PIN de acceso
            <span style={{fontSize:".68rem",color:"var(--grn)",fontWeight:700,marginLeft:6}}>
              (mínimo 4 dígitos)
            </span>
          </label>
          <input className="fi" type="password" inputMode="numeric" autoComplete="off" maxLength={6}
            value={f.pin} onChange={e=>set("pin",e.target.value.replace(/\D/g,""))} placeholder="Ej: 1234"/>
          <div className="fi-hint">Solo números. El usuario usa este PIN para entrar a la app.</div>
        </div>
        {f.role==="promoter"&&(
          <div className="fg">
            <label className="fl">Vincular con promotora</label>
            <select className="fs" value={f.promoterId||""} onChange={e=>set("promoterId",e.target.value||null)}>
              <option value="">Sin vincular</option>
              {promoters.map(pr=><option key={pr.id} value={pr.id}>{pr.name}</option>)}
            </select>
            <div className="fi-hint">Al vincular, esta usuaria solo verá sus propias ventas y pedidos</div>
          </div>
        )}
        <div className="row mt12">
          <button className="btn btn-out" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" disabled={!valid} onClick={()=>onSave(f)}>
            <Ic n="check" s={16} c="#100d02"/> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  NEW SALE MODAL
// ============================================================
function NewSaleModal({products, promoters, user, isHistoric, onClose, onSubmit}) {
  const BANKS = ["Tigo Money","BNB","Banco Unión","Banco Mercantil","Banco Bisa","Banco Nacional","Otro"];
  const [step,setStep]= useState(1);
  const [done,setDone]= useState(null);
  const [f,setF]= useState({
    productId:"",productName:"",customization:"",
    clientPrice:"",promoterPrice:"",cost:0,
    paymentMethod:"efectivo",
    promoterId:   user.role==="promoter"?user.promoterId:"",
    promoterName: user.role==="promoter"?(promoters.find(p=>p.id===user.promoterId)?.name||""):"",
    isDirectSale: false,
    clientName:"",clientPhone:"",
    saleDate:todayISO(),
    variantId:"",variantName:"",
    soloGrabado:false, grabadoDesc:"",
  });
  const set=(k,v)=>setF(x=>({...x,[k]:v}));
  const setSoloPrice=v=>setF(x=>({...x,clientPrice:v,promoterPrice:v}));
  const toggleSoloGrabado=on=>setF(x=>({...x,soloGrabado:on,
    ...(on?{
      productId:"solo-grabado",productName:"Servicio de grabado",
      isDirectSale:true,promoterId:"DIRECTO",promoterName:"Tienda directa",
      cost:0,clientPrice:"",promoterPrice:"",grabadoDesc:"",customization:"",
    }:{
      productId:"",productName:"",isDirectSale:false,
      promoterId:user.role==="promoter"?user.promoterId:"",
      promoterName:user.role==="promoter"?(promoters.find(p=>p.id===user.promoterId)?.name||""):"",
      clientPrice:"",promoterPrice:"",
    }),
  }));

  // Estado del comprobante (opcional, solo para QR/transferencia)
  const [vcOpen,    setVcOpen]    = useState(false);
  const [vcFile,    setVcFile]    = useState(null);
  const [vcPreview, setVcPreview] = useState(null);
  const [vcType,    setVcType]    = useState("");
  const [vcHash,    setVcHash]    = useState("");
  const [vcRef,     setVcRef]     = useState("");
  const [vcHolder,  setVcHolder]  = useState("");
  const [vcBank,    setVcBank]    = useState("Tigo Money");
  const [vcDate,    setVcDate]    = useState(todayISO());
  const [vcTime,    setVcTime]    = useState("");
  const [vcLoading, setVcLoading] = useState(false);

  const handleVcFile = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 10*1024*1024) { alert("El archivo supera los 10MB."); return; }
    const isPDF = file.type==="application/pdf";
    const isImg = file.type.startsWith("image/");
    if (!isPDF&&!isImg) { alert("Solo JPG, PNG o PDF."); return; }
    setVcLoading(true);
    const h = await fileHash(file);
    setVcHash(h); setVcFile(file); setVcType(isPDF?"pdf":"image");
    if (isImg) {
      let b64 = await compressImage(file);
      if (b64.length > 2*1024*1024) b64 = await new Promise(res=>{
        const reader=new FileReader(); reader.onload=ev=>{
          const img=new Image(); img.onload=()=>{
            const c=document.createElement("canvas");
            const MAX=800; const ratio=Math.min(MAX/img.width,MAX/img.height,1);
            c.width=img.width*ratio; c.height=img.height*ratio;
            c.getContext("2d").drawImage(img,0,0,c.width,c.height);
            res(c.toDataURL("image/jpeg",0.5));
          }; img.src=ev.target.result;
        }; reader.readAsDataURL(file);
      });
      setVcPreview(b64);
    } else {
      const b64 = await new Promise(res=>{const r=new FileReader();r.onload=ev=>res(ev.target.result);r.readAsDataURL(file);});
      setVcPreview(b64);
    }
    setVcLoading(false);
  };

  const needsVoucher = f.paymentMethod==="qr" || f.paymentMethod==="transferencia";

  // ── MODO CARRITO ──
  const [multiMode, setMultiMode] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [pickingFor, setPickingFor] = useState(null); // índice del item al que se asigna producto

  const newCartItem = (type='product') => ({
    _id: uid('ci'),
    type,
    productId: type==='grabado'?'solo-grabado':'',
    productName: '',
    qty: 1,
    unitPrice: '',
    unitCost: 0,
    unitPromoterPrice: '',
    isSoloGrabado: type==='grabado',
    grabadoDesc: '',
    customization: '',
    variantId: '',
    variantName: '',
  });
  const addCartItem = type => setCartItems(p=>[...p, newCartItem(type)]);
  const updCartItem = (idx, patch) => setCartItems(p=>p.map((it,i)=>i===idx?{...it,...patch}:it));
  const remCartItem = idx => setCartItems(p=>p.filter((_,i)=>i!==idx));

  const cartTotalPrice = cartItems.reduce((s,it)=>s+(parseFloat(it.unitPrice)||0)*(it.qty||1),0);
  const cartTotalCost  = cartItems.reduce((s,it)=>s+(it.unitCost||0)*(it.qty||1),0);
  const cartTotalPromoterPrice = cartItems.reduce((s,it)=>s+(parseFloat(it.unitPromoterPrice)||0)*(it.qty||1),0);
  const {commission:cartCommission,profit:cartProfit,profitOwner:cartProfitOwner,profitPartner:cartProfitPartner}
    = calcSale(cartTotalPrice, cartTotalPromoterPrice, cartTotalCost);

  const selProd = products.find(p=>p.id===f.productId);
  const selProm = promoters.find(p=>p.id===f.promoterId);

  const pickProduct = p=>{
    const pp = f.isDirectSale ? p.clientPrice : resolvePromoterPrice(p,selProm);
    set("productId",p.id); set("productName",p.name);
    set("clientPrice",p.clientPrice.toString());
    set("promoterPrice",pp.toString()); set("cost",p.cost);
    // Reset variant on product change
    set("variantId",""); set("variantName","");
  };
  const selProdLowStock = selProd && selProd.stock <= selProd.lowStockAlert;
  const pickPromoter = pr=>{
    set("promoterId",pr.id); set("promoterName",pr.name);
    if (selProd) set("promoterPrice",resolvePromoterPrice(selProd,pr).toString());
  };
  const setDirectSale = direct=>{
    set("isDirectSale",direct);
    if (direct){
      set("promoterId","DIRECTO"); set("promoterName","Tienda directa");
      if (selProd) set("promoterPrice",selProd.clientPrice.toString());
    } else {
      set("promoterId",""); set("promoterName","");
      if (selProd) set("promoterPrice",resolvePromoterPrice(selProd,null).toString());
    }
  };

  const cp  = parseFloat(f.clientPrice)||0;
  const pp  = parseFloat(f.promoterPrice)||0;
  const cst = f.cost||0;
  const {commission,profit,profitOwner,profitPartner} = calcSale(cp,pp,cst);
  const ss  = s => step>s?"s-done":step===s?"s-cur":"s-fut";
  const selProdHasVariants = selProd?.hasVariants && selProd?.variants?.length>0;
  const step1valid = multiMode
    ? cartItems.length>0 && cartItems.every(it=>(parseFloat(it.unitPrice)||0)>0 && (it.isSoloGrabado||it.productId))
    : f.soloGrabado
      ? cp > 0
      : f.productId && (f.productId!=="custom" || f.productName.trim()) && (!selProdHasVariants || f.variantId);
  const step2valid = multiMode || f.isDirectSale||f.promoterId;

  const parseLocalDate = iso => { const [y,m,d]=iso.split("-"); return new Date(+y,+m-1,+d).getTime(); };

  const handleSubmit = async()=>{
    const saleDate = isHistoric ? parseLocalDate(f.saleDate) : Date.now();
    const vcId = (vcOpen && vcFile) ? uid("vc") : null;
    const soloGrabado = !!f.soloGrabado;

    if (multiMode) {
      const saleDate = isHistoric ? parseLocalDate(f.saleDate) : Date.now();
      const vcId = (vcOpen && vcFile) ? uid("vc") : null;
      const cp2  = r2(cartTotalPrice);
      const pp2  = r2(f.isDirectSale ? cartTotalPrice : cartTotalPromoterPrice);
      const {commission:cm,profit:pf,profitOwner:po,profitPartner:pp3} = calcSale(cp2,pp2,r2(cartTotalCost));
      const names = cartItems.map(it=>(it.qty>1?it.qty+"× ":"")+(it.isSoloGrabado?(it.grabadoDesc||"Grabado"):(it.productName||"?")));
      const multiSale = {
        id:uid("V"),
        productId: "multi",
        productName: names.join(" · "),
        customization: "",
        clientPrice:cp2, promoterPrice:pp2, cost:r2(cartTotalCost),
        commission:cm, profit:pf, profitOwner:po, profitPartner:pp3,
        paymentMethod:f.paymentMethod,
        promoterId: f.isDirectSale?null:f.promoterId,
        promoterName: f.isDirectSale?"Tienda directa":f.promoterName,
        isDirectSale: !!f.isDirectSale,
        isSoloGrabado: false,
        isMultiItem: true,
        items: cartItems.map(it=>({
          productId: it.isSoloGrabado?"solo-grabado":it.productId,
          productName: it.isSoloGrabado?(it.grabadoDesc||"Servicio de grabado"):it.productName,
          qty: it.qty||1,
          unitPrice: parseFloat(it.unitPrice)||0,
          unitCost: it.unitCost||0,
          unitPromoterPrice: parseFloat(it.unitPromoterPrice)||0,
          isSoloGrabado: !!it.isSoloGrabado,
          customization: it.customization||"",
          variantId: it.variantId||null,
          variantName: it.variantName||null,
        })),
        clientName: f.clientName.trim(),
        clientPhone: f.clientPhone.trim(),
        notes: "",
        commissionStatus: f.isDirectSale?"pagado":"pendiente",
        date: saleDate, isHistoric: !!isHistoric,
        voucherId: vcId,
        synced: false,
      };
      if (vcId && vcFile) {
        let vcImageUrl = null;
        try {
          let uploadBlob = vcFile, uploadType = vcFile.type;
          if (vcType !== "pdf" && vcPreview) {
            const byteStr = atob(vcPreview.split(',')[1]);
            const buf = new ArrayBuffer(byteStr.length);
            const arr = new Uint8Array(buf);
            for (let i=0;i<byteStr.length;i++) arr[i]=byteStr.charCodeAt(i);
            uploadBlob = new Blob([buf], {type:'image/jpeg'}); uploadType='image/jpeg';
          }
          vcImageUrl = await uploadVoucherImage(vcId, uploadBlob, uploadType);
        } catch(e) { console.warn("Storage upload failed:", e); }
        const voucher = {
          id:vcId, hash:vcHash, image:vcPreview, imageUrl:vcImageUrl, fileType:vcType, fileName:vcFile.name,
          amount:cp2, reference:vcRef.trim(), holderName:vcHolder.trim(), bank:vcBank,
          paymentDate:vcDate||new Date(saleDate).toISOString().slice(0,10), paymentTime:vcTime,
          uploadedAt:Date.now(), uploadedBy:user?.name||"",
          saleId:multiSale.id, saleSummary:names[0]+" · "+fmtDate(saleDate),
          notes:"", synced:false,
        };
        await dbPut("vouchers", voucher);
      }
      setDone(multiSale); await onSubmit(multiSale);
      return;
    }

    const sale = {
      id:uid("V"),
      productId: soloGrabado?"solo-grabado":f.productId,
      productName: soloGrabado?(f.grabadoDesc.trim()||"Servicio de grabado"):f.productName,
      customization:f.customization.trim(),
      clientPrice:cp,promoterPrice:pp,cost:cst,
      commission,profit,profitOwner,profitPartner,
      paymentMethod:f.paymentMethod,
      promoterId:   f.isDirectSale?null:f.promoterId,
      promoterName: f.isDirectSale?"Tienda directa":f.promoterName,
      isDirectSale: !!f.isDirectSale,
      isSoloGrabado: soloGrabado,
      clientName:   f.clientName.trim(),
      clientPhone:  f.clientPhone.trim(),
      notes:"",
      commissionStatus: f.isDirectSale?"pagado":"pendiente",
      date:saleDate,isHistoric:!!isHistoric,
      variantId: f.variantId||null,
      variantName: f.variantName||null,
      voucherId: vcId,
    };
    // Si hay comprobante, guardarlo ANTES del onSubmit para que el reload lo incluya
    if (vcId && vcFile) {
      let vcImageUrl = null;
      try {
        let uploadBlob = vcFile, uploadType = vcFile.type;
        if (vcType !== "pdf" && vcPreview) {
          const byteStr = atob(vcPreview.split(',')[1]);
          const buf = new ArrayBuffer(byteStr.length);
          const arr = new Uint8Array(buf);
          for (let i=0;i<byteStr.length;i++) arr[i]=byteStr.charCodeAt(i);
          uploadBlob = new Blob([buf], {type:'image/jpeg'}); uploadType='image/jpeg';
        }
        vcImageUrl = await uploadVoucherImage(vcId, uploadBlob, uploadType);
      } catch(e) { console.warn("Storage upload failed:", e); }
      const voucher = {
        id: vcId,
        hash: vcHash,
        image: vcPreview,
        imageUrl: vcImageUrl,
        fileType: vcType,
        fileName: vcFile.name,
        amount: cp,
        reference: vcRef.trim(),
        holderName: vcHolder.trim(),
        bank: vcBank,
        paymentDate: vcDate || new Date(saleDate).toISOString().slice(0,10),
        paymentTime: vcTime,
        uploadedAt: Date.now(),
        uploadedBy: user?.name||"",
        saleId: sale.id,
        saleSummary: f.productName+" · "+fmtDate(saleDate),
        notes: "",
        synced: false,
      };
      await dbPut("vouchers", voucher);
    }
    setDone(sale); await onSubmit(sale);
  };

  return (
    <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&!done&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        {done?(
          <div className="suc">
            <div className="suc-ring"><Ic n="check" s={32} c="#fff"/></div>
            <div className="suc-title">{isHistoric?"Cargada!":"Venta registrada!"}</div>
            <div className="id-tag" style={{marginBottom:16}}>{done.id}</div>
            <div className="pb" style={{width:"100%",marginBottom:16}}>
              {done.isMultiItem?(
                done.items.map((it,i)=>(
                  <div key={i} className="pbr">
                    <span className="pbk">{it.qty>1?it.qty+"× ":""}{it.isSoloGrabado?(it.grabadoDesc||"Grabado"):(it.productName||"?")}{it.customization?` · "${it.customization}"`:""}</span>
                    <span className="pbv pbv-gold">{fmt((it.unitPrice||0)*(it.qty||1))}</span>
                  </div>
                ))
              ):(
                <>
                  <div className="pbr"><span className="pbk">{done.isSoloGrabado?"Pieza":"Producto"}</span><span className="pbv">{done.productName}</span></div>
                  {done.customization&&<div className="pbr"><span className="pbk">Grabado</span><span className="pbv pbv-gold" style={{fontStyle:"italic"}}>"{done.customization}"</span></div>}
                </>
              )}
              <div className="pbr"><span className="pbk">Fecha</span><span className="pbv">{fmtDate(done.date)}</span></div>
              <div className="pbr"><span className="pbk">Origen</span><span className="pbv">{done.isSoloGrabado?"Solo grabado":done.promoterName}</span></div>
              {done.clientName&&<div className="pbr"><span className="pbk">Cliente</span><span className="pbv">{done.clientName}{done.clientPhone?" - "+done.clientPhone:""}</span></div>}
              {done.voucherId&&<div className="pbr"><span className="pbk">Comprobante</span><span className="pbv" style={{color:"var(--grn)"}}><Ic n="clip" s={11}/> Adjunto</span></div>}
              <div className="pbr sep"><span className="pbk">Precio cobrado</span><span className="pbv pbv-gold">{fmt(done.clientPrice)}</span></div>
              {done.isSoloGrabado?(
                user.role==="admin"&&(
                  <>
                    <div className="pbr"><span className="pbk">Ganancia bruta (servicio puro)</span><span className="pbv pbv-grn">{fmt(done.profit)}</span></div>
                    <div className="pbr"><span className="pbk">Tu parte (50%)</span><span className="pbv" style={{color:"#b47fff",fontWeight:800}}>{fmt(done.profitOwner)}</span></div>
                    <div className="pbr"><span className="pbk">Socio (50%)</span><span className="pbv" style={{color:"#b47fff",fontWeight:800}}>{fmt(done.profitPartner)}</span></div>
                  </>
                )
              ):(
                <>
                  {done.isDirectSale?(
                    <div className="pbr"><span className="pbk">Ingreso total tienda</span><span className="pbv pbv-teal">{fmt(done.clientPrice)}</span></div>
                  ):(
                    <>
                      <div className="pbr"><span className="pbk">Comisión promotora</span><span className="pbv pbv-gold">{fmt(done.commission)}</span></div>
                      <div className="pbr"><span className="pbk">Monto a entregar a tienda</span><span className="pbv pbv-teal">{fmt(done.promoterPrice)}</span></div>
                    </>
                  )}
                  {user.role==="admin"&&(
                    <>
                      <div className="pbr"><span className="pbk">(-) Costo material</span><span className="pbv pbv-red">{fmt(done.cost)}</span></div>
                      <div className="pbr"><span className="pbk">= Ganancia bruta</span><span className="pbv pbv-grn">{fmt(done.profit)}</span></div>
                      <div className="pbr"><span className="pbk">Socio administrador (50%)</span><span className="pbv pbv-teal">{fmt(done.profitOwner)}</span></div>
                    </>
                  )}
                </>
              )}
            </div>
            <button className="btn btn-gold" onClick={onClose}><Ic n="check" s={16} c="#100d02"/> Continuar</button>
          </div>
        ):(
          <>
            {isHistoric&&(
              <div className="al al-info" style={{marginBottom:14}}>
                <Ic n="history" s={14}/>
                <span>Modo histórico - pone la fecha real de la venta</span>
              </div>
            )}
            <div className="steps">
              {[1,2,3].map((s,i)=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div className={"step "+ss(s)}>{s}</div>
                  {i<2&&<div className={"s-line "+(step>s?"sl-done":"sl-fut")}/>}
                </div>
              ))}
            </div>

            {step===1&&(
              <div className="pe">
                <div style={{fontSize:"1rem",fontWeight:700,marginBottom:14,color:"var(--muted)"}}>
                  Paso 1 - <span style={{color:"var(--txt)"}}>{multiMode?"Artículos (carrito)":f.soloGrabado?"Servicio de grabado":"Producto y grabado"}</span>
                </div>

                {/* Toggle venta múltiple */}
                {!f.soloGrabado&&(
                  <div className="price-box" style={{marginBottom:14,cursor:"pointer"}}
                    onClick={()=>{setMultiMode(v=>!v);if(!multiMode&&cartItems.length===0)addCartItem('product');}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:".86rem",display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:"1rem"}}>🛒</span>
                          <span style={{color:multiMode?"var(--teal)":"var(--txt)"}}>Venta múltiple</span>
                        </div>
                        <div style={{fontSize:".72rem",color:"var(--muted)",marginTop:2}}>Vendés varios artículos distintos en una sola operación</div>
                      </div>
                      <div style={{
                        width:42,height:24,borderRadius:12,
                        background:multiMode?"rgba(41,184,168,.35)":"var(--s3)",
                        position:"relative",flexShrink:0,transition:".2s",
                      }}>
                        <div style={{
                          width:18,height:18,borderRadius:"50%",
                          background:multiMode?"var(--teal)":"var(--muted)",
                          position:"absolute",top:3,
                          left:multiMode?20:3,
                          transition:".2s",
                        }}/>
                      </div>
                    </div>
                  </div>
                )}

                {/* Toggle solo grabado */}
                {!multiMode&&(
                <div className="price-box" style={{marginBottom:14,cursor:"pointer"}} onClick={()=>toggleSoloGrabado(!f.soloGrabado)}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:".86rem",display:"flex",alignItems:"center",gap:6}}>
                        <Ic n="laser" s={14} c={f.soloGrabado?"#b47fff":"var(--muted)"}/>
                        <span style={{color:f.soloGrabado?"#b47fff":"var(--txt)"}}>Solo grabado</span>
                      </div>
                      <div style={{fontSize:".72rem",color:"var(--muted)",marginTop:2}}>El cliente trae su pieza · solo cobras el servicio</div>
                    </div>
                    <div style={{
                      width:42,height:24,borderRadius:12,
                      background:f.soloGrabado?"rgba(180,120,255,.4)":"var(--s3)",
                      position:"relative",flexShrink:0,transition:".2s",
                    }}>
                      <div style={{
                        width:18,height:18,borderRadius:"50%",
                        background:f.soloGrabado?"#b47fff":"var(--muted)",
                        position:"absolute",top:3,
                        left:f.soloGrabado?20:3,
                        transition:".2s",
                      }}/>
                    </div>
                  </div>
                </div>
                )} {/* fin !multiMode → toggle solo grabado */}

                {/* ══ MODO CARRITO ══ */}
                {multiMode&&(
                  <>
                    {isHistoric&&(
                      <div className="fg">
                        <label className="fl">Fecha real de la venta</label>
                        <input className="fi" type="date" value={f.saleDate} onChange={e=>set("saleDate",e.target.value)} max={todayISO()}/>
                      </div>
                    )}
                    {(user.role==="admin"||user.role==="employee")&&(
                      <div className="price-box" style={{marginBottom:14}}>
                        <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
                          Datos del cliente (opcional)
                        </div>
                        <div className="fi2">
                          <div className="fg">
                            <label className="fl">Nombre</label>
                            <input className="fi" value={f.clientName} onChange={e=>set("clientName",e.target.value)} placeholder="Nombre del cliente"/>
                          </div>
                          <div className="fg">
                            <label className="fl">Teléfono</label>
                            <input className="fi" type="tel" value={f.clientPhone} onChange={e=>set("clientPhone",e.target.value)} placeholder="70012345"/>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Líneas del carrito */}
                    {cartItems.map((it,idx)=>(
                      <div key={it._id} style={{border:"1px solid var(--b1)",borderRadius:"var(--r)",padding:"12px 13px",marginBottom:10,background:"var(--s2)"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                          <div style={{fontWeight:700,fontSize:".82rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:.4}}>
                            {it.isSoloGrabado?"Solo grabado":it.type==="custom"?"Personalizado":"Artículo "+(idx+1)}
                          </div>
                          <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",fontSize:"1rem",padding:0}} onClick={()=>remCartItem(idx)}>×</button>
                        </div>
                        {it.isSoloGrabado?(
                          <>
                            <div className="fg" style={{marginBottom:8}}>
                              <input className="fi" value={it.grabadoDesc} onChange={e=>updCartItem(idx,{grabadoDesc:e.target.value})} placeholder="Descripción de la pieza (opcional)"/>
                            </div>
                            <div className="fg" style={{marginBottom:8}}>
                              <input className="fi" value={it.customization} onChange={e=>updCartItem(idx,{customization:e.target.value})} placeholder="Texto del grabado (opcional)"/>
                            </div>
                          </>
                        ):(
                          <>
                            {it.productId?(
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                                <div style={{flex:1,fontWeight:700,fontSize:".86rem",color:"var(--gold)"}}>{it.productName}</div>
                                <button className="btn btn-sm btn-out" style={{padding:"4px 8px",fontSize:".7rem"}} onClick={()=>setPickingFor(idx)}>Cambiar</button>
                              </div>
                            ):(
                              <button className="btn btn-out" style={{width:"100%",marginBottom:8}} onClick={()=>setPickingFor(idx)}>
                                Seleccionar producto del catálogo →
                              </button>
                            )}
                            {it.type==="custom"&&(
                              <div className="fg" style={{marginBottom:8}}>
                                <input className="fi" value={it.productName} onChange={e=>updCartItem(idx,{productId:e.target.value?"custom":"",productName:e.target.value})} placeholder="Nombre del artículo"/>
                              </div>
                            )}
                            <div className="fg" style={{marginBottom:8}}>
                              <input className="fi" value={it.customization} onChange={e=>updCartItem(idx,{customization:e.target.value})} placeholder="Texto del grabado (opcional)"/>
                            </div>
                          </>
                        )}
                        <div className="fi2">
                          <div className="fg">
                            <label className="fl">Precio unitario (Bs)</label>
                            <input className="fi" type="number" inputMode="decimal" value={it.unitPrice}
                              onChange={e=>{
                                const v=e.target.value;
                                updCartItem(idx,{unitPrice:v, unitPromoterPrice:v});
                              }} placeholder="0" min="0"/>
                          </div>
                          <div className="fg">
                            <label className="fl">Costo unitario (Bs)</label>
                            <input className="fi" type="number" inputMode="decimal" value={it.unitCost}
                              onChange={e=>updCartItem(idx,{unitCost:parseFloat(e.target.value)||0})} placeholder="0" min="0"/>
                          </div>
                        </div>
                        <div className="fg">
                          <label className="fl">Cantidad</label>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <button className="btn btn-sm btn-out" style={{padding:"5px 12px",fontSize:"1rem"}}
                              onClick={()=>updCartItem(idx,{qty:Math.max(1,(it.qty||1)-1)})}>−</button>
                            <span style={{fontWeight:800,fontSize:"1rem",minWidth:28,textAlign:"center"}}>{it.qty||1}</span>
                            <button className="btn btn-sm btn-out" style={{padding:"5px 12px",fontSize:"1rem"}}
                              onClick={()=>updCartItem(idx,{qty:(it.qty||1)+1})}>+</button>
                            <span style={{fontSize:".76rem",color:"var(--muted)",marginLeft:4}}>
                              = {fmt((parseFloat(it.unitPrice)||0)*(it.qty||1))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Botones añadir línea */}
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                      <button className="btn btn-sm btn-out" onClick={()=>addCartItem('product')}>+ Del catálogo</button>
                      <button className="btn btn-sm btn-out" onClick={()=>addCartItem('custom')}>+ Personalizado</button>
                      <button className="btn btn-sm btn-out" style={{color:"#b47fff",borderColor:"rgba(180,120,255,.3)"}} onClick={()=>addCartItem('grabado')}>+ Solo grabado</button>
                    </div>
                    {/* Total del carrito */}
                    {cartItems.length>0&&cartTotalPrice>0&&(
                      <div className="pb" style={{marginBottom:14}}>
                        <div className="pbr"><span className="pbk">Total a cobrar</span><span className="pbv pbv-gold">{fmt(cartTotalPrice)}</span></div>
                        <div className="pbr"><span className="pbk">Costo total materiales</span><span className="pbv pbv-red">{fmt(cartTotalCost)}</span></div>
                        {user.role==="admin"&&(
                          <>
                            <div className="pbr sep"><span className="pbk">Ganancia bruta</span><span className="pbv pbv-grn">{fmt(cartProfit+(cartTotalPrice-cartTotalPromoterPrice))}</span></div>
                            <div className="pbr"><span className="pbk">Tu parte (50%)</span><span className="pbv pbv-teal">{fmt(cartProfitOwner+(cartTotalPrice-cartTotalPromoterPrice)/2)}</span></div>
                          </>
                        )}
                      </div>
                    )}
                    {/* Picker de producto de catálogo */}
                    {pickingFor!==null&&(
                      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:900,overflowY:"auto",padding:"20px 16px",display:"flex",flexDirection:"column"}}>
                        <div style={{maxWidth:560,margin:"0 auto",width:"100%"}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                            <div style={{fontWeight:700,fontSize:"1rem"}}>Seleccionar producto</div>
                            <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--txt)",fontSize:"1.3rem"}} onClick={()=>setPickingFor(null)}>✕</button>
                          </div>
                          <div className="prod-grid">
                            {products.map(p=>(
                              <div key={p.id} className="prod-card" onClick={()=>{
                                updCartItem(pickingFor,{
                                  productId:p.id, productName:p.name,
                                  unitPrice:p.clientPrice.toString(),
                                  unitCost:p.cost,
                                  unitPromoterPrice:p.promoterPrice.toString(),
                                  type:'product',
                                });
                                setPickingFor(null);
                              }}>
                                {p.photo?<img src={p.photo} alt={p.name} className="prod-card-img"/>:<div className="prod-card-ph">{p.name.charAt(0)}</div>}
                                <div className="prod-card-info">
                                  <div className="prod-card-name">{p.name}</div>
                                  <div className="prod-card-price">{fmt(p.clientPrice)}</div>
                                  <div className="prod-card-sub">Costo: {fmt(p.cost)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ══ MODO SIMPLE (existente) ══ */}
                {!multiMode&&(
                <>
                {isHistoric&&(
                  <div className="fg">
                    <label className="fl">Fecha real de la venta</label>
                    <input className="fi" type="date" value={f.saleDate} onChange={e=>set("saleDate",e.target.value)} max={todayISO()}/>
                  </div>
                )}
                {f.soloGrabado?(
                  /* ── FORMULARIO SOLO GRABADO ── */
                  <>
                    {(user.role==="admin"||user.role==="employee")&&(
                      <div className="fi2" style={{marginBottom:14}}>
                        <div className="fg">
                          <label className="fl">Nombre cliente (opcional)</label>
                          <input className="fi" value={f.clientName} onChange={e=>set("clientName",e.target.value)} placeholder="Nombre del cliente"/>
                        </div>
                        <div className="fg">
                          <label className="fl">Teléfono (opcional)</label>
                          <input className="fi" type="tel" value={f.clientPhone} onChange={e=>set("clientPhone",e.target.value)} placeholder="70012345"/>
                        </div>
                      </div>
                    )}
                    <div className="fg">
                      <label className="fl">Descripción de la pieza (opcional)</label>
                      <input className="fi" value={f.grabadoDesc}
                        onChange={e=>set("grabadoDesc",e.target.value)}
                        placeholder="Ej: Taza del cliente, llavero, gafas..."/>
                    </div>
                    <div className="fg">
                      <label className="fl">Texto del grabado (opcional)</label>
                      {f.customization&&(
                        <div className="lp">
                          <div style={{fontSize:".68rem",color:"var(--dim)",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Vista previa laser</div>
                          <div className="lp-txt">{f.customization.toUpperCase()}</div>
                        </div>
                      )}
                      <input className="fi" placeholder="Ej: Ana y Luis 2024" value={f.customization} onChange={e=>set("customization",e.target.value)}/>
                    </div>
                    <div className="fg">
                      <label className="fl">Precio del servicio (Bs)</label>
                      <input className="fi" type="number" inputMode="decimal"
                        value={f.clientPrice} onChange={e=>setSoloPrice(e.target.value)}
                        placeholder="0" min="0"/>
                    </div>
                    {cp>0&&user.role==="admin"&&(
                      <div className="pb" style={{marginBottom:14}}>
                        <div className="pbr"><span className="pbk">Precio cobrado</span><span className="pbv pbv-gold">{fmt(cp)}</span></div>
                        <div className="pbr"><span className="pbk">Costo material</span><span className="pbv pbv-red">Bs 0 (solo servicio)</span></div>
                        <div className="pbr sep"><span className="pbk">Ganancia bruta</span><span className="pbv pbv-grn">{fmt(cp)}</span></div>
                        <div className="pbr"><span className="pbk">Tu parte (50%)</span><span className="pbv" style={{color:"#b47fff",fontWeight:800}}>{fmt(cp/2)}</span></div>
                        <div className="pbr"><span className="pbk">Socio (50%)</span><span className="pbv" style={{color:"#b47fff",fontWeight:800}}>{fmt(cp/2)}</span></div>
                      </div>
                    )}
                  </>
                ):(
                  /* ── FORMULARIO NORMAL ── */
                  <>
                    {/* Datos del cliente - solo tienda y admin */}
                    {(user.role==="admin"||user.role==="employee")&&(
                      <div className="price-box">
                        <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
                          Datos del cliente (opcional)
                        </div>
                        <div className="fi2">
                          <div className="fg">
                            <label className="fl">Nombre</label>
                            <input className="fi" value={f.clientName} onChange={e=>set("clientName",e.target.value)} autoComplete="name" placeholder="Nombre del cliente"/>
                          </div>
                          <div className="fg">
                            <label className="fl">Teléfono</label>
                            <input className="fi" type="tel" autoComplete="tel" value={f.clientPhone} onChange={e=>set("clientPhone",e.target.value)} placeholder="Ej: 70012345 (sin prefijo 591)"/>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="fg">
                      <label className="fl">Producto</label>
                      <button className={"prod-card"+(f.productId==="custom"?" sel":"")}
                        style={{width:"100%",textAlign:"left",padding:"10px 12px",display:"flex",alignItems:"center",gap:8,marginBottom:8,borderRadius:"var(--r)"}}
                        onClick={()=>{set("productId","custom");set("productName","");set("clientPrice","");set("promoterPrice","");set("cost",0);set("isDirectSale",true);}}>
                        <div style={{width:32,height:32,borderRadius:8,background:"var(--s3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>✏️</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:".86rem"}}>Producto personalizado</div>
                          <div style={{fontSize:".68rem",color:"var(--muted)",marginTop:1}}>Para productos fuera del catálogo</div>
                        </div>
                      </button>
                      <div className="prod-grid">
                        {products.map(p=>(
                          <div key={p.id} className={"prod-card"+(f.productId===p.id?" sel":"")} onClick={()=>pickProduct(p)}>
                            {p.photo?<img src={p.photo} alt={p.name} className="prod-card-img"/>:<div className="prod-card-ph">{p.name.charAt(0)}</div>}
                            <div className="prod-card-info">
                              <div className="prod-card-name" style={{color:f.productId===p.id?"var(--gold)":"var(--txt)"}}>{p.name}</div>
                              <div className="prod-card-price">{fmt(p.clientPrice)}</div>
                              <div className="prod-card-sub">Neto: {fmt(p.promoterPrice)}</div>
                              {p.hasVariants?(
                                <div style={{fontSize:".68rem",color:"var(--muted)",marginTop:2}}>{(p.variants||[]).length} variantes · stock: {p.stock}</div>
                              ):(
                                p.stock<=p.lowStockAlert&&<div style={{fontSize:".68rem",color:"var(--red)",marginTop:2}}>Stock bajo: {p.stock}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {isHistoric&&f.productId&&(
                      <div className="price-box">
                        <div style={{fontSize:".76rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
                          Ajusta si los precios eran diferentes en esa epoca
                        </div>
                        <div className="fi2">
                          <div className="fg">
                            <label className="fl">Precio al cliente</label>
                            <input className="fi" type="number" inputMode="decimal" value={f.clientPrice} onChange={e=>set("clientPrice",e.target.value)}/>
                          </div>
                          <div className="fg">
                            <label className="fl">Precio neto recibido</label>
                            <input className="fi" type="number" inputMode="decimal" value={f.promoterPrice} onChange={e=>set("promoterPrice",e.target.value)}/>
                          </div>
                        </div>
                        <div className="fg">
                          <label className="fl">Costo material (en ese momento)</label>
                          <input className="fi" type="number" inputMode="decimal" value={f.cost} onChange={e=>set("cost",parseFloat(e.target.value)||0)}/>
                        </div>
                      </div>
                    )}
                    {selProd?.hasVariants&&selProd?.variants?.length>0&&(
                      <div className="fg">
                        <label className="fl">Variante</label>
                        <div className="var-grid">
                          {selProd.variants.map(v=>(
                            <button key={v.id} className={"var-btn"+(f.variantId===v.id?" sel":"")}
                              onClick={()=>{set("variantId",v.id);set("variantName",v.name);}}>
                              <div className="var-btn-name">{v.name}</div>
                              <div className="var-btn-stock">Stock: {v.stock||0}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {f.productId&&cp>0&&pp>0&&(
                      <div style={{marginBottom:13,fontSize:".76rem",display:"flex",gap:14,flexWrap:"wrap"}}>
                        <span style={{color:"var(--muted)"}}>Comision promotora: <b style={{color:"var(--gold)"}}>{fmt(commission)}</b></span>
                        {user.role==="admin"&&<span style={{color:"var(--muted)"}}>Ganancia: <b style={{color:"var(--teal)"}}>{fmt(profit)}</b></span>}
                      </div>
                    )}
                    <div className="fg">
                      <label className="fl">Texto del grabado (opcional)</label>
                      {f.customization&&(
                        <div className="lp">
                          <div style={{fontSize:".68rem",color:"var(--dim)",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Vista previa laser</div>
                          <div className="lp-txt">{f.customization.toUpperCase()}</div>
                        </div>
                      )}
                      <input className="fi" placeholder="Ej: Ana y Luis 2024" value={f.customization} onChange={e=>set("customization",e.target.value)}/>
                    </div>
                    {selProdLowStock&&(
                      <div className="al al-warn" style={{marginTop:8,marginBottom:8}}>
                        <Ic n="warn" s={13}/>
                        <span>Stock bajo: solo quedan <b>{selProd.stock}</b> unidades</span>
                      </div>
                    )}
                  </>
                )}
                <button className="btn btn-gold"
                  disabled={f.soloGrabado?!cp:(!f.productId||!f.clientPrice||!f.promoterPrice)}
                  onClick={()=>step1valid&&setStep(2)}>
                  Continuar
                </button>
                </> /* fin !multiMode */
                )} {/* fin !multiMode wrapper */}

                {/* Botón Continuar del carrito */}
                {multiMode&&(
                  <button className="btn btn-gold"
                    disabled={!step1valid}
                    onClick={()=>step1valid&&setStep(2)}>
                    Continuar — {cartItems.length} artículo{cartItems.length!==1?"s":""} · {fmt(cartTotalPrice)}
                  </button>
                )}
              </div>
            )}

            {step===2&&(
              <div className="pe">
                <div style={{fontSize:"1rem",fontWeight:700,marginBottom:14,color:"var(--muted)"}}>
                  Paso 2 - <span style={{color:"var(--txt)"}}>Origen de la venta</span>
                </div>
                {multiMode&&(
                  <div className="al al-ok" style={{marginBottom:14}}>
                    <span>🛒</span>
                    <span>Venta múltiple · {cartItems.length} artículo{cartItems.length!==1?"s":""} · total {fmt(cartTotalPrice)}</span>
                  </div>
                )}
                {f.soloGrabado&&(
                  <div className="al al-ok" style={{marginBottom:14}}>
                    <Ic n="laser" s={14}/>
                    <span>Solo grabado · pieza del cliente · sin promotora · split 50/50</span>
                  </div>
                )}
                {!f.soloGrabado&&!multiMode&&user.role!=="promoter"&&(
                  <div className="fg">
                    <label className="fl">Tipo de venta</label>
                    <div className="pills" style={{marginBottom:12}}>
                      <button className={"pill"+(!f.isDirectSale?" act":"")} onClick={()=>setDirectSale(false)}>Por promotora</button>
                      <button className={"pill"+(f.isDirectSale?" act":"")} onClick={()=>setDirectSale(true)}>Venta directa tienda</button>
                    </div>
                    {f.isDirectSale&&(
                      <div className="al al-ok" style={{marginBottom:0}}>
                        <Ic n="check" s={14}/>
                        <span>Venta directa - cliente de TikTok, redes o tienda fisica. Sin comisión de promotora.</span>
                      </div>
                    )}
                  </div>
                )}
                {!f.isDirectSale&&!f.soloGrabado&&!multiMode&&(
                  <div className="fg">
                    <label className="fl">¿Quién hizo la venta?</label>
                    {promoters.filter(p=>p.active).map(pr=>{
                      const priceForThis=selProd?resolvePromoterPrice(selProd,pr):0;
                      const isSelf=user.role==="promoter"&&user.promoterId===pr.id;
                      return (
                        <div key={pr.id} onClick={()=>pickPromoter(pr)} style={{
                          display:"flex",alignItems:"center",gap:10,padding:"11px 13px",
                          background:f.promoterId===pr.id?"linear-gradient(145deg,#18140a,#201c0e)":"var(--s2)",
                          border:"1px solid "+(f.promoterId===pr.id?"var(--gd)":"var(--b1)"),
                          borderRadius:"var(--rsm)",cursor:"pointer",marginBottom:7,transition:".2s",
                          opacity:user.role==="promoter"&&!isSelf?.3:1,
                          pointerEvents:user.role==="promoter"&&!isSelf?"none":"auto",
                        }}>
                          <div style={{width:34,height:34,borderRadius:"50%",
                            background:f.promoterId===pr.id?"var(--gd)":"var(--b1)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontFamily:"DM Sans,sans-serif",fontWeight:800,fontSize:"1rem",
                            color:f.promoterId===pr.id?"#100d02":"var(--muted)",flexShrink:0}}>
                            {pr.name.charAt(0)}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:".86rem",color:f.promoterId===pr.id?"var(--gold)":"var(--txt)"}}>{pr.name}</div>
                            <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:2}}>
                              Neto: <b style={{color:"var(--gold)"}}>{fmt(priceForThis)}</b>
                              {pr.customPromoterPrice!=null&&<span style={{color:"var(--blu)",marginLeft:4}}>(precio especial)</span>}
                            </div>
                          </div>
                          {f.promoterId===pr.id&&<Ic n="check" s={16} c="var(--gold)"/>}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="fg">
                  <label className="fl">Método de pago</label>
                  <div className="pills">
                    {PM_OPTS.map(([v,l])=>(
                      <button key={v} className={"pill"+(f.paymentMethod===v?" act":"")} onClick={()=>{set("paymentMethod",v);if(v!=="qr"&&v!=="transferencia")setVcOpen(false);}}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* SECCIÓN COMPROBANTE — aparece solo para QR/Transferencia */}
                {needsVoucher&&(
                  <div style={{border:"1px solid var(--b1)",borderRadius:"var(--r)",marginBottom:14,overflow:"hidden"}}>
                    <button
                      style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 13px",background:vcOpen?"rgba(224,198,17,.07)":"var(--s2)",border:"none",cursor:"pointer",gap:8,WebkitAppearance:"none",outline:"none"}}
                      onClick={()=>setVcOpen(v=>!v)}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <Ic n="clip" s={14} c={vcFile?"var(--grn)":"var(--muted)"}/>
                        <span style={{fontSize:".82rem",fontWeight:700,color:vcFile?"var(--grn)":"var(--muted)"}}>
                          {vcFile?"Comprobante adjunto ✓":"Adjuntar comprobante de pago (opcional)"}
                        </span>
                      </div>
                      <span style={{fontSize:".76rem",color:"var(--dim)"}}>{vcOpen?"▲":"▼"}</span>
                    </button>

                    {vcOpen&&(
                      <div style={{padding:"12px 13px",borderTop:"1px solid var(--b1)"}}>
                        <div className="fg">
                          <label className="fl">Archivo (JPG, PNG, PDF — máx 10MB)</label>
                          <input type="file" accept="image/*,.pdf" className="fi"
                            onChange={handleVcFile} disabled={vcLoading}/>
                        </div>
                        {vcLoading&&<div style={{textAlign:"center",padding:"8px 0",fontSize:".76rem",color:"var(--muted)"}}>Procesando archivo...</div>}
                        {vcPreview&&vcType==="image"&&(
                          <div style={{marginBottom:10,borderRadius:"var(--rsm)",overflow:"hidden",border:"1px solid var(--b1)"}}>
                            <img src={vcPreview} style={{width:"100%",maxHeight:140,objectFit:"contain",display:"block",background:"#111"}}/>
                          </div>
                        )}
                        {vcFile&&vcType==="pdf"&&(
                          <div className="al al-ok" style={{marginBottom:10}}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            <span style={{fontSize:".76rem"}}>{vcFile.name}</span>
                          </div>
                        )}
                        <div className="fi2">
                          <div className="fg">
                            <label className="fl">Fecha del pago</label>
                            <input className="fi" type="date" value={vcDate} onChange={e=>setVcDate(e.target.value)}/>
                          </div>
                          <div className="fg">
                            <label className="fl">Hora</label>
                            <input className="fi" type="time" value={vcTime} onChange={e=>setVcTime(e.target.value)}/>
                          </div>
                        </div>
                        <div className="fi2">
                          <div className="fg">
                            <label className="fl">Nro. comprobante</label>
                            <input className="fi" value={vcRef} onChange={e=>setVcRef(e.target.value)} placeholder="Últimos dígitos"/>
                          </div>
                          <div className="fg">
                            <label className="fl">Banco / Billetera</label>
                            <select className="fs" value={vcBank} onChange={e=>setVcBank(e.target.value)}>
                              {BANKS.map(b=><option key={b}>{b}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="fg">
                          <label className="fl">Nombre del titular</label>
                          <input className="fi" value={vcHolder} onChange={e=>setVcHolder(e.target.value)} placeholder="Nombre en el comprobante"/>
                        </div>
                        {vcFile&&(
                          <button className="btn btn-sm btn-out" style={{width:"auto"}} onClick={()=>{setVcFile(null);setVcPreview(null);setVcHash("");setVcType("");}}>
                            Quitar comprobante
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {step2valid&&(
                  <div className="pb" style={{marginBottom:13}}>
                    <div style={{fontSize:".68rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>
                      {isHistoric?"Resumen histórico":"Resumen de la venta"}
                    </div>
                    {multiMode?(
                      <>
                        {cartItems.map((it,i)=>(
                          <div key={i} className="pbr">
                            <span className="pbk">{it.qty>1?it.qty+"× ":""}{it.isSoloGrabado?(it.grabadoDesc||"Grabado"):(it.productName||"Artículo")}</span>
                            <span className="pbv pbv-gold">{fmt((parseFloat(it.unitPrice)||0)*(it.qty||1))}</span>
                          </div>
                        ))}
                        <div className="pbr sep"><span className="pbk">TOTAL</span><span className="pbv pbv-gold">{fmt(cartTotalPrice)}</span></div>
                        <div className="pbr"><span className="pbk">(-) Costo total</span><span className="pbv pbv-red">{fmt(cartTotalCost)}</span></div>
                        {user.role==="admin"&&(
                          <div className="pbr"><span className="pbk">= Ganancia bruta</span><span className="pbv pbv-grn">{fmt(cartTotalPrice-cartTotalCost)}</span></div>
                        )}
                      </>
                    ):null}
                    {!multiMode&&<div className="pbr"><span className="pbk">Precio cobrado</span><span className="pbv pbv-gold">{fmt(cp)}</span></div>}
                    {f.soloGrabado?(
                      user.role==="admin"&&(
                        <>
                          <div className="pbr"><span className="pbk">Ganancia bruta (servicio puro)</span><span className="pbv pbv-grn">{fmt(cp)}</span></div>
                          <div className="pbr"><span className="pbk">Tu parte (50%)</span><span className="pbv" style={{color:"#b47fff",fontWeight:800}}>{fmt(cp/2)}</span></div>
                          <div className="pbr"><span className="pbk">Socio (50%)</span><span className="pbv" style={{color:"#b47fff",fontWeight:800}}>{fmt(cp/2)}</span></div>
                        </>
                      )
                    ):(
                      <>
                        {f.isDirectSale?(
                          <div className="pbr"><span className="pbk">Ingreso total tienda</span><span className="pbv pbv-teal">{fmt(cp)}</span></div>
                        ):(
                          <>
                            <div className="pbr"><span className="pbk">Comisión promotora</span><span className="pbv pbv-gold">{fmt(commission)}</span></div>
                            <div className="pbr"><span className="pbk">Monto a entregar a tienda</span><span className="pbv pbv-teal">{fmt(pp)}</span></div>
                          </>
                        )}
                        {user.role==="admin"&&(
                          <>
                            <div className="pbr"><span className="pbk">(-) Costo material</span><span className="pbv pbv-red">{fmt(cst)}</span></div>
                            <div className="pbr"><span className="pbk">= Ganancia bruta</span><span className="pbv pbv-grn">{fmt(profit)}</span></div>
                            <div className="pbr"><span className="pbk">Socio administrador (50%)</span><span className="pbv pbv-teal">{fmt(profitOwner)}</span></div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
                <div className="row">
                  <button className="btn btn-out" onClick={()=>setStep(1)}>Volver</button>
                  <button className="btn btn-gold" disabled={!step2valid} onClick={()=>setStep(3)} style={{flex:2}}>Revisar</button>
                </div>
              </div>
            )}

            {step===3&&(
              <div className="pe">
                <div style={{fontSize:"1rem",fontWeight:700,marginBottom:14,color:"var(--muted)"}}>
                  Paso 3 - <span style={{color:"var(--txt)"}}>Confirmar</span>
                </div>
                <div className="pb" style={{marginBottom:14}}>
                  {multiMode&&<div className="pbr"><span className="pbk">Tipo</span><span className="pbv"><span className="chip ch-teal">🛒 Venta múltiple</span></span></div>}
                  {f.soloGrabado&&<div className="pbr"><span className="pbk">Tipo</span><span className="pbv"><span className="chip ch-laser">Solo Grabado</span></span></div>}
                  {multiMode?(
                    cartItems.map((it,i)=>(
                      <div key={i} className="pbr">
                        <span className="pbk">{it.qty>1?it.qty+"× ":""}{it.isSoloGrabado?(it.grabadoDesc||"Grabado"):(it.productName||"?")}{it.customization?` · "${it.customization}"`:""}</span>
                        <span className="pbv pbv-gold">{fmt((parseFloat(it.unitPrice)||0)*(it.qty||1))}</span>
                      </div>
                    ))
                  ):(
                    <>
                      <div className="pbr"><span className="pbk">{f.soloGrabado?"Pieza":"Producto"}</span><span className="pbv">{f.soloGrabado?(f.grabadoDesc||"Servicio de grabado"):f.productName}</span></div>
                      {f.customization&&<div className="pbr"><span className="pbk">Grabado</span><span className="pbv pbv-gold" style={{fontStyle:"italic"}}>"{f.customization}"</span></div>}
                    </>
                  )}
                  {isHistoric&&<div className="pbr"><span className="pbk">Fecha real</span><span className="pbv">{fmtDate(parseLocalDate(f.saleDate))}</span></div>}
                  <div className="pbr"><span className="pbk">Origen</span><span className="pbv">{multiMode?"Tienda directa":f.soloGrabado?"Solo grabado":f.isDirectSale?"Tienda directa":f.promoterName}</span></div>
                  <div className="pbr"><span className="pbk">Método de pago</span><span className="pbv" style={{textTransform:"capitalize"}}>{f.paymentMethod}</span></div>
                  {f.clientName&&<div className="pbr"><span className="pbk">Cliente</span><span className="pbv">{f.clientName}</span></div>}
                  {isHistoric&&<div className="pbr"><span className="pbk">Tipo</span><span className="pbv hist-tag">Histórica</span></div>}
                  {vcFile&&<div className="pbr"><span className="pbk">Comprobante</span><span className="pbv" style={{color:"var(--grn)"}}><Ic n="clip" s={11}/> {vcFile.name}</span></div>}
                  <div className="pbr sep"><span className="pbk">{multiMode?"TOTAL":"Precio cobrado"}</span><span className="pbv pbv-gold">{fmt(multiMode?cartTotalPrice:cp)}</span></div>
                  {multiMode?(
                    <>
                      <div className="pbr"><span className="pbk">(-) Costo total</span><span className="pbv pbv-red">{fmt(cartTotalCost)}</span></div>
                      {user.role==="admin"&&(
                        <>
                          <div className="pbr"><span className="pbk">= Ganancia bruta</span><span className="pbv pbv-grn">{fmt(cartTotalPrice-cartTotalCost)}</span></div>
                          <div className="pbr"><span className="pbk">Tu parte (50%)</span><span className="pbv pbv-teal">{fmt((cartTotalPrice-cartTotalCost)/2)}</span></div>
                          <div className="pbr"><span className="pbk">Socio (50%)</span><span className="pbv pbv-teal">{fmt((cartTotalPrice-cartTotalCost)/2)}</span></div>
                        </>
                      )}
                    </>
                  ):null}
                  {!multiMode&&f.soloGrabado&&user.role==="admin"&&(
                    <>
                      <div className="pbr"><span className="pbk">Ganancia bruta (servicio puro)</span><span className="pbv pbv-grn">{fmt(cp)}</span></div>
                      <div className="pbr"><span className="pbk">Tu parte (50%)</span><span className="pbv" style={{color:"#b47fff",fontWeight:800}}>{fmt(cp/2)}</span></div>
                      <div className="pbr"><span className="pbk">Socio (50%)</span><span className="pbv" style={{color:"#b47fff",fontWeight:800}}>{fmt(cp/2)}</span></div>
                    </>
                  )}
                  {!multiMode&&!f.soloGrabado&&(
                    <>
                      {f.isDirectSale?(
                        <div className="pbr"><span className="pbk">Ingreso total tienda</span><span className="pbv pbv-teal">{fmt(cp)}</span></div>
                      ):(
                        <>
                          <div className="pbr"><span className="pbk">Comisión promotora</span><span className="pbv pbv-gold">{fmt(commission)}</span></div>
                          <div className="pbr"><span className="pbk">Monto a entregar a tienda</span><span className="pbv pbv-teal">{fmt(pp)}</span></div>
                        </>
                      )}
                      {user.role==="admin"&&(
                        <>
                          <div className="pbr"><span className="pbk">(-) Costo material</span><span className="pbv pbv-red">{fmt(cst)}</span></div>
                          <div className="pbr"><span className="pbk">= Ganancia bruta</span><span className="pbv pbv-grn">{fmt(profit)}</span></div>
                          <div className="pbr"><span className="pbk">Socio administrador (50%)</span><span className="pbv pbv-teal">{fmt(profitOwner)}</span></div>
                          <div className="pbr"><span className="pbk">Socio (50%)</span><span className="pbv pbv-teal">{fmt(profitPartner)}</span></div>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className="row">
                  <button className="btn btn-out" onClick={()=>step1valid&&setStep(2)}>Volver</button>
                  <button className="btn btn-teal" onClick={handleSubmit} style={{flex:2}}>
                    <Ic n="check" s={16} c="#020f0e"/>
                    {isHistoric?"Cargar venta histórica":"Registrar venta"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
//  CSV IMPORT MODAL
// ============================================================
function CSVImportModal({promoters, onClose, onImport}) {
  const [rows,    setRows]    = useState(null);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const parseCSV = text => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return null;
    const header = lines[0].split(",").map(h=>h.replace(/^"|"$/g,"").trim().toLowerCase());
    const required = ["fecha","producto","precio_cliente"];
    for (const r of required) {
      if (!header.includes(r)) return {err:`Columna requerida faltante: ${r}`};
    }
    const get = (row,name) => {
      const i = header.indexOf(name);
      if (i<0) return "";
      return (row[i]||"").replace(/^"|"$/g,"").trim();
    };
    const parsed = [];
    for (let i=1;i<lines.length;i++) {
      const cols = lines[i].match(/("(?:[^"]|"")*"|[^,]*)/g)||lines[i].split(",");
      const raw = cols.map(c=>(c||"").replace(/^"|"$/g,"").trim());
      const fechaStr = get(raw,"fecha");
      if (!fechaStr) continue;
      const fechaMs = isNaN(Date.parse(fechaStr)) ? Date.now() : new Date(fechaStr).getTime();
      const cp  = parseFloat(get(raw,"precio_cliente"))||0;
      const pp  = parseFloat(get(raw,"precio_neto"))||cp;
      const cst = parseFloat(get(raw,"costo"))||0;
      const {commission,profit,profitOwner,profitPartner} = calcSale(cp,pp,cst);
      const promName = get(raw,"promotora")||"Tienda directa";
      const pr = promoters.find(p=>p.name.toLowerCase().includes(promName.toLowerCase()));
      const isDirectSale = !pr&&(promName.toLowerCase().includes("tienda")||promName.toLowerCase().includes("directa")||promName==="");
      parsed.push({
        id: uid("I"),
        productId: "imported",
        productName: get(raw,"producto")||"Importado",
        customization: "",
        clientPrice:cp, promoterPrice:pp, cost:cst,
        commission, profit, profitOwner, profitPartner,
        paymentMethod: (get(raw,"metodo_pago")||"efectivo").toLowerCase(),
        paymentRef: get(raw,"referencia_pago")||"",
        promoterId: pr?.id||null,
        promoterName: pr?pr.name:(isDirectSale?"Tienda directa":promName),
        isDirectSale: !!isDirectSale,
        clientName: get(raw,"nombre_cliente")||"",
        clientPhone: "",
        notes: get(raw,"notas")||"",
        commissionStatus: (pr||!isDirectSale)?"pendiente":"pagado",
        date: fechaMs,
        isHistoric: true,
        synced: false,
      });
    }
    return parsed;
  };

  const handleFile = e => {
    setError(""); setRows(null);
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = parseCSV(ev.target.result);
      if (!result) { setError("Archivo vacío o sin encabezados."); return; }
      if (result.err) { setError(result.err); return; }
      setRows(result);
    };
    reader.readAsText(file,"utf-8");
  };

  const handleImport = async () => {
    if (!rows||rows.length===0) return;
    setLoading(true);
    await onImport(rows);
    setLoading(false);
  };

  return (
    <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">Importar ventas desde CSV</div>
        <div style={{fontSize:".76rem",color:"var(--muted)",marginBottom:14,lineHeight:1.6}}>
          El CSV debe tener encabezados en la primera fila. Columnas soportadas:<br/>
          <code style={{fontSize:".68rem",color:"var(--gold)"}}>fecha, producto, precio_cliente, precio_neto, costo, metodo_pago, promotora, referencia_pago, nombre_cliente, notas</code>
        </div>
        <div className="fg">
          <input type="file" accept=".csv,text/csv" className="fi" onChange={handleFile}/>
        </div>
        {error&&<div className="al al-warn" style={{marginBottom:10}}><span>{error}</span></div>}
        {rows&&(
          <div className="al al-ok" style={{marginBottom:14}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span><b>{rows.length} filas</b> detectadas y listas para importar.</span>
          </div>
        )}
        {rows&&rows.length>0&&(
          <div style={{background:"var(--s2)",borderRadius:"var(--rsm)",padding:"10px 12px",marginBottom:14,maxHeight:180,overflowY:"auto"}}>
            {rows.slice(0,8).map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--b1)",fontSize:".76rem"}}>
                <span>{fmtDate(r.date)} · {r.productName}</span>
                <span style={{color:"var(--gold)",fontWeight:700}}>{fmt(r.clientPrice)}</span>
              </div>
            ))}
            {rows.length>8&&<div style={{fontSize:".68rem",color:"var(--dim)",paddingTop:6}}>... y {rows.length-8} más</div>}
          </div>
        )}
        <div className="row mt12">
          <button className="btn btn-out" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" disabled={!rows||rows.length===0||loading} onClick={handleImport} style={{flex:2}}>
            {loading?"Importando...":"Importar "+((rows&&rows.length)||0)+" ventas"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  DELETE SALE MODAL
// ============================================================
function DeleteSaleModal({sale, onClose, onConfirm}) {
  const [motivo, setMotivo] = useState("");
  const motivos = ["Devolucion al cliente","Error de registro","Pedido cancelado","Otro"];
  return (
    <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">Eliminar venta</div>
        <div className="al al-warn" style={{marginBottom:14}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>Esta acción no se puede deshacer. Quedan los datos como registro.</span>
        </div>
        <div className="pb" style={{marginBottom:14}}>
          <div className="pbr"><span className="pbk">Producto</span><span className="pbv">{sale?.productName}</span></div>
          <div className="pbr"><span className="pbk">Cliente</span><span className="pbv">{sale?.clientName||"—"}</span></div>
          <div className="pbr sep"><span className="pbk">Monto</span><span className="pbv pbv-red">{new Intl.NumberFormat("es-BO",{style:"currency",currency:"BOB"}).format(sale?.clientPrice||0)}</span></div>
        </div>
        <div className="fg">
          <label className="fl">Motivo de eliminación</label>
          <div className="pills" style={{flexWrap:"wrap",marginBottom:8}}>
            {motivos.map(m=>(
              <button key={m} className={"pill"+(motivo===m?" act":"")} onClick={()=>setMotivo(m)}>{m}</button>
            ))}
          </div>
          {(motivo==="Otro"||(!["Devolucion al cliente","Error de registro","Pedido cancelado","Otro"].includes(motivo)&&motivo))&&(
            <input className="fi" value={motivo==="Otro"?"":motivo}
              placeholder="Especifica el motivo..."
              onChange={e=>setMotivo(e.target.value||"Otro")}/>
          )}
        </div>
        <div className="row mt12">
          <button className="btn btn-out" onClick={onClose}>Cancelar</button>
          <button className="btn btn-red" disabled={!motivo||motivo==="Otro"} onClick={()=>onConfirm(sale.id,motivo)} style={{flex:2}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Eliminar venta
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  LOCKED
// ============================================================
function Locked() {
  return (
    <div className="locked">
      <Ic n="lock" s={42} c="var(--dim)"/>
      <p>No tiene acceso a esta sección.</p>
    </div>
  );
}

// ============================================================
//  VOUCHERS PAGE
// ============================================================
function VouchersPage({vouchers, sales, user, onSave, onAssign, onUnassign}) {
  const [tab,      setTab]      = useState("unassigned");
  const [showUpload,setShowUpload]= useState(false);
  const [assignVC, setAssignVC] = useState(null);
  const [viewVC,   setViewVC]   = useState(null);

  const unassigned = vouchers.filter(v=>!v.saleId);
  const displayed  = tab==="unassigned" ? unassigned : vouchers;

  const getMatches = v => {
    if (v.saleId) return [];
    return sales.filter(s=>!s.deleted&&!s.voucherId&&Math.abs(s.clientPrice-v.amount)<=1);
  };

  const pendingTotal = unassigned.reduce((a,v)=>a+(v.amount||0),0);

  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l"><Ic n="clip" s={18}/> Comprobantes</div>
        <button className="btn btn-sm btn-gold" style={{width:"auto"}} onClick={()=>setShowUpload(true)}>
          <Ic n="plus" s={13} c="#0a0a00"/> Subir
        </button>
      </div>

      <div className="tabs">
        <button className={"tab"+(tab==="unassigned"?" act":"")} onClick={()=>setTab("unassigned")}>
          Sin asignar {unassigned.length>0&&<span className="chip ch-red" style={{marginLeft:4}}>{unassigned.length}</span>}
        </button>
        <button className={"tab"+(tab==="all"?" act":"")} onClick={()=>setTab("all")}>Todos ({vouchers.length})</button>
      </div>

      {displayed.length===0
        ? <div className="empty"><Ic n="clip" s={38}/><p>{tab==="unassigned"?"Todos los comprobantes están asignados.":"No hay comprobantes registrados."}</p></div>
        : displayed.map(v=>(
          <VoucherRow key={v.id} voucher={v} matches={getMatches(v)} sales={sales}
            onView={()=>setViewVC(v)}
            onAssign={()=>setAssignVC(v)}
            onViewSale={()=>{}}/>
        ))
      }

      {vouchers.length>0&&(
        <div className="vc-foot">
          <span>{unassigned.length} sin asignar</span>
          <span>{vouchers.length} total</span>
          <span style={{color:"var(--red)",fontWeight:800}}>{fmt(pendingTotal)} pendiente</span>
        </div>
      )}

      {showUpload&&(
        <SubirComprobante
          vouchers={vouchers} user={user}
          onClose={()=>setShowUpload(false)}
          onSave={async v=>{await onSave(v);setShowUpload(false);}}
          onSaveAndAssign={async v=>{await onSave(v);setShowUpload(false);setAssignVC(v);}}/>
      )}

      {assignVC&&(
        <AsignarComprobante voucher={assignVC} sales={sales}
          onClose={()=>setAssignVC(null)}
          onConfirm={async(vid,sid)=>{await onAssign(vid,sid);setAssignVC(null);}}/>
      )}

      {viewVC&&(
        <VerComprobante voucher={viewVC} sales={sales}
          onClose={()=>setViewVC(null)}
          onAssign={()=>{setAssignVC(viewVC);setViewVC(null);}}
          onUnassign={async()=>{await onUnassign(viewVC.id,viewVC.saleId);setViewVC(null);}}/>
      )}
    </div>
  );
}

// ============================================================
//  VOUCHER ROW
// ============================================================
function VoucherRow({voucher, matches, sales, onView, onAssign}) {
  const assigned  = !!voucher.saleId;
  const hasMatch  = !assigned && matches && matches.length>0;
  const sale      = assigned ? sales.find(s=>s.id===voucher.saleId) : null;
  const ref4      = voucher.reference ? "···"+(voucher.reference||"").slice(-4) : "—";

  return (
    <div className="vc-row">
      <div className={"vc-bar "+(assigned?"vc-bar-ok":"vc-bar-no")}/>
      <button className="vc-thumb" onClick={onView} title="Ver comprobante">
        {voucher.fileType==="image"&&(voucher.image||voucher.imageUrl)
          ? <img src={voucher.image||voucher.imageUrl} alt="comprobante"/>
          : voucher.fileType==="pdf"
            ? <div className="vc-thumb-pdf">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                PDF
              </div>
            : <div style={{color:"var(--dim)",fontSize:"1.2rem"}}><Ic n="clip" s={20}/></div>
        }
        <div className="vc-thumb-ov">🔍</div>
      </button>
      <div className="vc-body">
        <div className="vc-grid">
          <div>
            <div className="vc-lbl">Fecha</div>
            <div className="vc-val">{voucher.paymentDate||"—"}{voucher.paymentTime&&" "+voucher.paymentTime}</div>
          </div>
          <div>
            <div className="vc-lbl">Comprobante</div>
            <div className="vc-val">{ref4}</div>
          </div>
          <div>
            <div className="vc-lbl">Titular</div>
            <div className="vc-val">{voucher.holderName||"—"}</div>
          </div>
          <div>
            <div className="vc-lbl">Banco</div>
            <div className="vc-val">{voucher.bank||"—"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",marginTop:6,flexWrap:"wrap"}}>
          <span style={{fontSize:"1rem",fontWeight:800,color:"var(--gold)"}}>{fmt(voucher.amount)}</span>
          {assigned
            ? <span className="chip ch-grn">Asignado</span>
            : <span className="chip ch-red">Sin asignar</span>
          }
          {hasMatch&&<span className="chip ch-gold">Posible coincidencia</span>}
        </div>
        {sale&&<div style={{fontSize:".76rem",color:"var(--teal)",marginTop:4}}>{sale.productName} · {fmtDate(sale.date)}</div>}
        <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}>
          <button className="btn btn-sm btn-out" onClick={onView} style={{padding:"5px 9px"}}>
            <Ic n="eye" s={11}/> Ver
          </button>
          {!assigned&&(
            <button className="btn btn-sm btn-gold" onClick={onAssign} style={{padding:"5px 10px"}}>
              Asignar
            </button>
          )}
          {assigned&&(
            <button className="btn btn-sm btn-out" onClick={onView} style={{padding:"5px 9px"}}>
              Ver venta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  MODAL: SUBIR COMPROBANTE
// ============================================================
function SubirComprobante({vouchers, user, onClose, onSave, onSaveAndAssign, prefillSale}) {
  const BANKS = ["Tigo Money","BNB","Banco Unión","Banco Mercantil","Banco Bisa","Banco Nacional","Otro"];
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [fileType,  setFileType]  = useState("");
  const [hash,      setHash]      = useState("");
  const [dupAlert,  setDupAlert]  = useState(null); // {exists: true/false, voucher}
  const [amount,    setAmount]    = useState(prefillSale?.clientPrice||"");
  const [payDate,   setPayDate]   = useState(todayISO());
  const [payTime,   setPayTime]   = useState("");
  const [reference, setReference] = useState("");
  const [holderName,setHolderName]= useState("");
  const [bank,      setBank]      = useState("Tigo Money");
  const [notes,     setNotes]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const fileRef = useRef();

  const handleFile = async e => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10*1024*1024) { alert("El archivo supera los 10MB."); return; }
    const isPDF = f.type==="application/pdf";
    const isImg = f.type.startsWith("image/");
    if (!isPDF&&!isImg) { alert("Solo se aceptan JPG, PNG o PDF."); return; }

    // Calcular hash
    const h = await fileHash(f);
    setHash(h);

    // Verificar duplicados
    const existing = vouchers.find(v=>v.hash===h);
    if (existing) {
      setDupAlert({assigned:!!existing.saleId, voucher:existing});
      return;
    }
    setDupAlert(null);
    setFile(f);
    setFileType(isPDF?"pdf":"image");

    // Preview
    if (isPDF) {
      setPreview(null);
    } else {
      let base64 = await compressImage(f);
      if (base64.length > 2*1024*1024) base64 = await new Promise(res=>{
        const reader=new FileReader(); reader.onload=ev=>{
          const img=new Image(); img.onload=()=>{
            const c=document.createElement("canvas");
            const MAX=800; const ratio=Math.min(MAX/img.width,MAX/img.height,1);
            c.width=img.width*ratio; c.height=img.height*ratio;
            c.getContext("2d").drawImage(img,0,0,c.width,c.height);
            res(c.toDataURL("image/jpeg",0.5));
          }; img.src=ev.target.result;
        }; reader.readAsDataURL(f);
      });
      setPreview(base64);
    }
  };

  const handleSave = async (andAssign=false) => {
    if (!file||!amount||!payDate) return;
    setSaving(true);
    try {
      const vcId = uid("vc");
      // Subir a Supabase Storage
      let uploadBlob = file;
      let uploadType = file.type;
      if (fileType !== "pdf" && preview) {
        const byteStr = atob(preview.split(',')[1]);
        const buf = new ArrayBuffer(byteStr.length);
        const arr = new Uint8Array(buf);
        for (let i=0;i<byteStr.length;i++) arr[i]=byteStr.charCodeAt(i);
        uploadBlob = new Blob([buf], {type:'image/jpeg'});
        uploadType = 'image/jpeg';
      }
      const imageUrl = await uploadVoucherImage(vcId, uploadBlob, uploadType);
      const v = {
        id: vcId, hash, image: preview, imageUrl, fileType,
        fileName: file.name,
        amount: parseFloat(amount)||0,
        reference: reference.trim(),
        holderName: holderName.trim(),
        bank, paymentDate: payDate, paymentTime: payTime,
        uploadedAt: Date.now(), uploadedBy: user?.name||"",
        saleId: null, saleSummary: "", notes: notes.trim(),
      };
      if (andAssign) await onSaveAndAssign(v);
      else await onSave(v);
    } catch(e) {
      alert("No se pudo subir el comprobante. Verifica tu conexión a internet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">Subir comprobante de pago</div>

        {dupAlert&&(
          dupAlert.assigned
            ? <div className="al al-warn">
                <Ic n="warn" s={14}/>
                <div>
                  <div style={{fontWeight:800}}>Este comprobante ya está asignado</div>
                  <div style={{fontSize:".76rem",marginTop:2}}>{dupAlert.voucher.saleSummary}</div>
                  <button className="btn btn-sm btn-out" style={{marginTop:8}} onClick={onClose}>Cerrar</button>
                </div>
              </div>
            : <div className="al al-info">
                <Ic n="warn" s={14}/>
                <div>
                  <div style={{fontWeight:800}}>Este comprobante ya existe sin asignar</div>
                  <div style={{fontSize:".76rem",marginTop:2}}>Bs. {dupAlert.voucher.amount}</div>
                  <button className="btn btn-sm btn-gold" style={{marginTop:8}} onClick={onClose}>Ir al comprobante</button>
                </div>
              </div>
        )}

        {!dupAlert&&(
          <>
            <div className="fg">
              <label className="fl">Archivo (JPG, PNG, PDF — máx 10MB)</label>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="fi" onChange={handleFile}/>
            </div>

            {preview&&(
              <div style={{marginBottom:14,borderRadius:"var(--r)",overflow:"hidden",border:"1px solid var(--b1)"}}>
                <img src={preview} style={{width:"100%",maxHeight:200,objectFit:"contain",display:"block",background:"#111"}}/>
              </div>
            )}
            {fileType==="pdf"&&file&&(
              <div className="al al-info" style={{marginBottom:14}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>PDF: {file.name}</span>
              </div>
            )}

            <div className="fi2">
              <div className="fg">
                <label className="fl">Fecha del pago *</label>
                <input className="fi" type="date" value={payDate} onChange={e=>setPayDate(e.target.value)}/>
              </div>
              <div className="fg">
                <label className="fl">Hora del pago</label>
                <input className="fi" type="time" value={payTime} onChange={e=>setPayTime(e.target.value)}/>
              </div>
            </div>
            <div className="fg">
              <label className="fl">Monto en Bs. *</label>
              <input className="fi" type="number" inputMode="decimal" value={amount}
                onChange={e=>setAmount(e.target.value)} placeholder="0.00"/>
            </div>
            <div className="fg">
              <label className="fl">Nro. de comprobante (últimos dígitos)</label>
              <input className="fi" value={reference} onChange={e=>setReference(e.target.value)} placeholder="Ej: 004821"/>
            </div>
            <div className="fi2">
              <div className="fg">
                <label className="fl">Nombre del titular</label>
                <input className="fi" value={holderName} onChange={e=>setHolderName(e.target.value)} placeholder="Nombre en comprobante"/>
              </div>
              <div className="fg">
                <label className="fl">Banco o billetera</label>
                <select className="fs" value={bank} onChange={e=>setBank(e.target.value)}>
                  {BANKS.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="fg">
              <label className="fl">Notas</label>
              <textarea className="fta" value={notes} onChange={e=>setNotes(e.target.value)}
                placeholder="Ej: dijo Ana y Luis, cliente María García"/>
            </div>

            <div className="row mt12">
              <button className="btn btn-out" onClick={onClose}>Cancelar</button>
              <button className="btn btn-out" disabled={!file||!amount||!payDate||saving}
                onClick={()=>handleSave(false)} style={{flex:1}}>
                Solo guardar
              </button>
              <button className="btn btn-gold" disabled={!file||!amount||!payDate||saving}
                onClick={()=>handleSave(true)} style={{flex:1.5}}>
                {saving?"Guardando...":"Guardar y asignar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
//  MODAL: ASIGNAR COMPROBANTE
// ============================================================
function AsignarComprobante({voucher, sales, onClose, onConfirm}) {
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState(null);
  const [showAll,    setShowAll]     = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Ventas sin voucher asignado, no eliminadas
  const candidates = useMemo(()=>
    sales.filter(s=>!s.deleted&&!s.voucherId).sort((a,b)=>b.date-a.date),
  [sales]);

  // Coincidencias por monto con tolerancia ±1 Bs (redondeos de QR)
  const exactMatches = useMemo(()=>
    candidates.filter(s=>Math.abs(s.clientPrice-voucher.amount)<=1),
  [candidates,voucher.amount]);

  // Filtro de búsqueda
  const filtered = useMemo(()=>{
    const q = search.toLowerCase().trim();
    if (!q) return showAll ? candidates : candidates.slice(0,20);
    return candidates.filter(s=>
      s.productName.toLowerCase().includes(q)||
      (s.clientName||"").toLowerCase().includes(q)||
      (s.promoterName||"").toLowerCase().includes(q)||
      String(s.clientPrice).includes(q)
    );
  },[candidates,search,showAll]);

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);
    await onConfirm(voucher.id, selected.id);
    setConfirming(false);
  };

  return (
    <div className="overlay" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">Asignar comprobante a venta</div>

        {/* Datos del comprobante */}
        <div className="pb" style={{marginBottom:14}}>
          <div className="pbr"><span className="pbk">Monto</span><span className="pbv pbv-gold">{fmt(voucher.amount)}</span></div>
          <div className="pbr"><span className="pbk">Fecha/Hora</span><span className="pbv">{voucher.paymentDate}{voucher.paymentTime&&" "+voucher.paymentTime}</span></div>
          {voucher.holderName&&<div className="pbr"><span className="pbk">Titular</span><span className="pbv">{voucher.holderName}</span></div>}
          {voucher.bank&&<div className="pbr"><span className="pbk">Banco</span><span className="pbv">{voucher.bank}</span></div>}
          {voucher.reference&&<div className="pbr"><span className="pbk">Nro.</span><span className="pbv">···{voucher.reference.slice(-4)}</span></div>}
        </div>

        {/* Sugerencia automática */}
        {exactMatches.length>0&&!selected&&(
          <div style={{background:"rgba(224,198,17,.07)",border:"1px solid var(--gd)",borderRadius:"var(--r)",padding:13,marginBottom:14}}>
            <div style={{fontSize:".76rem",fontWeight:800,color:"var(--gold)",textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>
              Posible coincidencia — {fmt(voucher.amount)}
            </div>
            {exactMatches.slice(0,3).map(s=>(
              <button key={s.id}
                style={{width:"100%",background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:"var(--rsm)",padding:"10px 12px",marginBottom:6,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                onClick={()=>setSelected(s)}>
                <div>
                  <div style={{fontWeight:700,fontSize:".86rem"}}>{s.productName}</div>
                  <div style={{fontSize:".72rem",color:"var(--muted)",marginTop:2}}>{fmtDate(s.date)} · {s.promoterName?.split(" ")[0]}{s.clientName&&" · "+s.clientName}</div>
                </div>
                <span style={{color:"var(--gold)",fontWeight:800}}>{fmt(s.clientPrice)}</span>
              </button>
            ))}
            {exactMatches.length>3&&<div style={{fontSize:".72rem",color:"var(--muted)",textAlign:"center"}}>Y {exactMatches.length-3} más con el mismo monto</div>}
            <button className="btn btn-sm btn-out" style={{marginTop:8}} onClick={()=>setShowAll(true)}>
              Elegir otra venta
            </button>
          </div>
        )}

        {/* Confirmación de la venta seleccionada */}
        {selected&&(
          <div style={{background:"rgba(46,204,113,.08)",border:"1px solid var(--grd)",borderRadius:"var(--r)",padding:13,marginBottom:14}}>
            <div style={{fontSize:".76rem",fontWeight:800,color:"var(--grn)",marginBottom:6}}>Venta seleccionada</div>
            <div style={{fontWeight:700}}>{selected.productName}</div>
            <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:2}}>{fmtDate(selected.date)} · {fmt(selected.clientPrice)}</div>
            <button className="btn btn-sm btn-out" style={{marginTop:8}} onClick={()=>setSelected(null)}>Cambiar</button>
          </div>
        )}

        {/* Buscador de ventas */}
        {(showAll||exactMatches.length===0||selected===null)&&(
          <>
            {!selected&&(
              <div className="fg">
                <input className="fi" placeholder="Buscar producto, cliente, monto..."
                  value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
            )}
            {!selected&&filtered.length>0&&(
              <div style={{maxHeight:240,overflowY:"auto",border:"1px solid var(--b1)",borderRadius:"var(--rsm)",marginBottom:14}}>
                {filtered.map(s=>(
                  <button key={s.id}
                    style={{width:"100%",background:selected?.id===s.id?"rgba(224,198,17,.1)":"none",border:"none",borderBottom:"1px solid var(--b1)",padding:"10px 12px",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                    onClick={()=>setSelected(s)}>
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:".86rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.productName}</div>
                      <div style={{fontSize:".72rem",color:"var(--muted)",marginTop:1}}>{fmtDate(s.date)} · {s.promoterName?.split(" ")[0]}</div>
                    </div>
                    <span style={{color:"var(--gold)",fontWeight:800,flexShrink:0,marginLeft:8}}>{fmt(s.clientPrice)}</span>
                  </button>
                ))}
                {!search&&candidates.length>20&&!showAll&&(
                  <button style={{width:"100%",padding:"10px",background:"none",border:"none",color:"var(--muted)",fontSize:".76rem",cursor:"pointer"}} onClick={()=>setShowAll(true)}>
                    Mostrar todas ({candidates.length})
                  </button>
                )}
              </div>
            )}
            {!selected&&filtered.length===0&&<div className="empty" style={{padding:"20px 0"}}><p>Sin resultados</p></div>}
          </>
        )}

        <div className="row mt12">
          <button className="btn btn-out" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" disabled={!selected||confirming} onClick={handleConfirm} style={{flex:2}}>
            {confirming?"Guardando...":"Confirmar asignación"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  MODAL: VER COMPROBANTE (fullscreen)
// ============================================================
function VerComprobante({voucher, sales, onClose, onAssign, onUnassign}) {
  const sale = voucher.saleId ? sales.find(s=>s.id===voucher.saleId) : null;

  return (
    <div className="vc-fs" onMouseDown={e=>{e.currentTarget.dataset.own=e.target===e.currentTarget?'1':'';}} onClick={e=>e.target===e.currentTarget&&e.currentTarget.dataset.own==='1'&&onClose()}>
      <div className="vc-fs-top">
        {!voucher.saleId&&onAssign&&(
          <button className="vc-fs-btn" style={{width:"auto",padding:"0 12px",borderRadius:20,fontSize:".76rem",fontWeight:700,gap:5,display:"flex",alignItems:"center"}} onClick={onAssign}>
            <Ic n="clip" s={13}/> Asignar
          </button>
        )}
        <button className="vc-fs-btn" onClick={onClose} title="Cerrar">✕</button>
      </div>

      <div className="vc-fs-img">
        {voucher.fileType==="image"&&(voucher.image||voucher.imageUrl)
          ? <img src={voucher.image||voucher.imageUrl} alt="Comprobante" style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}/>
          : voucher.fileType==="pdf"&&(voucher.image||voucher.imageUrl)
            ? <iframe src={voucher.image||voucher.imageUrl} style={{width:"100%",height:"100%",border:"none"}} title="PDF"/>
            : <div style={{color:"var(--muted)",textAlign:"center",padding:40}}>
                <Ic n="clip" s={48}/>
                <p style={{marginTop:12,fontSize:".86rem"}}>
                  {voucher.fileType==="pdf"?"PDF sin previsualización local":"Sin imagen disponible"}
                </p>
              </div>
        }
      </div>

      <div className="vc-fs-info">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 14px",marginBottom:12}}>
          <div><div className="vc-lbl">Monto</div><div className="vc-val" style={{color:"var(--gold)",fontSize:"1.1rem"}}>{fmt(voucher.amount)}</div></div>
          <div><div className="vc-lbl">Banco</div><div className="vc-val">{voucher.bank||"—"}</div></div>
          <div><div className="vc-lbl">Fecha / Hora</div><div className="vc-val">{voucher.paymentDate||"—"}{voucher.paymentTime&&" "+voucher.paymentTime}</div></div>
          <div><div className="vc-lbl">Nro. comprobante</div><div className="vc-val">{voucher.reference?"···"+voucher.reference.slice(-4):"—"}</div></div>
          <div><div className="vc-lbl">Titular</div><div className="vc-val">{voucher.holderName||"—"}</div></div>
          <div><div className="vc-lbl">Subido por</div><div className="vc-val">{voucher.uploadedBy||"—"}</div></div>
        </div>
        {sale&&(
          <div style={{borderTop:"1px solid var(--b1)",paddingTop:10}}>
            <span className="chip ch-grn" style={{marginBottom:6}}>Asignado</span>
            <div style={{fontWeight:700,marginTop:4}}>{sale.productName}</div>
            <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:2}}>{fmtDate(sale.date)} · {fmt(sale.clientPrice)}</div>
            {onUnassign&&(
              <button className="btn btn-sm btn-out" style={{marginTop:8}} onClick={onUnassign}>
                Remover asignación
              </button>
            )}
          </div>
        )}
        {!sale&&voucher.saleId&&(
          <div style={{borderTop:"1px solid var(--b1)",paddingTop:10}}>
            <span className="chip ch-grn">Asignado a venta #{voucher.saleId.slice(-6)}</span>
          </div>
        )}
        {voucher.notes&&(
          <div style={{marginTop:10,fontSize:".76rem",color:"var(--muted)",fontStyle:"italic"}}>{voucher.notes}</div>
        )}
      </div>
    </div>
  );
}
