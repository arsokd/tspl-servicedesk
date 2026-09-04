// ============================================================================
// TSPL ServiceDesk — Role-Based Authentication Guard & Hierarchy Scoping
// ============================================================================

(function () {
  // Check auth state on page initialization
  auth.onAuthStateChanged(function (user) {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'login.html') return;

    if (!user) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'login.html';
      return;
    }

    // Developer Recognition: ars.okd@gmail.com automatically granted full Admin / Developer privileges
    if (user.email && user.email.toLowerCase() === 'ars.okd@gmail.com') {
      var devName = 'Developer (ars.okd)';
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', devName);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRo', 'NATIONAL');
      localStorage.setItem('userClientBank', '');
      localStorage.setItem('userUid', user.uid);
      localStorage.setItem('isDeveloper', 'true');

      // Ensure Developer profile exists in Firestore
      db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        name: devName,
        role: 'admin',
        employeeId: 'DEV-ARS-001',
        mobile: '+91 99999 99999',
        ro: 'NATIONAL',
        isActive: true,
        mustChangePassword: false,
        bgvStatus: 'Cleared',
        isDeveloper: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(function (e) {
        console.warn('Developer profile sync:', e);
      });

      updateHeaderProfile(devName, 'DEV · ADMIN');
      return;
    }

    var role = localStorage.getItem('userRole');
    var name = localStorage.getItem('userName') || user.displayName || user.email;

    if (!role) {
      // Fetch user profile from Firestore if missing from cache
      db.collection('users').doc(user.uid).get().then(function (doc) {
        if (doc.exists) {
          var data = doc.data();
          localStorage.setItem('userRole', data.role || 'engineer');
          localStorage.setItem('userName', data.name || user.email);
          localStorage.setItem('userEmail', data.email || user.email);
          localStorage.setItem('userRo', data.ro || '');
          localStorage.setItem('userClientBank', data.clientBank || '');
          localStorage.setItem('userUid', user.uid);
          updateHeaderProfile(data.name || user.email, data.role || 'engineer');
        } else {
          // If no profile exists, sign out
          auth.signOut().then(function () {
            window.location.href = 'login.html';
          });
        }
      }).catch(function () {
        window.location.href = 'login.html';
      });
    } else {
      updateHeaderProfile(name, role);
    }
  });
})();

/**
 * Updates username & role display badge in DOM
 */
function updateHeaderProfile(name, role) {
  var displayEl = document.getElementById('display-username');
  if (displayEl) {
    var isDev = localStorage.getItem('isDeveloper') === 'true' || (role && role.indexOf('DEV') !== -1);
    var badgeClass = isDev
      ? 'bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded ml-1 font-mono uppercase tracking-wider text-[11px] shadow-sm'
      : 'bg-indigo-800 text-indigo-100 px-2 py-0.5 rounded ml-1 font-mono uppercase text-xs';
    displayEl.innerHTML = '<span class="font-semibold">' + (name || 'User') + '</span> <span class="' + badgeClass + '">' + (role || 'User') + '</span>';
  }
}

/**
 * Role authorization check on restricted pages
 */
function checkAuth(allowedRoles) {
  var userEmail = localStorage.getItem('userEmail') || (auth.currentUser ? auth.currentUser.email : '');
  if (userEmail && userEmail.toLowerCase() === 'ars.okd@gmail.com') {
    return true; // Full unrestricted access for Developer
  }

  var userRole = localStorage.getItem('userRole');
  if (!userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;

  if (allowedRoles.indexOf(userRole) === -1) {
    if (userRole === 'engineer') {
      window.location.href = 'engineer.html';
    } else if (userRole === 'client') {
      window.location.href = 'client-portal.html';
    } else {
      window.location.href = 'dashboard.html';
    }
    return false;
  }
  return true;
}

/**
 * Global Logout handler
 */
function handleLogout() {
  if (typeof stopTracking === 'function') {
    try {
      stopTracking();
    } catch (e) {
      console.warn('Tracking stop error during logout:', e);
    }
  }

  auth.signOut().then(function () {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
  }).catch(function (err) {
    console.error('Logout error:', err);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
  });
}

// Bind logout button if present
document.addEventListener('DOMContentLoaded', function () {
  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      handleLogout();
    });
  }
});

