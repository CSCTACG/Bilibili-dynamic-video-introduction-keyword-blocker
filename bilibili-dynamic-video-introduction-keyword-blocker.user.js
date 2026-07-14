// ==UserScript==
// @name         B站动态视频简介关键词屏蔽器
// @namespace    https://github.com/CSCTACG/Bilibili-dynamic-video-introduction-keyword-blocker
// @version      1.5
// @description  屏蔽B站动态中视频简介包含指定关键词的视频，支持自定义关键词管理
// @author       CSCTACG
// @match        https://t.bilibili.com/*
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'bili_keyword_blocker_keywords';
    const DEFAULT_KEYWORDS = [];

    function getKeywords() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_KEYWORDS;
    }

    function saveKeywords(keywords) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
    }

    function hideItem(item) {
        if (!item.classList.contains('keyword-blocked-hidden')) {
            item.style.display = 'none';
            item.classList.add('keyword-blocked-hidden');
        }
    }

    function showItem(item) {
        item.style.display = '';
        item.classList.remove('keyword-blocked-hidden');
    }

    function checkAndHideItems() {
        const keywords = getKeywords();
        if (keywords.length === 0) return;

        document.querySelectorAll('.bili-dyn-card-video__desc').forEach(desc => {
            const text = desc.textContent || '';
            const item = desc.closest('.bili-dyn-item');
            if (!item) return;

            const shouldHide = keywords.some(kw => kw && text.includes(kw));
            if (shouldHide) {
                hideItem(item);
            } else if (item.classList.contains('keyword-blocked-hidden')) {
                showItem(item);
            }
        });
    }

    let panel = null;

    function createOrShowPanel() {
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'keyword-blocker-panel';
            panel.innerHTML = `
                <div style="
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    width: 320px;
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 2147483647;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                    padding: 16px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0; font-size: 16px; color: #222;">关键词屏蔽设置</h3>
                        <button id="close-panel" style="
                            background: none; border: none; font-size: 18px; cursor: pointer;
                            color: #999; padding: 0; width: 24px; height: 24px;
                        ">×</button>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <input type="text" id="new-keyword" placeholder="请输入关键词"
                            style="width: 100%; padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        <button id="add-keyword" style="
                            margin-top: 6px; width: 100%; padding: 6px 0;
                            background: #00a1d6; color: white; border: none; border-radius: 4px; cursor: pointer;
                        ">添加关键词</button>
                    </div>
                    <div style="margin-bottom: 12px; display: flex; gap: 6px;">
                        <button id="export-keywords" style="
                            flex: 1; padding: 6px 0; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;
                        ">导出</button>
                        <button id="import-keywords" style="
                            flex: 1; padding: 6px 0; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;
                        ">导入</button>
                        <button id="clear-keywords" style="
                            flex: 1; padding: 6px 0; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;
                        ">清空</button>
                    </div>
                    <div style="max-height: 200px; overflow-y: auto; border-top: 1px solid #eee; padding-top: 8px;">
                        <div id="keyword-list" style="display: flex; flex-direction: column; gap: 6px;"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);

            panel.querySelector('#close-panel').onclick = () => panel.style.display = 'none';
            panel.querySelector('#add-keyword').onclick = addKeyword;
            panel.querySelector('#export-keywords').onclick = exportKeywords;
            panel.querySelector('#import-keywords').onclick = importKeywords;
            panel.querySelector('#clear-keywords').onclick = clearKeywords;
        }

        panel.style.display = 'block';
        renderKeywordList();
    }

    function renderKeywordList() {
        const list = document.getElementById('keyword-list');
        const keywords = getKeywords();
        list.innerHTML = '';
        keywords.forEach((kw, index) => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.innerHTML = `
                <span style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 13px;">${kw}</span>
                <button data-index="${index}" style="
                    background: #ff4d4d; color: white; border: none; border-radius: 3px;
                    padding: 2px 6px; font-size: 12px; cursor: pointer;
                ">删除</button>
            `;
            item.querySelector('button').onclick = () => removeKeyword(index);
            list.appendChild(item);
        });
    }

    function addKeyword() {
        const input = document.getElementById('new-keyword');
        const value = input.value.trim();
        if (!value) return;
        const keywords = getKeywords();
        if (!keywords.includes(value)) {
            keywords.push(value);
            saveKeywords(keywords);
            input.value = '';
            renderKeywordList();
            checkAndHideItems();
        }
    }

    function removeKeyword(index) {
        const keywords = getKeywords();
        keywords.splice(index, 1);
        saveKeywords(keywords);
        renderKeywordList();
        document.querySelectorAll('.keyword-blocked-hidden').forEach(showItem);
        checkAndHideItems();
    }

    function exportKeywords() {
        const keywords = getKeywords();
        const text = JSON.stringify(keywords, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            alert('关键词已复制到剪贴板！\n可直接保存为 .json 文件或分享给他人。');
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制控制台输出。\n（请在控制台查看关键词）');
            console.log('关键词列表（JSON）:', text);
        });
    }

    function importKeywords() {
        const input = prompt('请粘贴关键词 JSON 数组（例如：["关键词1","关键词2"]）：');
        if (!input) return;

        try {
            const parsed = JSON.parse(input);
            if (!Array.isArray(parsed)) throw new Error('关键词JSON数组格式有误，请确保输入的是有效的 JSON 字符串数组。\n例如：["关键词1","关键词2"]');
            const keywords = [...new Set(parsed.filter(kw => typeof kw === 'string' && kw.trim() !== '').map(kw => kw.trim()))];
            saveKeywords(keywords);
            renderKeywordList();
            checkAndHideItems();
            alert('关键词导入成功！');
        } catch (e) {
            alert('导入失败！请确保输入的是有效的 JSON 字符串数组。\n例如：["关键词1","关键词2"]');
            console.error('导入错误:', e);
        }
    }

    function clearKeywords() {
        if (confirm('确定要清空所有关键词吗？\n清空后将恢复默认关键词列表。')) {
            localStorage.removeItem(STORAGE_KEY);
            renderKeywordList();
            document.querySelectorAll('.keyword-blocked-hidden').forEach(showItem);
            checkAndHideItems();
            alert('已清空并恢复默认关键词。');
        }
    }

    if (typeof GM_registerMenuCommand !== 'undefined') {
        GM_registerMenuCommand('打开关键词屏蔽设置', createOrShowPanel);
    }

    function init() {
        checkAndHideItems();
        const observer = new MutationObserver(checkAndHideItems);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
