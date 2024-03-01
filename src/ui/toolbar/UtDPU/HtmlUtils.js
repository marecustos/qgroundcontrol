//Retirer des option dans un combo html(select)
function RemoveOptions(obj) {
    while (obj.options.length) {
        obj.remove(0);
    }
}

function DeepCopy(jsonObject_) {
    return JSON.parse(JSON.stringify(jsonObject_));
}

function HtmlAddTextArea(div_, name_, id_) {
    var textArea = document.createElement("textarea");
    textArea.id = id_;
    textArea.name = name_;

    div_.appendChild(textArea);

    return textArea;
}

function HtmlAddGroupBox(div_, name_, id_, autoAdjustWidth_ = false) {
    var fieldset = document.createElement("fieldset");

    var legend = document.createElement("legend");
    legend.id = "leg_id";
    legend.innerHTML = name_;

    fieldset.appendChild(legend);
    fieldset.id = id_;
    if (autoAdjustWidth_) {
        fieldset.style = "width:0px";   //Auto adjust
    }

    div_.appendChild(fieldset);

    return fieldset;
}

function HtmlAddLabel(div_, name_) {
    var label = document.createElement("label");
    label.innerHTML = name_ + ": ";
    label.htmlFor = name_;
    div_.appendChild(label);
}

function HtmlAddLabelValue(div_, name_, value_) {
    HtmlAddLabel(div_, name_);
    var label = document.createElement("label");
    label.innerHTML = value_;
    div_.appendChild(label);
}

function HtmlAddBr(element_) {
    var br = document.createElement("br");
    element_.appendChild(br);
}

//function HtmlAddDataList(div_, name_, type_, inputId_, inputSize_, list_, br = true) {

//    //let list = document.createElement('datalist');
//    //list.id = 'cars';

//    //[1, 2, 3, 4, 5].forEach(i => {
//    //    let opt = document.createElement('option');
//    //    opt.value = `Option ${i}`;
//    //    opt.innerText = `Option ${i}`;
//    //    list.appendChild(opt);
//    //});

//    //document.body.appendChild(list);

//    //let input = document.createElement('input');
//    //input.setAttribute('list', 'cars');
//    //document.body.appendChild(input);

//    //---------------------------------
//    //let datalist = document.createElement('datalist');
//    //datalist.id = list_;
//    //div_.appendChild(datalist);

//    //let input = HtmlAddLabelInput(div_, name_, type_, inputId_, inputSize_, br = false)
//    //input.list = list_;


//    //if (br) { HtmlAddBr(div_); }

//    //return datalist;
//}

function HtmlAddCombo(div_, name_, items_, br = true) {
    HtmlAddLabel(div_, name_);

    let combo = document.createElement('select');
    combo.name = name_;
    combo.id = name_;

    if (items_.length > 0) {
        FillOptions(combo, items_);
    }

    div_.appendChild(combo);

    if (br) { HtmlAddBr(div_); }

    return combo;
}

function HtmlAddButton(div_, name_, callback_, br = true) {
    let button = document.createElement("button");
    let label = document.createTextNode(name_);
    button.appendChild(label);
    button.onclick = callback_;
    div_.appendChild(button);

    if (br) { HtmlAddBr(div_); }

    return button;
}

function HtmlAddInput(div_, type_, id_, size_, br = false) {
    let input = document.createElement("input");
    input.type = type_;
    input.id = id_;
    input.style["width"] = size_ + "em";
    div_.appendChild(input);


    //input.onmousewheel = (
    //    function () { this.focus(); }
    //);

    if (br) { HtmlAddBr(div_); }

    return input;
}

function HtmlAddLabelInput(div_, label_, type_,  inputId_, inputSize_, br = false) {
    HtmlAddLabel(div_, label_);
    let input = HtmlAddInput(div_, type_, inputId_, inputSize_);

    if (br) { HtmlAddBr(div_); }

    return input;
}

function HtmlAddInputWithButton(div_, label_, type_, inputId_, inputSize_, buttonCaption_, callback_, br = true) {
    let input = HtmlAddLabelInput(div_, label_, type_, inputId_, inputSize_);
    HtmlAddButton(div_, buttonCaption_, callback_, false);

    if (br) { HtmlAddBr(div_); }

    return input;
}

//function HtmlCreateMatchLists(parentElement_, leftMatchListItems_, rightMatchListItems_) {
//    const matchContainer = document.createElement("div");
//    //matchContainer.style.width = "800px";
//    //matchContainer.style.height = "100px";
//    //matchContainer.style.border = "1px solid black";
//    //matchContainer.style.overflow = "auto";

//    const leftContainer = document.createElement("div");
//    //leftContainer.style.width = "600px";
//    //leftContainer.style.height = "100px";
//    //leftContainer.style.border = "1px solid black";
//    //leftContainer.style.float = "left";

