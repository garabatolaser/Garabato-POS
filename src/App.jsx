import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ============================================================
//  GARABATO POS v9  -  Sistema de gestion comercial
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
  --bg:#0a0a08; --s1:#111109; --s2:#191907; --s3:#222210;
  --b1:#2e2e14; --b2:#3a3a1a;
  --gold:#d4a017; --gd:#8a6500;
  --teal:#29b8a8; --td:#0d5c53;
  --red:#d95555;  --rd:#6b2525;
  --grn:#45b87c;  --grd:#1e5c3a;
  --blu:#7b9ee8;
  --txt:#f0edd8; --muted:#8a8660; --dim:#3a3820;
  --r:13px; --rsm:8px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--txt);min-height:100dvh;overflow-x:hidden}
button,input,select,textarea{font-family:'DM Sans',sans-serif}
.app{max-width:430px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column}

/* MODO CLARO - dentro de la app una vez logueado */
.app-light{background:#ffffff;color:#1a1a1a}
.app-light .topbar{background:#ffffff;border-bottom:1px solid #e8e0cc}
.app-light .bnav{background:#ffffff;border-top:1px solid #e8e0cc}
.app-light .content{background:#f7f5f0}
.app-light .card{background:#ffffff;border-color:#e8e0cc}
.app-light .card-gold{background:linear-gradient(145deg,#fffbee,#fff8e0);border-color:#d4a017}
.app-light .sc{background:#ffffff;border-color:#e8e0cc}
.app-light .sc.hg{background:linear-gradient(145deg,#fffbee,#fff5cc);border-color:#d4a017}
.app-light .sc.ht{background:linear-gradient(145deg,#eefaf8,#d8f5f0);border-color:#29b8a8}
.app-light .sc.hr{background:linear-gradient(145deg,#fff0f0,#ffe8e8);border-color:#d95555}
.app-light .sl{color:#888}
.app-light .sv{color:#1a1a1a}
.app-light .sv.gold{color:#8a6500}
.app-light .sv.teal{color:#0d5c53}
.app-light .sv.red{color:#b03030}
.app-light .sv.grn{color:#1e5c3a}
.app-light .ss{color:#aaa}
.app-light .si{background:#ffffff;border-color:#e8e0cc}
.app-light .si-prod{color:#1a1a1a}
.app-light .si-cust{color:#666}
.app-light .si-meta{color:#999}
.app-light .si-amt{color:#8a6500}
.app-light .si-sub{color:#aaa}
.app-light .si-ico{background:#f5f0e8;border-color:#e8e0cc;color:#d4a017}
.app-light .pc{background:#ffffff;border-color:#e8e0cc}
.app-light .pc-img-ph{background:#f5f0e8;border-color:#e8e0cc;color:#ccc}
.app-light .prc{background:#ffffff;border-color:#e8e0cc}
.app-light .prc-av{background:linear-gradient(145deg,#d4a017,#f5f0e8);color:#8a6500}
.app-light .prs{background:#f7f5f0}
.app-light .prs-v{color:#8a6500}
.app-light .prs-l{color:#aaa}
.app-light .ei{background:#ffffff;border-color:#e8e0cc}
.app-light .ei-ico{background:#f7f5f0}
.app-light .ei-type{color:#1a1a1a}
.app-light .ei-desc{color:#666}
.app-light .ei-date{color:#aaa}
.app-light .shd{color:#1a1a1a}
.app-light .ni{color:#bbb}
.app-light .ni.act{color:#d4a017}
.app-light .tbtn{background:#f5f0e8;border-color:#e8e0cc;color:#666}
.app-light .ubtn{background:#f5f0e8;border-color:#e8e0cc}
.app-light .np-on{color:#0d5c53;border-color:#29b8a866;background:rgba(41,184,168,.08)}
.app-light .np-off{color:#aaa;border-color:#e8e0cc;background:#f5f5f5}
.app-light .fi,.app-light .fs,.app-light .fta{background:#f7f5f0;border-color:#e8e0cc;color:#1a1a1a}
.app-light .fi:focus,.app-light .fs:focus,.app-light .fta:focus{border-color:#d4a017}
.app-light .fl{color:#888}
.app-light .fi-hint{color:#bbb}
.app-light .pill{background:#ffffff;border-color:#e8e0cc;color:#666}
.app-light .pill.act{background:#fff8e0;border-color:#d4a017;color:#8a6500}
.app-light .tab{color:#bbb}
.app-light .tab.act{background:#fff8e0;color:#8a6500}
.app-light .tabs{background:#f0ede8}
.app-light .chip.ch-gold{background:#fff3cc;color:#8a6500}
.app-light .chip.ch-grn{background:#d8f5e8;color:#1e5c3a}
.app-light .chip.ch-red{background:#ffe8e8;color:#b03030}
.app-light .chip.ch-teal{background:#d8f5f0;color:#0d5c53}
.app-light .chip.ch-blu{background:#e8eeff;color:#2a4a9a}
.app-light .chip.ch-dim{background:#f0ede8;color:#888}
.app-light .pb{background:#f7f5f0}
.app-light .pbr{border-bottom-color:#e8e0cc}
.app-light .pbk{color:#888}
.app-light .fb{background:#f7f5f0}
.app-light .fr{border-bottom-color:#e8e0cc}
.app-light .fk{color:#888}
.app-light .rbar-t{background:#e8e0cc}
.app-light .rbar-l{color:#666}
.app-light .rbar-v{color:#888}
.app-light .price-box{background:#f7f5f0}
.app-light .dvd{background:#e8e0cc}
.app-light .empty{color:#bbb}
.app-light .locked{color:#bbb}
.app-light .grp-header{background:#f7f5f0;border-color:#e8e0cc}
.app-light .grp-body{border-color:#e8e0cc}
.app-light .order-row{background:#ffffff}
.app-light .order-name{color:#1a1a1a}
.app-light .order-prod{color:#666}
.app-light .order-meta{color:#aaa}
.app-light .order-amt{color:#8a6500}
.app-light .order-detail{border-top-color:#e8e0cc;background:#fafaf8}
.app-light .kanban-head{background:#f0ede8}
.app-light .kanban-card{background:#ffffff;border-color:#e8e0cc}
.app-light .kanban-empty{border-color:#e8e0cc;color:#bbb}
.app-light .notify-bar{background:linear-gradient(145deg,#eefaf0,#d8f5e8);border-color:#45b87c}
.app-light .pay-row{background:#ffffff;border-color:#e8e0cc}
.app-light .pay-av{background:linear-gradient(145deg,#d4a017,#f5f0e8);color:#8a6500}
.app-light .id-tag{background:#f0ede8;color:#888}
.app-light .hist-tag{background:#e8eeff;color:#2a4a9a}
.app-light .sheet{background:#ffffff;border-top:1px solid #e8e0cc}
.app-light .sh-hd{background:#e8e0cc}
.app-light .overlay{background:rgba(0,0,0,.5)}
.app-light .prod-card{background:#f7f5f0;border-color:#e8e0cc}
.app-light .prod-card.sel{background:#fff8e0;border-color:#d4a017}
.app-light .prod-card-ph{background:#eee;color:#ccc}
.app-light .prod-card-name{color:#1a1a1a}
.app-light .prod-card-price{color:#8a6500}
.app-light .prod-card-sub{color:#aaa}
.app-light .photo-upload{border-color:#e8e0cc;background:#f7f5f0;color:#888}
.app-light .pcs{background:#f7f5f0}
.app-light .pcs-l{color:#aaa}
.app-light .al-warn{background:#fff0f0;border-color:#d95555;color:#b03030}
.app-light .al-info{background:#fff8e0;border-color:#d4a017;color:#8a6500}
.app-light .al-ok{background:#d8f5e8;border-color:#45b87c;color:#1e5c3a}
.app-light .lp{background:#fff8e0;border-color:#d4a017}
.app-light .suc-ring{background:linear-gradient(145deg,#45b87c,#1e5c3a)}
.app-light .view-toggle{background:#f0ede8}
.app-light .vt-btn.act{background:#ffffff;color:#8a6500}
.app-light .vt-btn.off{color:#bbb}
.app-light .step.s-done{background:#d4a017;border-color:#d4a017;color:#0a0a00}
.app-light .step.s-cur{background:#fff8e0;border-color:#d4a017;color:#8a6500}
.app-light .step.s-fut{background:#f0ede8;border-color:#e8e0cc;color:#bbb}
.app-light .s-line.sl-done{background:#d4a017}
.app-light .s-line.sl-fut{background:#e8e0cc}
.app-light .uname{color:#888}
.app-light .rbadge.rb-admin{background:#fff3cc;color:#8a6500}
.app-light .rbadge.rb-employee{background:#e8eeff;color:#2a4a9a}
.app-light .rbadge.rb-promoter{background:#d8f5e8;color:#1e5c3a}
.app-light .tb-brand{color:#8a6500}
.app-light .nbadge{background:#d95555}
.app-light .btn-out{border-color:#e8e0cc;color:#666}
.app-light .btn-out:active{background:#f0ede8}
.app-light .fab-sec{background:#ffffff;border-color:#e8e0cc}

/* LOGIN */
.splash{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:radial-gradient(ellipse 120% 60% at 50% -5%,#1a1800 0%,var(--bg) 60%);padding:32px 24px}
.splash-mark{width:88px;height:88px;background:#d4a017;border-radius:18px;
  display:flex;align-items:center;justify-content:center;margin-bottom:22px;
  box-shadow:0 0 60px rgba(212,160,23,.35),0 8px 32px rgba(0,0,0,.7)}
.splash-title{font-family:'Playfair Display',serif;font-size:2.8rem;font-weight:900;color:#d4a017;letter-spacing:2px;margin-bottom:4px}
.splash-sub{font-size:.72rem;color:var(--muted);letter-spacing:2px;margin-bottom:40px;text-transform:uppercase}
.ugrid{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px}
.ub{background:var(--s2);border:1px solid var(--b1);border-radius:var(--r);padding:16px 12px;
  cursor:pointer;text-align:center;transition:.2s;-webkit-appearance:none;outline:none}
.ub.sel{background:linear-gradient(145deg,#18140a,#201c0e);border-color:var(--gd)}
.ub-ico{font-size:1.5rem;margin-bottom:8px}
.ub-name{font-size:.8rem;font-weight:700;color:var(--muted)}
.ub.sel .ub-name{color:var(--gold)}
.ub-role{font-size:.65rem;margin-top:4px}
.pin-hd{text-align:center;font-size:.82rem;color:var(--muted);margin-bottom:14px}
.pin-hd b{color:var(--gold)}
.pin-dots{display:flex;justify-content:center;gap:12px;margin-bottom:20px}
.pd{width:13px;height:13px;border-radius:50%;background:var(--b1);border:1px solid var(--b2);transition:.2s}
.pd.on{background:var(--gold);border-color:var(--gold);box-shadow:0 0 10px rgba(200,168,75,.5)}
.pin-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:280px;margin:0 auto}
.pk{height:56px;background:var(--s2);border:1px solid var(--b1);border-radius:var(--rsm);
  font-size:1.25rem;font-weight:700;color:var(--txt);cursor:pointer;transition:.15s;-webkit-appearance:none;outline:none}
.pk:active{background:var(--s3);transform:scale(.93)}
.pk.del{font-size:.85rem;color:var(--muted)}
.pin-err{text-align:center;font-size:.78rem;color:var(--red);margin-top:10px;min-height:18px}
.demo-hint{font-size:.68rem;color:var(--dim);text-align:center;margin-top:16px;line-height:1.6}

/* TOP BAR */
.topbar{display:flex;align-items:center;justify-content:space-between;padding:13px 16px 10px;
  position:sticky;top:0;z-index:200;background:var(--bg);border-bottom:1px solid var(--b1)}
.tb-l{display:flex;align-items:center;gap:9px}
.tb-logo{width:30px;height:30px;background:#d4a017;
  border-radius:8px;display:flex;align-items:center;justify-content:center}
.tb-brand{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:900;color:#d4a017;letter-spacing:1px}
.tb-r{display:flex;align-items:center;gap:7px}
.np{display:flex;align-items:center;gap:4px;font-size:.68rem;font-weight:700;
  padding:4px 9px;border-radius:20px;border:1px solid}
.np-on{color:var(--teal);border-color:var(--td);background:rgba(41,184,168,.07)}
.np-off{color:var(--muted);border-color:var(--b1);background:rgba(255,255,255,.03)}
.tbtn{display:flex;align-items:center;gap:5px;padding:5px 9px;background:var(--s2);
  border:1px solid var(--b2);border-radius:20px;font-size:.7rem;font-weight:700;
  color:var(--muted);cursor:pointer;-webkit-appearance:none;outline:none}
.tbtn.spin svg{animation:spin .9s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ubtn{display:flex;align-items:center;gap:5px;padding:4px 9px;background:var(--s2);
  border:1px solid var(--b1);border-radius:20px;cursor:pointer;-webkit-appearance:none;outline:none}
.rbadge{padding:2px 7px;border-radius:10px;font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.4px}
.rb-admin{background:rgba(200,168,75,.15);color:var(--gold)}
.rb-employee{background:rgba(91,139,232,.15);color:var(--blu)}
.rb-promoter{background:rgba(69,184,124,.15);color:var(--grn)}
.uname{font-size:.72rem;color:var(--muted)}

/* BOTTOM NAV */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;
  background:var(--s1);border-top:1px solid var(--b1);display:flex;
  padding:6px 0 max(16px,env(safe-area-inset-bottom));z-index:200}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 4px;
  cursor:pointer;border:none;background:none;color:var(--dim);font-size:.6rem;font-weight:700;
  letter-spacing:.3px;text-transform:uppercase;transition:.2s;outline:none;-webkit-appearance:none}
.ni.act{color:var(--gold)}
.ni-w{position:relative}
.nbadge{position:absolute;top:-4px;right:-7px;background:var(--red);color:#fff;
  font-size:.55rem;font-weight:800;min-width:15px;height:15px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;padding:0 3px}

/* CONTENT */
.content{flex:1;padding:16px 16px 90px;overflow-y:auto;-webkit-overflow-scrolling:touch}
.pe{animation:pe .2s ease}
@keyframes pe{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

/* TYPOGRAPHY / SECTION HEADERS */
.shd{font-family:'Playfair Display',serif;font-size:1.2rem;color:var(--txt);
  margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
.shd-l{display:flex;align-items:center;gap:7px}

/* STAT CARDS */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px}
.sc{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:13px}
.sc.hg{background:linear-gradient(145deg,#0f0e00,#1a1800);border-color:#5a4800}
.sc.ht{background:linear-gradient(145deg,#081312,#0e1e1c);border-color:var(--td)}
.sc.hr{background:linear-gradient(145deg,#120909,#1a0e0e);border-color:var(--rd)}
.sl{font-size:.65rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.sv{font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--txt);line-height:1}
.sv.gold{color:var(--gold)}.sv.teal{color:var(--teal)}.sv.red{color:var(--red)}.sv.grn{color:var(--grn)}
.ss{font-size:.68rem;color:var(--dim);margin-top:3px}

/* BUTTONS */
.btn{display:flex;align-items:center;justify-content:center;gap:7px;padding:13px 18px;
  border-radius:var(--rsm);font-size:.88rem;font-weight:700;cursor:pointer;border:none;
  transition:.2s;width:100%;letter-spacing:.2px;-webkit-appearance:none;outline:none}
.btn:disabled{opacity:.4;pointer-events:none}
.btn:active{transform:scale(.97)}
.btn-gold{background:#d4a017;color:#0a0a00;font-weight:800}
.btn-teal{background:linear-gradient(145deg,var(--teal),var(--td));color:#020f0e}
.btn-red{background:linear-gradient(145deg,var(--red),var(--rd));color:#fff}
.btn-grn{background:linear-gradient(145deg,var(--grn),var(--grd));color:#fff}
.btn-out{background:transparent;border:1px solid var(--b2);color:var(--muted)}
.btn-out:active{background:var(--s2)}
.btn-sm{padding:7px 12px;font-size:.75rem;width:auto}

/* FAB */
.fab{position:fixed;bottom:82px;right:calc(50% - 215px + 16px);width:50px;height:50px;
  border-radius:50%;background:#d4a017;border:none;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:0 4px 24px rgba(212,160,23,.5);z-index:198;transition:.2s;outline:none}
.fab:active{transform:scale(.88)}
.fab-sec{position:fixed;bottom:82px;right:calc(50% - 215px + 74px);width:36px;height:36px;
  border-radius:50%;background:var(--s2);border:1px solid var(--b2);
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:0 2px 10px rgba(0,0,0,.4);z-index:198;outline:none}

/* FORM ELEMENTS */
.fg{margin-bottom:13px}
.fl{font-size:.68rem;font-weight:800;color:var(--muted);text-transform:uppercase;
  letter-spacing:.5px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between}
.fi,.fs,.fta{width:100%;background:var(--s2);border:1px solid var(--b1);border-radius:var(--rsm);
  color:var(--txt);font-size:.9rem;padding:11px 13px;outline:none;transition:border-color .2s;-webkit-appearance:none}
.fi:focus,.fs:focus,.fta:focus{border-color:var(--gd)}
.fta{resize:vertical;min-height:68px;font-family:'DM Sans',sans-serif}
.fs option{background:var(--s2)}
.fi-hint{font-size:.7rem;color:var(--dim);margin-top:5px}
.fi2{display:grid;grid-template-columns:1fr 1fr;gap:8px}

/* PILLS / TABS */
.pills{display:flex;gap:7px;flex-wrap:wrap}
.pill{padding:7px 14px;border-radius:20px;border:1px solid var(--b1);background:var(--s2);
  color:var(--muted);font-size:.78rem;font-weight:700;cursor:pointer;transition:.2s;
  white-space:nowrap;-webkit-appearance:none;outline:none}
.pill.act{background:#1a1800;border-color:#8a6500;color:#d4a017}
.pill.act-red{background:linear-gradient(145deg,#180a0a,#200e0e);border-color:var(--rd);color:var(--red)}
.tabs{display:flex;background:var(--s2);border-radius:var(--rsm);padding:3px;margin-bottom:13px}
.tab{flex:1;padding:7px;text-align:center;font-size:.74rem;font-weight:800;border-radius:6px;
  cursor:pointer;color:var(--dim);transition:.2s;border:none;background:none;
  letter-spacing:.3px;text-transform:uppercase;-webkit-appearance:none;outline:none}
.tab.act{background:var(--s3);color:var(--gold)}

/* CHIPS */
.chip{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:10px;
  font-size:.65rem;font-weight:800;letter-spacing:.3px;text-transform:uppercase}
.ch-gold{background:rgba(200,168,75,.15);color:var(--gold)}
.ch-grn{background:rgba(69,184,124,.15);color:var(--grn)}
.ch-red{background:rgba(217,85,85,.15);color:var(--red)}
.ch-teal{background:rgba(41,184,168,.12);color:var(--teal)}
.ch-blu{background:rgba(91,139,232,.12);color:var(--blu)}
.ch-dim{background:rgba(255,255,255,.06);color:var(--muted)}
.hist-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:8px;
  font-size:.62rem;font-weight:800;background:rgba(91,139,232,.15);color:var(--blu)}

/* SALE ROW */
.si{display:flex;align-items:flex-start;gap:10px;padding:12px 13px;background:var(--s1);
  border:1px solid var(--b1);border-radius:var(--r);margin-bottom:8px;position:relative}
.si-ico{width:36px;height:36px;border-radius:9px;background:var(--s2);border:1px solid var(--b1);
  display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0}
.si-body{flex:1;min-width:0}
.si-prod{font-weight:700;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.si-cust{font-size:.74rem;color:var(--muted);font-style:italic;margin-top:1px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.si-meta{font-size:.68rem;color:var(--dim);margin-top:3px;display:flex;gap:7px;flex-wrap:wrap}
.si-r{text-align:right;flex-shrink:0}
.si-amt{font-family:'Playfair Display',serif;font-size:1.05rem;color:var(--gold)}
.si-sub{font-size:.68rem;color:var(--muted);margin-top:1px}
.sdot{position:absolute;top:9px;right:9px;width:6px;height:6px;border-radius:50%}
.sd-ok{background:var(--grn)}.sd-no{background:var(--red)}

/* PRODUCT CARDS */
.pc{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:13px;margin-bottom:8px}
.pc-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.pc-img{width:56px;height:56px;border-radius:10px;object-fit:cover;flex-shrink:0;border:1px solid var(--b1)}
.pc-img-ph{width:56px;height:56px;border-radius:10px;background:var(--s2);border:1px solid var(--b1);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-size:1.4rem;font-weight:800;color:var(--dim)}
.pc-name{font-weight:700;font-size:.9rem}
.pc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.pcs{background:var(--s2);border-radius:6px;padding:8px 6px;text-align:center}
.pcs-v{font-family:'Playfair Display',serif;font-size:1rem}
.pcs-l{font-size:.62rem;color:var(--dim);margin-top:2px}

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
.prod-card-name{font-size:.8rem;font-weight:700;line-height:1.2;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prod-card-price{font-family:'Playfair Display',serif;font-size:.95rem;color:var(--gold);margin-top:3px}
.prod-card-sub{font-size:.66rem;color:var(--dim);margin-top:1px}

/* PHOTO UPLOAD */
.photo-upload{width:100%;padding:14px;border:2px dashed var(--b2);
  border-radius:var(--r);background:var(--s2);cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:10px;
  font-size:.82rem;color:var(--muted);font-weight:700;
  -webkit-appearance:none;outline:none;transition:.2s}
.photo-upload:active{border-color:var(--gd);color:var(--gold)}
.photo-preview{position:relative;display:inline-block;width:100%}
.photo-preview img{width:100%;max-height:200px;object-fit:cover;border-radius:var(--r);border:1px solid var(--b1)}
.photo-remove{position:absolute;top:6px;right:6px;width:26px;height:26px;
  border-radius:50%;background:rgba(0,0,0,.7);border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;color:#fff;
  font-size:.8rem;font-weight:800;-webkit-appearance:none;outline:none}

/* PROMOTER CARD */
.prc{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:14px;margin-bottom:9px}
.prc-h{display:flex;align-items:center;gap:10px;margin-bottom:11px}
.prc-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(145deg,var(--gd),var(--s3));
  display:flex;align-items:center;justify-content:center;
  font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--gold);flex-shrink:0}
.prc-name{font-weight:700;font-size:.9rem}
.prc-ph{font-size:.72rem;color:var(--muted);margin-top:2px}
.prc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.prs{background:var(--s2);border-radius:7px;padding:9px 7px;text-align:center}
.prs-v{font-family:'Playfair Display',serif;font-size:.98rem;color:var(--gold)}
.prs-l{font-size:.62rem;color:var(--dim);margin-top:2px}

/* EXPENSE ROW */
.ei{display:flex;align-items:center;gap:10px;padding:11px 13px;background:var(--s1);
  border:1px solid var(--b1);border-radius:var(--r);margin-bottom:7px;position:relative}
.ei-ico{width:34px;height:34px;background:var(--s2);border-radius:8px;
  display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.ei-body{flex:1}
.ei-type{font-weight:700;font-size:.84rem}
.ei-desc{font-size:.72rem;color:var(--muted);margin-top:1px}
.ei-date{font-size:.68rem;color:var(--dim);margin-top:2px}
.ei-amt{font-family:'Playfair Display',serif;font-size:1rem;color:var(--red);text-align:right;flex-shrink:0}

/* MODAL / SHEET */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:300;
  display:flex;flex-direction:column;justify-content:flex-end}
.sheet{background:var(--s1);border-radius:20px 20px 0 0;
  padding:18px 18px max(18px,env(safe-area-inset-bottom));
  max-height:94dvh;overflow-y:auto;border-top:1px solid var(--b2)}
.sh-hd{width:32px;height:3px;background:var(--b2);border-radius:2px;margin:0 auto 18px}
.sh-title{font-family:'Playfair Display',serif;font-size:1.15rem;margin-bottom:16px}

/* SALE STEPS */
.steps{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:18px}
.step{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:.72rem;font-weight:800;transition:.2s;border:1.5px solid}
.s-done{background:var(--gold);border-color:var(--gold);color:#100d02}
.s-cur{background:var(--s3);border-color:var(--gd);color:var(--gold)}
.s-fut{background:var(--s2);border-color:var(--b1);color:var(--dim)}
.s-line{flex:1;max-width:22px;height:1px}
.sl-done{background:var(--gd)}.sl-fut{background:var(--b1)}

/* PRICE BREAKDOWN */
.pb{background:var(--s2);border-radius:var(--r);padding:13px}
.pbr{display:flex;justify-content:space-between;align-items:center;
  padding:5px 0;border-bottom:1px solid var(--b1);font-size:.82rem}
.pbr:last-child{border-bottom:none}
.pbr.sep{border-top:1px solid var(--b2);margin-top:5px;padding-top:10px}
.pbk{color:var(--muted)}.pbv{font-weight:700}
.pbv-gold{color:var(--gold)}.pbv-red{color:var(--red)}.pbv-grn{color:var(--grn)}.pbv-teal{color:var(--teal)}

/* FINANCIAL TABLE */
.fb{background:var(--s2);border-radius:var(--r);padding:14px}
.fr{display:flex;justify-content:space-between;align-items:center;
  padding:6px 0;border-bottom:1px solid var(--b1);font-size:.82rem}
.fr:last-child{border-bottom:none}
.fr.total{font-weight:800;font-size:.92rem;padding-top:9px;margin-top:4px}
.fk{color:var(--muted)}.fv{font-weight:700}

/* BAR CHART */
.rbar{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.rbar-l{font-size:.76rem;color:var(--muted);width:95px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0}
.rbar-t{flex:1;background:var(--s2);border-radius:4px;height:6px;overflow:hidden}
.rbar-f{height:100%;border-radius:4px;transition:width .9s ease}
.rbar-v{font-size:.73rem;color:var(--muted);width:60px;text-align:right;flex-shrink:0}

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
.suc-title{font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:6px}

/* ALERTS */
.al{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:var(--rsm);
  margin-bottom:11px;font-size:.78rem}
.al-warn{background:rgba(217,85,85,.1);border:1px solid var(--rd);color:var(--red)}
.al-info{background:rgba(200,168,75,.1);border:1px solid var(--gd);color:var(--gold)}
.al-ok{background:rgba(69,184,124,.1);border:1px solid var(--grd);color:var(--grn)}

/* TOAST */
.toast-wrap{position:fixed;top:70px;left:50%;transform:translateX(-50%);
  z-index:999;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.toast{padding:10px 18px;border-radius:20px;font-size:.8rem;font-weight:700;
  box-shadow:0 4px 20px rgba(0,0,0,.5);animation:tin .25s ease;pointer-events:none}
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
.order-prod{font-size:.74rem;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.order-meta{font-size:.68rem;color:var(--dim);margin-top:2px;display:flex;gap:7px;flex-wrap:wrap}
.order-amt{font-family:'Playfair Display',serif;font-size:1rem;color:var(--gold);flex-shrink:0}
.order-detail{padding:0 13px 12px 27px;border-top:1px solid var(--b1)}
.order-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.kanban-wrap{display:flex;gap:10px;overflow-x:auto;padding-bottom:12px;
  scroll-snap-type:x mandatory;scrollbar-width:none;
  margin-left:-16px;margin-right:-16px;padding-left:16px;padding-right:16px}
.kanban-wrap::-webkit-scrollbar{display:none}
.kanban-col{flex-shrink:0;width:72vw;max-width:280px;scroll-snap-align:start}
.kanban-head{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;
  margin-bottom:8px;background:var(--s2);border-radius:var(--r);border-left:3px solid}
.kanban-card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);
  padding:11px 12px;margin-bottom:8px;border-top:2px solid}
.kanban-empty{border:1px dashed var(--b1);border-radius:var(--r);padding:20px 10px;
  text-align:center;font-size:.72rem;color:var(--dim)}

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
  font-size:.72rem;font-weight:700;transition:.15s;-webkit-appearance:none;outline:none}
.vt-btn.act{background:var(--s3);color:var(--gold)}
.vt-btn.off{background:transparent;color:var(--dim)}

/* PAY ROW */
.pay-row{display:flex;align-items:center;gap:10px;padding:12px 13px;background:var(--s1);
  border:1px solid var(--b1);border-radius:var(--r);margin-bottom:8px}
.pay-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(145deg,var(--gd),var(--s3));
  display:flex;align-items:center;justify-content:center;
  font-family:'Playfair Display',serif;font-size:1rem;color:var(--gold);flex-shrink:0}

/* MISC */
.price-box{background:var(--s2);border-radius:var(--r);padding:13px;margin-bottom:13px}
.dvd{height:1px;background:var(--b1);margin:12px 0}
.id-tag{font-size:.66rem;font-family:monospace;background:var(--s3);color:var(--muted);
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
`;

// ============================================================
//  DATABASE  (IndexedDB)
// ============================================================
const DB_NAME   = "garabato_v11";
const DB_VER    = 1;
const DB_STORES = ["users","products","promoters","sales","expenses","commissionPayments","orders"];
let _db = null;

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
  return new Promise((res,rej) => {
    const r = db.transaction(store,"readwrite").objectStore(store).put(data);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
};
const dbDel = async (store, key) => {
  const db = await openDB();
  return new Promise((res,rej) => {
    const r = db.transaction(store,"readwrite").objectStore(store).delete(key);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
};

// ============================================================
//  CONSTANTS
// ============================================================
const ORDER_STATES = [
  { id:"nuevo",          label:"Nuevo",      color:"var(--blu)", border:"#5b8be8" },
  { id:"diseniar",       label:"Diseniar",   color:"var(--gold)",border:"#c8a84b" },
  { id:"pago_pendiente", label:"Pago Pend.", color:"var(--red)", border:"#d95555" },
  { id:"pagado",         label:"Pagado",     color:"var(--teal)",border:"#29b8a8" },
  { id:"listo",          label:"Listo",      color:"var(--grn)", border:"#45b87c" },
];
const STATE_IDS  = ORDER_STATES.map(s => s.id);
const stateInfo  = id => ORDER_STATES.find(s => s.id === id) || ORDER_STATES[0];
const stateIndex = id => { const i = STATE_IDS.indexOf(id); return i >= 0 ? i : 0; };
const nextState  = id => { const i = STATE_IDS.indexOf(id); return i >= 0 && i < STATE_IDS.length-1 ? STATE_IDS[i+1] : null; };

const ROLE_LABEL = { admin:"Admin", employee:"Tienda", promoter:"Promotora" };
const ROLE_CLASS = { admin:"rb-admin", employee:"rb-employee", promoter:"rb-promoter" };
const EXP_TYPES  = ["Empaques","Electricidad","Internet","Materiales","Marketing","Transporte","Alquiler","Otro"];
const PM_OPTS    = [["efectivo","Efectivo"],["transferencia","Transferencia"],["qr","QR"]];

// Permissions
const CAN = {
  seeReports:  r => r === "admin",
  seeComms:    r => r === "admin",
  seeInventory:r => r === "admin" || r === "employee",
  editData:    r => r === "admin",
  seeExpenses: r => r === "admin",
  seePayments: r => r === "admin",
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
  const a = document.createElement("a");
  a.href = "https://wa.me/"+full+"?text="+encodeURIComponent(message||"");
  a.target = "_blank"; a.rel = "noopener noreferrer";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
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
//  SEED DATA
// ============================================================
async function seed() {
  const ex = await dbAll("products");
  if (ex.length > 0) return;
  const now = Date.now(), d = n => n*86400000;
  function mkSale(id,pid,pname,cust,cp,pp,cost,prid,prname,ago,pm,hist) {
    const {commission,profit,profitOwner,profitPartner} = calcSale(cp,pp,cost);
    return {id,productId:pid,productName:pname,customization:cust,
      clientPrice:cp,promoterPrice:pp,cost,commission,profit,profitOwner,profitPartner,
      paymentMethod:pm,promoterId:prid,promoterName:prname,
      commissionStatus:ago>3?"pagado":"pendiente",
      date:now-d(ago),synced:ago>1,isHistoric:!!hist,isDirectSale:false,
      clientName:"",clientPhone:"",notes:""};
  }
  const users = [
    {id:"u1",name:"Carlos (Admin)",role:"admin",   pin:"1234",promoterId:null},
    {id:"u2",name:"Tienda",        role:"employee",pin:"5678",promoterId:null},
    {id:"u3",name:"Maria Gonzalez",role:"promoter",pin:"1111",promoterId:"pr1"},
    {id:"u4",name:"Laura Martinez",role:"promoter",pin:"2222",promoterId:"pr2"},
  ];
  const products = [
    {id:"p1",name:"Dije Corazon Fotograbado",clientPrice:122,promoterPrice:94, cost:35,stock:24,lowStockAlert:5,photo:null},
    {id:"p2",name:"Pulsera Acero Grabada",   clientPrice:95, promoterPrice:72, cost:28,stock:18,lowStockAlert:4,photo:null},
    {id:"p3",name:"Llavero Oval",            clientPrice:65, promoterPrice:52, cost:18,stock:30,lowStockAlert:8,photo:null},
    {id:"p4",name:"Cadena con Dije",         clientPrice:175,promoterPrice:138,cost:55,stock:12,lowStockAlert:3,photo:null},
    {id:"p5",name:"Anillo Ajustable",        clientPrice:140,promoterPrice:108,cost:40,stock:15,lowStockAlert:4,photo:null},
    {id:"p6",name:"Arete Colgante",          clientPrice:110,promoterPrice:85, cost:32,stock:3, lowStockAlert:4,photo:null},
  ];
  const promoters = [
    {id:"pr1",name:"Maria Gonzalez",phone:"70012345",active:true,customPromoterPrice:null},
    {id:"pr2",name:"Laura Martinez",phone:"70098765",active:true,customPromoterPrice:null},
  ];
  const sales = [
    mkSale("s1","p1","Dije Corazon Fotograbado","Ana y Luis 2024",122,94, 35,"pr1","Maria Gonzalez",8,"efectivo"),
    mkSale("s2","p3","Llavero Oval",            "FAMILIA TORRES",  65,52, 18,"pr2","Laura Martinez",6,"qr"),
    mkSale("s3","p2","Pulsera Acero Grabada",   "Mi amor eterno",  95,72, 28,"pr1","Maria Gonzalez",3,"efectivo"),
    mkSale("s4","p4","Cadena con Dije",         "JM",             175,138,55,"pr1","Maria Gonzalez",1,"qr",true),
    mkSale("s5","p1","Dije Corazon Fotograbado","Mama te amo",    122,94, 35,"pr2","Laura Martinez",0,"efectivo"),
  ];
  const expenses = [
    {id:"e1",type:"Electricidad",amount:120,date:now-d(7), description:"Factura mensual",    synced:true},
    {id:"e2",type:"Internet",    amount:80, date:now-d(5), description:"Plan mensual",        synced:true},
    {id:"e3",type:"Materiales",  amount:200,date:now-d(3), description:"Resina y acero inox", synced:true},
    {id:"e4",type:"Empaques",    amount:45, date:now-d(1), description:"Sobres y cajas",      synced:false},
  ];
  const orders = [
    {id:"o1",clientName:"Sofia Ramirez",  clientPhone:"70011222",
     productId:"p1",productName:"Dije Corazon Fotograbado",customization:"Siempre juntos + foto",
     clientPrice:122,promoterId:"pr1",promoterName:"Maria Gonzalez",
     delivery:"local",deliveryCity:"",deliveryAddress:"",
     status:"listo",statusHistory:[
       {status:"nuevo",date:now-d(3)},{status:"diseniar",date:now-d(2)},
       {status:"pagado",date:now-d(1)},{status:"listo",date:now},
     ],notes:"Fotograbado con foto enviada por WhatsApp",
     date:now-d(3),synced:true,convertedToSale:false},
    {id:"o2",clientName:"Rodrigo Vasquez",clientPhone:"70033444",
     productId:"p4",productName:"Cadena con Dije",customization:"RV 2024",
     clientPrice:175,promoterId:"pr2",promoterName:"Laura Martinez",
     delivery:"envio",deliveryCity:"Santa Cruz",deliveryAddress:"Av. Canoto 234",
     status:"diseniar",statusHistory:[
       {status:"nuevo",date:now-d(1)},{status:"diseniar",date:now},
     ],notes:"Envio por transportadora",
     date:now-d(1),synced:true,convertedToSale:false},
    {id:"o3",clientName:"Carmen Lopez",   clientPhone:"70055666",
     productId:"p2",productName:"Pulsera Acero Grabada",customization:"Mama",
     clientPrice:95,promoterId:"pr1",promoterName:"Maria Gonzalez",
     delivery:"local",deliveryCity:"",deliveryAddress:"",
     status:"pago_pendiente",statusHistory:[
       {status:"nuevo",date:now-d(2)},{status:"diseniar",date:now-d(1)},
       {status:"pago_pendiente",date:now},
     ],notes:"",
     date:now-d(2),synced:false,convertedToSale:false},
  ];
  for (const u  of users)     await dbPut("users",    u);
  for (const p  of products)  await dbPut("products", p);
  for (const pr of promoters) await dbPut("promoters",pr);
  for (const s  of sales)     await dbPut("sales",    s);
  for (const e  of expenses)  await dbPut("expenses", e);
  for (const o  of orders)    await dbPut("orders",   o);
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
  const totalExp    = expenses.reduce((a,e)=>a+e.amount,0);
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
.sub{font-size:.85rem;color:#7a6020;margin-top:4px;text-transform:uppercase;letter-spacing:1px}
.dt{font-size:.78rem;color:#9a8060;margin-top:8px}
.hl{background:linear-gradient(135deg,#fffbf0,#fff8e8);border:2px solid #c8a84b;border-radius:12px;
  padding:20px;margin-bottom:20px;text-align:center}
.hl-lbl{font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:#7a6020;font-family:sans-serif}
.hl-val{font-size:2.4rem;color:#c8a84b;font-weight:700;margin-top:6px}
.hl-sub{font-size:.8rem;color:#9a8060;margin-top:6px;font-family:sans-serif}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.card{background:#fff;border:1px solid #e8d8b0;border-radius:10px;padding:14px;text-align:center}
.cv{font-size:1.3rem;font-weight:700}.cv.g{color:#c8a84b}.cv.t{color:#29b8a8}.cv.r{color:#d95555}
.cl{font-size:.68rem;color:#9a8060;margin-top:3px;text-transform:uppercase;letter-spacing:.5px;font-family:sans-serif}
.sec{background:#fff;border:1px solid #e8d8b0;border-radius:12px;padding:18px;margin-bottom:16px}
.sec-t{font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:#9a8060;margin-bottom:14px;
  font-weight:700;font-family:sans-serif}
.row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;
  border-bottom:1px solid #f0e8d0;font-size:.88rem}
.row:last-child{border-bottom:none}
.row.tot{font-weight:700;font-size:.95rem;padding-top:10px;margin-top:4px}
.rk{color:#7a6020}.rv{font-weight:700}
.footer{text-align:center;font-size:.72rem;color:#9a8060;margin-top:24px;
  padding-top:16px;border-top:1px solid #e8d8b0;font-family:sans-serif}
</style></head><body>
<div class="hdr"><div class="logo">Garabato</div>
<div class="sub">Reporte para socio</div>
<div class="dt">Periodo: ${periodLabel} - Generado el ${dateStr}</div></div>
<div class="hl"><div class="hl-lbl">Participacion del socio</div>
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
<div class="row tot"><span class="rk">Socio 1 (50%)</span><span class="rv" style="color:#c8a84b">Bs ${socio.toFixed(2)}</span></div>
<div class="row tot"><span class="rk">Socio 2 (50%)</span><span class="rv" style="color:#29b8a8">Bs ${socio.toFixed(2)}</span></div>
</div>
${promos.length>0?`<div class="sec"><div class="sec-t">Ventas por promotora</div>
${promos.map(r=>`<div class="row"><span class="rk">${r.name} (${r.count} ventas)</span><span class="rv">Bs ${r.total.toFixed(2)}</span></div>`).join("")}
</div>`:""}
${topP.length>0?`<div class="sec"><div class="sec-t">Productos mas vendidos</div>
${topP.map((p,i)=>`<div class="row"><span class="rk">${i+1}. ${p.name} (${p.count} u.)</span><span class="rv">Bs ${p.rev.toFixed(2)}</span></div>`).join("")}
</div>`:""}
<div class="footer">Garabato POS - Reporte generado automaticamente - ${dateStr}</div>
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
.sub{font-size:.85rem;color:#7a6020;margin-top:4px;text-transform:uppercase;letter-spacing:1px;font-family:sans-serif}
.dt{font-size:.78rem;color:#9a8060;margin-top:8px;font-family:sans-serif}
.total-box{background:linear-gradient(135deg,#fffbf0,#fff8e8);border:2px solid #c8a84b;
  border-radius:12px;padding:20px;margin-bottom:20px;text-align:center}
.tl{font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:#7a6020;font-family:sans-serif}
.tv{font-size:2.2rem;color:#d95555;font-weight:700;margin-top:6px}
.pc{background:#fff;border:1px solid #e8d8b0;border-radius:12px;padding:18px;margin-bottom:14px}
.ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;
  padding-bottom:12px;border-bottom:1px solid #f0e8d0}
.pn{font-size:1rem;font-weight:700}.pp{font-size:.75rem;color:#9a8060;margin-top:3px;font-family:sans-serif}
.pa{font-size:1.4rem;color:#d95555;font-weight:700;text-align:right}
.pal{font-size:.65rem;color:#9a8060;text-align:right;font-family:sans-serif}
.sr{display:flex;justify-content:space-between;align-items:center;padding:6px 0;
  border-bottom:1px solid #f8f4ee;font-size:.82rem}
.sr:last-child{border-bottom:none}
.sn{color:#7a6020}.sd{font-size:.7rem;color:#9a8060;margin-top:2px;font-family:sans-serif}
.sc{font-weight:700;color:#d95555}
.footer{text-align:center;font-size:.72rem;color:#9a8060;margin-top:24px;
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
  const [products, setProducts]  = useState([]);
  const [promoters,setPromoters] = useState([]);
  const [sales,    setSales]     = useState([]);
  const [expenses, setExpenses]  = useState([]);
  const [payments, setPayments]  = useState([]);
  const [users,    setUsers]     = useState([]);
  const [orders,   setOrders]    = useState([]);
  const {show:toast, ToastContainer} = useToast();

  useEffect(()=>{
    const st=document.createElement("style"); st.textContent=CSS; document.head.appendChild(st);
    seed().then(()=>reload().then(()=>setReady(true)));
    const on=()=>setOnline(true), off=()=>setOnline(false);
    window.addEventListener("online",on); window.addEventListener("offline",off);
    return ()=>{ window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  },[]);

  const reload = useCallback(async ()=>{
    const [pr,prm,sl,ex,pay,usr,ord] = await Promise.all([
      dbAll("products"),dbAll("promoters"),dbAll("sales"),
      dbAll("expenses"),dbAll("commissionPayments"),dbAll("users"),dbAll("orders"),
    ]);
    setProducts(pr); setPromoters(prm);
    setSales(sl.sort((a,b)=>b.date-a.date));
    setExpenses(ex.sort((a,b)=>b.date-a.date));
    setPayments(pay.sort((a,b)=>b.date-a.date));
    setUsers(usr); setOrders(ord.sort((a,b)=>b.date-a.date));
  },[]);

  const pendingSync = useMemo(()=>
    sales.filter(s=>!s.synced).length + expenses.filter(e=>!e.synced).length,
  [sales,expenses]);

  const role = user?.role;

  const readyOrders = useMemo(()=>orders.filter(o=>o.status==="listo"&&!o.convertedToSale),[orders]);
  const myReadyOrders = useMemo(()=>{
    if (!user) return [];
    if (role==="admin"||role==="employee") return readyOrders;
    return readyOrders.filter(o=>o.promoterId===user.promoterId);
  },[readyOrders,user,role]);

  // HANDLERS
  const handleSync = async ()=>{
    if (!online||syncing) return;
    setSyncing(true);
    await new Promise(r=>setTimeout(r,800));
    const ps=sales.filter(s=>!s.synced), pe=expenses.filter(e=>!e.synced);
    for (const s of ps) await dbPut("sales",{...s,synced:true});
    for (const e of pe) await dbPut("expenses",{...e,synced:true});
    await reload();
    toast((ps.length+pe.length)+" registro"+(ps.length+pe.length!==1?"s":"")+" sincronizado"+(ps.length+pe.length!==1?"s":""),"ok");
    setSyncing(false);
  };

  const handleBackup = async ()=>{
    const [pr,prm,sl,ex,pay]=await Promise.all([
      dbAll("products"),dbAll("promoters"),dbAll("sales"),dbAll("expenses"),dbAll("commissionPayments"),
    ]);
    exportBackup({products:pr,promoters:prm,sales:sl,expenses:ex,commissionPayments:pay,exportedAt:new Date().toISOString()});
    toast("Backup descargado","ok");
  };

  const handleNewSale = async data=>{
    await dbPut("sales",{...data,synced:online&&!data.isHistoric});
    if (!data.isHistoric) {
      const prod=products.find(p=>p.id===data.productId);
      if (prod&&prod.stock>0) await dbPut("products",{...prod,stock:prod.stock-1});
    }
    await reload(); setShowSale(false); setPage("sales");
    toast(data.isHistoric?"Venta historica cargada":"Venta registrada!","ok");
  };

  const handleEditSale = async updated=>{
    await dbPut("sales",{...updated,synced:false});
    await reload(); toast("Venta actualizada","ok");
  };

  const handleDeleteSale = async id=>{
    await dbDel("sales",id); await reload(); toast("Venta eliminada","info");
  };

  const handleMarkPaid = async saleId=>{
    const s=await (async()=>{const db=await openDB();return new Promise((r)=>{const q=db.transaction("sales","readonly").objectStore("sales").get(saleId);q.onsuccess=()=>r(q.result);})})();
    if (s) await dbPut("sales",{...s,commissionStatus:"pagado"});
    await reload(); toast("Comision marcada como pagada","ok");
  };

  const handlePayPromoter = async (promoterId,saleIds,total)=>{
    await dbPut("commissionPayments",{id:uid("cp"),promoterId,amount:total,salesIds:saleIds,date:Date.now()});
    for (const sid of saleIds){
      const s=await (async()=>{const db=await openDB();return new Promise((r)=>{const q=db.transaction("sales","readonly").objectStore("sales").get(sid);q.onsuccess=()=>r(q.result);})})();
      if (s) await dbPut("sales",{...s,commissionStatus:"pagado"});
    }
    await reload(); toast("Pago de "+fmt(total)+" registrado","ok");
  };

  const handleSaveOrder = async o=>{
    await dbPut("orders",{...o,synced:online}); await reload(); toast("Pedido guardado","ok");
  };

  const handleAdvanceOrder = async (orderId,newStatus)=>{
    const db=await openDB();
    const o=await new Promise(r=>{const q=db.transaction("orders","readonly").objectStore("orders").get(orderId);q.onsuccess=()=>r(q.result);});
    if (!o) return;
    await dbPut("orders",{...o,status:newStatus,synced:false,
      statusHistory:[...(o.statusHistory||[]),{status:newStatus,date:Date.now()}]});
    await reload(); toast("Pedido: "+stateInfo(newStatus).label,"ok");
  };

  const handleDeleteOrder = async id=>{
    await dbDel("orders",id); await reload(); toast("Pedido eliminado","info");
  };

  const handleConvertToSale = async order=>{
    const product  = products.find(p=>p.id===order.productId);
    const promoter = promoters.find(p=>p.id===order.promoterId);
    if (!product){toast("Producto no encontrado","err");return;}
    const pp = promoter?.customPromoterPrice!=null ? promoter.customPromoterPrice : product.promoterPrice;
    const {commission,profit,profitOwner,profitPartner} = calcSale(order.clientPrice,pp,product.cost);
    const sale = {
      id:uid("V"),productId:order.productId,productName:order.productName,
      customization:order.customization,clientPrice:order.clientPrice,
      promoterPrice:pp,cost:product.cost,commission,profit,profitOwner,profitPartner,
      paymentMethod:"qr",promoterId:order.promoterId,promoterName:order.promoterName,
      isDirectSale:false,clientName:order.clientName||"",clientPhone:order.clientPhone||"",notes:"",
      commissionStatus:"pendiente",date:Date.now(),isHistoric:false,synced:online,orderId:order.id,
    };
    await dbPut("sales",sale);
    await dbPut("orders",{...order,convertedToSale:true,saleId:sale.id});
    if (product.stock>0) await dbPut("products",{...product,stock:product.stock-1});
    await reload(); setPage("sales"); toast("Pedido convertido en venta!","ok");
  };

  if (!ready) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100dvh",
      background:"#07080a",color:"#c8a84b",fontFamily:"Playfair Display,serif",fontSize:"1.8rem",letterSpacing:"2px"}}>
      Garabato
    </div>
  );

  if (!user) return <LoginScreen users={users} onLogin={u=>{setUser(u);setPage("home");}}/>;

  const navItems = [
    {id:"home",     icon:"home",    label:"Inicio"},
    {id:"orders",   icon:"tag",     label:"Pedidos",  badge:myReadyOrders.length},
    {id:"sales",    icon:"cart",    label:"Ventas",   badge:pendingSync},
    CAN.seeInventory(role) && {id:"inventory",icon:"box",   label:"Stock"},
    {id:"promoters",icon:"users",   label:role==="promoter"?"Perfil":"Promotoras"},
    CAN.seeExpenses(role)  && {id:"expenses", icon:"receipt",label:"Gastos"},
    CAN.seeReports(role)   && {id:"reports",  icon:"chart",  label:"Reportes"},
    CAN.manageConfig(role) && {id:"settings", icon:"settings",label:"Config"},
  ].filter(Boolean);

  return (
    <div className={"app"+(user?" app-light":"")}>
      <ToastContainer />
      <TopBar user={user} online={online} pendingSync={pendingSync} syncing={syncing}
        onSync={handleSync}
        onLogout={()=>{setUser(null);setPage("home");}}
        onBackup={CAN.manageConfig(role)?handleBackup:null}
      />
      <div className="content">
        {page==="home"     && <HomePage sales={sales} products={products} promoters={promoters}
          expenses={expenses} role={role} orders={orders} user={user}
          myReadyOrders={myReadyOrders} onGoOrders={()=>setPage("orders")}/>}
        {page==="orders"   && <OrdersPage orders={orders} products={products} promoters={promoters}
          user={user} role={role} onSave={handleSaveOrder} onAdvance={handleAdvanceOrder}
          onDelete={handleDeleteOrder} onConvert={handleConvertToSale}/>}
        {page==="sales"    && <SalesPage sales={sales} role={role} user={user} promoters={promoters}
          onMarkPaid={handleMarkPaid} onEdit={handleEditSale}
          onDelete={role==="admin"?handleDeleteSale:null}/>}
        {page==="inventory"&& (CAN.seeInventory(role)
          ? <InventoryPage products={products} role={role}
              onSave={async p=>{await dbPut("products",p);await reload();toast("Producto guardado","ok");}}
              onDelete={CAN.editData(role)?async id=>{await dbDel("products",id);await reload();toast("Eliminado","info");}:null}/>
          : <Locked/>)}
        {page==="promoters"&& <PromotersPage promoters={promoters} sales={sales} role={role}
          payments={payments} user={user} onPay={handlePayPromoter}
          onSave={CAN.editData(role)?async p=>{await dbPut("promoters",p);await reload();toast("Promotora guardada","ok");}:null}/>}
        {page==="expenses" && (CAN.seeExpenses(role)
          ? <ExpensesPage expenses={expenses}
              onAdd={async e=>{await dbPut("expenses",{...e,synced:online});await reload();toast("Gasto registrado","ok");}}
              onDelete={async id=>{await dbDel("expenses",id);await reload();toast("Gasto eliminado","info");}}/>
          : <Locked/>)}
        {page==="reports"  && (CAN.seeReports(role)
          ? <ReportsPage sales={sales} expenses={expenses} promoters={promoters} payments={payments}/>
          : <Locked/>)}
        {page==="settings" && (CAN.manageConfig(role)
          ? <SettingsPage users={users} products={products} promoters={promoters}
              onSaveUser={async u=>{await dbPut("users",u);await reload();toast("Usuario guardado","ok");}}
              onDelUser={async id=>{await dbDel("users",id);await reload();toast("Usuario eliminado","info");}}
              onSaveProduct={async p=>{await dbPut("products",p);await reload();toast("Producto actualizado","ok");}}/>
          : <Locked/>)}
      </div>

      {(role==="admin"||role==="employee"||role==="promoter") && (
        <>
          <button className="fab" onClick={()=>{setHistoric(false);setShowSale(true);}} aria-label="Nueva venta">
            <Ic n="plus" s={24} c="#100d02"/>
          </button>
          {CAN.seeReports(role) && (
            <button className="fab-sec" onClick={()=>{setHistoric(true);setShowSale(true);}} title="Venta historica">
              <Ic n="history" s={16} c="var(--muted)"/>
            </button>
          )}
        </>
      )}

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

      {showSale && (
        <NewSaleModal products={products} promoters={promoters} user={user} isHistoric={historic}
          onClose={()=>setShowSale(false)} onSubmit={handleNewSale}/>
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
      else {setErr("PIN incorrecto. Intente nuevamente.");setPin("");}
    }
  };
  return (
    <div className="splash">
      <img src="data:image/jpeg;base64,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" alt="Garabato" style={{width:"220px",borderRadius:"20px",marginBottom:"32px",boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}/>
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
      <div className="demo-hint" style={{opacity:0,userSelect:'none',pointerEvents:'none'}}>.</div>
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
        <span className="tb-brand" style={{fontSize:"1.35rem"}}>Garabato</span>
      </div>
      <div className="tb-r">
        {pendingSync>0&&online&&(
          <button className={"tbtn"+(syncing?" spin":"")} onClick={onSync}>
            <Ic n="sync" s={13}/>
            {syncing?"Sincronizando...":pendingSync+" pendiente"+(pendingSync>1?"s":"")}
          </button>
        )}
        {onBackup&&(
          <button className="tbtn" onClick={onBackup} title="Backup"><Ic n="download" s={13}/></button>
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
function HomePage({sales, products, promoters, expenses, role, orders, user, myReadyOrders, onGoOrders}) {
  const td = todayMs();
  const mySales  = role==="promoter" ? sales.filter(s=>s.promoterId===user.promoterId) : sales;
  const myOrders = role==="promoter" ? orders.filter(o=>o.promoterId===user.promoterId) : orders;

  const todaySales = mySales.filter(s=>s.date>=td);
  const totalToday = todaySales.reduce((a,s)=>a+s.clientPrice,0);
  const commToday  = todaySales.reduce((a,s)=>a+s.commission,0);
  const totalAll   = mySales.reduce((a,s)=>a+s.clientPrice,0);
  const netAll     = sales.reduce((a,s)=>a+s.profit,0);
  const ownerAll   = sales.reduce((a,s)=>a+s.profitOwner,0);
  const pendComm   = sales.filter(s=>s.commissionStatus==="pendiente").reduce((a,s)=>a+s.commission,0);
  const myPendComm = mySales.filter(s=>s.commissionStatus==="pendiente").reduce((a,s)=>a+s.commission,0);
  const lowStock   = products.filter(p=>p.stock<=p.lowStockAlert);
  const activeOrders = myOrders.filter(o=>!o.convertedToSale).length;

  return (
    <div className="pe">
      <div className="card card-gold" style={{marginBottom:14}}>
        <div style={{fontSize:".68rem",color:"var(--gd)",fontWeight:800,textTransform:"uppercase",letterSpacing:.6,marginBottom:4}}>
          {"HOY - "+new Date().toLocaleDateString("es-BO",{weekday:"long",day:"numeric",month:"long"})}
        </div>
        <div style={{fontFamily:"Playfair Display,serif",fontSize:"2.2rem",color:"var(--gold)",lineHeight:1}}>
          {fmt(totalToday)}
        </div>
        <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:4}}>
          {todaySales.length} {todaySales.length===1?"venta":"ventas"}
          {role==="promoter"
            ? " - Tu comision: "+fmt(commToday)
            : " - Ganancia: "+fmt(todaySales.reduce((a,s)=>a+s.profit,0))}
        </div>
      </div>

      {lowStock.length>0&&CAN.seeInventory(role)&&(
        <div className="al al-warn">
          <Ic n="warn" s={14}/>
          <span>
            <b>{lowStock.slice(0,2).map(p=>p.name).join(", ")}</b>
            {lowStock.length>2?" y "+(lowStock.length-2)+" mas":""} - stock bajo
          </span>
        </div>
      )}

      {myReadyOrders.length>0&&(
        <div className="notify-bar" onClick={onGoOrders}>
          <div className="notify-dot"/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:".86rem",color:"var(--grn)"}}>
              {myReadyOrders.length} pedido{myReadyOrders.length>1?"s":""} listo{myReadyOrders.length>1?"s":""} para entregar
            </div>
            <div style={{fontSize:".72rem",color:"var(--muted)",marginTop:2}}>Ver pedidos listos</div>
          </div>
          <Ic n="check" s={18} c="var(--grn)"/>
        </div>
      )}

      {CAN.seeReports(role)&&(
        <>
          <div className="g2">
            <div className="sc hg"><div className="sl">Total vendido</div><div className="sv gold">{fmt(totalAll)}</div><div className="ss">{sales.length} ventas</div></div>
            <div className="sc ht"><div className="sl">Ganancia tienda</div><div className="sv teal">{fmt(netAll)}</div><div className="ss">Antes de gastos fijos</div></div>
          </div>
          <div className="g2">
            <div className="sc hg"><div className="sl">Socio 1 (50%)</div><div className="sv gold">{fmt(ownerAll)}</div><div className="ss">Distribucion societaria</div></div>
            <div className="sc hr"><div className="sl">Com. pendientes</div><div className="sv red">{fmt(pendComm)}</div><div className="ss">Por liquidar</div></div>
          </div>
          <div className="g2">
            <div className="sc"><div className="sl">Pedidos activos</div><div className="sv gold">{activeOrders}</div><div className="ss">En proceso</div></div>
            <div className="sc"><div className="sl">Listos hoy</div><div className="sv grn">{myReadyOrders.length}</div><div className="ss">Para entregar</div></div>
          </div>
        </>
      )}
      {role==="promoter"&&(
        <div className="g2">
          <div className="sc hg"><div className="sl">Mis ventas</div><div className="sv gold">{mySales.length}</div><div className="ss">Total registradas</div></div>
          <div className="sc hr"><div className="sl">Comision pendiente</div><div className="sv red">{fmt(myPendComm)}</div><div className="ss">Por cobrar</div></div>
        </div>
      )}
      {role==="employee"&&(
        <div className="g2">
          <div className="sc"><div className="sl">Ventas hoy</div><div className="sv gold">{todaySales.length}</div><div className="ss">Registradas</div></div>
          <div className="sc"><div className="sl">Monto hoy</div><div className="sv">{fmt(totalToday)}</div><div className="ss">Al cliente</div></div>
        </div>
      )}

      <div className="shd mt12"><div className="shd-l"><span style={{color:"var(--gold)"}}>G</span> {role==="promoter"?"Mis ventas recientes":"Ventas recientes"}</div></div>
      {mySales.slice(0,5).map(s=><SaleRow key={s.id} sale={s} role={role}/>)}
    </div>
  );
}

// ============================================================
//  ORDERS PAGE
// ============================================================
function OrdersPage({orders, products, promoters, user, role, onSave, onAdvance, onDelete, onConvert}) {
  const [view,    setView]    = useState("list");
  const [showForm,setShowForm]= useState(false);
  const [editOrd, setEditOrd] = useState(null);
  const [expanded,setExpanded]= useState({nuevo:true,diseniar:true,pago_pendiente:true,pagado:true,listo:true});

  const myOrders = useMemo(()=>
    role==="promoter" ? orders.filter(o=>o.promoterId===user.promoterId) : orders
  ,[orders,role,user]);

  const active    = myOrders.filter(o=>!o.convertedToSale);
  const delivered = myOrders.filter(o=>o.convertedToSale);

  const grouped = useMemo(()=>{
    const g={};
    for (const st of ORDER_STATES) g[st.id]=active.filter(o=>o.status===st.id);
    return g;
  },[active]);

  const toggleExpand = id => setExpanded(e=>({...e,[id]:!e[id]}));

  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l"><span style={{color:"var(--gold)"}}>G</span> Pedidos</div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <div className="view-toggle">
            <button className={"vt-btn "+(view==="list"?"act":"off")} onClick={()=>setView("list")}>Lista</button>
            <button className={"vt-btn "+(view==="kanban"?"act":"off")} onClick={()=>setView("kanban")}>Board</button>
          </div>
          <button className="btn btn-sm btn-gold" style={{width:"auto"}}
            onClick={()=>{setEditOrd(null);setShowForm(true);}}>
            <Ic n="plus" s={14} c="#100d02"/>
          </button>
        </div>
      </div>

      {/* Estado chips */}
      <div className="flt">
        {ORDER_STATES.map(st=>{
          const count=grouped[st.id]?.length||0;
          return (
            <div key={st.id} style={{flexShrink:0,padding:"5px 11px",borderRadius:20,
              background:count>0?"var(--s2)":"var(--s1)",
              border:"1px solid "+(count>0?st.border:"var(--b1)"),
              display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:st.color,flexShrink:0}}/>
              <span style={{fontSize:".7rem",color:"var(--muted)",fontWeight:700}}>{st.label}</span>
              {count>0&&<span style={{fontSize:".7rem",color:st.color,fontWeight:800}}>{count}</span>}
            </div>
          );
        })}
      </div>

      {/* LISTA VIEW */}
      {view==="list"&&(
        <>
          {ORDER_STATES.map(st=>{
            const group=grouped[st.id]||[], isOpen=expanded[st.id]!==false;
            return (
              <div key={st.id} style={{marginBottom:8}}>
                <button className={"grp-header"+(isOpen&&group.length>0?" open":"")}
                  onClick={()=>toggleExpand(st.id)}
                  style={{background:group.length>0?"var(--s2)":"var(--s1)",
                    borderColor:group.length>0?st.border+"66":"var(--b1)"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:st.color,flexShrink:0}}/>
                  <span style={{fontWeight:800,fontSize:".82rem",color:group.length>0?st.color:"var(--dim)",flex:1,textAlign:"left"}}>
                    {st.label.toUpperCase()}
                  </span>
                  <span style={{fontSize:".72rem",color:"var(--muted)",fontWeight:700}}>
                    {group.length} pedido{group.length!==1?"s":""}
                  </span>
                  <span style={{color:"var(--dim)",fontSize:".8rem",marginLeft:4}}>
                    {isOpen?"v":">"}
                  </span>
                </button>
                {isOpen&&group.length>0&&(
                  <div className="grp-body" style={{borderColor:st.border+"66"}}>
                    {group.map((order,idx)=>(
                      <OrderCard key={order.id} order={order} promoters={promoters}
                        role={role} isLast={idx===group.length-1} stateColor={st.color}
                        onAdvance={()=>{const ns=nextState(order.status);if(ns)onAdvance(order.id,ns);}}
                        onEdit={()=>{setEditOrd(order);setShowForm(true);}}
                        onDelete={()=>onDelete(order.id)}
                        onConvert={()=>onConvert(order)}
                        nextLabel={nextState(order.status)?stateInfo(nextState(order.status)).label:null}
                      />
                    ))}
                  </div>
                )}
                {isOpen&&group.length===0&&(
                  <div className="grp-body" style={{padding:12,textAlign:"center",fontSize:".76rem",color:"var(--dim)"}}>
                    Sin pedidos
                  </div>
                )}
              </div>
            );
          })}
          {delivered.length>0&&(
            <div style={{marginTop:8}}>
              <div style={{fontSize:".68rem",color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,padding:"8px 4px"}}>
                Entregados ({delivered.length})
              </div>
              {delivered.slice(0,5).map(order=>(
                <div key={order.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",
                  background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:"var(--r)",marginBottom:6,opacity:.7}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:".84rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {order.clientName} - {order.productName}
                    </div>
                    <div style={{fontSize:".7rem",color:"var(--dim)",marginTop:2}}>
                      {order.customization?'"'+order.customization+'" - ':""}{fmtDate(order.date)}
                    </div>
                  </div>
                  <span style={{fontFamily:"Playfair Display,serif",fontSize:"1rem",color:"var(--grn)",fontWeight:700,flexShrink:0}}>
                    {fmt(order.clientPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* KANBAN VIEW */}
      {view==="kanban"&&(
        <div className="kanban-wrap">
          {ORDER_STATES.map(st=>{
            const group=grouped[st.id]||[];
            return (
              <div key={st.id} className="kanban-col">
                <div className="kanban-head" style={{borderLeftColor:st.color}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:st.color}}/>
                    <span style={{fontWeight:800,fontSize:".78rem",color:st.color}}>{st.label.toUpperCase()}</span>
                  </div>
                  <span style={{background:st.color+"22",color:st.color,borderRadius:10,padding:"2px 8px",fontSize:".7rem",fontWeight:800}}>
                    {group.length}
                  </span>
                </div>
                {group.length===0&&<div className="kanban-empty">Sin pedidos</div>}
                {group.map(order=>{
                  const ns=nextState(order.status);
                  return (
                    <div key={order.id} className="kanban-card" style={{borderTopColor:st.color}}>
                      <div style={{fontWeight:700,fontSize:".84rem",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {order.clientName}
                      </div>
                      <div style={{fontSize:".72rem",color:"var(--muted)",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {order.productName}
                      </div>
                      {order.customization&&(
                        <div style={{fontSize:".7rem",color:"var(--gold)",fontStyle:"italic",marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                          {'"'+order.customization+'"'}
                        </div>
                      )}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <span style={{fontSize:".7rem",color:"var(--dim)"}}>{order.promoterName?.split(" ")[0]}</span>
                        <span style={{fontFamily:"Playfair Display,serif",fontSize:".95rem",color:"var(--gold)"}}>{fmt(order.clientPrice)}</span>
                      </div>
                      {order.delivery==="envio"&&order.deliveryCity&&(
                        <div style={{fontSize:".66rem",color:"var(--blu)",marginBottom:6}}>Envio: {order.deliveryCity}</div>
                      )}
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {ns&&CAN.editData(role)&&(
                          <button className="btn btn-sm btn-teal" style={{flex:1,padding:"5px 8px",fontSize:".7rem"}}
                            onClick={()=>onAdvance(order.id,ns)}>
                            {stateInfo(ns).label}
                          </button>
                        )}
                        {(order.status==="pagado"||order.status==="listo")&&CAN.editData(role)&&(
                          <button className="btn btn-sm btn-gold" style={{flex:1,padding:"5px 8px",fontSize:".7rem"}}
                            onClick={()=>onConvert(order)}>
                            Venta
                          </button>
                        )}
                        {order.clientPhone&&(
                          <button className="wa-btn" style={{padding:"5px 9px"}}
                            onClick={()=>openWhatsApp(order.clientPhone,
                              order.status==="listo"
                                ?"Hola "+order.clientName+"! Tu pedido de "+order.productName+" ya esta listo. Gracias! Garabato"
                                :"Hola "+order.clientName+"! Te contactamos de Garabato sobre tu pedido de "+order.productName+"."
                            )}>
                            <WaIcon/>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {showForm&&(
        <OrderForm order={editOrd} products={products} promoters={promoters} user={user} role={role}
          onClose={()=>setShowForm(false)}
          onSave={async o=>{await onSave(o);setShowForm(false);}}/>
      )}
    </div>
  );
}

// ============================================================
//  ORDER CARD  (lista expandible)
// ============================================================
function OrderCard({order, promoters, role, isLast, stateColor, onAdvance, onEdit, onDelete, onConvert, nextLabel}) {
  const [open,setOpen] = useState(false);
  const promoter = promoters.find(p=>p.id===order.promoterId);
  return (
    <div style={{background:"var(--s1)",borderBottom:isLast?"none":"1px solid var(--b1)"}}>
      <div className="order-row" onClick={()=>setOpen(o=>!o)}>
        <div className="order-bar" style={{background:stateColor}}/>
        <div className="order-body">
          <div className="order-name">{order.clientName}</div>
          <div className="order-prod">
            {order.productName}{order.customization?' - "'+order.customization+'"':""}
          </div>
          <div className="order-meta">
            <span>{order.promoterName?.split(" ")[0]}</span>
            {order.delivery==="envio"&&<span style={{color:"var(--blu)"}}>Envio: {order.deliveryCity||"a definir"}</span>}
            <span>{fmtDate(order.date)}</span>
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div className="order-amt">{fmt(order.clientPrice)}</div>
          <div style={{fontSize:".62rem",color:"var(--dim)",marginTop:2}}>{open?"cerrar":"ver"}</div>
        </div>
      </div>
      {open&&(
        <div className="order-detail">
          {order.customization&&(
            <div style={{fontSize:".76rem",color:"var(--gold)",fontStyle:"italic",padding:"8px 0 4px"}}>
              Grabado: "{order.customization}"
            </div>
          )}
          {order.notes&&(
            <div style={{fontSize:".72rem",color:"var(--dim)",padding:"5px 8px",
              background:"var(--s2)",borderRadius:"var(--rsm)",marginBottom:8}}>
              Nota: {order.notes}
            </div>
          )}
          {order.delivery==="envio"&&order.deliveryCity&&(
            <div style={{fontSize:".74rem",color:"var(--blu)",marginBottom:8}}>
              Envio a: {order.deliveryCity}{order.deliveryAddress?" - "+order.deliveryAddress:""}
            </div>
          )}
          <div className="order-actions">
            {nextLabel&&CAN.editData(role)&&(
              <button className="btn btn-sm btn-teal" style={{fontSize:".76rem"}} onClick={onAdvance}>
                Avanzar: {nextLabel}
              </button>
            )}
            {(order.status==="pagado"||order.status==="listo")&&!order.convertedToSale&&CAN.editData(role)&&(
              <button className="btn btn-sm btn-gold" style={{fontSize:".76rem"}} onClick={onConvert}>
                <Ic n="cart" s={12} c="#100d02"/> Convertir en venta
              </button>
            )}
            {order.clientPhone&&(
              <button className="wa-btn"
                onClick={()=>openWhatsApp(order.clientPhone,
                  order.status==="listo"
                    ?"Hola "+order.clientName+"! Tu pedido de "+order.productName+" ya esta listo"+(order.delivery==="local"?" para retirar en tienda":" para enviar a "+order.deliveryCity)+". Gracias! Garabato"
                    :order.status==="diseniar"
                    ?"Hola "+order.clientName+"! En breve te enviamos el diseno de tu "+order.productName+" para que lo apruebes. Garabato"
                    :"Hola "+order.clientName+"! Te contactamos de Garabato sobre tu pedido de "+order.productName+"."
                )}>
                <WaIcon/> Cliente
              </button>
            )}
            {order.status==="listo"&&promoter?.phone&&(
              <button className="wa-btn" style={{background:"#128c7e"}}
                onClick={()=>openWhatsApp(promoter.phone,
                  "Hola "+promoter.name?.split(" ")[0]+"! El pedido de "+order.clientName+" ("+order.productName+") ya esta listo para entregar. Coordina con el cliente. Garabato"
                )}>
                <WaIcon/> Promotora
              </button>
            )}
            {!order.convertedToSale&&CAN.editData(role)&&(
              <>
                <button className="btn btn-sm btn-out" style={{padding:"5px 8px"}} onClick={onEdit}>
                  <Ic n="edit" s={12}/>
                </button>
                <button className="btn btn-sm btn-red" style={{padding:"5px 8px"}} onClick={onDelete}>
                  <Ic n="trash" s={12}/>
                </button>
              </>
            )}
          </div>
          {order.convertedToSale&&(
            <div style={{marginTop:8,fontSize:".72rem",color:"var(--grn)",fontWeight:700}}>Convertido en venta</div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
//  ORDER FORM
// ============================================================
function OrderForm({order, products, promoters, user, role, onClose, onSave}) {
  const blank = {
    id:uid("O"),clientName:"",clientPhone:"",
    productId:"",productName:"",customization:"",clientPrice:"",
    promoterId:  user.role==="promoter"?user.promoterId:"",
    promoterName:user.role==="promoter"?(promoters.find(p=>p.id===user.promoterId)?.name||""):"",
    delivery:"local",deliveryCity:"",deliveryAddress:"",notes:"",
    status:"nuevo",statusHistory:[{status:"nuevo",date:Date.now()}],
    date:Date.now(),convertedToSale:false,
  };
  const [f,setF] = useState(order||blank);
  const set = (k,v)=>setF(x=>({...x,[k]:v}));
  const valid = f.clientName&&f.productId&&f.promoterId&&f.clientPrice;

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">{order?"Editar pedido":"Nuevo pedido"}</div>

        <div className="price-box">
          <div style={{fontSize:".7rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Datos del cliente</div>
          <div className="fi2">
            <div className="fg">
              <label className="fl">Nombre</label>
              <input className="fi" value={f.clientName} onChange={e=>set("clientName",e.target.value)} placeholder="Nombre del cliente"/>
            </div>
            <div className="fg">
              <label className="fl">Telefono</label>
              <input className="fi" type="tel" value={f.clientPhone} onChange={e=>set("clientPhone",e.target.value)} placeholder="7XXXXXXX"/>
              <div className="fi-hint">Para WhatsApp directo</div>
            </div>
          </div>
        </div>

        <div className="fg">
          <label className="fl">Producto</label>
          <div className="prod-grid">
            {products.map(p=>(
              <div key={p.id} className={"prod-card"+(f.productId===p.id?" sel":"")} onClick={()=>{set("productId",p.id);set("productName",p.name);set("clientPrice",p.clientPrice.toString());}}>
                {p.photo?<img src={p.photo} alt={p.name} className="prod-card-img"/>:<div className="prod-card-ph">{p.name.charAt(0)}</div>}
                <div className="prod-card-info">
                  <div className="prod-card-name" style={{color:f.productId===p.id?"var(--gold)":"var(--txt)"}}>{p.name}</div>
                  <div className="prod-card-price">{fmt(p.clientPrice)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fg">
          <label className="fl">Precio acordado (Bs.)</label>
          <input className="fi" type="number" value={f.clientPrice} onChange={e=>set("clientPrice",e.target.value)} placeholder="0"/>
        </div>

        <div className="fg">
          <label className="fl">Personalizacion / Grabado</label>
          {f.customization&&(
            <div className="lp">
              <div style={{fontSize:".62rem",color:"var(--dim)",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Vista previa laser</div>
              <div className="lp-txt">{f.customization.toUpperCase()}</div>
            </div>
          )}
          <input className="fi" value={f.customization} onChange={e=>set("customization",e.target.value)} placeholder="Texto, foto o logo a grabar"/>
        </div>

        <div className="fg">
          <label className="fl">Promotora</label>
          {promoters.filter(p=>p.active).map(pr=>{
            const isSelf=user.role==="promoter"&&user.promoterId===pr.id;
            return (
              <div key={pr.id} onClick={()=>{set("promoterId",pr.id);set("promoterName",pr.name);}} style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                background:f.promoterId===pr.id?"linear-gradient(145deg,#18140a,#201c0e)":"var(--s2)",
                border:"1px solid "+(f.promoterId===pr.id?"var(--gd)":"var(--b1)"),
                borderRadius:"var(--rsm)",cursor:"pointer",marginBottom:7,transition:".2s",
                opacity:user.role==="promoter"&&!isSelf?.3:1,
                pointerEvents:user.role==="promoter"&&!isSelf?"none":"auto",
              }}>
                <div style={{width:30,height:30,borderRadius:"50%",
                  background:f.promoterId===pr.id?"var(--gd)":"var(--b1)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"Playfair Display,serif",color:f.promoterId===pr.id?"#100d02":"var(--muted)",flexShrink:0}}>
                  {pr.name.charAt(0)}
                </div>
                <span style={{fontWeight:700,fontSize:".86rem",color:f.promoterId===pr.id?"var(--gold)":"var(--txt)"}}>{pr.name}</span>
                {f.promoterId===pr.id&&<Ic n="check" s={15} c="var(--gold)"/>}
              </div>
            );
          })}
        </div>

        <div className="fg">
          <label className="fl">Entrega</label>
          <div className="pills" style={{marginBottom:10}}>
            <button className={"pill"+(f.delivery==="local"?" act":"")} onClick={()=>set("delivery","local")}>Retiro en tienda</button>
            <button className={"pill"+(f.delivery==="envio"?" act":"")} onClick={()=>set("delivery","envio")}>Envio a domicilio</button>
          </div>
          {f.delivery==="envio"&&(
            <div className="fi2">
              <div className="fg">
                <label className="fl">Ciudad</label>
                <input className="fi" value={f.deliveryCity} onChange={e=>set("deliveryCity",e.target.value)} placeholder="Ej: Santa Cruz"/>
              </div>
              <div className="fg">
                <label className="fl">Direccion</label>
                <input className="fi" value={f.deliveryAddress} onChange={e=>set("deliveryAddress",e.target.value)} placeholder="Referencia"/>
              </div>
            </div>
          )}
        </div>

        <div className="fg">
          <label className="fl">Notas internas</label>
          <textarea className="fta" value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Detalles, instrucciones especiales..."/>
        </div>

        <div className="row mt12">
          <button className="btn btn-out" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" disabled={!valid} onClick={()=>onSave({...f,clientPrice:parseFloat(f.clientPrice)||0})}>
            <Ic n="check" s={16} c="#100d02"/> Guardar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  SALES PAGE
// ============================================================
function SalesPage({sales, role, user, promoters, onMarkPaid, onEdit, onDelete}) {
  const [filter,  setFilter]   = useState("all");
  const [search,  setSearch]   = useState("");
  const [hideHist,setHideHist] = useState(false);
  const [editSale,setEditSale] = useState(null);
  const [confirmDel,setConfirmDel] = useState(null);

  const visible = useMemo(()=>{
    let list = role==="promoter"
      ? sales.filter(s=>s.promoterId===user.promoterId)
      : filter==="all" ? sales : sales.filter(s=>s.promoterId===filter);
    if (hideHist) list=list.filter(s=>!s.isHistoric);
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
  },[sales,role,user,filter,search,hideHist]);

  const total = visible.reduce((a,s)=>a+s.clientPrice,0);

  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l"><span style={{color:"var(--gold)"}}>G</span> Ventas</div>
        <span style={{fontSize:".8rem",color:"var(--gold)",fontFamily:"Playfair Display,serif"}}>{fmt(total)}</span>
      </div>
      <div className="fg">
        <input className="fi" placeholder="Buscar producto, grabado, promotora, cliente..."
          value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      {role!=="promoter"&&(
        <div className="flt">
          <button className={"pill"+(filter==="all"?" act":"")} onClick={()=>setFilter("all")}>Todas</button>
          {promoters.map(pr=>(
            <button key={pr.id} className={"pill"+(filter===pr.id?" act":"")} onClick={()=>setFilter(pr.id)}>
              {pr.name.split(" ")[0]}
            </button>
          ))}
          <button className={"pill"+(hideHist?" act-red":"")} onClick={()=>setHideHist(v=>!v)}>
            {hideHist?"Mostrar historicas":"Ocultar historicas"}
          </button>
        </div>
      )}
      {visible.length===0
        ?<div className="empty"><Ic n="cart" s={38}/><p>Sin ventas.</p></div>
        :visible.map(s=>(
          <SaleRow key={s.id} sale={s} role={role}
            showActions={CAN.seeComms(role)}
            onMarkPaid={s.commissionStatus==="pendiente"?()=>onMarkPaid(s.id):null}
            onEdit={()=>setEditSale(s)}
            onDelete={role==="admin"&&onDelete?()=>setConfirmDel(s):null}
          />
        ))
      }

      {editSale&&(
        <SaleEditModal sale={editSale} role={role}
          onClose={()=>setEditSale(null)}
          onSave={async u=>{await onEdit(u);setEditSale(null);}}/>
      )}

      {confirmDel&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setConfirmDel(null)}>
          <div className="sheet">
            <div className="sh-hd"/>
            <div className="sh-title">Eliminar venta</div>
            <div className="al al-warn" style={{marginBottom:16}}>
              <Ic n="warn" s={14}/>
              <span>Esta accion no se puede deshacer.</span>
            </div>
            <div className="pb" style={{marginBottom:16}}>
              <div className="pbr"><span className="pbk">Producto</span><span className="pbv">{confirmDel.productName}</span></div>
              {confirmDel.customization&&<div className="pbr"><span className="pbk">Grabado</span><span className="pbv pbv-gold">"{confirmDel.customization}"</span></div>}
              <div className="pbr"><span className="pbk">Fecha</span><span className="pbv">{fmtDate(confirmDel.date)}</span></div>
              <div className="pbr"><span className="pbk">Monto</span><span className="pbv pbv-gold">{fmt(confirmDel.clientPrice)}</span></div>
            </div>
            <div className="row">
              <button className="btn btn-out" onClick={()=>setConfirmDel(null)}>Cancelar</button>
              <button className="btn btn-red" onClick={async()=>{await onDelete(confirmDel.id);setConfirmDel(null);}}>
                <Ic n="trash" s={16} c="#fff"/> Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">Editar venta</div>
        <div style={{background:"var(--s2)",borderRadius:"var(--rsm)",padding:"10px 13px",marginBottom:16,fontSize:".8rem"}}>
          <div style={{fontWeight:700,color:"var(--gold)"}}>{sale.productName}</div>
          <div style={{color:"var(--dim)",fontSize:".72rem",marginTop:2}}>{fmtDate(sale.date)} - {sale.promoterName}</div>
        </div>
        <div className="fg">
          <label className="fl">Texto del grabado</label>
          <input className="fi" value={f.customization} onChange={e=>set("customization",e.target.value)} placeholder="Texto, foto o diseno a grabar"/>
        </div>
        <div className="fg">
          <label className="fl">Metodo de pago</label>
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
            <label className="fl">Telefono del cliente</label>
            <input className="fi" type="tel" value={f.clientPhone} onChange={e=>set("clientPhone",e.target.value)} placeholder="7XXXXXXX"/>
          </div>
        </div>
        <div className="fg">
          <label className="fl">Notas adicionales</label>
          <textarea className="fta" value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Instrucciones especiales..."/>
        </div>
        {role==="admin"&&(
          <div className="price-box">
            <div style={{fontSize:".7rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
              Precios (solo admin)
            </div>
            <div className="fi2">
              <div className="fg">
                <label className="fl">Precio al cliente</label>
                <input className="fi" type="number" value={f.clientPrice} onChange={e=>set("clientPrice",e.target.value)}/>
              </div>
              <div className="fg">
                <label className="fl">Precio neto recibido</label>
                <input className="fi" type="number" value={f.promoterPrice} onChange={e=>set("promoterPrice",e.target.value)}/>
              </div>
            </div>
            <div className="fg">
              <label className="fl">Costo material</label>
              <input className="fi" type="number" value={f.cost} onChange={e=>set("cost",e.target.value)}/>
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

function SaleRow({sale, role, showActions, onMarkPaid, onEdit, onDelete}) {
  const pm={efectivo:"Ef.",transferencia:"Tf.",qr:"QR"};
  return (
    <div className="si">
      <div className="si-ico"><Ic n={sale.isHistoric?"history":"laser"} s={16}/></div>
      <div className="si-body">
        <div className="si-prod">{sale.productName}</div>
        {sale.customization&&<div className="si-cust">"{sale.customization}"</div>}
        <div className="si-meta">
          <span>{fmtDate(sale.date)}{!sale.isHistoric&&" "+fmtHora(sale.date)}</span>
          <span>{pm[sale.paymentMethod]||sale.paymentMethod}</span>
          <span>{sale.promoterName?.split(" ")[0]}</span>
          {sale.clientName&&<span style={{color:"var(--muted)"}}>{sale.clientName}</span>}
          {sale.isHistoric&&<span className="hist-tag">Historica</span>}
          {sale.isDirectSale&&<span className="chip ch-blu">Tienda directa</span>}
        </div>
        {sale.notes&&<div style={{fontSize:".7rem",color:"var(--dim)",marginTop:4,fontStyle:"italic"}}>{sale.notes}</div>}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
          {showActions&&onMarkPaid&&(
            <button onClick={onMarkPaid} className="btn btn-sm btn-out" style={{padding:"5px 10px",fontSize:".72rem"}}>
              <Ic n="check" s={12}/> Marcar pagada
            </button>
          )}
          {sale.clientPhone&&(
            <button className="wa-btn" style={{fontSize:".72rem",padding:"5px 10px"}}
              onClick={()=>openWhatsApp(sale.clientPhone,"Hola "+(sale.clientName||"cliente")+"! Gracias por tu compra en Garabato.")}>
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
        {CAN.seeComms(role)&&<div className="si-sub">Com: {fmt(sale.commission)}</div>}
        {CAN.seeReports(role)&&<div className="si-sub" style={{color:"var(--teal)"}}>Gan: {fmt(sale.profit)}</div>}
        <div className="mt8">
          <span className={"chip "+(sale.commissionStatus==="pagado"?"ch-grn":"ch-gold")}>
            {sale.commissionStatus==="pagado"?"Pagado":"Pendiente"}
          </span>
        </div>
      </div>
      <div className={"sdot "+(sale.synced?"sd-ok":"sd-no")}/>
    </div>
  );
}

// ============================================================
//  INVENTORY PAGE
// ============================================================
function InventoryPage({products, role, onSave, onDelete}) {
  const [editProd,setEditProd] = useState(null);
  const [showForm,setShowForm] = useState(false);
  const low = products.filter(p=>p.stock<=p.lowStockAlert);
  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l"><span style={{color:"var(--gold)"}}>G</span> Inventario</div>
        {CAN.editData(role)&&(
          <button className="btn btn-sm btn-gold" style={{width:"auto"}} onClick={()=>{setEditProd(null);setShowForm(true);}}>
            <Ic n="plus" s={14} c="#100d02"/> Nuevo
          </button>
        )}
      </div>
      {low.length>0&&(
        <div className="al al-warn"><Ic n="warn" s={14}/><b>{low.length} producto{low.length>1?"s":""} con stock bajo</b></div>
      )}
      {products.length===0
        ?<div className="empty"><Ic n="box" s={38}/><p>Sin productos.</p></div>
        :products.map(p=>{
          const commission=r2(p.clientPrice-p.promoterPrice), profit=r2(p.promoterPrice-p.cost);
          return (
            <div key={p.id} className="pc">
              <div className="pc-top">
                {p.photo?<img src={p.photo} alt={p.name} className="pc-img"/>
                  :<div className="pc-img-ph">{p.name.charAt(0)}</div>}
                <div style={{flex:1}}>
                  <div className="pc-name">{p.name}</div>
                  <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:2}}>{fmt(p.clientPrice)} al cliente</div>
                </div>
                {CAN.editData(role)&&(
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn btn-sm btn-out" style={{padding:"5px 8px"}} onClick={()=>{setEditProd(p);setShowForm(true);}}>
                      <Ic n="edit" s={13}/>
                    </button>
                    {onDelete&&<button className="btn btn-sm btn-red" style={{padding:"5px 8px"}} onClick={()=>onDelete(p.id)}><Ic n="trash" s={13}/></button>}
                  </div>
                )}
              </div>
              <div className="pc-grid">
                <div className="pcs"><div className="pcs-v" style={{color:"var(--txt)"}}>{fmt(p.clientPrice)}</div><div className="pcs-l">Precio venta</div></div>
                <div className="pcs"><div className="pcs-v" style={{color:"var(--gold)"}}>{fmt(p.promoterPrice)}</div><div className="pcs-l">Precio neto</div></div>
                <div className="pcs"><div className="pcs-v" style={{color:"var(--red)"}}>{fmt(p.cost)}</div><div className="pcs-l">Costo</div></div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8,padding:"7px 10px",background:"var(--s2)",borderRadius:"var(--rsm)",fontSize:".72rem"}}>
                <span style={{color:"var(--muted)"}}>Com: <b style={{color:"var(--gold)"}}>{fmt(commission)}</b></span>
                <span style={{color:"var(--muted)"}}>Ganancia: <b style={{color:"var(--teal)"}}>{fmt(profit)}</b></span>
                <span style={{color:p.stock<=p.lowStockAlert?"var(--red)":"var(--grn)"}}>Stock: <b>{p.stock}</b>{p.stock<=p.lowStockAlert?" !":""}</span>
              </div>
            </div>
          );
        })
      }
      {showForm&&<ProductForm product={editProd} onClose={()=>setShowForm(false)} onSave={async p=>{await onSave(p);setShowForm(false);}}/>}
    </div>
  );
}

function ProductForm({product, onClose, onSave}) {
  const blank={id:uid("p"),name:"",photo:null,clientPrice:"",promoterPrice:"",cost:"",stock:"",lowStockAlert:"5"};
  const [f,setF]         = useState(product||blank);
  const [uploading,setUploading] = useState(false);
  const fileRef = useRef(null);
  const set = (k,v)=>setF(x=>({...x,[k]:v}));
  const cp=parseFloat(f.clientPrice)||0, pp=parseFloat(f.promoterPrice)||0, c=parseFloat(f.cost)||0;
  const valid=f.name&&cp&&pp&&c&&f.stock;

  const handlePhoto = async e=>{
    const file=e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { set("photo",await compressImage(file)); } catch(err){console.error(err);}
    setUploading(false);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
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
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{display:"none"}} onChange={handlePhoto}/>
          <div className="fi-hint">La imagen se comprime automaticamente para no ocupar memoria</div>
        </div>
        <div className="fg">
          <label className="fl">Nombre del producto</label>
          <input className="fi" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nombre del producto o servicio"/>
        </div>
        <div className="price-box">
          <div style={{fontSize:".7rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Precios</div>
          <div className="fi2">
            <div className="fg">
              <label className="fl">Precio al cliente</label>
              <input className="fi" type="number" value={f.clientPrice} onChange={e=>set("clientPrice",e.target.value)} placeholder="122"/>
              <div className="fi-hint">Precio de venta al publico (PVP)</div>
            </div>
            <div className="fg">
              <label className="fl">Precio neto recibido</label>
              <input className="fi" type="number" value={f.promoterPrice} onChange={e=>set("promoterPrice",e.target.value)} placeholder="94"/>
              <div className="fi-hint">Monto que ingresa a la tienda</div>
            </div>
          </div>
          <div className="fg">
            <label className="fl">Costo material (Bs.)</label>
            <input className="fi" type="number" value={f.cost} onChange={e=>set("cost",e.target.value)} placeholder="35"/>
          </div>
          {cp>0&&pp>0&&c>0&&(
            <div style={{background:"var(--s1)",borderRadius:"var(--rsm)",padding:"10px 12px",fontSize:".76rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{color:"var(--muted)"}}>Comision promotora</span>
                <b style={{color:"var(--gold)"}}>{fmt(r2(cp-pp))}</b>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"var(--muted)"}}>Ganancia por venta</span>
                <b style={{color:"var(--teal)"}}>{fmt(r2(pp-c))}</b>
              </div>
            </div>
          )}
        </div>
        <div className="fi2">
          <div className="fg">
            <label className="fl">Stock</label>
            <input className="fi" type="number" value={f.stock} onChange={e=>set("stock",e.target.value)} placeholder="0"/>
          </div>
          <div className="fg">
            <label className="fl">Alerta stock bajo</label>
            <input className="fi" type="number" value={f.lowStockAlert} onChange={e=>set("lowStockAlert",e.target.value)} placeholder="5"/>
          </div>
        </div>
        <div className="row mt12">
          <button className="btn btn-out" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" disabled={!valid} onClick={()=>onSave({...f,clientPrice:cp,promoterPrice:pp,cost:c,stock:parseInt(f.stock),lowStockAlert:parseInt(f.lowStockAlert)})}>
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
        <div className="shd"><div className="shd-l"><span style={{color:"var(--gold)"}}>G</span> Mi perfil</div></div>
        <div className="prc">
          <div className="prc-h">
            <div className="prc-av" style={{width:52,height:52,fontSize:"1.4rem"}}>{me.name.charAt(0)}</div>
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
            <div className="prs"><div className="prs-v" style={{fontSize:".85rem",color:"var(--gold)"}}>{fmt(st.earned)}</div><div className="prs-l">Comision ganada</div></div>
            <div className="prs">
              <div className="prs-v" style={{fontSize:".85rem",color:st.pending>0?"var(--red)":"var(--grn)"}}>{fmt(st.pending)}</div>
              <div className="prs-l">Por cobrar</div>
            </div>
          </div>
        </div>
        {st.pending>0&&(
          <div className="al al-info"><Ic n="money" s={14}/><span>Tenes <b>{fmt(st.pending)}</b> en comisiones pendientes de cobro.</span></div>
        )}
        <div className="shd mt12"><div className="shd-l">Mis ventas recientes</div></div>
        {recentSales.length===0
          ?<div className="empty"><Ic n="cart" s={36}/><p>Sin ventas registradas.</p></div>
          :recentSales.map(s=><SaleRow key={s.id} sale={s} role={role}/>)
        }
      </div>
    );
  }

  // Admin / Tienda: lista completa de promotoras
  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l"><span style={{color:"var(--gold)"}}>G</span> Promotoras</div>
        <div style={{display:"flex",gap:7}}>
          {CAN.seePayments(role)&&(
            <button className="wa-btn" style={{fontSize:".72rem",padding:"6px 11px"}}
              onClick={()=>generateCommissionReport(promoters,sales)}>
              <WaIcon/> Comisiones
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
                <div className="prc-ph">Tel: {pr.phone}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <span className="chip ch-teal">
                  {pr.customPromoterPrice!=null?"Precio esp: "+fmt(pr.customPromoterPrice):"Precio estandar"}
                </span>
                {!pr.active&&<span className="chip ch-red">Inactiva</span>}
              </div>
            </div>
            <div className="prc-stats">
              <div className="prs"><div className="prs-v">{st.count}</div><div className="prs-l">Ventas</div></div>
              <div className="prs"><div className="prs-v" style={{fontSize:".85rem"}}>{fmt(st.total)}</div><div className="prs-l">Vendido</div></div>
              <div className="prs">
                <div className="prs-v" style={{fontSize:".85rem",color:st.pending>0?"var(--red)":"var(--grn)"}}>{fmt(st.pending)}</div>
                <div className="prs-l">Pendiente</div>
              </div>
            </div>
            {CAN.seePayments(role)&&st.pending>0&&(
              <button className="btn btn-grn mt12" onClick={()=>setPayingPr(pr)}>
                <Ic n="money" s={16} c="#fff"/> Pagar {fmt(st.pending)} a {pr.name.split(" ")[0]}
              </button>
            )}
            {CAN.editData(role)&&(
              <button className="btn btn-out mt8" style={{fontSize:".75rem",padding:"7px"}} onClick={()=>{setEditPr(pr);setShowForm(true);}}>
                <Ic n="edit" s={13}/> Editar
              </button>
            )}
          </div>
        );
      })}

      {tab==="pagos"&&CAN.seePayments(role)&&(
        payments.length===0
          ?<div className="empty"><Ic n="money" s={38}/><p>Sin pagos registrados.</p></div>
          :payments.map(pay=>{
            const pr=promoters.find(p=>p.id===pay.promoterId);
            return (
              <div key={pay.id} className="pay-row">
                <div className="pay-av">{pr?.name.charAt(0)||"?"}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:".86rem"}}>{pr?.name||"Promotora"}</div>
                  <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:2}}>
                    {fmtDate(pay.date)} - {pay.salesIds.length} venta{pay.salesIds.length>1?"s":""}
                  </div>
                </div>
                <div style={{fontFamily:"Playfair Display,serif",fontSize:"1.1rem",color:"var(--grn)"}}>{fmt(pay.amount)}</div>
              </div>
            );
          })
      )}

      {showForm&&<PromoterForm promoter={editPr} onClose={()=>setShowForm(false)} onSave={async p=>{await onSave(p);setShowForm(false);}}/>}

      {payingPr&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setPayingPr(null)}>
          <div className="sheet">
            <div className="sh-hd"/>
            <div className="sh-title">Confirmar pago</div>
            <div className="pb">
              <div className="pbr"><span className="pbk">Promotora</span><span className="pbv">{payingPr.name}</span></div>
              <div className="pbr"><span className="pbk">Total a pagar</span><span className="pbv" style={{color:"var(--grn)"}}>{fmt(statsFor(payingPr.id).pending)}</span></div>
              <div className="pbr"><span className="pbk">Ventas a liquidar</span><span className="pbv">{statsFor(payingPr.id).ids.length}</span></div>
            </div>
            <div className="al al-info mt12"><Ic n="warn" s={14}/> Todas las comisiones pendientes quedaran como pagadas.</div>
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
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">{promoter?"Editar promotora":"Nueva promotora"}</div>
        <div className="fg">
          <label className="fl">Nombre completo</label>
          <input className="fi" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nombre y apellido"/>
        </div>
        <div className="fg">
          <label className="fl">Telefono</label>
          <input className="fi" type="tel" value={f.phone} onChange={e=>set("phone",e.target.value)} placeholder="7XXXXXXX"/>
        </div>
        <div className="fg">
          <label className="fl">Precio personalizado</label>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <button className={"pill"+(!hasCustom?" act":"")} onClick={()=>set("customPromoterPrice",null)}>Precio estandar del producto</button>
            <button className={"pill"+(hasCustom?" act-red":"")} onClick={()=>set("customPromoterPrice",f.customPromoterPrice||0)}>Precio personalizado</button>
          </div>
          {hasCustom&&(
            <>
              <input className="fi" type="number" value={f.customPromoterPrice} onChange={e=>set("customPromoterPrice",parseFloat(e.target.value)||0)} placeholder="Monto neto recibido (Bs.)"/>
              <div className="fi-hint">Reemplaza el precio estandar del producto para esta promotora en particular</div>
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
  const [form,setForm]=useState({type:"Empaques",amount:"",description:"",date:todayISO()});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const total=expenses.reduce((a,e)=>a+e.amount,0);
  const monthly=expenses.filter(e=>e.date>=Date.now()-30*86400000).reduce((a,e)=>a+e.amount,0);
  const byType=expenses.reduce((m,e)=>{m[e.type]=(m[e.type]||0)+e.amount;return m;},{});
  const sorted=Object.entries(byType).sort((a,b)=>b[1]-a[1]);
  const maxE=sorted[0]?.[1]||1;
  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l"><span style={{color:"var(--gold)"}}>G</span> Gastos</div>
        <button className="btn btn-sm btn-red" style={{width:"auto"}} onClick={()=>setShowForm(true)}>
          <Ic n="plus" s={14} c="#fff"/> Agregar
        </button>
      </div>
      <div className="g2">
        <div className="sc hr"><div className="sl">Total acumulado</div><div className="sv red">{fmt(total)}</div><div className="ss">{expenses.length} registros</div></div>
        <div className="sc"><div className="sl">Este mes</div><div className="sv">{fmt(monthly)}</div><div className="ss">30 dias</div></div>
      </div>
      {sorted.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div style={{fontSize:".7rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Por categoria</div>
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
        ?<div className="empty"><Ic n="receipt" s={38}/><p>Sin gastos registrados.</p></div>
        :expenses.map(e=>(
          <div key={e.id} className="ei">
            <div className="ei-ico">{e.type.charAt(0)}</div>
            <div className="ei-body">
              <div className="ei-type">{e.type}</div>
              {e.description&&<div className="ei-desc">{e.description}</div>}
              <div className="ei-date">{fmtDate(e.date)}</div>
            </div>
            <div className="ei-amt">{fmt(e.amount)}</div>
            <button onClick={()=>onDelete(e.id)} className="btn btn-sm btn-out" style={{marginLeft:8,padding:"4px 8px",fontSize:".68rem",flexShrink:0}}>
              <Ic n="trash" s={11}/>
            </button>
            <div className={"sdot "+(e.synced?"sd-ok":"sd-no")}/>
          </div>
        ))
      }
      {showForm&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="sheet">
            <div className="sh-hd"/>
            <div className="sh-title">Nuevo gasto</div>
            <div className="fg">
              <label className="fl">Categoria</label>
              <select className="fs" value={form.type} onChange={e=>set("type",e.target.value)}>
                {EXP_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fi2">
              <div className="fg">
                <label className="fl">Monto (Bs.)</label>
                <input className="fi" type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="0.00"/>
              </div>
              <div className="fg">
                <label className="fl">Fecha</label>
                <input className="fi" type="date" value={form.date} onChange={e=>set("date",e.target.value)}/>
              </div>
            </div>
            <div className="fg">
              <label className="fl">Descripcion</label>
              <textarea className="fta" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Detalle opcional..."/>
            </div>
            <div className="row">
              <button className="btn btn-out" onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className="btn btn-red" disabled={!form.amount} onClick={async()=>{
                if (!form.amount||isNaN(form.amount)) return;
                await onAdd({id:uid("e"),type:form.type,amount:parseFloat(form.amount),description:form.description,date:new Date(form.date).getTime()});
                setForm({type:"Empaques",amount:"",description:"",date:todayISO()});
                setShowForm(false);
              }}>
                <Ic n="plus" s={16} c="#fff"/> Registrar
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
function ReportsPage({sales, expenses, promoters, payments}) {
  const [tab,   setTab]   = useState("financiero");
  const [period,setPeriod]= useState("week");
  const periodLabel = period==="today"?"Hoy":period==="week"?"Ultimos 7 dias":period==="month"?"Ultimos 30 dias":"Todo el periodo";

  const fs = useMemo(()=>{
    const now=Date.now();
    if (period==="today") return sales.filter(s=>s.date>=todayMs());
    if (period==="week")  return sales.filter(s=>s.date>=now-7*86400000);
    if (period==="month") return sales.filter(s=>s.date>=now-30*86400000);
    return sales;
  },[sales,period]);

  const totalSales  = fs.reduce((a,s)=>a+s.clientPrice,0);
  const totalComm   = fs.reduce((a,s)=>a+s.commission,0);
  const totalCost   = fs.reduce((a,s)=>a+s.cost,0);
  const totalProfit = fs.reduce((a,s)=>a+s.profit,0);
  const ownerProfit = fs.reduce((a,s)=>a+s.profitOwner,0);
  const partProfit  = fs.reduce((a,s)=>a+s.profitPartner,0);
  const totalExp    = expenses.reduce((a,e)=>a+e.amount,0);
  const netFinal    = r2(totalProfit-totalExp);
  const ownerFinal  = r2(netFinal*.5);
  const partFinal   = r2(netFinal*.5);
  const histSales   = fs.filter(s=>s.isHistoric);

  const ranking = promoters.map(pr=>{
    const ps=fs.filter(s=>s.promoterId===pr.id);
    return {name:pr.name,total:ps.reduce((a,s)=>a+s.clientPrice,0),count:ps.length,comm:ps.reduce((a,s)=>a+s.commission,0)};
  }).sort((a,b)=>b.total-a.total);
  const maxR=ranking[0]?.total||1;

  const pm={};
  fs.forEach(s=>{
    if(!pm[s.productId]) pm[s.productId]={name:s.productName,count:0,rev:0,profit:0};
    pm[s.productId].count++; pm[s.productId].rev+=s.clientPrice; pm[s.productId].profit+=s.profit;
  });
  const topP=Object.values(pm).sort((a,b)=>b.count-a.count).slice(0,5);
  const maxP=topP[0]?.count||1;

  return (
    <div className="pe">
      <div className="shd">
        <div className="shd-l"><span style={{color:"var(--gold)"}}>G</span> Reportes</div>
        <button className="wa-btn" style={{fontSize:".72rem",padding:"6px 11px"}}
          onClick={()=>generatePartnerReport(sales,expenses,promoters,period,periodLabel)}>
          <WaIcon/> Enviar a socio
        </button>
      </div>
      <div className="flt">
        {[["all","Todo"],["today","Hoy"],["week","7 dias"],["month","30 dias"]].map(([k,v])=>(
          <button key={k} className={"pill"+(period===k?" act":"")} onClick={()=>setPeriod(k)}>{v}</button>
        ))}
      </div>
      <div className="tabs">
        {["financiero","promotoras","productos"].map(t=>(
          <button key={t} className={"tab"+(tab===t?" act":"")} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab==="financiero"&&(
        <>
          <div className="g2">
            <div className="sc hg"><div className="sl">Total vendido</div><div className="sv gold">{fmt(totalSales)}</div><div className="ss">{fs.length} ventas</div></div>
            <div className="sc ht"><div className="sl">Ganancia tienda</div><div className="sv teal">{fmt(totalProfit)}</div><div className="ss">Antes de gastos fijos</div></div>
          </div>
          {histSales.length>0&&(
            <div className="al al-info" style={{marginBottom:12}}>
              <Ic n="history" s={14}/>
              <span>Incluye <b>{histSales.length} ventas historicas</b></span>
            </div>
          )}
          <div className="shd mt8"><div className="shd-l">Estado de resultados</div></div>
          <div className="fb">
            <div className="fr"><span className="fk">(+) Ingresos brutos al cliente</span><span className="fv" style={{color:"var(--gold)"}}>{fmt(totalSales)}</span></div>
            <div className="fr"><span className="fk">(-) Comisiones promotoras</span><span className="fv" style={{color:"var(--red)"}}>{fmt(totalComm)}</span></div>
            <div className="fr"><span className="fk">(=) Lo que entro a la tienda</span><span className="fv">{fmt(r2(totalSales-totalComm))}</span></div>
            <div className="fr"><span className="fk">(-) Costo materiales</span><span className="fv" style={{color:"var(--red)"}}>{fmt(totalCost)}</span></div>
            <div className="fr total"><span className="fk">= Ganancia bruta</span><span className="fv" style={{color:"var(--teal)"}}>{fmt(totalProfit)}</span></div>
            <div className="fr"><span className="fk">(-) Gastos operativos</span><span className="fv" style={{color:"var(--red)"}}>{fmt(totalExp)}</span></div>
            <div className="fr total"><span className="fk">= Ganancia real final</span>
              <span className="fv" style={{color:netFinal>=0?"var(--grn)":"var(--red)"}}>{fmt(netFinal)}</span>
            </div>
          </div>
          <div className="shd mt16"><div className="shd-l">Distribucion entre socios</div></div>
          <div className="g2">
            <div className="sc hg"><div className="sl">Socio 1 (50%)</div><div className="sv gold">{fmt(ownerFinal)}</div><div className="ss">Socio administrador</div></div>
            <div className="sc ht"><div className="sl">Socio 2 (50%)</div><div className="sv teal">{fmt(partFinal)}</div><div className="ss">Distribucion igualitaria</div></div>
          </div>
          {totalSales>0&&(
            <div className="card">
              <div style={{fontSize:".7rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Distribucion del ingreso</div>
              {[
                {label:"Ganancia socio 1",val:ownerProfit,clr:"var(--gold)"},
                {label:"Ganancia socio 2",val:partProfit, clr:"var(--teal)"},
                {label:"Comisiones",      val:totalComm,  clr:"var(--blu)"},
                {label:"Materiales",      val:totalCost,  clr:"var(--red)"},
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
          <div style={{fontSize:".72rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Ranking por volumen</div>
          {ranking.map((r,i)=>(
            <div key={r.name} className="rbar">
              <div className="rbar-l">{(i+1)+". "+r.name.split(" ")[0]}</div>
              <div className="rbar-t"><div className="rbar-f" style={{width:(r.total/maxR*100)+"%"}}/></div>
              <div className="rbar-v">{r.count}v</div>
            </div>
          ))}
          <div className="dvd"/>
          <div className="fb">
            {ranking.map(r=>(
              <div key={r.name} className="fr">
                <span className="fk">{r.name}</span>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontSize:".72rem",color:"var(--red)"}}>Com: {fmt(r.comm)}</span>
                  <span className="fv" style={{color:"var(--gold)"}}>{fmt(r.total)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="shd mt16"><div className="shd-l">Historial de pagos</div></div>
          {payments.length===0
            ?<div className="empty"><Ic n="money" s={36}/><p>Sin pagos aun.</p></div>
            :payments.slice(0,10).map(pay=>{
              const pr=promoters.find(p=>p.id===pay.promoterId);
              return (
                <div key={pay.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--b1)",fontSize:".82rem"}}>
                  <div>
                    <div style={{fontWeight:700}}>{pr?.name}</div>
                    <div style={{fontSize:".7rem",color:"var(--dim)",marginTop:2}}>{fmtDate(pay.date)} - {pay.salesIds.length} ventas</div>
                  </div>
                  <span style={{fontFamily:"Playfair Display,serif",fontSize:"1rem",color:"var(--grn)"}}>{fmt(pay.amount)}</span>
                </div>
              );
            })
          }
        </>
      )}

      {tab==="productos"&&(
        <>
          <div style={{fontSize:".72rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Mas vendidos</div>
          {topP.length===0
            ?<div className="empty"><p>Sin datos para este periodo.</p></div>
            :topP.map(p=>(
              <div key={p.name} className="rbar">
                <div className="rbar-l">{p.name}</div>
                <div className="rbar-t"><div className="rbar-f" style={{width:(p.count/maxP*100)+"%",background:"linear-gradient(90deg,var(--td),var(--teal))"}}/></div>
                <div className="rbar-v">{p.count}u</div>
              </div>
            ))
          }
          <div className="dvd"/>
          <div className="fb">
            {topP.map(p=>(
              <div key={p.name} className="fr">
                <span className="fk">{p.name}</span>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontSize:".72rem",color:"var(--teal)"}}>{fmt(p.profit)} gan.</span>
                  <span className="fv" style={{color:"var(--gold)"}}>{fmt(p.rev)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
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
      <div className="shd"><div className="shd-l"><span style={{color:"var(--gold)"}}>G</span> Configuracion</div></div>
      <div className="tabs">
        {["usuarios","precios"].map(t=>(
          <button key={t} className={"tab"+(tab===t?" act":"")} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab==="usuarios"&&(
        <>
          <div style={{fontSize:".72rem",color:"var(--muted)",marginBottom:12,lineHeight:1.6}}>
            Administre los usuarios del sistema. Cada usuario accede con su PIN personal.
          </div>
          <button className="btn btn-gold" style={{marginBottom:14}} onClick={()=>{setEditUser(null);setShowUserForm(true);}}>
            <Ic n="plus" s={16} c="#100d02"/> Agregar usuario
          </button>
          {users.map(u=>(
            <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",
              background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:"var(--r)",marginBottom:8}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:"var(--s2)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:800,fontSize:".8rem",color:"var(--muted)",flexShrink:0}}>
                {u.name.charAt(0)}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:".88rem"}}>{u.name}</div>
                <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:2}}>
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
          <div style={{fontSize:".72rem",color:"var(--muted)",marginBottom:12,lineHeight:1.6}}>
            Edita los precios de cada producto. <b style={{color:"var(--gold)"}}>Las ventas ya registradas no cambian.</b>
          </div>
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
                    <div style={{fontWeight:700,fontSize:".9rem"}}>{p.name}</div>
                  </div>
                  <button className="btn btn-sm btn-out" style={{padding:"5px 9px"}} onClick={()=>{setEditProd(p);setShowProdForm(true);}}>
                    <Ic n="edit" s={13}/> Editar
                  </button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:8}}>
                  {[{l:"Precio venta",v:p.clientPrice,c:"var(--txt)"},{l:"Precio neto",v:p.promoterPrice,c:"var(--gold)"},{l:"Costo",v:p.cost,c:"var(--red)"}].map(it=>(
                    <div key={it.l} style={{background:"var(--s2)",borderRadius:"var(--rsm)",padding:"8px 6px",textAlign:"center"}}>
                      <div style={{fontFamily:"Playfair Display,serif",fontSize:"1rem",color:it.c}}>{fmt(it.v)}</div>
                      <div style={{fontSize:".62rem",color:"var(--dim)",marginTop:2}}>{it.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",background:"var(--s2)",borderRadius:"var(--rsm)",fontSize:".72rem"}}>
                  <span style={{color:"var(--muted)"}}>Comision: <b style={{color:"var(--gold)"}}>{fmt(commission)}</b></span>
                  <span style={{color:"var(--muted)"}}>Ganancia: <b style={{color:"var(--teal)"}}>{fmt(profit)}</b></span>
                </div>
              </div>
            );
          })}
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
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">{user?"Editar usuario":"Nuevo usuario"}</div>
        <div className="fg">
          <label className="fl">Nombre</label>
          <input className="fi" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nombre completo"/>
        </div>
        <div className="fg">
          <label className="fl">Rol</label>
          <select className="fs" value={f.role} onChange={e=>set("role",e.target.value)}>
            <option value="admin">Admin</option>
            <option value="employee">Tienda</option>
            <option value="promoter">Promotora</option>
          </select>
        </div>
        <div className="fg">
          <label className="fl">PIN de acceso
            <span style={{fontSize:".68rem",color:"var(--grn)",fontWeight:700,marginLeft:6}}>
              (minimo 4 digitos)
            </span>
          </label>
          <input className="fi" type="password" inputMode="numeric" maxLength={6}
            value={f.pin} onChange={e=>set("pin",e.target.value.replace(/\D/g,""))} placeholder="Ej: 1234"/>
          <div className="fi-hint">Solo numeros. El usuario usa este PIN para entrar a la app.</div>
        </div>
        {f.role==="promoter"&&(
          <div className="fg">
            <label className="fl">Vincular con promotora</label>
            <select className="fs" value={f.promoterId||""} onChange={e=>set("promoterId",e.target.value||null)}>
              <option value="">Sin vincular</option>
              {promoters.map(pr=><option key={pr.id} value={pr.id}>{pr.name}</option>)}
            </select>
            <div className="fi-hint">Al vincular, esta usuaria solo vera sus propias ventas y pedidos</div>
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
  });
  const set=(k,v)=>setF(x=>({...x,[k]:v}));

  const selProd = products.find(p=>p.id===f.productId);
  const selProm = promoters.find(p=>p.id===f.promoterId);

  const pickProduct = p=>{
    const pp = f.isDirectSale ? p.clientPrice : resolvePromoterPrice(p,selProm);
    set("productId",p.id); set("productName",p.name);
    set("clientPrice",p.clientPrice.toString());
    set("promoterPrice",pp.toString()); set("cost",p.cost);
  };
  const pickPromoter = pr=>{
    set("promoterId",pr.id); set("promoterName",pr.name);
    if (selProd) set("promoterPrice",resolvePromoterPrice(selProd,pr).toString());
  };
  const setDirectSale = direct=>{
    set("isDirectSale",direct);
    if (direct){
      set("promoterId","TIENDA"); set("promoterName","Tienda directa");
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
  const step2valid = f.isDirectSale||f.promoterId;

  const handleSubmit = async()=>{
    const saleDate = isHistoric ? new Date(f.saleDate).getTime() : Date.now();
    const sale = {
      id:uid("V"),productId:f.productId,productName:f.productName,
      customization:f.customization.trim(),
      clientPrice:cp,promoterPrice:pp,cost:cst,
      commission,profit,profitOwner,profitPartner,
      paymentMethod:f.paymentMethod,
      promoterId:   f.isDirectSale?null:f.promoterId,
      promoterName: f.isDirectSale?"Tienda directa":f.promoterName,
      isDirectSale: !!f.isDirectSale,
      clientName:   f.clientName.trim(),
      clientPhone:  f.clientPhone.trim(),
      notes:"",
      commissionStatus: f.isDirectSale?"pagado":"pendiente",
      date:saleDate,isHistoric:!!isHistoric,
    };
    setDone(sale); await onSubmit(sale);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&!done&&onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        {done?(
          <div className="suc">
            <div className="suc-ring"><Ic n="check" s={32} c="#fff"/></div>
            <div className="suc-title">{isHistoric?"Cargada!":"Venta registrada!"}</div>
            <div className="id-tag" style={{marginBottom:16}}>{done.id}</div>
            <div className="pb" style={{width:"100%",marginBottom:16}}>
              <div className="pbr"><span className="pbk">Producto</span><span className="pbv">{done.productName}</span></div>
              {done.customization&&<div className="pbr"><span className="pbk">Grabado</span><span className="pbv pbv-gold" style={{fontStyle:"italic"}}>"{done.customization}"</span></div>}
              <div className="pbr"><span className="pbk">Fecha</span><span className="pbv">{fmtDate(done.date)}</span></div>
              <div className="pbr"><span className="pbk">Origen</span><span className="pbv">{done.promoterName}</span></div>
              {done.clientName&&<div className="pbr"><span className="pbk">Cliente</span><span className="pbv">{done.clientName}{done.clientPhone?" - "+done.clientPhone:""}</span></div>}
              <div className="pbr sep"><span className="pbk">Precio al cliente</span><span className="pbv pbv-gold">{fmt(done.clientPrice)}</span></div>
              {done.isDirectSale?(
                <div className="pbr"><span className="pbk">Ingreso total tienda</span><span className="pbv pbv-teal">{fmt(done.clientPrice)}</span></div>
              ):(
                <>
                  <div className="pbr"><span className="pbk">Comision promotora</span><span className="pbv pbv-gold">{fmt(done.commission)}</span></div>
                  <div className="pbr"><span className="pbk">Monto a entregar a tienda</span><span className="pbv pbv-teal">{fmt(done.promoterPrice)}</span></div>
                </>
              )}
              {user.role==="admin"&&(
                <>
                  <div className="pbr"><span className="pbk">(-) Costo material</span><span className="pbv pbv-red">{fmt(done.cost)}</span></div>
                  <div className="pbr"><span className="pbk">= Ganancia bruta</span><span className="pbv pbv-grn">{fmt(done.profit)}</span></div>
                  <div className="pbr"><span className="pbk">Socio 1 (50%)</span><span className="pbv pbv-teal">{fmt(done.profitOwner)}</span></div>
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
                <span>Modo historico - pone la fecha real de la venta</span>
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
                <div style={{fontSize:".9rem",fontWeight:700,marginBottom:14,color:"var(--muted)"}}>
                  Paso 1 - <span style={{color:"var(--txt)"}}>Producto y grabado</span>
                </div>
                {isHistoric&&(
                  <div className="fg">
                    <label className="fl">Fecha real de la venta</label>
                    <input className="fi" type="date" value={f.saleDate} onChange={e=>set("saleDate",e.target.value)} max={todayISO()}/>
                  </div>
                )}
                {/* Datos del cliente - solo tienda y admin */}
                {(user.role==="admin"||user.role==="employee")&&(
                  <div className="price-box">
                    <div style={{fontSize:".7rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
                      Datos del cliente (opcional)
                    </div>
                    <div className="fi2">
                      <div className="fg">
                        <label className="fl">Nombre</label>
                        <input className="fi" value={f.clientName} onChange={e=>set("clientName",e.target.value)} placeholder="Nombre del cliente"/>
                      </div>
                      <div className="fg">
                        <label className="fl">Telefono</label>
                        <input className="fi" type="tel" value={f.clientPhone} onChange={e=>set("clientPhone",e.target.value)} placeholder="7XXXXXXX"/>
                      </div>
                    </div>
                  </div>
                )}
                <div className="fg">
                  <label className="fl">Producto</label>
                  <div className="prod-grid">
                    {products.map(p=>(
                      <div key={p.id} className={"prod-card"+(f.productId===p.id?" sel":"")} onClick={()=>pickProduct(p)}>
                        {p.photo?<img src={p.photo} alt={p.name} className="prod-card-img"/>:<div className="prod-card-ph">{p.name.charAt(0)}</div>}
                        <div className="prod-card-info">
                          <div className="prod-card-name" style={{color:f.productId===p.id?"var(--gold)":"var(--txt)"}}>{p.name}</div>
                          <div className="prod-card-price">{fmt(p.clientPrice)}</div>
                          <div className="prod-card-sub">Neto: {fmt(p.promoterPrice)}</div>
                          {p.stock<=p.lowStockAlert&&<div style={{fontSize:".62rem",color:"var(--red)",marginTop:2}}>Stock bajo: {p.stock}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {isHistoric&&f.productId&&(
                  <div className="price-box">
                    <div style={{fontSize:".7rem",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
                      Ajusta si los precios eran diferentes en esa epoca
                    </div>
                    <div className="fi2">
                      <div className="fg">
                        <label className="fl">Precio al cliente</label>
                        <input className="fi" type="number" value={f.clientPrice} onChange={e=>set("clientPrice",e.target.value)}/>
                      </div>
                      <div className="fg">
                        <label className="fl">Precio neto recibido</label>
                        <input className="fi" type="number" value={f.promoterPrice} onChange={e=>set("promoterPrice",e.target.value)}/>
                      </div>
                    </div>
                    <div className="fg">
                      <label className="fl">Costo material (en ese momento)</label>
                      <input className="fi" type="number" value={f.cost} onChange={e=>set("cost",parseFloat(e.target.value)||0)}/>
                    </div>
                  </div>
                )}
                {f.productId&&cp>0&&pp>0&&(
                  <div style={{marginBottom:13,fontSize:".74rem",display:"flex",gap:14,flexWrap:"wrap"}}>
                    <span style={{color:"var(--muted)"}}>Comision promotora: <b style={{color:"var(--gold)"}}>{fmt(commission)}</b></span>
                    {user.role==="admin"&&<span style={{color:"var(--muted)"}}>Ganancia: <b style={{color:"var(--teal)"}}>{fmt(profit)}</b></span>}
                  </div>
                )}
                <div className="fg">
                  <label className="fl">Texto del grabado (opcional)</label>
                  {f.customization&&(
                    <div className="lp">
                      <div style={{fontSize:".62rem",color:"var(--dim)",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Vista previa laser</div>
                      <div className="lp-txt">{f.customization.toUpperCase()}</div>
                    </div>
                  )}
                  <input className="fi" placeholder="Ej: Ana y Luis 2024" value={f.customization} onChange={e=>set("customization",e.target.value)}/>
                </div>
                <button className="btn btn-gold" disabled={!f.productId||!f.clientPrice||!f.promoterPrice} onClick={()=>setStep(2)}>
                  Continuar
                </button>
              </div>
            )}

            {step===2&&(
              <div className="pe">
                <div style={{fontSize:".9rem",fontWeight:700,marginBottom:14,color:"var(--muted)"}}>
                  Paso 2 - <span style={{color:"var(--txt)"}}>Origen de la venta</span>
                </div>
                {user.role!=="promoter"&&(
                  <div className="fg">
                    <label className="fl">Tipo de venta</label>
                    <div className="pills" style={{marginBottom:12}}>
                      <button className={"pill"+(!f.isDirectSale?" act":"")} onClick={()=>setDirectSale(false)}>Por promotora</button>
                      <button className={"pill"+(f.isDirectSale?" act":"")} onClick={()=>setDirectSale(true)}>Venta directa tienda</button>
                    </div>
                    {f.isDirectSale&&(
                      <div className="al al-ok" style={{marginBottom:0}}>
                        <Ic n="check" s={14}/>
                        <span>Venta directa - cliente de TikTok, redes o tienda fisica. Sin comision de promotora.</span>
                      </div>
                    )}
                  </div>
                )}
                {!f.isDirectSale&&(
                  <div className="fg">
                    <label className="fl">Quien hizo la venta?</label>
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
                            fontFamily:"Playfair Display,serif",fontSize:".95rem",
                            color:f.promoterId===pr.id?"#100d02":"var(--muted)",flexShrink:0}}>
                            {pr.name.charAt(0)}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:".86rem",color:f.promoterId===pr.id?"var(--gold)":"var(--txt)"}}>{pr.name}</div>
                            <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:2}}>
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
                  <label className="fl">Metodo de pago</label>
                  <div className="pills">
                    {PM_OPTS.map(([v,l])=>(
                      <button key={v} className={"pill"+(f.paymentMethod===v?" act":"")} onClick={()=>set("paymentMethod",v)}>{l}</button>
                    ))}
                  </div>
                </div>
                {step2valid&&(
                  <div className="pb" style={{marginBottom:13}}>
                    <div style={{fontSize:".68rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>
                      {isHistoric?"Resumen historico":"Resumen de la venta"}
                    </div>
                    <div className="pbr"><span className="pbk">Precio al cliente</span><span className="pbv pbv-gold">{fmt(cp)}</span></div>
                    {f.isDirectSale?(
                      <div className="pbr"><span className="pbk">Ingreso total tienda</span><span className="pbv pbv-teal">{fmt(cp)}</span></div>
                    ):(
                      <>
                        <div className="pbr"><span className="pbk">Comision promotora</span><span className="pbv pbv-gold">{fmt(commission)}</span></div>
                        <div className="pbr"><span className="pbk">Monto a entregar a tienda</span><span className="pbv pbv-teal">{fmt(pp)}</span></div>
                      </>
                    )}
                    {user.role==="admin"&&(
                      <>
                        <div className="pbr"><span className="pbk">(-) Costo material</span><span className="pbv pbv-red">{fmt(cst)}</span></div>
                        <div className="pbr"><span className="pbk">= Ganancia bruta</span><span className="pbv pbv-grn">{fmt(profit)}</span></div>
                        <div className="pbr"><span className="pbk">Socio 1 (50%)</span><span className="pbv pbv-teal">{fmt(profitOwner)}</span></div>
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
                <div style={{fontSize:".9rem",fontWeight:700,marginBottom:14,color:"var(--muted)"}}>
                  Paso 3 - <span style={{color:"var(--txt)"}}>Confirmar</span>
                </div>
                <div className="pb" style={{marginBottom:14}}>
                  <div className="pbr"><span className="pbk">Producto</span><span className="pbv">{f.productName}</span></div>
                  {f.customization&&<div className="pbr"><span className="pbk">Grabado</span><span className="pbv pbv-gold" style={{fontStyle:"italic"}}>"{f.customization}"</span></div>}
                  {isHistoric&&<div className="pbr"><span className="pbk">Fecha real</span><span className="pbv">{fmtDate(new Date(f.saleDate).getTime())}</span></div>}
                  <div className="pbr"><span className="pbk">Origen</span><span className="pbv">{f.isDirectSale?"Tienda directa":f.promoterName}</span></div>
                  <div className="pbr"><span className="pbk">Metodo de pago</span><span className="pbv" style={{textTransform:"capitalize"}}>{f.paymentMethod}</span></div>
                  {f.clientName&&<div className="pbr"><span className="pbk">Cliente</span><span className="pbv">{f.clientName}</span></div>}
                  {isHistoric&&<div className="pbr"><span className="pbk">Tipo</span><span className="pbv hist-tag">Historica</span></div>}
                  <div className="pbr sep"><span className="pbk">Precio al cliente</span><span className="pbv pbv-gold">{fmt(cp)}</span></div>
                  {f.isDirectSale?(
                    <div className="pbr"><span className="pbk">Ingreso total tienda</span><span className="pbv pbv-teal">{fmt(cp)}</span></div>
                  ):(
                    <>
                      <div className="pbr"><span className="pbk">Comision promotora</span><span className="pbv pbv-gold">{fmt(commission)}</span></div>
                      <div className="pbr"><span className="pbk">Monto a entregar a tienda</span><span className="pbv pbv-teal">{fmt(pp)}</span></div>
                    </>
                  )}
                  {user.role==="admin"&&(
                    <>
                      <div className="pbr"><span className="pbk">(-) Costo material</span><span className="pbv pbv-red">{fmt(cst)}</span></div>
                      <div className="pbr"><span className="pbk">= Ganancia bruta</span><span className="pbv pbv-grn">{fmt(profit)}</span></div>
                      <div className="pbr"><span className="pbk">Socio 1 (50%)</span><span className="pbv pbv-teal">{fmt(profitOwner)}</span></div>
                      <div className="pbr"><span className="pbk">Socio 2 (50%)</span><span className="pbv pbv-teal">{fmt(profitPartner)}</span></div>
                    </>
                  )}
                </div>
                <div className="row">
                  <button className="btn btn-out" onClick={()=>setStep(2)}>Volver</button>
                  <button className="btn btn-teal" onClick={handleSubmit} style={{flex:2}}>
                    <Ic n="check" s={16} c="#020f0e"/>
                    {isHistoric?"Cargar venta historica":"Registrar venta"}
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
//  LOCKED
// ============================================================
function Locked() {
  return (
    <div className="locked">
      <Ic n="lock" s={42} c="var(--dim)"/>
      <p>No tiene acceso a esta seccion.</p>
    </div>
  );
}
