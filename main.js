// ==UserScript==
// @name         进化自动化脚本
// @namespace    bilibili12433014
// @version      2.0.0
// @description  一个用于`https://g8hh.github.io/evolve/`简单自动化的脚本
// @author       bilibili12433014
// @homepageURL  https://github.com/bilibili12433014
// @updateURL    https://github.com/bilibili12433014/evolve_script/raw/main/main.js
// @downloadURL  https://github.com/bilibili12433014/evolve_script/raw/main/main.js
// @match        https://g8hh.github.io/evolve/
// @icon         https://avatars.githubusercontent.com/u/73748897?v=4
// @grant        none
// ==/UserScript==

window.clickTimes = 1000;
window.eventQueue = [];
window.circle = [];
window.setting_data = {};
window.setting_config = {
    "enable_script":{
        "text":"启用脚本",
        "type":"bool"
    },
    "enable_collect":{
        "text":"收集物资",
        "type":"bool"
    },
    "enable_cell":{
        "text":"售卖物资",
        "type":"bool"
    },
    "hold_Food":{
        "text":"食物保有量",
        "type":"percentage"
    },
    "enable_sell_Food":{
        "text":"允许售卖食物",
        "type":"bool"
    },
    "hold_Money":{
        "text":"金钱保有量",
        "type":"percentage"
    },
    "hold_Lumber":{
        "text":"木材保有量",
        "type":"percentage"
    },
    "hold_Stone":{
        "text":"石头保有量",
        "type":"percentage"
    },
    "enable_all_buy":{
        "text":"启用全部自动购买",
        "type":"button"
    },
    "disable_all_buy":{
        "text":"禁用启用全部自动购买",
        "type":"button"
    },
}
window.scriptLock = false;

function createSettingsElement() {
    // 创建设置按钮
    const settingsButton = document.createElement('button');
    settingsButton.innerText = '设置';
    settingsButton.style.position = 'fixed';
    settingsButton.style.left = '10px';
    settingsButton.style.bottom = '30px';
    settingsButton.style.color = 'black';
    settingsButton.style.backgroundColor = 'white';
    settingsButton.style.padding = '10px 20px';
    settingsButton.style.fontSize = '16px';

    // 创建设置框
    const settingsBox = document.createElement('div');
    settingsBox.style.position = 'fixed';
    settingsBox.style.top = '10%';
    settingsBox.style.left = '10%';
    settingsBox.style.right = '10%';
    settingsBox.style.bottom = '10%';
    settingsBox.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    settingsBox.style.color = 'black';
    settingsBox.style.display = 'none';
    settingsBox.style.border = '2px solid white';

    // 创建透明的全屏覆盖元素
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // 完全透明
    overlay.style.display = 'none';

    // 设置按钮点击事件
    settingsButton.addEventListener('click', function() {
        if (settingsBox.style.display === 'none') {
            settingsBox.style.display = 'block';
            overlay.style.display = 'block';
        } else {
            settingsBox.style.display = 'none';
            overlay.style.display = 'none';
        }
    });

    // 透明元素点击事件
    overlay.addEventListener('click', function() {
        settingsBox.style.display = 'none';
        overlay.style.display = 'none';
    });

    // 创建一个父元素容纳设置按钮、设置框和透明覆盖元素
    const container = document.createElement('div');
    container.appendChild(overlay);
    container.appendChild(settingsBox);
    container.appendChild(settingsButton);

    return container;
}

