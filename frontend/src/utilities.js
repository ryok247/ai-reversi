"use strict";

// generate random integer between [0,max]
export function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCsrfToken() {
    let csrfToken = null;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            csrfToken = cookie.substring('csrftoken='.length, cookie.length);
            break;
        }
    }
    return csrfToken;
}

export class NotImplementedError extends Error {
    constructor(message) {
        super(message || "This function is not implemented.");
        this.name = "NotImplementedError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotImplementedError);
        }
    }
}

export function makeAsync(syncFunction) {
    return async function(...args) {
        // Call a synchronous function asynchronously
        return syncFunction.apply(this, args);
    };
}

export function convertRowColToA1(row, col) {
    const a1 = String.fromCharCode('A'.charCodeAt(0) + col) + (row + 1);
    return a1;
}

export function convertA1ToRowCol(a1) {
    const row = parseInt(a1[1]) - 1;
    const col = a1.charCodeAt(0) - 'A'.charCodeAt(0);
    return [row, col];
}