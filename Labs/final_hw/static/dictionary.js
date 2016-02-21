var xmlhttp = null, hehe = 0;

var s, words = new Array(),
    english = new Array(),
    chinese = new Array(),
    chineses = new Array(),
    tag = new Array(),
    count = new Array(),
    index = new Array(),
    collection2 = new Array();
var child = new Array(), cchild = new Array();

window.onload = function() {
    $('#page4').bind('pageinit', function() {
        $('#list').listview();
    });
    $('#page3').bind('pageinit', function() {
         $('#list1').listview('refresh');
    });
    $('#page3_bu').bind('click', function() {
         $('#list1').listview('refresh');
    });
    $("input[type='radio']").bind('click',function(){
        $(this).attr("checked", true);
        $("input[type='radio']").not(this).attr("checked", false);
    });
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp != null) {
        xmlhttp.onreadystatechange = ready;
        xmlhttp.open("GET", '/static/database/dictionary.txt',true);
        xmlhttp.send(null);
    } else {
        alert("Your browser does not support XMLHTTP.");
    }
}

function ready() {
    if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
            s = xmlhttp.responseText;
            words = s.split("\n");
            for (var i = 0; i < words.length; i++) {
                child = words[i].split(":");
                english.push(child[0]);
                chinese.push(child[1]);
                cchild = child[1].split(",");
                chineses.push(cchild);
                var li = "<li><a name='"+child[0]+":"+child[1]+"'>"+child[0]+":       "+child[1]+"</a></li>";
                $("#list").append(li);
            }
            $("#list").listview();
            $("#sch").click(search);
            $("#submit").click(register);
            $("#submit1").click(logon);
            $("#logout").click(logout);
            $("#test").click(test);
            $("#check").click(check);
            $("#next").click(next);
        } else {
            alert("Problem retrieving data:" + xmlhttp.statusText);
        }
    }
}

function search() {
    $("#outp").attr("value","");
    var inputword;
    inputword = $("#inp").attr("value");
    var radios = new Array();
    radios = document.getElementsByName("opti");
    if (radios[0].checked == true) {
        for (var i = 0; i < english.length; i++) {
            if (inputword == english[i]) {
                $("#outp").attr("value", chinese[i]);
            }
        }
    } else {
        for (var i = 0; i < chineses.length; i++) {
            for (var j = 0; j < chineses[i].length; j++) {
                if (inputword == chineses[i][j]) {
                    var tmp = $("#outp").attr("value");
                    $("#outp").attr("value", tmp+english[i]+"\n");
                }
            }
        }
    }
    if ($("#outp").attr("value") == "") {
        $("#outp").attr("value", "Not Found!");
    }
}

function insert() {
    for (var i = 0; i < english.length; i++) {
        if ($("#EngWord").attr("value") == english[i]) {
            $("#info").attr("value", "This word has existed!");
            return false;
        }
    }
    if (/^([\u4e00-\u9fa5]+,)*[\u4e00-\u9fa5]+$/.test($("#ChsWord").attr("value")) == false) {
        $("#info").attr("value", "The Chinese doesn't suit the format!");
        return false;
    }
    s += "\n"+$("#EngWord").attr("value")+":"+$("#ChsWord").attr("value");
    words = s.split("\n");
    english = [], chineses = [], chinese = [];
    for (var i = 0; i < words.length; i++) {
        child = words[i].split(":");
        english.push(child[0]);
        chinese.push(child[1]);
        cchild = child[1].split(",");
        chineses.push(cchild);
    }
    $.ajax({
        type: "POST",
        url: "/insert",
        dataType: "text",
        data: {
            "Chinese": $("#ChsWord").val(),
            "English": $("#EngWord").val()
        },
        success: function(data) {
            alert(decodeURI(data));
        }
    });
    $("#info").attr("value", "Insert successed!");
}

function register() {
    $.ajax({
        type: "POST",
        url: "/register",
        dataType: "text",
        data: {
            'username': $("#page5 #username").val(),
            'password': $("#page5 #password").val()
        },
        success: function(data) {
            alert(data);
        }
    });
}