/**
 * Builds responsive, role-aware top navigation bar
 */
function buildNav(activePage) {
  var userRole = localStorage.getItem('userRole') || 'callcentre';

  var navItems = [
    { name: 'Dashboard', file: 'dashboard.html', roles: ['admin', 'callcentre', 'techsupport', 'rm', 'regionalhead', 'unithead'] },
    { name: 'SLA Board', file: 'sla-board.html', roles: ['admin', 'callcentre', 'rm', 'regionalhead'] },
    { name: 'Dockets', file: 'dockets.html', roles: ['admin', 'callcentre', 'techsupport', 'rm', 'regionalhead', 'unithead'] },
    { name: 'Live Map', file: 'live-map.html', roles: ['admin', 'callcentre', 'rm', 'regionalhead'] },
    { name: 'Parts', file: 'parts.html', roles: ['admin', 'techsupport'] },
    { name: 'Reports', file: 'reports.html', roles: ['admin', 'rm', 'regionalhead', 'unithead'] },
    { name: 'Clock Ledger', file: 'clock-ledger-report.html', roles: ['admin', 'techsupport', 'rm', 'regionalhead', 'unithead'] },
    { name: 'Billing', file: 'billing.html', roles: ['admin'] },
    { name: 'Compliance', file: 'compliance.html', roles: ['admin'] },
    { name: 'Masters', file: 'masters-atm.html', roles: ['admin'] },
    { name: 'Setup', file: 'setup-data.html', roles: ['admin'] }
  ];

  var filtered = navItems.filter(function (item) {
    return item.roles.indexOf(userRole) !== -1;
  });

  var navContainer = document.getElementById('main-nav');
  if (!navContainer) return;

  var desktopLinks = filtered.map(function (item) {
    var isActive = item.file === activePage;
    var classes = isActive
      ? 'border-b-2 border-white text-white font-semibold px-2.5 py-1.5 text-xs tracking-wide whitespace-nowrap'
      : 'text-indigo-100 hover:text-white hover:bg-indigo-700 px-2.5 py-1.5 rounded text-xs font-normal transition whitespace-nowrap';
    return '<a href="' + item.file + '" class="' + classes + '">' + item.name + '</a>';
  }).join('');

  var mobileLinks = filtered.map(function (item) {
    var isActive = item.file === activePage;
    var classes = isActive
      ? 'bg-indigo-800 text-white block px-3 py-2 rounded-md text-base font-medium'
      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium';
    return '<a href="' + item.file + '" class="' + classes + '">' + item.name + '</a>';
  }).join('');

  navContainer.innerHTML = 
    '<nav class="bg-[#4F46E5] text-white shadow-md">' +
      '<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">' +
        '<div class="flex items-center justify-between h-14">' +
          '<div class="flex items-center gap-4 min-w-0">' +
            '<a href="dashboard.html" class="flex-shrink-0 flex items-center gap-2">' +
              '<img src="assets/tspl-logo.svg" alt="TSPL Logo" class="h-8 w-auto object-contain rounded bg-white/10 p-0.5 border border-white/20" />' +
              '<span class="font-bold text-sm sm:text-base tracking-wider text-white whitespace-nowrap">TSPL ServiceDesk</span>' +
            '</a>' +
            '<div class="hidden lg:flex items-center space-x-0.5 overflow-x-auto py-1">' +
              desktopLinks +
            '</div>' +
          '</div>' +
          '<div class="hidden md:flex items-center space-x-3 shrink-0">' +
            '<div id="display-username" class="text-xs"></div>' +
            '<button id="logout-btn" onclick="handleLogout()" class="bg-indigo-700 hover:bg-indigo-800 text-xs px-2.5 py-1.5 rounded transition font-medium border border-indigo-500 whitespace-nowrap">Sign Out</button>' +
          '</div>' +
          '<div class="flex lg:hidden">' +
            '<button id="mobile-menu-btn" type="button" class="p-1.5 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none">' +
              '<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="mobile-menu" class="hidden lg:hidden px-2 pt-2 pb-3 space-y-1 bg-indigo-900 border-t border-indigo-700">' +
        mobileLinks +
        '<div class="pt-4 pb-2 border-t border-indigo-800">' +
          '<div class="px-3 py-1 text-xs text-indigo-200 font-medium" id="mobile-display-username"></div>' +
          '<button onclick="handleLogout()" class="mt-2 w-full text-left bg-indigo-800 text-white px-3 py-2 rounded-md text-sm font-medium">Sign Out</button>' +
        '</div>' +
      '</div>' +
    '</nav>';

  var mobileBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
  }

  var name = localStorage.getItem('userName');
  var role = localStorage.getItem('userRole');
  if (name && role) {
    updateHeaderProfile(name, role);
    var mobEl = document.getElementById('mobile-display-username');
    if (mobEl) mobEl.textContent = name + ' (' + role + ')';
  }
}

