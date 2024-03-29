function () {
var dcE = function(ln, o = null) {
    return document.createElement(ln, o);
  };
  var w = window;
  w._v = null;
  w._v2 = null;
  w._w = w;
  var gov = function(ed, ew) {
    if (ed == null) {
      if (ew != null) {
        w._v2 = 1;
      }
      return null;
    };
    var ov = ed.querySelector("video");
    if (ov == null) {
      var o = ed.querySelectorAll("iframe");
      for (var i = 0; i < o.length; i++) {
        var ov = gov(o[i].contentDocument, o[i].contentWindow);
        if (ov != null) {
          w._w = o[i].contentWindow;
          break;
        }
      }
    }
    return ov;
  };
  w._v = gov(document);
  w._v.get(0).webkitEnterFullscreen();  
  if (_v == null && _v2 == null) {
    alert("Not Video");
  } else if (_v2 != null && _v2 == 1) {
    alert("跨網域，無法取得 Video！");
  } else {
    w._w.rPFS = function(elem) {
      var fs = elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen||elem.webkitEnterFullscreen;
      fs.call(elem);
    };
    w._w.rPC = function(e) {
      var pr = e.parentNode;
      if (pr.classList.contains("controller")) {
        pr.classList.remove("controller");
      } else {
        pr.classList.add("controller");
      }
    };
    w._w.rPR = function() {
      if (_v != null) {
        for (var i = 0; i < 10; i++) {
          delete _v.playbackRate;
        }
      }
    };
    w._w.sPR = function(r, p) {
      if (_v != null) {
        if (r != null) {
          w._w.rPR();
          if (p == null) {
            _v.playbackRate = r;
          } else if (p == 1) {
            _v.playbackRate = (Math.round(parseFloat(r + _v.playbackRate) * 100) / 100);
          } else if (p == 2) {
            _v.currentTime += r;
          }
        }
        w._w.b10.innerHTML = (Math.round(parseFloat(_v.playbackRate) * 100) / 100).toString();
      }
    };
    w._w.sMute = function() {
      if (_v != null) {
        _v.muted = !_v.muted;
      }
    };
    w._w.sPlay = function() {
      if (_v != null) {
        if (_v.paused) {
          _v.play();
        } else {
          _v.pause();
        }
      }
    };
    if (w.hasOwnProperty("divd") && w.divd != null) {
      w.divd.remove();
      w.divd = null;
    } else {
      if (w.divd == null) {
        w.divd = dcE("div");
        w.divd.id = "sdany_pr";
        _v.parentNode.parentNode.appendChild(w.divd);
      }
      var style = dcE("style");
      style.innerHTML = "div.vsc-controller{display:none!important;}#sdany_pr *{font-size:10pt!important;}#sdany_controller{display:none;}#sdany_pr.controller #sdany_controller{display:initial!important;}#sdany_pr.controller{opacity:0.7!important;text-align:right;}#sdany_pr{padding:10px 5px;position:absolute;border-radius:5px;background:black!important;right:10px;top:30px;z-index:2147483647;user-select:none;opacity:0.3;}#sdany_pr button{min-width:25px;border-radius:5px;margin:3px;display:inline-block;border:0;text-align:center;padding:3px 5px;font-weight:bold;}#sdany_pr>button{padding:3px!important;cursor:-webkit-grab;color:white;background:black!important;}#sdany_pr>span>button{cursor:pointer;background-color:rgb(239, 239, 239)}#sdany_pr_0{min-width:30px!important;}";
      var b = "button";
      w.divd.appendChild(style);
      var b10 = dcE(b);
      b10.id = "sdany_pr_0";
      b10.innerHTML = "1";
      b10.onclick = function(e) {
        e.preventDefault();
        try {
          w._w.rPC(this);
        } catch (e) {
          try {
            parent.rPC(this);
          } catch (e) {}
        }
      };
      var span = dcE("span");
      span.id = "sdany_controller";
      var b1 = dcE(b);
      b1.setAttribute("onclick", "try{sPR(-10,2);}catch(e){try{parent.sPR(-10,2);}catch(e){}}");
      b1.innerHTML = "&lt;&lt;";
      var b2 = dcE(b);
      b2.setAttribute("onclick", "try{sPR(+25,2);}catch(e){try{parent.sPR(+25,2);}catch(e){}}");
      b2.innerHTML = "&gt;&gt;";
      var b3 = dcE(b);
      b3.setAttribute("onclick", "try{sPR(-0.1,1);}catch(e){try{parent.sPR(-0.1,1);}catch(e){}}");
      b3.innerHTML = "-";
      var b4 = dcE(b);
      b4.setAttribute("onclick", "try{sPR(+0.1,1);}catch(e){try{parent.sPR(+0.1,1);}catch(e){}}");
      b4.innerHTML = "+";
      var b5 = dcE(b);
      b5.setAttribute("onclick", "try{sPR(1);}catch(e){try{parent.sPR(1);}catch(e){}}");
      b5.innerHTML = "1";
      var b6 = dcE(b);
      b6.setAttribute("onclick", "try{sPR(1.5);}catch(e){try{parent.sPR(1.5);}catch(e){}}");
      b6.innerHTML = "1.5";
      var b7 = dcE(b);
      b7.setAttribute("onclick", "try{sPR(2);}catch(e){try{parent.sPR(2);}catch(e){}}");
      b7.innerHTML = "2";
      var b8 = dcE(b);
      b8.setAttribute("onclick", "try{sMute();}catch(e){try{parent.sMute();}catch(e){}}");
      b8.innerHTML = "M";
      var b9 = dcE(b);
      b9.setAttribute("onclick", "try{sPlay();}catch(e){try{parent.sPlay();}catch(e){}}");
      b9.innerHTML = "P";
      var b11 = dcE(b);
      b11.onclick = function(e) {
        try {
          w._w.rPFS(w._v);
        } catch (e) {
          try {
            parent.sPlay(parent._v);
          } catch (e) {}
        }
      };
      b11.innerHTML = "F";
      w.divd.appendChild(b10);
      w.divd.appendChild(dcE("br"));
      divd.appendChild(span);
      span.appendChild(b8);
      span.appendChild(b9);
      span.appendChild(dcE("br"));
      span.appendChild(b1);
      span.appendChild(b2);
      span.appendChild(dcE("br"));
      span.appendChild(b3);
      span.appendChild(b4);
      span.appendChild(dcE("br"));
      span.appendChild(b6);
      span.appendChild(b7);
      span.appendChild(dcE("br"));
      span.appendChild(b11);
      span.appendChild(b5);
      w._w.b10 = b10;
      w._w.sPR();
    }
  }
}