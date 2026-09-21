(function(){
  'use strict';

  var CFG = window.NICE_SOAP_CONFIG || {};
  var token = localStorage.getItem('ns_admin_token');

  // Guard: Redirect to login immediately if no token exists
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Fallback catalog matching storefront defaults[cite: 2]
  var PRODUCTS = [
    {id:'pandan', name:'Pandan & Coconut Milk', cat:'herbal', price:18, notes:'Fresh pandan, warm coconut, a little vanilla'},
    {id:'serai', name:'Serai Bright', cat:'citrus', price:16, notes:'Lemongrass, lemon peel, a hint of ginger'},
    {id:'rose', name:'Rosewater Dawn', cat:'floral', price:19, notes:'Damask rose, geranium, soft musk'},
    {id:'limau', name:'Limau Purut Zest', cat:'citrus', price:17, notes:'Kaffir lime, bergamot, green tea'},
    {id:'charcoal', name:'Charcoal & Tea Tree', cat:'herbal', price:20, notes:'Tea tree, peppermint, cedar'},
    {id:'melur', name:'Melur Night', cat:'floral', price:19, notes:'Jasmine, sandalwood, a touch of amber'},
    {id:'oat', name:'Oat & Honey', cat:'unscented', price:15, notes:'No added fragrance. Just oats and honey'},
    {id:'goat', name:'Plain Goat Milk', cat:'unscented', price:21, notes:'Fragrance-free and extra creamy'}
  ];

  var allOrders = [];

  var $ = function(s){ return document.querySelector(s); };
  var fmt = function(n){ return 'RM ' + Number(n || 0).toFixed(2); };

  var tt;
  function toast(msg){
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg; 
    t.classList.add('show');
    clearTimeout(tt); 
    tt = setTimeout(function(){ t.classList.remove('show'); }, 2200);
  }

  /* Fetch live orders using the Authenticated Session Token */
  function loadOrders(){
    var statusEl = $('#dbStatus');
    if (statusEl) statusEl.textContent = 'Connecting to Supabase...';

    var url = CFG.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/orders?select=*&order=created_at.desc';

    fetch(url, {
      headers: {
        'apikey': CFG.SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + token
      }
    })
    .then(function(res){
      if (res.status === 401 || res.status === 403) {
        // Token is invalid or expired
        localStorage.removeItem('ns_admin_token');
        localStorage.removeItem('ns_admin_user');
        window.location.href = 'login.html';
        return;
      }
      return res.json();
    })
    .then(function(data){
      if (Array.isArray(data)) {
        allOrders = data;
        if (statusEl) statusEl.textContent = 'Connected to Live Supabase Database';
        renderAll();
      }
    })
    .catch(function(){
      if (statusEl) statusEl.textContent = 'Offline / Failed to fetch orders';
    });
  }

  /* Update Order Status with Authenticated Patch Query */
  function updateOrderStatus(orderNo, newStatus){
    var url = CFG.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/orders?order_no=eq.' + encodeURIComponent(orderNo);
    fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CFG.SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + token,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ status: newStatus })
    })
    .then(function(r){
      if (r.ok) {
        toast('Status saved for ' + orderNo);
        var o = allOrders.find(function(item){ return item.order_no === orderNo; });
        if (o) o.status = newStatus;
        renderStats();
      } else {
        toast('Could not update order status');
      }
    })
    .catch(function(){ 
      toast('Network error updating status'); 
    });
  }

  /* Calculate and Display Metrics */
  function renderStats(){
    var rev = 0, units = 0;
    allOrders.forEach(function(o){
      if (o.status !== 'cancelled') {
        rev += Number(o.total || 0);
        if (Array.isArray(o.items)) {
          o.items.forEach(function(i){ units += (i.qty || 1); });
        }
      }
    });

    var count = allOrders.length;
    var aov = count ? (rev / count) : 0;

    if ($('#statRevenue')) $('#statRevenue').textContent = fmt(rev);
    if ($('#statOrders')) $('#statOrders').textContent = count;
    if ($('#statUnits')) $('#statUnits').textContent = units;
    if ($('#statAOV')) $('#statAOV').textContent = fmt(aov);
  }

  /* Render Customer Orders Table */
  function renderOrders(){
    var searchEl = $('#searchOrders');
    var filterEl = $('#filterStatus');
    var query = (searchEl ? searchEl.value : '').toLowerCase().trim();
    var statusFilter = filterEl ? filterEl.value : 'all';

    var filtered = allOrders.filter(function(o){
      var matchQ = !query || 
                   (o.order_no && o.order_no.toLowerCase().includes(query)) || 
                   (o.customer_name || o.name || '').toLowerCase().includes(query);
      var matchS = statusFilter === 'all' || (o.status || 'pending') === statusFilter;
      return matchQ && matchS;
    });

    var tbody = $('#ordersTbody');
    if (!tbody) return;

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;" class="fine">No matching orders found.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function(o){
      var itemsSummary = Array.isArray(o.items) ? o.items.map(function(i){
        return i.qty + 'x ' + (i.product_id || 'soap') + ' (' + (i.size || 'bar') + ')';
      }).join(', ') : '1x Bar';

      var status = o.status || 'pending';
      var orderNo = o.order_no || o.client_ref || 'NS-UNKNOWN';
      var name = o.customer_name || o.name || 'Guest';

      return '<tr>' +
        '<td><strong>' + orderNo + '</strong></td>' +
        '<td>' + name + '<br><small class="fine">' + (o.state || '') + '</small></td>' +
        '<td><small class="fine">' + (o.email || '') + '<br>' + (o.phone || '') + '</small></td>' +
        '<td><small>' + itemsSummary + '</small></td>' +
        '<td><strong>' + fmt(o.total) + '</strong></td>' +
        '<td><span class="fine">' + (o.payment_method === 'cod' ? 'COD' : 'Transfer') + '</span></td>' +
        '<td>' +
          '<select class="status-select" data-order="' + orderNo + '">' +
            '<option value="pending"' + (status === 'pending'?' selected':'') + '>Pending</option>' +
            '<option value="processing"' + (status === 'processing'?' selected':'') + '>Processing</option>' +
            '<option value="shipped"' + (status === 'shipped'?' selected':'') + '>Shipped</option>' +
            '<option value="delivered"' + (status === 'delivered'?' selected':'') + '>Delivered</option>' +
            '<option value="cancelled"' + (status === 'cancelled'?' selected':'') + '>Cancelled</option>' +
          '</select>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  /* Render Catalog Overview */
  function renderProducts(){
    var tbody = $('#productsTbody');
    if (!tbody) return;
    tbody.innerHTML = PRODUCTS.map(function(p){
      return '<tr>' +
        '<td><strong>' + p.name + '</strong></td>' +
        '<td><span class="fine">' + p.cat + '</span></td>' +
        '<td>' + fmt(p.price) + '</td>' +
        '<td>' + fmt(p.price * 3 * 0.9) + '</td>' +
        '<td><small class="fine">' + p.notes + '</small></td>' +
      '</tr>';
    }).join('');
  }

  function renderAll(){
    renderStats();
    renderOrders();
    renderProducts();
  }

  /* Event Listeners */
  var searchInput = $('#searchOrders');
  var statusFilter = $('#filterStatus');
  var logoutBtn = $('#logoutBtn');

  if (searchInput) searchInput.addEventListener('input', renderOrders);
  if (statusFilter) statusFilter.addEventListener('change', renderOrders);

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(){
      localStorage.removeItem('ns_admin_token');
      localStorage.removeItem('ns_admin_user');
      window.location.href = 'login.html';
    });
  }

  document.addEventListener('change', function(e){
    if (e.target.classList.contains('status-select') && e.target.hasAttribute('data-order')) {
      var orderNo = e.target.getAttribute('data-order');
      updateOrderStatus(orderNo, e.target.value);
    }
  });

  // Run on page load
  loadOrders();
})();