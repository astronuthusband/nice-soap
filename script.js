(function(){
  'use strict';

  var FREE_SHIP = 80, SHIP = 8, SET_DISCOUNT = 0.9;
  var STORE_KEY = 'nicesoap-cart-v1';
  var CFG = window.NICE_SOAP_CONFIG || {};
  var LIVE = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY); // false = demo mode, nothing is sent anywhere

  var PRODUCTS = [
    {id:'pandan',  name:'Pandan & Coconut Milk', cat:'herbal',    price:18, color:'#9DC58B', motif:'leaf',  tone:'dark',
      notes:'Fresh pandan, warm coconut, a little vanilla',
      desc:'A soft, creamy bar that smells like kaya toast on a slow morning. Coconut milk makes the lather rich and gentle.',
      ing:'Coconut oil, olive oil, shea butter, coconut milk, pandan leaf extract, vanilla, sodium hydroxide (fully saponified).'},
    {id:'serai',   name:'Serai Bright',           cat:'citrus',    price:16, color:'#E4DC7A', motif:'slice', tone:'dark',
      notes:'Lemongrass, lemon peel, a hint of ginger',
      desc:'Sharp, clean and awake. A scrubby bar with lemon peel flecks that leaves your hands smelling fresh, not perfumed.',
      ing:'Olive oil, coconut oil, shea butter, lemongrass oil, ground lemon peel, ginger extract, sodium hydroxide (fully saponified).'},
    {id:'rose',    name:'Rosewater Dawn',         cat:'floral',    price:19, color:'#EBB4BA', motif:'flower', tone:'dark',
      notes:'Damask rose, geranium, soft musk',
      desc:'Made with real rosewater and pink clay. Soft, calm and made for gentle morning washes.',
      ing:'Olive oil, coconut oil, shea butter, rosewater, pink clay, geranium oil, sodium hydroxide (fully saponified).'},
    {id:'limau',   name:'Limau Purut Zest',       cat:'citrus',    price:17, color:'#BCD66A', motif:'drop',  tone:'dark',
      notes:'Kaffir lime, bergamot, green tea',
      desc:'Bright kaffir lime with a green tea finish. It cuts through the day\u2019s humidity and never feels drying.',
      ing:'Coconut oil, olive oil, cocoa butter, kaffir lime oil, green tea extract, bergamot oil, sodium hydroxide (fully saponified).'},
    {id:'charcoal',name:'Charcoal & Tea Tree',    cat:'herbal',    price:20, color:'#66726C', motif:'hex',   tone:'light',
      notes:'Tea tree, peppermint, cedar',
      desc:'A deep-clean bar for oily skin and after-gym washes. Activated charcoal lifts, tea tree keeps it fresh.',
      ing:'Olive oil, coconut oil, shea butter, activated charcoal, tea tree oil, peppermint oil, sodium hydroxide (fully saponified).'},
    {id:'melur',   name:'Melur Night',            cat:'floral',    price:19, color:'#EFE3C2', motif:'flower', tone:'dark',
      notes:'Jasmine, sandalwood, a touch of amber',
      desc:'Named for the jasmine that blooms after dark. Warm and a little smoky, it\u2019s the bar we reach for before bed.',
      ing:'Olive oil, coconut oil, shea butter, jasmine absolute, sandalwood oil, amber resin, sodium hydroxide (fully saponified).'},
    {id:'oat',     name:'Oat & Honey',            cat:'unscented', price:15, color:'#E6CFA3', motif:'dots',  tone:'dark',
      notes:'No added fragrance. Just oats and honey',
      desc:'A mild everyday bar with ground oats and local honey. Good for sensitive skin and the whole family.',
      ing:'Olive oil, coconut oil, shea butter, ground oats, honey, sodium hydroxide (fully saponified).'},
    {id:'goat',    name:'Plain Goat Milk',        cat:'unscented', price:21, color:'#EEEBDD', motif:'drop',  tone:'dark',
      notes:'Fragrance-free and extra creamy',
      desc:'Just goat milk and gentle oils. It\u2019s our simplest and creamiest bar, made for dry or easily irritated skin.',
      ing:'Olive oil, coconut oil, shea butter, goat milk, sodium hydroxide (fully saponified).'}
  ];

  var CATS = [['all','All'],['floral','Floral'],['herbal','Herbal'],['citrus','Citrus'],['unscented','Unscented']];
  var STATES = ['Johor','Kedah','Kelantan','Kuala Lumpur','Labuan','Melaka','Negeri Sembilan','Pahang','Penang','Perak','Perlis','Putrajaya','Sabah','Sarawak','Selangor','Terengganu'];

  var ICONS = {
    leaf:'<path d="M98 71c0-14 9-20 24-20 0 14-9 20-24 20z"/>',
    slice:'<circle cx="110" cy="61" r="10" fill="none"/><path d="M110 51v20M100 61h20M103 54l14 14M117 54l-14 14" fill="none" stroke-width="1"/>',
    flower:'<circle cx="110" cy="53" r="5"/><circle cx="118" cy="59" r="5"/><circle cx="115" cy="68" r="5"/><circle cx="105" cy="68" r="5"/><circle cx="102" cy="59" r="5"/>',
    drop:'<path d="M110 50c7 9 10 14 10 18a10 10 0 0 1-20 0c0-4 3-9 10-18z"/>',
    hex:'<path d="M110 50l10 6v12l-10 6-10-6V56z"/>',
    dots:'<circle cx="100" cy="61" r="3.5"/><circle cx="110" cy="61" r="3.5"/><circle cx="120" cy="61" r="3.5"/>'
  };

  var uid = 0;
  function soap(p){
    var id = 'sg' + (++uid);
    var light = p.tone === 'light';
    var s = light ? 'rgba(255,255,255,.8)' : 'rgba(24,36,28,.55)';
    return '<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/>' +
      '</linearGradient></defs>' +
      '<ellipse cx="110" cy="136" rx="82" ry="8" fill="rgba(0,0,0,.14)"/>' +
      '<rect x="20" y="20" width="180" height="108" rx="30" fill="'+p.color+'"/>' +
      '<rect x="20" y="20" width="180" height="108" rx="30" fill="url(#'+id+')"/>' +
      '<rect x="50" y="42" width="120" height="66" rx="18" fill="'+(light?'rgba(255,255,255,.1)':'rgba(0,0,0,.06)')+'" stroke="'+s+'" stroke-opacity=".4"/>' +
      '<g fill="'+s+'" stroke="'+s+'" stroke-width="1.5" stroke-linecap="round">'+ICONS[p.motif]+'</g>' +
      '<text x="110" y="96" text-anchor="middle" font-family="\'Young Serif\',Georgia,serif" font-size="22" fill="'+s+'">nice</text>' +
      '</svg>';
  }

  var $ = function(s){ return document.querySelector(s); };
  var byId = function(id){ return PRODUCTS.filter(function(p){ return p.id === id; })[0]; };
  var fmt = function(n){ return 'RM ' + n.toFixed(2); };
  var priceFor = function(p, size){ return size === 'set' ? Math.round(p.price * 3 * SET_DISCOUNT * 100) / 100 : p.price; };
  var sizeLabel = function(size){ return size === 'set' ? 'Set of 3 bars' : 'Single bar, 100 g'; };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Cart state ---------- */
  var cart = load();
  function load(){
    try{
      var raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      if(!Array.isArray(raw)) return [];
      return raw.filter(function(i){ return i && byId(i.id) && (i.size === 'bar' || i.size === 'set') && i.qty > 0; });
    }catch(e){ return []; }
  }
  function save(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(cart)); }catch(e){} }

  function totals(){
    var lines = cart.map(function(i){
      var p = byId(i.id), price = priceFor(p, i.size);
      return {id:i.id, size:i.size, qty:i.qty, p:p, price:price, key:i.id+'|'+i.size};
    });
    var sub = lines.reduce(function(a,l){ return a + l.price * l.qty; }, 0);
    var ship = (sub === 0 || sub >= FREE_SHIP) ? 0 : SHIP;
    var items = lines.reduce(function(a,l){ return a + l.qty; }, 0);
    return {lines:lines, sub:sub, ship:ship, total:sub+ship, items:items};
  }

  function addToCart(id, size, qty){
    size = size || 'bar'; qty = qty || 1;
    var found = cart.filter(function(i){ return i.id === id && i.size === size; })[0];
    if(found) found.qty += qty; else cart.push({id:id, size:size, qty:qty});
    save(); renderCart(); bump();
  }
  function changeQty(key, delta){
    var parts = key.split('|');
    var it = cart.filter(function(i){ return i.id === parts[0] && i.size === parts[1]; })[0];
    if(!it) return;
    it.qty += delta;
    if(it.qty <= 0) cart = cart.filter(function(i){ return i !== it; });
    save(); renderCart();
  }
  function removeLine(key){
    var parts = key.split('|');
    cart = cart.filter(function(i){ return !(i.id === parts[0] && i.size === parts[1]); });
    save(); renderCart();
  }
  function bump(){
    var c = $('#count'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  }

  var tt;
  function toast(msg){
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function(){ t.classList.remove('show'); }, 2200);
  }

  /* ---------- Dialog helpers ---------- */
  var dlgs = Array.prototype.slice.call(document.querySelectorAll('dialog'));
  function syncLock(){ document.documentElement.style.overflow = dlgs.some(function(d){ return d.open; }) ? 'hidden' : ''; }
  dlgs.forEach(function(d){
    d.addEventListener('close', syncLock);
    d.addEventListener('click', function(e){ if(e.target === d) d.close(); });
  });
  function openDlg(d){ if(!d.open) d.showModal(); syncLock(); }

  var X_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';

  /* ---------- Render: filters + grid ---------- */
  var filter = 'all';
  function renderChips(){
    $('#chips').innerHTML = CATS.map(function(c){
      return '<button type="button" class="chip" data-cat="'+c[0]+'" aria-pressed="'+(filter===c[0])+'">'+c[1]+'</button>';
    }).join('');
  }
  function tileHTML(p, observed){
    return '<article class="tile reveal"'+(observed ? ' data-reveal' : '')+' style="--c:'+p.color+'">' +
      '<button type="button" class="tile-art" data-open="'+p.id+'" aria-label="View details for '+p.name+'">'+soap(p)+'</button>' +
      '<div class="tile-info"><div><h3>'+p.name+'</h3><p class="notes">'+p.notes+'</p></div><p class="price">'+fmt(p.price)+'</p></div>' +
      '<button type="button" class="btn" data-add="'+p.id+'" aria-label="Add '+p.name+' to cart">Add to cart</button>' +
    '</article>';
  }
  function renderGrid(){
    var list = PRODUCTS.filter(function(p){ return filter === 'all' || p.cat === filter; });
    var g = $('#grid');
    g.innerHTML = list.length
      ? list.map(function(p){ return tileHTML(p, true); }).join('')
      : '<p class="empty">No soaps match this filter yet.</p>';
    observeReveal(g);
  }
  var BEST = ['pandan','serai','rose','oat','goat','melur'];
  function renderCarousel(){
    $('#bestTrack').innerHTML = BEST.map(function(id){ return tileHTML(byId(id), false); }).join('');
  }

  /* ---------- Render: quick view ---------- */
  var qvId = null;
  function openQV(id){
    var p = byId(id); qvId = id;
    $('#qvBody').innerHTML =
      '<div class="qv">' +
        '<button type="button" class="icon-btn" data-close aria-label="Close">'+X_ICON+'</button>' +
        '<div class="qv-art" style="--c:'+p.color+'">'+soap(p)+'</div>' +
        '<div class="qv-info">' +
          '<div><h2>'+p.name+'</h2><p class="notes">'+p.notes+'</p></div>' +
          '<p>'+p.desc+'</p>' +
          '<p class="ing"><strong>Ingredients:</strong> '+p.ing+'</p>' +
          '<fieldset><legend>Choose a size</legend>' +
            '<label class="opt"><span><input type="radio" name="size" value="bar" checked>Single bar <small>100 g</small></span><span>'+fmt(priceFor(p,'bar'))+'</span></label>' +
            '<label class="opt"><span><input type="radio" name="size" value="set">Set of 3 <small>save 10%</small></span><span>'+fmt(priceFor(p,'set'))+'</span></label>' +
          '</fieldset>' +
          '<button type="button" class="btn primary block" id="qvAdd">Add to cart</button>' +
        '</div>' +
      '</div>';
    openDlg($('#dlgQV'));
  }

  /* ---------- Render: cart ---------- */
  function lineHTML(l, editable){
    var side = editable
      ? '<div class="line-side"><p>'+fmt(l.price*l.qty)+'</p><button type="button" class="link" data-rm="'+l.key+'" aria-label="Remove '+l.p.name+' from cart">Remove</button></div>'
      : '<div class="line-side"><p>'+fmt(l.price*l.qty)+'</p></div>';
    var qty = editable
      ? '<div class="qty"><button type="button" data-dec="'+l.key+'" aria-label="Decrease quantity of '+l.p.name+'">\u2212</button><span aria-live="polite">'+l.qty+'</span><button type="button" data-inc="'+l.key+'" aria-label="Increase quantity of '+l.p.name+'">+</button></div>'
      : '';
    return '<li class="line"><div class="thumb" style="--c:'+l.p.color+'">'+soap(l.p)+'</div>' +
      '<div><p class="line-name">'+l.p.name+'</p><p class="line-meta">'+sizeLabel(l.size)+(editable?'':' \u00d7 '+l.qty)+'</p>'+qty+'</div>'+side+'</li>';
  }

  function renderCart(){
    var t = totals();
    var count = $('#count');
    count.textContent = t.items;
    $('#cartBtn').setAttribute('aria-label', 'Open cart, ' + t.items + (t.items === 1 ? ' item' : ' items'));

    var msg = $('#shipMsg'), bar = $('#shipBar');
    if(t.sub === 0){ msg.textContent = 'Free delivery on orders over ' + fmt(FREE_SHIP) + '.'; bar.style.width = '0%'; }
    else if(t.sub >= FREE_SHIP){ msg.textContent = 'You\u2019ve got free delivery.'; bar.style.width = '100%'; }
    else { msg.textContent = 'Add ' + fmt(FREE_SHIP - t.sub) + ' more for free delivery.'; bar.style.width = Math.round(t.sub / FREE_SHIP * 100) + '%'; }

    var body = $('#cartBody'), foot = $('#cartFoot');
    if(!t.lines.length){
      body.innerHTML = '<div class="empty-cart"><h3>Your cart is empty</h3><p>Pick a bar you like and it will show up here.</p><a class="btn primary" href="#shop" data-close>Browse soap</a></div>';
      foot.innerHTML = '';
      foot.style.display = 'none';
    } else {
      body.innerHTML = '<ul class="lines">' + t.lines.map(function(l){ return lineHTML(l, true); }).join('') + '</ul>';
      foot.style.display = '';
      foot.innerHTML =
        '<div class="row"><span>Subtotal</span><span>'+fmt(t.sub)+'</span></div>' +
        '<div class="row"><span>Delivery</span><span>'+(t.ship === 0 ? 'Free' : fmt(t.ship))+'</span></div>' +
        '<div class="row total"><span>Total</span><span>'+fmt(t.total)+'</span></div>' +
        '<button type="button" class="btn primary block" data-checkout style="margin-top:.6rem">Check out</button>';
    }
  }

  /* ---------- Render: checkout ---------- */
  var checkoutRef = null;
  function newRef(){
    if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(ch){
      var r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }
  function openCheckout(){
    var t = totals();
    if(!t.lines.length) return;
    if(!checkoutRef) checkoutRef = newRef();
    var stateOpts = '<option value="" selected disabled>Select state</option>' + STATES.map(function(s){ return '<option>'+s+'</option>'; }).join('');
    $('#checkoutBody').innerHTML =
      '<div class="co">' +
        '<button type="button" class="icon-btn" data-close aria-label="Close checkout">'+X_ICON+'</button>' +
        '<form class="co-form" id="coForm" novalidate>' +
          '<h2>Check out</h2>' +
          '<div class="fields">' +
            '<label class="f full">Full name<input name="name" required autocomplete="name"></label>' +
            '<label class="f">Email<input name="email" type="email" required autocomplete="email"></label>' +
            '<label class="f">Phone<input name="phone" type="tel" required pattern="[0-9+\\s\\-]{8,15}" autocomplete="tel" placeholder="012 345 6789"></label>' +
            '<label class="f full">Address<input name="address" required autocomplete="street-address"></label>' +
            '<label class="f">Postcode<input name="postcode" required pattern="[0-9]{5}" inputmode="numeric" maxlength="5" autocomplete="postal-code"></label>' +
            '<label class="f">State<select name="state" required>'+stateOpts+'</select></label>' +
          '</div>' +
          '<fieldset><legend>Payment method</legend>' +
            '<label class="opt"><span><input type="radio" name="pay" value="cod" checked>Cash on delivery</span></label>' +
            '<label class="opt"><span><input type="radio" name="pay" value="transfer">Bank transfer or DuitNow QR <small>We\u2019ll send the details after you order</small></span></label>' +
          '</fieldset>' +
          '<div class="sr" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>' +
          '<p class="fine">'+(LIVE ? 'You won\u2019t be charged online. We\u2019ll confirm your order by email or phone.' : 'This is a demo checkout. No order is sent and no payment is taken.')+'</p>' +
          '<p class="form-error" id="coError" role="alert" hidden></p>' +
          '<button class="btn primary block" type="submit">Place order \u2013 '+fmt(t.total)+'</button>' +
        '</form>' +
        '<aside class="co-sum" aria-label="Order summary">' +
          '<h3>Your order</h3>' +
          '<ul class="lines">'+t.lines.map(function(l){ return lineHTML(l, false); }).join('')+'</ul>' +
          '<div class="row"><span>Subtotal</span><span>'+fmt(t.sub)+'</span></div>' +
          '<div class="row"><span>Delivery</span><span>'+(t.ship===0?'Free':fmt(t.ship))+'</span></div>' +
          '<div class="row total"><span>Total</span><span>'+fmt(t.total)+'</span></div>' +
        '</aside>' +
      '</div>';
    openDlg($('#dlgCheckout'));
  }

  function showDone(name, orderNo, res, pay){
    var msg;
    if(!LIVE){
      msg = '<p>Your order <span class="order-no">'+orderNo+'</span> is confirmed. This was a demo checkout, so nothing was sent and no payment was taken.</p>';
    } else if(pay === 'transfer'){
      msg = '<p>Your order <span class="order-no">'+orderNo+'</span> is in'+(res && res.total != null ? ' for '+fmt(Number(res.total)) : '')+'. We\u2019ll message you shortly with bank transfer and DuitNow details, and pack your order once payment arrives.</p>';
    } else {
      msg = '<p>Your order <span class="order-no">'+orderNo+'</span> is in'+(res && res.total != null ? '. Please have '+fmt(Number(res.total))+' ready when it arrives' : '')+'. We\u2019ll confirm your delivery details by email or phone shortly.</p>';
    }
    $('#checkoutBody').innerHTML =
      '<div class="done" style="position:relative">' +
        '<h2>Thank you, <span id="doneName"></span>.</h2>' + msg +
        '<button type="button" class="btn primary" data-close>Continue shopping</button>' +
      '</div>';
    $('#doneName').textContent = name.split(' ')[0] || name;
  }

  function submitOrder(form){
    var f = form.elements;
    var btn = form.querySelector('button[type="submit"]');
    var err = $('#coError');
    var name = f.name.value.trim();
    var pay = (form.querySelector('input[name="pay"]:checked') || {}).value || 'cod';
    var payload = {
      name: name,
      email: f.email.value.trim(),
      phone: f.phone.value.trim(),
      address: f.address.value.trim(),
      postcode: f.postcode.value.trim(),
      state: f.state.value,
      payment_method: pay,
      website: f.website.value,
      client_ref: checkoutRef,
      items: cart.map(function(i){ return {product_id:i.id, size:i.size, qty:i.qty}; })
    };
    err.hidden = true;

    function finish(orderNo, res){
      cart = []; save(); renderCart(); checkoutRef = null;
      showDone(name, orderNo, res, pay);
    }

    if(!LIVE){ finish('NS-' + String(Math.floor(100000 + Math.random() * 900000)), null); return; }

    var label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Placing order\u2026';
    var ctrl = new AbortController();
    var timer = setTimeout(function(){ ctrl.abort(); }, 15000);

    fetch(CFG.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/rpc/place_order', {
      method: 'POST',
      headers: {'Content-Type':'application/json', 'apikey':CFG.SUPABASE_ANON_KEY, 'Authorization':'Bearer ' + CFG.SUPABASE_ANON_KEY},
      body: JSON.stringify({payload: payload}),
      signal: ctrl.signal
    }).then(function(r){
      return r.json().catch(function(){ return null; }).then(function(body){
        if(!r.ok) throw {body: body};
        return body;
      });
    }).then(function(res){
      clearTimeout(timer);
      finish(res.order_no, res);
    }, function(e){
      clearTimeout(timer);
      var known = e && e.body && e.body.code === 'P0001' && e.body.message;
      err.textContent = known ? e.body.message : 'We couldn\u2019t place your order. Please check your connection and try again.';
      err.hidden = false;
      btn.disabled = false; btn.textContent = label;
    });
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', function(e){
    var t = e.target, el;
    if((el = t.closest('[data-cat]'))){ filter = el.getAttribute('data-cat'); renderChips(); renderGrid(); return; }
    if((el = t.closest('[data-open]'))){ openQV(el.getAttribute('data-open')); return; }
    if((el = t.closest('[data-add]'))){ addToCart(el.getAttribute('data-add'), 'bar', 1); toast('Added to cart'); return; }
    if(t.closest('#qvAdd')){
      var size = (document.querySelector('#qvBody input[name="size"]:checked') || {}).value || 'bar';
      addToCart(qvId, size, 1);
      $('#dlgQV').close();
      toast('Added to cart');
      return;
    }
    if((el = t.closest('[data-inc]'))){ changeQty(el.getAttribute('data-inc'), 1); return; }
    if((el = t.closest('[data-dec]'))){ changeQty(el.getAttribute('data-dec'), -1); return; }
    if((el = t.closest('[data-rm]'))){ removeLine(el.getAttribute('data-rm')); return; }
    if(t.closest('[data-checkout]')){ $('#dlgCart').close(); openCheckout(); return; }
    if((el = t.closest('[data-close]'))){ var d = el.closest('dialog'); if(d) d.close(); return; }
  });

  $('#cartBtn').addEventListener('click', function(){ renderCart(); openDlg($('#dlgCart')); });

  document.addEventListener('submit', function(e){
    if(e.target.id === 'coForm'){
      e.preventDefault();
      var form = e.target;
      if(!form.checkValidity()){ form.reportValidity(); return; }
      submitOrder(form);
    }
    if(e.target.id === 'newsForm'){
      e.preventDefault();
      $('#news').innerHTML = '<div><h2>You\u2019re on the list.</h2><p>We\u2019ll email you when the next batch is ready.</p></div>';
    }
  });

  /* Hero bar: lather */
  var heroBar = $('#heroBar'), bubbles = $('#bubbles');
  var heroProduct = {color:'#A9CF98', motif:'leaf', tone:'dark'};
  heroBar.innerHTML = soap(heroProduct);
  heroBar.addEventListener('click', function(){
    heroBar.classList.remove('wiggle'); void heroBar.offsetWidth; heroBar.classList.add('wiggle');
    if(reduceMotion.matches) return;
    for(var i = 0; i < 14; i++){
      var b = document.createElement('span');
      var s = 10 + Math.random() * 34;
      b.className = 'bubble';
      b.style.cssText = 'width:'+s+'px;height:'+s+'px;left:'+(15 + Math.random()*70)+'%;top:'+(30 + Math.random()*40)+'%;' +
        '--dx:'+((Math.random()-.5)*90)+'px;--dy:'+(-(80 + Math.random()*150))+'px;animation-delay:'+(Math.random()*.25)+'s';
      b.addEventListener('animationend', function(){ this.remove(); });
      bubbles.appendChild(b);
    }
  });

  /* ---------- Scroll reveal (IntersectionObserver, runs once per element) ---------- */
  var docEl = document.documentElement;
  var revealIO = null;
  var STEP = 70; // ms between siblings that enter together

  function clearDelay(e){
    if(e.target !== this) return;
    this.style.transitionDelay = '';
    this.removeEventListener('transitionend', clearDelay);
  }
  function showEl(el, delay){
    if(delay){
      el.style.transitionDelay = delay + 'ms';
      el.addEventListener('transitionend', clearDelay);
    }
    el.classList.add('in');
  }
  function onReveal(entries){
    var vis = entries.filter(function(e){ return e.isIntersecting; }).map(function(e){ return e.target; });
    // Read top-to-bottom, left-to-right so the stagger follows the layout
    vis.sort(function(a, b){
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return (Math.round(ra.top / 40) - Math.round(rb.top / 40)) || (ra.left - rb.left);
    });
    var n = 0;
    vis.forEach(function(el){
      revealIO.unobserve(el);
      if(el.hasAttribute('data-reveal-group')){
        Array.prototype.forEach.call(el.children, function(c, i){ showEl(c, Math.min(i, 4) * STEP); });
      } else {
        showEl(el, Math.min(n, 5) * STEP);
        n++;
      }
    });
  }
  function observeReveal(scope){
    if(!revealIO) return;
    Array.prototype.forEach.call(scope.querySelectorAll('[data-reveal],[data-reveal-group]'), function(el){
      if(!el.classList.contains('in')) revealIO.observe(el);
    });
  }
  function setupReveal(){
    if(!docEl.classList.contains('js-reveal')) return;
    revealIO = new IntersectionObserver(onReveal, {threshold:0.12, rootMargin:'0px 0px -6% 0px'});
    observeReveal(document);
    window.__revealReady = true;
  }
  if(reduceMotion.addEventListener){
    reduceMotion.addEventListener('change', function(){
      if(reduceMotion.matches){
        docEl.classList.remove('js-reveal');
        if(revealIO) revealIO.disconnect();
      }
    });
  }

  /* ---------- Best sellers carousel ---------- */
  function setupCarousel(){
    var track = $('#bestTrack'), prev = $('#bestPrev'), next = $('#bestNext');
    function step(){
      var first = track.firstElementChild;
      if(!first) return track.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      return first.getBoundingClientRect().width + gap;
    }
    function update(){
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.setAttribute('aria-disabled', track.scrollLeft <= 2 ? 'true' : 'false');
      next.setAttribute('aria-disabled', track.scrollLeft >= max ? 'true' : 'false');
    }
    function go(dir){
      track.scrollBy({left: dir * step(), behavior: reduceMotion.matches ? 'auto' : 'smooth'});
    }
    prev.addEventListener('click', function(){ if(prev.getAttribute('aria-disabled') !== 'true') go(-1); });
    next.addEventListener('click', function(){ if(next.getAttribute('aria-disabled') !== 'true') go(1); });
    track.addEventListener('keydown', function(e){
      if(e.target !== track) return;
      if(e.key === 'ArrowRight'){ e.preventDefault(); go(1); }
      else if(e.key === 'ArrowLeft'){ e.preventDefault(); go(-1); }
    });
    var raf = 0;
    track.addEventListener('scroll', function(){
      if(raf) return;
      raf = requestAnimationFrame(function(){ raf = 0; update(); });
    }, {passive:true});
    window.addEventListener('resize', update, {passive:true});
    update();
  }

  /* ---------- Sticky category bar ---------- */
  function setupSticky(){
    var header = $('.site-header'), nav = $('#shopNav'), sentinel = $('#shopSentinel');
    function setH(){ docEl.style.setProperty('--header-h', header.offsetHeight + 'px'); }
    setH();
    window.addEventListener('resize', setH, {passive:true});
    window.addEventListener('load', setH);
    if(!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function(entries){
      var e = entries[0];
      nav.classList.toggle('stuck', !e.isIntersecting && e.boundingClientRect.top < header.offsetHeight + 2);
    }, {rootMargin: '-' + (header.offsetHeight + 1) + 'px 0px 0px 0px', threshold: 0}).observe(sentinel);
  }

  /* ---------- Hero backdrop parallax (desktop only, very subtle) ---------- */
  function setupParallax(){
    var stage = document.querySelector('.stage'), hero = document.querySelector('.hero');
    if(!stage || !hero || !('IntersectionObserver' in window)) return;
    var mq = window.matchMedia('(min-width: 760px)');
    var ticking = false, visible = true;
    function apply(){
      ticking = false;
      if(!mq.matches || reduceMotion.matches){ stage.style.removeProperty('--py'); return; }
      stage.style.setProperty('--py', (Math.min(window.scrollY, 600) * 0.07).toFixed(1) + 'px');
    }
    new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }).observe(hero);
    window.addEventListener('scroll', function(){
      if(!visible || ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }, {passive:true});
    window.addEventListener('resize', apply, {passive:true});
  }

  /* Init */
  renderChips();
  renderGrid();
  renderCarousel();
  renderCart();
  setupReveal();
  setupCarousel();
  setupSticky();
  setupParallax();
})();
