/*1,游戏结束提示 */
$ = function(v) {
	'use strict';
	return document.getElementById(v);
};

var arr = new Array("0", "100", "200", "300");
var xchange = new Array(0, 0, -1, 1);
var ychange = new Array(-1, 1, 0, 0);
var posx = 3, posy = 3, parts;
var hehe = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10,
	11], [12, 13, 14, 15]];

window.onload = function() {
	parts = $("puzzlearea").getElementsByTagName("div");
	for (var i = 0; i < parts.length; i++) {
		parts[i].className = "puzzlepiece";
		parts[i].style.backgroundPosition = "-" + arr[i % 4] + "px -" + arr[parseInt(i / 4)] + "px";
		parts[i].style.left = arr[i % 4] + "px";
		parts[i].style.top = arr[parseInt(i / 4)] + "px";
		parts[i].addEventListener("mouseover", check);
		parts[i].addEventListener("mouseout", out);
		parts[i].addEventListener("mousedown", click);
	}
	$("shufflebutton").onclick = shuffle;
};

function shuffle() {
	var i = 0;
	while (i < 1) {
		var j = Math.floor(Math.random() * 4);
		if ((0 <= (posx + xchange[j]) && (posx + xchange[j]) <= 3)
		    && (0 <= (posy + ychange[j]) && (posy + ychange[j]) <= 3)) {
			var tmp1 = hehe[posy][posx];
			hehe[posy][posx] = hehe[posy + ychange[j]][posx + xchange[j]];
			hehe[posy + ychange[j]][posx + xchange[j]] = tmp1;
			posx += xchange[j];
			posy += ychange[j];
			tmp1 = hehe[posy - ychange[j]][posx - xchange[j]];
			if (j == "0") {
				var tmp = parseInt(parts[tmp1].style.top) + 100;
				parts[tmp1].style.top = tmp + "px";
			} else if (j == "1") {
				var tmp = parseInt(parts[tmp1].style.top) - 100;
				parts[tmp1].style.top = tmp + "px";
			} else if (j == "2") {
				var tmp = parseInt(parts[tmp1].style.left) + 100;
				parts[tmp1].style.left = tmp + "px";
			} else if (j == "3") {
				var tmp = parseInt(parts[tmp1].style.left) - 100;
				parts[tmp1].style.left = tmp + "px";
			}
			i++;
		}
	}
}

function check(event) {
	var i, j, data;
	data = parseInt(this.innerHTML) - 1;
	for (i = 0; i < 16; i++) {
		if (hehe[parseInt(i / 4)][i % 4] == data) break;
	}
	j = i % 4;
	i = parseInt(i / 4);
	for  (var k = 0; k < 4; k++) {
		var tmpx = j + xchange[k];
		var tmpy = i + ychange[k];
		if (0 <= tmpx && tmpx <= 3 && 0 <= tmpy && tmpy <= 3) {
			if (hehe[tmpy][tmpx] == 15) {
				this.style.borderColor = "red";
				this.style.color = "#006600";
				this.style.textDecoration = "underline";
			}
		}
	} 
}

function out(event) {
	this.style.borderColor = "black";
	this.style.color = "black";
	this.style.textDecoration = "none";
}

 function click(event) {
 	var i, j, data;
	data = parseInt(this.innerHTML) - 1;
	for (i = 0; i < 16; i++) {
		if (hehe[parseInt(i / 4)][i % 4] == data) break;
	}
	j = i % 4;
	i = parseInt(i / 4);
	for  (var k = 0; k < 4; k++) {
		var tmpx = j + xchange[k];
		var tmpy = i + ychange[k];
		if (0 <= tmpx && tmpx <= 3 && 0 <= tmpy && tmpy <= 3) {
			if (hehe[tmpy][tmpx] == 15) {
				var tmp1 = hehe[tmpy][tmpx];
				hehe[tmpy][tmpx] = hehe[i][j];
				hehe[i][j] = tmp1;
				tmp1 = hehe[tmpy][tmpx];
				if (k == 1) {
					var tmp = parseInt(parts[tmp1].style.top) + 100;
					parts[tmp1].style.top = tmp + "px";
				} else if (k == 0) {
					var tmp = parseInt(parts[tmp1].style.top) - 100;
					parts[tmp1].style.top = tmp + "px";
				} else if (k == 3) {
					var tmp = parseInt(parts[tmp1].style.left) + 100;
					parts[tmp1].style.left = tmp + "px";
				} else if (k == 2) {
					var tmp = parseInt(parts[tmp1].style.left) - 100;
					parts[tmp1].style.left = tmp + "px";
				}
			}
		}
	}
	var flag = true;
	for (j = 0; j < 4; j++) {
		for (i = 0; i < 4; i++) {
			if (hehe[j][i] != (j*4 + i)) {
				flag = false;
				
			}
		}
	}
	if (flag) {
		for (var l = 0; l < parts.length; l++)
			parts[l].style.backgroundImage = "url(background1.jpg)";
		alert("Winner!!You got a meizi!!");
	}
}