//    leftMatchListItems_.forEach((leftItem) => {
//        const leftItemElement = document.createElement("div");
//        leftItemElement.textContent = leftItem.name;
//        leftItemElement.draggable = true;
//        leftItemElement.dataset.id = leftItem.id;
//        leftItemElement.ondragstart = (e) => {
//            e.dataTransfer.setData("text", leftItem.id);
//        };
//        leftContainer.appendChild(leftItemElement);
//    });

//    const rightContainer = document.createElement("div");
//    //rightContainer.style.float = "right";
//    //rightContainer.style.width = "200px";
//    //rightContainer.style.height = "100px";
//    //rightContainer.style.border = "1px solid black";

//    rightMatchListItems_.forEach((rightItem) => {
//        const rightItemElement = document.createElement("div");
//        rightItemElement.textContent = rightItem.name;
//        rightItemElement.draggable = true;
//        rightItemElement.ondragstart = (e) => {
//            e.dataTransfer.setData("text", rightItem);
//        };
//        rightItemElement.ondragover = (e) => {
//            e.preventDefault();
//        };
//        rightItemElement.ondrop = (e) => {
//            e.preventDefault();
//            const groupId = e.dataTransfer.getData("text");
//            const groupItemElem = document.querySelector(`[data-id="${groupId}"]`);
//            const matchElem = document.createElement("div");
//            matchElem.textContent = `${groupItemElem.textContent} - ${rightItem.name}`;
//            matchContainer.appendChild(matchElem);
//            leftContainer.removeChild(groupItemElem);
//        };
//        rightContainer.appendChild(rightItemElement);
//    });

//    //matchContainer.style.clear = "both";

//    parentElement_.appendChild(leftContainer);
//    parentElement_.appendChild(rightContainer);
//    parentElement_.appendChild(matchContainer);

//    return matchContainer;
//}

function HtmlRemoveAllChildren(element_) {
    while (element_.firstChild) {
        element_.removeChild(element_.firstChild);
    }
}
function HtmlCreateMatchLists(parentElement_, leftMatchListItems_, rightMatchListItems_) {

    parentElement_.style.display = "flex";
    parentElement_.style.width = "1800px";
    parentElement_.style.margin = "0 auto";

    const matchContainer = document.createElement("div");
    matchContainer.style.flex = "1";
    matchContainer.style.border = "1px solid black";
    matchContainer.style.margin = "5px";
    matchContainer.style.padding = "10px"

    const leftContainer = document.createElement("div");
    leftContainer.style.flex = "1";
    leftContainer.style.border = "1px solid black";
    leftContainer.style.margin = "5px";
    leftContainer.style.padding = "10px";

    leftMatchListItems_.forEach((leftItem) => {
        const leftItemElement = document.createElement("div");

        leftItemElement.style.border = "1px solid black";
        leftItemElement.style.margin = "1px";
        leftItemElement.style.padding = "0px";
        leftItemElement.style.backgroundColor = "lightgray";

        leftItemElement.textContent = leftItem.name;
        leftItemElement.draggable = true;
        leftItemElement.dataset.id = leftItem.id;
        leftItemElement.ondragstart = (e) => {
            e.dataTransfer.setData("text", leftItem.id);
        };
        leftContainer.appendChild(leftItemElement);
    });

    const rightContainer = document.createElement("div");
    rightContainer.style.flex = "1";
    rightContainer.style.border = "1px solid black";
    rightContainer.style.margin = "5px";
    rightContainer.style.padding = "10px";
    rightContainer.style.width = "20%";
    //rightContainer.style.textAlign = "center";

    rightMatchListItems_.forEach((rightItem) => {
        const rightItemElement = document.createElement("div");

        rightItemElement.style.border = "1px solid black";
        rightItemElement.style.margin = "1px";
        rightItemElement.style.padding = "0px";
        rightItemElement.style.backgroundColor = "lightblue";

        rightItemElement.textContent = rightItem.name;
        rightItemElement.draggable = true;
        rightItemElement.ondragstart = (e) => {
            e.dataTransfer.setData("text", rightItem);
        };
        rightItemElement.ondragover = (e) => {
            e.preventDefault();
        };
        rightItemElement.ondrop = (e) => {
            e.preventDefault();
            const leftElementId = e.dataTransfer.getData("text");
            const leftItemElem = document.querySelector(`[data-id="${leftElementId}"]`);
            const matchElem = document.createElement("div");

            matchElem.style.border = "1px solid black";
            matchElem.style.margin = "1px";
            matchElem.style.padding = "0px";
            matchElem.style.backgroundColor = "lightgreen";

            matchElem.textContent = `${leftItemElem.textContent} - ${rightItem.name}`;
            matchElem.setAttribute('matchIds', JSON.stringify({ leftId: leftElementId, rightId: rightItem.id }));
            matchContainer.appendChild(matchElem);
            leftContainer.removeChild(leftItemElem);
        };
        rightContainer.appendChild(rightItemElement);
    });

    //matchContainer.style.clear = "both";

    parentElement_.appendChild(leftContainer);
    parentElement_.appendChild(rightContainer);
    parentElement_.appendChild(matchContainer);

    return matchContainer;
}