function logon() {
    $.ajax({
        type: "POST",
        url: "/logon",
        dataType: "text",
        data: {
            'username': $("#page6 #username").val(),
            'password': $("#page6 #password").val()
        },
        success: function(data) {
            list = data.split("\n")
            alert(list[0]);
            if (list[1]) {
                if (xmlhttp != null) {
                    xmlhttp.onreadystatechange = ready1;
                    xmlhttp.open("GET", "/collection?username="+$("#page6 #username").val(),true);
                    xmlhttp.send(null);
                }
/*                $("#list li a").attr("href", "#page7");
                $("#list li a").attr("data-rel", "dialog");*/
                $("#list li").on("taphold", function() {
                    v = this.innerText;
                    var flag = 1;
                    var data2 = v.split(":");
                    for (var k = 0; k < collection2.length; k++) {
                        if (collection2[k] == data2[0]) {
                            flag = 0;
                            break;
                        }
                    }
                    $.ajax({
                        type: "POST",
                        url: "/collect2",
                        dataType: "text",
                        data: {
                            'value': this.innerText,
                            'flag': flag
                        },
                        success: function(data) {
                            alert(data);
                            var li = "<li><a href=\"#\">"+v+"</a></li>";
                            if (flag) {
                                collection2.push(data2[0]);
                                $("#list1").append(li);
                            }
                            $("#list1").listview('refresh');
                        }
                    });
                });
            }
        }
    });
}

function ready1() {
    if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
            s = xmlhttp.responseText;
            if (s != "") {
                words = s.split("\n");
                for (var i = 0; i < words.length; i++) {
                    child = words[i].split(":");
                    english.push(child[0]);
                    chinese.push(child[1]);
                    cchild = child[1].split(",");
                    chineses.push(cchild);
                    var li = "<li><a href=\"#\">"+child[0]+":       "+child[1]+"</a></li>";
                    $("#list1").append(li);
                    collection2.push(child[0]);
                }
                $("#list1").listview('refresh');
            }
        } else {
            alert("Problem retrieving data:" + xmlhttp.statusText);
        }
    }
}

function logout() {
    $.ajax({
        type: "POST",
        url: "/logout",
        success: function(data) {
            alert(data);
        }
    });
}

function test() {
    for (var k = 0; k < english.length; k++) {
        tag[k] = 0;
        count[k] = 0;
    }
    var i = Math.floor(Math.random()*english.length);
    index[5] = i;
    $("#page7 #eng").attr("value", english[i]);
    var j = Math.floor(Math.random()*4);
    tag[i] = 1;
    index[j] = i;
    $("#la"+(j+1)).empty();
    $("#la"+(j+1)).append(chinese[i]);
    for (var k = 0; k < 4; k++) {
        if (k != j) {
            var t =  Math.floor(Math.random()*english.length);
            while(tag[t] == 1) {
                t =  Math.floor(Math.random()*english.length);
            }
            tag[t] = 1; 
            $("#la"+(k+1)).empty();
            $("#la"+(k+1)).append(chinese[t]);
            index[k] = t;
        }
    }
}

function check() {
    if (hehe == 0) {
    var flag = 0, corr = 0;
    for (var k = 0; k < 4; k++) {
        if ($("#ch"+(k+1)).attr("checked") == "checked") {
            if (index[k] == index[5]) {
                flag = 1;
                corr = k;
                break;
            }
        } else {
            if (index[k] == index[5]) {
                corr = k;
                break;
            }
        }
    }
    if (flag) {
        $("#ans").attr("value", "Correct!");
        count[index[corr]]++;
    } else {
        hehe = 1;
        $("#ans").attr("value", "Wrong!The true answer is: "+chinese[index[corr]]);
    }
    } else {
        $("#ans").attr("value", "Don't fool me...Please turn to the next question.");
    }
}

function next() {
    var flag = 1;
    hehe = 0;
    for (var k = 0; k < english.length; k++) {
        tag[k] = 0;
        if (count[k] < 2) flag = 0;
    }
    if (flag == 0) {
    var i = Math.floor(Math.random()*english.length);
    while (count[i] >= 2) {
        i = Math.floor(Math.random()*english.length);
    }
    index[5] = i;
    $("#page7 #eng").attr("value", english[i]);
    var j = Math.floor(Math.random()*4);
    tag[i] = 1;
    index[j] = i;
    $("#la"+(j+1)).empty();
    $("#la"+(j+1)).append(chinese[i]);
    for (var k = 0; k < 4; k++) {
        if (k != j) {
            var t =  Math.floor(Math.random()*english.length);
            while(tag[t] == 1) {
                t =  Math.floor(Math.random()*english.length);
            }
            tag[t] = 1; 
            $("#la"+(k+1)).empty();
            $("#la"+(k+1)).append(chinese[t]);
            index[k] = t;
        }
    }
    $("#ans").attr("value", "");
    } else {
        $("#ans").attr("value", "Congradulation!You have passed the test!");
    }
}