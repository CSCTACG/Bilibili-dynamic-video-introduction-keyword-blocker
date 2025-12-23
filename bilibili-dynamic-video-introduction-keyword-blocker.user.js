// ==UserScript==
// @name         B站动态视频简介关键词屏蔽器
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  屏蔽B站动态中视频简介包含指定关键词的动态
// @author       764542542
// @match        https://t.bilibili.com/*
// @icon         https://static.hdslb.com/images/0.gif
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // 初始化关键词列表
    let keywords = GM_getValue("keywords", []);

    // 创建设置面板
    function createSettingsPanel() {
        // 检查面板是否已存在
        if (document.getElementById('keyword-blocker-panel')) {
            document.getElementById('keyword-blocker-panel').style.display = 'block';
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'keyword-blocker-panel';
        panel.innerHTML = `
            <div style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); width: 400px; background: white; border: 1px solid #ccc; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 10000; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 15px; text-align: center;">关键词屏蔽设置</h3>
                <div style="display: flex; margin-bottom: 10px;">
                    <input type="text" id="keyword-input" placeholder="输入关键词" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px 0 0 4px;">
                    <button id="add-keyword-btn" style="background: #00a1d6; color: white; border: none; padding: 8px 15px; border-radius: 0 4px 4px 0; cursor: pointer;">添加</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <input type="file" id="import-file" accept=".json" style="display: none;">
                    <button id="import-btn" style="background: #5daf34; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-right: 10px;">导入</button>
                    <button id="export-btn" style="background: #5daf34; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">导出</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <button id="clear-btn" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">清空</button>
                </div>
                <div id="keyword-list" style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                    ${keywords.map((keyword, index) => `<div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #f0f0f0;">${keyword}<button data-index="${index}" class="delete-keyword-btn" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">删除</button></div>`).join('')}
                </div>
                <div style="text-align: center; margin-top: 15px;">
                    <button id="close-panel-btn" style="background: #95a5a6; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // 添加事件监听器
        document.getElementById('add-keyword-btn').addEventListener('click', addKeyword);
        document.getElementById('keyword-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addKeyword();
        });
        document.getElementById('import-btn').addEventListener('click', importKeywords);
        document.getElementById('export-btn').addEventListener('click', exportKeywords);
        document.getElementById('clear-btn').addEventListener('click', clearKeywords);
        document.getElementById('close-panel-btn').addEventListener('click', () => panel.remove());

        // 为删除按钮添加事件监听器
        document.querySelectorAll('.delete-keyword-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteKeyword(index);
            });
        });
    }

    // 添加关键词
    function addKeyword() {
        const input = document.getElementById('keyword-input');
        const keyword = input.value.trim();
        if (keyword && !keywords.includes(keyword)) {
            keywords.push(keyword);
            GM_setValue("keywords", keywords);
            input.value = '';
            updateKeywordList();
        }
    }

    // 删除关键词
    function deleteKeyword(index) {
        keywords.splice(index, 1);
        GM_setValue("keywords", keywords);
        updateKeywordList();
    }

    // 清空关键词
    function clearKeywords() {
        if (confirm("确定要清空所有关键词吗？")) {
            keywords = [];
            GM_setValue("keywords", keywords);
            updateKeywordList();
        }
    }

    // 导入关键词
    function importKeywords() {
        document.getElementById('import-file').click();
        document.getElementById('import-file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const importedKeywords = JSON.parse(e.target.result);
                        if (Array.isArray(importedKeywords)) {
                            keywords = importedKeywords;
                            GM_setValue("keywords", keywords);
                            updateKeywordList();
                            alert("导入成功！");
                        } else {
                            alert("无效的JSON格式！");
                        }
                    } catch (error) {
                        alert("导入失败，请检查JSON格式！");
                    }
                };
                reader.readAsText(file);
            }
        }, { once: true });
    }

    // 导出关键词
    function exportKeywords() {
        const dataStr = JSON.stringify(keywords, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'keywords.json';
        link.click();
    }

    // 更新关键词列表显示
    function updateKeywordList() {
        const listContainer = document.getElementById('keyword-list');
        listContainer.innerHTML = keywords.map((keyword, index) => 
            `<div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #f0f0f0;">${keyword}<button data-index="${index}" class="delete-keyword-btn" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">删除</button></div>`
        ).join('');

        // 重新为删除按钮添加事件监听器
        document.querySelectorAll('.delete-keyword-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteKeyword(index);
            });
        });
    }

    // 检查并隐藏包含关键词的动态
    function checkAndHideDynamic() {
        // 选择视频动态的描述元素
        const videoDescElements = document.querySelectorAll('.bili-dyn-card-video__desc:not([data-checked])');
        // 创建正则表达式，将关键词转义并用|连接
        if (keywords.length > 0) {
            const escapedKeywords = keywords.map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            const regex = new RegExp(escapedKeywords.join('|'));
            
            videoDescElements.forEach(descElement => {
                descElement.dataset.checked = 'true'; // 标记为已检查
                const descText = descElement.textContent || descElement.innerText;
                // 使用正则表达式一次性检查所有关键词
                if (regex.test(descText)) {
                    // 隐藏整个动态
                    const dynamicCard = descElement.closest('.bili-dyn-item');
                    if (dynamicCard) {
                        dynamicCard.style.display = 'none';
                    }
                }
            });
        } else {
            // 如果没有关键词，只标记元素为已检查，不隐藏任何内容
            videoDescElements.forEach(descElement => {
                descElement.dataset.checked = 'true';
            });
        }
    }

    // 注册菜单命令
    GM_registerMenuCommand("打开关键词屏蔽设置", createSettingsPanel);

    // 初次加载时检查动态
    setTimeout(checkAndHideDynamic, 1000);
    
    // 页面完全加载后再次检查，确保所有动态都处理完成
    window.addEventListener('load', function() {
        setTimeout(checkAndHideDynamic, 2000);
    });

    // 防抖函数，避免频繁执行
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 使用防抖优化的检查函数
    const debouncedCheckAndHideDynamic = debounce(checkAndHideDynamic, 300);

    // 使用 MutationObserver 监听动态加载
    const observer = new MutationObserver(function(mutations) {
        let shouldCheck = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // 元素节点
                        // 检查新增节点或其子节点是否包含视频动态描述元素
                        if (node.querySelector && (node.querySelector('.bili-dyn-card-video__desc'))) {
                            shouldCheck = true;
                        }
                    }
                });
            }
        });
        if (shouldCheck) {
            debouncedCheckAndHideDynamic(); // 使用防抖函数
        }
    });

    // 开始监听
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();