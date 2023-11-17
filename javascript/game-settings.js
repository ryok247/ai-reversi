"use strict";

export class gameSettings{
    constructor(){
        this.mode = this.getRadioValue("mode");
        this.color = this.getRadioValue("color");
        this.level = this.getRadioValue("level");
    }

    getRadioValue(name){
        let elements = document.getElementsByName(name);
        let checkedValue = '';
    
        for (let i = 0; i < elements.length; i++){
            if (elements[i].checked) checkedValue = elements[i].value;
        }
    
        return checkedValue;
    }
}