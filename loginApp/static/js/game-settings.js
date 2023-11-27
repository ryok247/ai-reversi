"use strict";

export class gameSettings{
    constructor(...settingKeywords){
        settingKeywords.forEach(keyword => {
            this[keyword] = this.getInputValue(keyword);
        });
    }

    getInputValue(name){
        let elements = document.getElementsByName(name);
        let checkedValue = '';
    
        for (let i = 0; i < elements.length; i++){
            if (elements[i].checked) checkedValue = elements[i].value;
        }
    
        return checkedValue;
    }
}