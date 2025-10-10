// ==UserScript==
// @name         B站动态视频简介关键词屏蔽器
// @namespace    https://github.com/CSCTACG/Bilibili-dynamic-video-introduction-keyword-blocker
// @version      1.4
// @description  屏蔽B站动态中视频简介包含指定关键词的视频，支持自定义关键词管理
// @author       CSCTACG
// @match        https://t.bilibili.com/*
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ============ 配置 ============
    const STORAGE_KEY = 'bili_keyword_blocker_keywords';
    const DEFAULT_KEYWORDS = [
    "116864",
    "126519",
    "273493",
    "476644",
    "149721",
    "610742",
    "910323",
    "143859374984",
    "54214807822",
    "a16789",
    "32793225",
    "11770282",
    "27502730",
    "1977291374",
    "Karsamzing苏弟",
    "126523",
    "126518",
    "153246",
    "25277646",
    "25383355",
    "1939021227",
    "童锦程",
    "770714",
    "426743",
    "解限机",
    "5609440",
    "821839",
    "22913442",
    "头号追击",
    "147613",
    "126524",
    "27364915",
    "永恒轮回",
    "23220418",
    "30241587",
    "4867882",
    "4133084",
    "阿梓",
    "24965442",
    "yjj",
    "32712223",
    "27692899"
    ];

    // ============ 工具函数 ============
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

    // ============ GUI 面板 ============
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
                    width: 300px;
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
                        <input type="text" id="new-keyword" placeholder="输入关键词（如：苏弟）"
                            style="width: 100%; padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        <button id="add-keyword" style="
                            margin-top: 6px; width: 100%; padding: 6px 0;
                            background: #00a1d6; color: white; border: none; border-radius: 4px; cursor: pointer;
                        ">添加关键词</button>
                    </div>

                    <div style="max-height: 200px; overflow-y: auto; border-top: 1px solid #eee; padding-top: 8px;">
                        <div id="keyword-list" style="display: flex; flex-direction: column; gap: 6px;"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);

            panel.querySelector('#close-panel').onclick = () => panel.style.display = 'none';
            panel.querySelector('#add-keyword').onclick = addKeyword;
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

    // ============ 注册 Tampermonkey 菜单项 ============
    if (typeof GM_registerMenuCommand !== 'undefined') {
        GM_registerMenuCommand('打开关键词屏蔽设置', createOrShowPanel);
    }

    // ============ 初始化 ============
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