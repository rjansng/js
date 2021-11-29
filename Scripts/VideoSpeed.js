function(w) {
    w._v = null;
    w._w = w;
    var gov = function(ed) {
        var ov = ed.querySelector('video');
        if (ov == null) {
            var o = ed.querySelectorAll('iframe');
            for (var i = 0; i < o.length; i++) {
                var ov = gov(o[i].contentDocument);
                if (ov != null) {
                    w._w = o[i].contentWindow;
                    break;
                }
            }
        }
        return ov;
    };
    w._v = gov(document);
    if (_v == null) {
        alert('Not Video');
    } else {
        w._w.rPR = function() {
            if (_v != null) {
                for (var i = 0; i < 5; i++) {
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
                    } else {
                        _v.playbackRate += r;
                    }
                }
                w._w.document.getElementById('sdany_pr_0').innerHTML = _v.playbackRate;
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
        w.divd = w._w.document.querySelector('#sdany_pr');
        if (divd != null) {
            divd.remove();
            divd = null;
        } else {
            if (divd == null) {
                divd = document.createElement("div");
                divd.id = 'sdany_pr';
                w._w.document.body.appendChild(divd);
            }
            divd.innerHTML = '<style>#sdany_pr{position:fixed;right:20px;top:50px;z-index:999999;user-select:none;}#sdany_pr span{width:40px;display:inline-block;border:1px solid red;text-align:center;background-color:yellow;height:30px;font-weight:bold;}#sdany_pr_0{background-color:green!important;color:white;font-weight:bold;}</style>' + '<span id="sdany_pr_0">1</span>' + '<span onclick="sPR(-0.25,1)">-0.25</span>' + '<span onclick="sPR(+0.25,1)">+0.25</span>' + '<span onclick="sPR(1)">1</span>' + '<span onclick="sPR(1.5)">1.5</span>' + '<span onclick="sPR(2)">2</span>' + '<span onclick="sMute()">Mute</span>' + '<span onclick="sPlay()">Play</span>';
            w._w.sPR();
        }
    }
}