function createSettingsItems() {
    // 读取全局变量
    const eventQueue = window.eventQueue || [];
    const setting_config = window.setting_config || {};

    // 创建一个容器元素
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '20px';
    container.style.left = '20px';
    container.style.right = '20px';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';

    // 设置一个辅助函数来创建设置项
    function createSettingItem(key, labelText, inputElement) {
        const itemContainer = document.createElement('div');
        itemContainer.style.display = 'flex';
        itemContainer.style.alignItems = 'center';
        itemContainer.style.marginBottom = '10px';
        itemContainer.style.marginRight = '20px';
        itemContainer.style.width = 'calc(50% - 20px)';

        const label = document.createElement('label');
        label.innerText = labelText;
        label.id = key + '_text';
        label.style.marginRight = '10px';
        label.style.width = '100px'; // 设置固定宽度以对齐

        inputElement.id = key + '_input';
        inputElement.style.maxWidth = '200px'; // 设置输入元素的最大宽度
        inputElement.style.height = '24px';

        const extraText = document.createElement('span');
        extraText.id = key + '_extra';
        extraText.style.marginLeft = '10px';
        extraText.style.width = '50px';

        itemContainer.appendChild(label);
        itemContainer.appendChild(inputElement);
        itemContainer.appendChild(extraText);

        return itemContainer;
    }

    // 遍历setting_config，创建对应的设置项
    for (const [key, config] of Object.entries(setting_config)) {
        let settingItem;

        if (config.type === 'percentage') {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.max = '100';
            input.step = '0.01';
            input.value = config.value || '95';
            input.style.textAlign = 'left';
            input.style.flex = '1';
            input.addEventListener('change', function() {
                if (parseFloat(input.value) > 100) {
                    input.value = 100;
                } else if (parseFloat(input.value) < 0) {
                    input.value = 0;
                }
                eventQueue.push([key, parseFloat(input.value)]);
            });
            input.dispatchEvent(new Event('change'));
            settingItem = createSettingItem(key, config.text, input);
        } else if (config.type === 'button') {
            const button = document.createElement('button');
            button.innerText = config.text;
            button.style.textAlign = 'left';
            button.style.flex = '1';
            button.addEventListener('click', function() {
                eventQueue.push([key]);
            });
            settingItem = createSettingItem(key, config.text, button);
        } else if (config.type === 'bool') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = config.value || false;
            checkbox.style.textAlign = 'left';
            checkbox.style.flex = '1';
            checkbox.addEventListener('change', function() {
                eventQueue.push([key, checkbox.checked]);
            });
            checkbox.dispatchEvent(new Event('change'));
            settingItem = createSettingItem(key, config.text, checkbox);
        }

        container.appendChild(settingItem);
    }

    return container;
}

function saveSettings() {
    // 读取全局变量setting_data
    const settingData = window.setting_data || {};

    // 将setting_data保存到localStorage中
    localStorage.setItem('user_settings', JSON.stringify(settingData));
}

function loadSettings() {
    // 从localStorage中读取用户设置
    const savedSettings = localStorage.getItem('user_settings');

    if (savedSettings) {
        const settingData = JSON.parse(savedSettings);

        // 更新全局变量setting_data
        window.setting_data = settingData;

        // 遍历setting_data，设置对应的项目为保存的值
        for (const [key, value] of Object.entries(settingData)) {
            const element = document.getElementById(key + '_input');
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
            element.dispatchEvent(new Event('change'));
        }
    }
}

function convertToInteger(str) {
    const suffixes = {
        '': 1,
        'K': 1000,
        'M': 1000000
    };
    const lastChar = str[str.length - 1];
    const suffix = suffixes[lastChar.toUpperCase()] || '';
    if (!suffix) {
        return parseInt(str, 10);
    }
    const numStr = str.slice(0, -1);
    const num = parseFloat(numStr);
    return Math.round(num * suffix);
}