// ============================================================================
// SECTION 6: HIERARCHY SCOPING HELPERS
// ============================================================================

/**
 * SCOPED DOCKET QUERY:
 * This helper enforces strict row-level security across the ATM service chain.
 * It prevents unauthorized users from downloading ticket records outside their
 * assigned operational perimeter or regional hierarchy.
 *
 * Scoping matrix:
 * - Engineer     -> Assigned specifically to them (.where('engineerId','==', uid))
 * - RM           -> ATMs supervised by this Regional Manager (.where('rmUid','==', uid))
 * - RegionalHead -> ATMs supervised across their Regional Head territory (.where('regionalHeadUid','==', uid))
 * - UnitHead     -> ATMs supervised across their Unit Head zone (.where('unitHeadUid','==', uid))
 * - Bank Client  -> ATMs owned by their specific bank (.where('bankName','==', userClientBank))
 * - Admin / CallCentre / TechSupport -> Unscoped nationwide view
 */
function scopedDocketQuery(customBaseRef) {
  var base = customBaseRef || db.collection('dockets');
  var role = localStorage.getItem('userRole');
  var uid = localStorage.getItem('userUid') || (auth.currentUser ? auth.currentUser.uid : null);
  var bank = localStorage.getItem('userClientBank');

  if (!uid) return base;

  if (role === 'engineer') {
    return base.where('assignedEngineerId', '==', uid);
  }
  if (role === 'rm') {
    return base.where('rmUid', '==', uid);
  }
  if (role === 'regionalhead') {
    return base.where('regionalHeadUid', '==', uid);
  }
  if (role === 'unithead') {
    return base.where('unitHeadUid', '==', uid);
  }
  if (role === 'client' && bank) {
    return base.where('bankName', '==', bank);
  }

  // admin, callcentre, techsupport see nationwide dockets
  return base;
}

/**
 * SCOPED LIVE LOCATIONS REF:
 * Scopes GPS live queries for Regional Managers so they only track engineers within
 * their designated Regional Office (RO), reducing bandwidth to about 1/4th of nationwide volume.
 */
function scopedLiveLocationsRef() {
  var role = localStorage.getItem('userRole');
  var ro = localStorage.getItem('userRo');

  var baseRef = rtdb.ref('liveLocations');
  if ((role === 'rm' || role === 'regionalhead') && ro) {
    return baseRef.orderByChild('ro').equalTo(ro);
  }
  return baseRef;
}

/**
 * STATS DOC ID:
 * Directs dashboard metrics to read pre-aggregated counter documents:
 * "live" for central office roles, or "ro_<RO>" for regional managers.
 */
function statsDocId() {
  var role = localStorage.getItem('userRole');
  var ro = localStorage.getItem('userRo');

  if (role === 'rm' && ro) {
    return 'ro_' + ro.toLowerCase().replace(/\s+/g, '_');
  }
  return 'live';
}
