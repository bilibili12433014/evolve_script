// ==UserScript==
// @name         进化自动化脚本
// @namespace    bilibili12433014
// @version      1.1.1
// @description  一个用于`https://g8hh.github.io/evolve/`简单自动化的脚本
// @author       bilibili12433014
// @homepageURL  https://github.com/bilibili12433014
// @updateURL    https://github.com/bilibili12433014/evolve_script/raw/main/main.js
// @downloadURL  https://github.com/bilibili12433014/evolve_script/raw/main/main.js
// @match        https://g8hh.github.io/evolve/
// @icon         https://avatars.githubusercontent.com/u/73748897?v=4
// @grant        none
// ==/UserScript==
window.setting_map = {
    "自动点击物资": false,
    "自动售卖物资": false,
    "自动增加到资金上限":false,
};

window.auto_sell2_status=false;

function auto_click() {
    var add = [
        ["city-food", "cntFood"],
        ["city-lumber", "cntLumber"],
        ["city-stone", "resStone"]
    ];

    var t = 0;
    var button;
    var cnt;
    var buttonElement;
    var cntElement;

    for (var addItem of add) {
        button = addItem[0];
        cnt = addItem[1];

        buttonElement = document.getElementById(button);
        cntElement = document.getElementById(cnt);

        t = 100;
        if (button === "city-food") {
            t = 50;
        }

        if (!buttonElement || cntElement.className.indexOf("has-text-warning") !== -1) {
            t = 0;
        }

        for (var i = 0; i < t; ++i) {
            buttonElement.children[0].click();
        }
    }
}

function auto_sell() {
    var sell = ["market-Lumber", "market-Stone"];
    var sellElement;

    for (var sellItem of sell) {
        sellElement = document.getElementById(sellItem);
        if (!sellElement) {
            continue;
        }
        sellElement.children[4].click();
    }
}

function auto_sell2() {
    if (!window.setting_map["自动点击物资"]) {
        document.getElementById("settingsBox").children[0].children[1].click();
    }
    if (!window.setting_map["自动售卖物资"]) {
        document.getElementById("settingsBox").children[1].children[1].click();
    }
    if (window.auto_sell2_status){
        return;
    }
    if (document.getElementById("cntMoney").className.indexOf("has-text-warning") !== -1) {
        window.auto_sell2_status=false;
        return;
    }
    window.auto_sell2_status = true;
    var sell_cnt = ["cntLumber", "cntStone"];
    var cntElement;

    for (var item of sell_cnt) {
        cntElement = document.getElementById(item);
        if (cntElement.className.indexOf("has-text-warning") !== -1) {
            setTimeout(function() {
                document.getElementById("11-label").click();
            },1);
            setTimeout(function() {
                document.getElementById("11-content").children[0].children[0].children[0].children[0].children[0].children[0].click();
            },200);
            setTimeout(function() {
                document.getElementById("5-label").click();
            },300);
            setTimeout(function() {
                document.getElementById("5-content").children[0].children[0].children[0].children[0].children[0].children[0].click();
            },400);
            setTimeout(function() {
                window.auto_sell2_status = false;
            },500);
            return;
        }
    }
    document.getElementById("5-label").click();
    setTimeout(function() {
        document.getElementById("5-content").children[0].children[0].children[0].children[0].children[0].children[0].click();
    },100);
    setTimeout(function() {
        window.auto_sell2_status = false;
    },200);
}

function main_loop() {
    if (window.setting_map["自动点击物资"]) {
        auto_click();
    }
    if (window.setting_map["自动售卖物资"]) {
        auto_sell();
    }
    if (window.setting_map["自动增加到资金上限"]) {
        auto_sell2();
    }
}


(function() {
    // 创建浮动显示框
    const settingsBox = document.createElement('div');
    settingsBox.id = 'settingsBox';
    settingsBox.style.position = 'fixed';
    settingsBox.style.bottom = '30px';
    settingsBox.style.left = '10px';
    settingsBox.style.width = '200px';
    settingsBox.style.padding = '10px';
    settingsBox.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // 50%透明的白色背景
    settingsBox.style.color = 'black'; // 字体颜色为黑色
    settingsBox.style.border = '1px solid #ccc';
    settingsBox.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    document.body.appendChild(settingsBox);

    // 根据setting_map创建选项
    for (const [key, value] of Object.entries(window.setting_map)) {
        const settingItem = document.createElement('div');
        settingItem.style.display = 'flex';
        settingItem.style.justifyContent = 'space-between';
        settingItem.style.alignItems = 'center';
        settingItem.style.marginBottom = '5px';

        const label = document.createElement('span');
        label.textContent = key;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = value;
        checkbox.addEventListener('change', function() {
            window.setting_map[key] = this.checked;
        });

        settingItem.appendChild(label);
        settingItem.appendChild(checkbox);
        settingsBox.appendChild(settingItem);
    }
    setInterval(main_loop,1);
})();
