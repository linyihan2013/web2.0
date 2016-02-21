/* 完成了两个其他特征 
1，Turbo加速
2，控制器生效
*/

$ = function(s) {
    'use strict';
    return document.getElementById(s);
};

var custom = " |_o_|\n" + 
"   #  \n" + 
" __|__\n" + 
"=====\n" + 
"  _o_ \n" + 
" | # |\n" + 
" _/ \\_\n" + 
"=====\n" + 
"___o_\n" + 
"   #  \n" + 
" __|__\n" + 
"=====\n" + 
"  _o___ \n" + 
"   # \n" + 
" _/ \\_\n";

ANIMATIONS["Custom"] = custom;

var timer = null, i = 0, interval = 200;

function start() {
    var index = $("animation").value;
    var list = ANIMATIONS[index].split("=====\n");
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    timer = setInterval(play, interval, list);
    $("start").disabled = true;
    $("animation").disabled = true;
    $("stop").disabled = false;
}

function play(a) {
    if (i < a.length) {
        $("displayarea").value = a[i];
        i++;
    } else {
        $("displayarea").value = a[0];
        i = 1;
    }
}

function stop() {
    clearInterval(timer);
    timer = null;
    var index = $("animation").value;
    var list = ANIMATIONS[index];
    $("displayarea").value = list;
    $("start").disabled = false;
    $("animation").disabled = false;
    $("stop").disabled = true;
}

window.onload = function() {
    $("start").onclick = start;
    $("stop").onclick = stop;
    $("size1").onclick = function() {
        $("displayarea").style.fontSize = '7pt';
    };
    $("size2").onclick = function() {
        $("displayarea").style.fontSize = '12pt';
    };
    $("size3").onclick = function() {
        $("displayarea").style.fontSize = '24pt';
    };
    $("turbo").onclick = function() {
        var index = $("animation").value;
        var list = ANIMATIONS[index].split("=====\n");
        if ($("turbo").checked === true) {
            interval = 50;
        } else {
            interval = 200;
        }
        if (timer) {
                clearInterval(timer);
                timer = setInterval(play, interval, list);
        }
    };
};