function mainFunction() {
    if (window.scriptLock) {
        return;
    }
    window.scriptLock = true;
    if (window.eventQueue && window.eventQueue.length > 0) {
        let item = window.eventQueue.shift();

        if (item.length === 1) {
            switch (item[0]) {
                case 'enable_all_buy':
                    for (const key in window.setting_data) {
                        if (window.setting_data.hasOwnProperty(key) && key.startsWith("enable_buy_")) {
                            document.getElementById(key+"_input").checked=true;
                            window.eventQueue.push([key, true]);
                        }
                    }
                    break;
                case 'disable_all_buy':
                    for (const key in window.setting_data) {
                        if (window.setting_data.hasOwnProperty(key) && key.startsWith("enable_buy_")) {
                            document.getElementById(key+"_input").checked=false;
                            window.eventQueue.push([key, false]);
                        }
                    }
                    break;
                default:
                    console.log('Unknown button clicked');
            }
        } else {
            window.setting_data[item[0]] = item[1];
        }
        saveSettings();
    }

    if (!window.setting_data.enable_script) {
        window.scriptLock = false;
        return;
    }
    var i;
    var sell_button1 = document.getElementById("market-Lumber").children[4];
    var sell_button2 = document.getElementById("market-Stone").children[4];
    var sell_button3 = document.getElementById("market-Food").children[4];
    var times = Math.max(1,parseInt(1+window.clickTimes/window.evolve.global.city.market.qty));
    if (window.setting_data.enable_cell && window.evolve.global.resource.Lumber.amount/window.evolve.global.resource.Lumber.max*100>window.setting_data.hold_Lumber) {
        for (i=0;i<Math.max(times,(window.evolve.global.resource.Lumber.amount-window.evolve.global.resource.Lumber.max*window.setting_data.hold_Lumber/100)/window.evolve.global.city.market.qty);++i) {
            sell_button1.click();
        }
    }
    if (window.setting_data.enable_cell && window.evolve.global.resource.Stone.amount/window.evolve.global.resource.Stone.max*100>window.setting_data.hold_Stone) {
        for (i=0;i<Math.max(times,(window.evolve.global.resource.Stone.amount-window.evolve.global.resource.Stone.max*window.setting_data.hold_Stone/100)/window.evolve.global.city.market.qty);++i) {
            sell_button2.click();
        }
    }
    if (window.setting_data.enable_cell && window.setting_data.enable_sell_Food && window.evolve.global.resource.Food.amount/window.evolve.global.resource.Food.max*100>window.setting_data.hold_Lumber) {
        for (i=0;i<Math.max(times,(window.evolve.global.resource.Food.amount-window.evolve.global.resource.Food.max*window.setting_data.hold_Food/100)/window.evolve.global.city.market.qty);++i) {
            sell_button3.click();
        }
    }

    var buy = [];
    for (const [key, value] of Object.entries(window.setting_data)) {
        if (key.startsWith("enable_buy_") && value) {
            const name = key.substring(11);
            buy.push(name)
            if (!window.circle.includes(name)) {
                window.circle.push(name);
            }
        }
    }

    const trackingCircle = window.circle.filter(item => buy.includes(item));
    for (const name of trackingCircle) {
        const item = "market-" + name;
        const marketElements = document.getElementById(item);
        const price = convertToInteger(marketElements.children[2].textContent.substr(1));
        if (window.evolve.global.resource[name].amount/window.evolve.global.resource[name].max*100>window.setting_data["hold_"+name]) {
            continue;
        }
        if ((window.evolve.global.resource.Money.amount-price)/window.evolve.global.resource.Money.max*100<window.setting_data.hold_Money) {
            break;
        }
        marketElements.children[2].click();
        const index = window.circle.indexOf(name);
        if (index !== -1) {
            window.circle.push(...window.circle.splice(index, 1));
        }
    }


    if (window.setting_data.enable_collect) {
        var button1 = document.getElementById("city-food").children[0];
        var button2 = document.getElementById("city-lumber").children[0];
        var button3 = document.getElementById("city-stone").children[0];
        if (window.evolve.global.resource.Food.max-window.evolve.global.resource.Food.amount>window.clickTimes) {
            for (i=0;i<window.clickTimes;++i) {
                button1.click();
            }
        }
        if (window.evolve.global.resource.Lumber.max-window.evolve.global.resource.Lumber.amount>window.clickTimes) {
            for (i=0;i<window.clickTimes;++i) {
                button2.click();
            }
        }
        if (window.evolve.global.resource.Stone.max-window.evolve.global.resource.Stone.amount>window.clickTimes) {
            for (i=0;i<window.clickTimes;++i) {
                button3.click();
            }
        }
    }
    window.scriptLock = false;
}

function init() {
    // 步骤1：执行初始化设置
    setTimeout(() => {
        document.getElementById("open_im").click();
        setTimeout(() => {
            document.getElementById("im_main").children[2].children[3].children[5].click();
            setTimeout(() => {
                document.getElementById("im_main").parentElement.children[1].click();
                setTimeout(() => {
                    document.getElementById("5-label").click();
                    setTimeout(() => {
                        // 设置2个按钮为true
                        document.querySelector("#settings > label:nth-child(11) > input[type=checkbox]").checked = true;
                        document.querySelector("#settings > label:nth-child(12) > input[type=checkbox]").checked = true;

                        // 确保设置完成后继续执行后续步骤
                        setTimeout(() => {
                            // 步骤2：根据页面内容动态追加window.setting_config的内容
                            const marketElements = document.querySelectorAll("#market > *");
                            marketElements.forEach(element => {
                                if (element.id.startsWith("market-") && element.id !== "market-qty" && element.id !== "market-Food" && element.id !== "market-Lumber" && element.id !== "market-Stone") {
                                    const item = element.id.substring(7); // 去除market-
                                    window.circle.push(item);
                                    const name = element.children[0].textContent;
                                    window.setting_config["enable_buy_" + item] = { "text": "购买" + name, "type": "bool" };
                                    window.setting_config["hold_" + item] = { "text": "保持" + name, "type": "percentage", "buy_id": item };
                                }
                            });

                            // 步骤3：启动自定义脚本
                            window.saveSettings = saveSettings;
                            window.loadSettings = loadSettings;
                            const ele = createSettingsElement();
                            ele.children[1].appendChild(createSettingsItems());
                            document.body.appendChild(ele);
                            loadSettings();
                            setInterval(mainFunction, 1);
                        }, 500);
                    }, 200);
                }, 100);
            }, 100);
        }, 100);
    }, 1000);
}

init();
