(function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    var REMOVED_KEY = 'sp_insect_removed';
    try {
        if (sessionStorage.getItem(REMOVED_KEY) === '1') {
            return;
        }
    } catch (e) {}

    var bug = document.createElement('div');
    bug.id = 'crawling-bug';
    bug.setAttribute('role', 'button');
    bug.setAttribute('aria-label', 'Catch the bug');
    bug.innerHTML =
        '<svg class="bug-svg" viewBox="0 0 48 68" xmlns="http://www.w3.org/2000/svg">' +
        '  <g fill="none" stroke="#0a0a0a" stroke-linecap="round">' +
        '    <path class="leg leg-left" style="transform-origin:100% 100%" d="M18 24 L6 15" stroke-width="3"/>' +
        '    <path class="leg leg-left" style="transform-origin:100% 50%" d="M16 33 L3 33" stroke-width="3"/>' +
        '    <path class="leg leg-left" style="transform-origin:100% 0%" d="M18 43 L6 52" stroke-width="3"/>' +
        '    <path class="leg leg-right" style="transform-origin:0% 100%" d="M30 24 L42 15" stroke-width="3"/>' +
        '    <path class="leg leg-right" style="transform-origin:0% 50%" d="M32 33 L45 33" stroke-width="3"/>' +
        '    <path class="leg leg-right" style="transform-origin:0% 0%" d="M30 43 L42 52" stroke-width="3"/>' +
        '    <path d="M20 10 L13 2" stroke-width="2.2"/>' +
        '    <path d="M28 10 L35 2" stroke-width="2.2"/>' +
        '  </g>' +
        '  <circle cx="13" cy="2" r="1.6" fill="#0a0a0a"/>' +
        '  <circle cx="35" cy="2" r="1.6" fill="#0a0a0a"/>' +
        '  <circle cx="24" cy="14" r="8" fill="#0a0a0a"/>' +
        '  <ellipse cx="24" cy="30" rx="9" ry="11" fill="#0a0a0a"/>' +
        '  <ellipse cx="24" cy="48" rx="11" ry="14" fill="#0a0a0a"/>' +
        '  <ellipse cx="21" cy="26" rx="3" ry="5" fill="#ffffff" opacity="0.18"/>' +
        '</svg>';
    document.body.appendChild(bug);

    var style = document.createElement('style');
    style.textContent =
        '#crawling-bug{' +
        '  position:fixed;top:0;left:0;pointer-events:auto;cursor:pointer;z-index:9999;' +
        '  will-change:transform;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35));' +
        '}' +
        '#crawling-bug.caught{' +
        '  cursor:default;filter:drop-shadow(0 0 7px rgba(255,215,0,.95));' +
        '}' +
        '#crawling-bug .bug-svg{display:block;width:100%;height:100%;overflow:visible;}' +
        '#crawling-bug .leg{transform-box:fill-box;}' +
        '#crawling-bug .leg-left{animation:bugLegL .16s infinite alternate ease-in-out;}' +
        '#crawling-bug .leg-right{animation:bugLegR .16s infinite alternate ease-in-out;}' +
        '#crawling-bug.caught .leg{animation-play-state:paused;}' +
        '@keyframes bugLegL{from{transform:rotate(-16deg)}to{transform:rotate(16deg)}}' +
        '@keyframes bugLegR{from{transform:rotate(16deg)}to{transform:rotate(-16deg)}}' +
        '#bug-trash{' +
        '  position:fixed;left:0;top:0;z-index:10000;width:46px;height:46px;border:none;' +
        '  border-radius:50%;background:#e63946;color:#fff;cursor:pointer;padding:0;' +
        '  display:flex;align-items:center;justify-content:center;' +
        '  box-shadow:0 6px 16px rgba(0,0,0,.45);' +
        '  transform:translate(-50%,-50%) scale(0);' +
        '  animation:bugTrashPop .22s ease forwards;' +
        '}' +
        '#bug-trash:hover{background:#c1121f;}' +
        '#bug-trash:active{transform:translate(-50%,-50%) scale(.92);}' +
        '#bug-trash svg{width:22px;height:22px;fill:#fff;display:block;}' +
        '@keyframes bugTrashPop{to{transform:translate(-50%,-50%) scale(1)}}';
    document.head.appendChild(style);

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function calcSize() {
        var base = Math.min(window.innerWidth, window.innerHeight);
        return clamp(base * 0.027, 9, 26);
    }

    function applySize() {
        var w = calcSize();
        var h = w * 1.42;
        bug.style.width = w + 'px';
        bug.style.height = h + 'px';
        return { w: w, h: h };
    }

    function normalize(a) {
        while (a > Math.PI) a -= Math.PI * 2;
        while (a < -Math.PI) a += Math.PI * 2;
        return a;
    }

    var W = window.innerWidth;
    var H = window.innerHeight;
    var dims = applySize();
    var size = dims.w;
    var x = Math.random() * W;
    var y = Math.random() * H;
    var heading = Math.random() * Math.PI * 2;
    var target = heading;
    var nextTurn = 0;
    var last = performance.now();
    var scale = 1;
    var zoomTarget = 1;
    var zoomUntil = 0;
    var nextZoom = performance.now() + 3000 + Math.random() * 4000;
    var caught = false;
    var removed = false;
    var trash = null;

    function placeTrash() {
        if (!trash) return;
        var bw = dims.w * scale;
        var bh = dims.h * scale;
        var tx = clamp(x + bw / 2 + 18, 28, window.innerWidth - 28);
        var ty = clamp(y - bh / 2 - 18, 28, window.innerHeight - 28);
        trash.style.left = tx + 'px';
        trash.style.top = ty + 'px';
    }

    function catchBug() {
        if (caught || removed) return;
        caught = true;
        bug.classList.add('caught');

        trash = document.createElement('button');
        trash.id = 'bug-trash';
        trash.type = 'button';
        trash.setAttribute('aria-label', 'Remove bug');
        trash.innerHTML =
            '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-1 12H7L6 9zm3 2v8h2v-8H9zm4 0v8h2v-8h-2z"/>' +
            '</svg>';

        trash.addEventListener('pointerdown', function (e) {
            e.stopPropagation();
        });
        trash.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            removed = true;
            try {
                sessionStorage.setItem(REMOVED_KEY, '1');
            } catch (err) {}
            if (trash && trash.parentNode) trash.parentNode.removeChild(trash);
            if (bug && bug.parentNode) bug.parentNode.removeChild(bug);
        });

        document.body.appendChild(trash);
        placeTrash();
    }

    bug.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        catchBug();
    });
    bug.addEventListener('mouseenter', function () {
        catchBug();
    });

    window.addEventListener('resize', function () {
        W = window.innerWidth;
        H = window.innerHeight;
        dims = applySize();
        size = dims.w;
        x = clamp(x, 0, W);
        y = clamp(y, 0, H);
        placeTrash();
    });

    function step(now) {
        if (caught || removed) {
            return;
        }

        var dt = Math.min(50, now - last) / 1000;
        last = now;

        W = window.innerWidth;
        H = window.innerHeight;
        var w = dims.w;
        var h = dims.h;
        var margin = Math.max(w * 1.5, 40);

        if (now > nextTurn) {
            target = heading + (Math.random() - 0.5) * Math.PI * 1.6;
            nextTurn = now + 220 + Math.random() * 850;
        }

        if (x < margin) {
            target = (Math.random() - 0.5) * 0.5;
        } else if (x > W - margin) {
            target = Math.PI + (Math.random() - 0.5) * 0.5;
        }
        if (y < margin) {
            target = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        } else if (y > H - margin) {
            target = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        }

        if (now > nextZoom) {
            zoomUntil = now + 220 + Math.random() * 260;
            zoomTarget = 3.5 + Math.random() * 2.5;
            nextZoom = now + 2500 + Math.random() * 4500;
        }

        var zooming = now < zoomUntil;
        if (zooming) {
            scale += (zoomTarget - scale) * 0.5;
        } else {
            scale += (1 - scale) * 0.1;
        }

        heading += normalize(target - heading) * 0.14;

        var speed = size * 8 * (zooming ? 1.4 : 1);
        x += Math.cos(heading) * speed * dt;
        y += Math.sin(heading) * speed * dt;
        x = clamp(x, w / 2, W - w / 2);
        y = clamp(y, h / 2, H - h / 2);

        var deg = (heading * 180) / Math.PI + 90;
        bug.style.transform =
            'translate(' + (x - w / 2) + 'px,' + (y - h / 2) + 'px) rotate(' + deg +
            'deg) scale(' + scale.toFixed(3) + ')';

        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
})();
