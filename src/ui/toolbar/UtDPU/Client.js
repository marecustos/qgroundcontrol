HtmlAddBr(divMenu);

let addLayoutABCDButton = HtmlAddButton(groupBoxViews, "Add ABCD", function () { SetLayoutABCD(); }, false);
addLayoutABCDButton.enabled = false;
let addLayoutABDButton = HtmlAddButton(groupBoxViews, "Add ABD", function () { SetLayoutABD(); }, false);
addLayoutABDButton.enabled = false;
let addLayoutBDButton = HtmlAddButton(groupBoxViews, "Add BD", function () { SetLayoutBD(); }, false);
addLayoutBDButton.enabled = false;
let addLayoutCCButton = HtmlAddButton(groupBoxViews, "Add CC", function () { SetLayoutCC(); }, false);
addLayoutCCButton.enabled = false;
let addLayout12AButton = HtmlAddButton(groupBoxViews, "Add 12A", function () { SetLayout12A(); }, false);
addLayout12AButton.enabled = false;

let addLayout8CButton = HtmlAddButton(groupBoxViews, "Add 8C", function () { SetLayout8C(); }, false);
addLayout8CButton.enabled = false;

let addLayout2C12A = HtmlAddButton(groupBoxViews, "Add 2C12A", function () { SetLayout2C12A(); }, false);
addLayout2C12A.enabled = false;

let g_viewId = 0;


function AddAscan(setViewsCommand_, groupId_, beamIndex_) {

    var ascanArray = setViewsCommand_["params"]["views"]["ascan"];
    ascanArray.push(
        {
            "id": ++g_viewId,
            "horizontal": {
                "type": "ultrasound",
                "orientation": "ltr",
                "length": 900
            },
            "vertical": {
                "type": "amplitude",
                "orientation": "btt",
                "length": 100
            },
            "paletteName": "yellow",
            "source": {
                "groupId": groupId_,
                "beamIndex": beamIndex_
            }
        });

    return setViewsCommand_;
}
function AddBscan(setViewsCommand_, groupId_) {

    var bscanArray = setViewsCommand_["params"]["views"]["bscan"];
    bscanArray.push(
        {
            "id": ++g_viewId,
            "horizontal": {
                "type": "scan",
                "orientation": "ltr",
                "length": 900
            },
            "vertical": {
                "type": "ultrasound",
                "orientation": "btt",
                "length": 300
            },
            "source": {
                "groupId": groupId_
            }
        });

    return setViewsCommand_;
}

function AddCscan(setViewsCommand_, groupId_, gateId_) {

    var cscanArray = setViewsCommand_["params"]["views"]["cscan"];
    cscanArray.push(
        {
            "id": ++g_viewId,
            "horizontal": {
                "type": "scan",
                "orientation": "ltr",
                "length": 900
            },
            "vertical": {
                "type": "index",
                "orientation": "btt",
                "length": 300
            },
            "source": {
                "groupId": groupId_,
                "gateIds": gateId_,
                "data": "amplitude"
            }
        });

    return setViewsCommand_;
}

function AddDscan(setViewsCommand_, groupId_){

    var dscanArray = setViewsCommand_["params"]["views"]["dscan"];
    dscanArray.push(
        {
            "id": ++g_viewId,
            "horizontal": {
                "type": "index",
                "orientation": "ltr",
                "length": 900
            },
            "vertical": {
                "type": "ultrasound",
                "orientation": "btt",
                "length": 300
            },
            "source": {
                "groupId": groupId_
            }
        });

    return setViewsCommand_;
}

let command_setViews = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "addViews",
    "params": {
        "views": {
            "ascan": [],
            "bscan": [],
            "cscan": [],
            "dscan": []
        }
    }
};

function SetLayout12A() {
    let groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);
    let setViewsCommand = JSON.parse(JSON.stringify(command_setViews)); //clone

    for (let i = 0; i < 12; ++i) {
        setViewsCommand = AddAscan(setViewsCommand, groupId, i);
    };

    SetViews(setViewsCommand);
    cmdSocket.send(JSON.stringify(setViewsCommand));
    RenderViews(cmdSocket_);
}

function SetLayoutABD() {
    let groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);
    let setViewsCommand = JSON.parse(JSON.stringify(command_setViews)); //clone

    setViewsCommand = AddAscan(setViewsCommand, groupId, 0);
    setViewsCommand = AddBscan(setViewsCommand, groupId);
    setViewsCommand = AddDscan(setViewsCommand, groupId);

    SetViews(setViewsCommand);
    cmdSocket.send(JSON.stringify(setViewsCommand));
    RenderViews(cmdSocket_);
}

function SetLayoutBD() {
    let groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);
    let setViewsCommand = JSON.parse(JSON.stringify(command_setViews)); //clone

    setViewsCommand = AddBscan(setViewsCommand, groupId);
    setViewsCommand = AddDscan(setViewsCommand, groupId);

    SetViews(setViewsCommand);
    cmdSocket.send(JSON.stringify(setViewsCommand));
    RenderViews(cmdSocket_);
}

function SetLayoutABCD() {
    let groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);
    let setViewsCommand = JSON.parse(JSON.stringify(command_setViews)); //clone

    setViewsCommand = AddCscan(setViewsCommand, groupId, 1);
    setViewsCommand = AddAscan(setViewsCommand, groupId, 0);
    setViewsCommand = AddBscan(setViewsCommand, groupId);
    setViewsCommand = AddDscan(setViewsCommand, groupId);

    SetViews(setViewsCommand);
    cmdSocket.send(JSON.stringify(setViewsCommand));
    RenderViews(cmdSocket_);
}

function SetLayoutCC() {
    let groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);
    let setViewsCommand = JSON.parse(JSON.stringify(command_setViews)); //clone

    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);
    setViewsCommand = AddCscan(setViewsCommand, groupId, 1);

    SetViews(setViewsCommand);
    cmdSocket.send(JSON.stringify(setViewsCommand));
    RenderViews(cmdSocket_);
}

function SetLayout8C() {
    let groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);

    let setViewsCommand = JSON.parse(JSON.stringify(command_setViews)); //clone
    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);    //ltr, btt

    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);
    setViewsCommand["params"]["views"]["cscan"][1]["vertical"]["orientation"] = "ttb";  //ltr, ttb

    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);
    setViewsCommand["params"]["views"]["cscan"][2]["horizontal"]["orientation"] = "rtl";    //rtl, btt

    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);
    setViewsCommand["params"]["views"]["cscan"][3]["horizontal"]["orientation"] = "rtl";    //rtl, ttb
    setViewsCommand["params"]["views"]["cscan"][3]["vertical"]["orientation"] = "ttb";


    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);    //ltr, btt
    setViewsCommand["params"]["views"]["cscan"][4]["horizontal"]["type"] = "index";
    setViewsCommand["params"]["views"]["cscan"][4]["horizontal"]["length"] = 300;
    setViewsCommand["params"]["views"]["cscan"][4]["vertical"]["type"] = "scan";
    setViewsCommand["params"]["views"]["cscan"][4]["vertical"]["length"] = 900;

    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);
    setViewsCommand["params"]["views"]["cscan"][5]["vertical"]["orientation"] = "ttb";  //ltr, ttb
    setViewsCommand["params"]["views"]["cscan"][5]["horizontal"]["type"] = "index";
    setViewsCommand["params"]["views"]["cscan"][5]["horizontal"]["length"] = 300;
    setViewsCommand["params"]["views"]["cscan"][5]["vertical"]["type"] = "scan";
    setViewsCommand["params"]["views"]["cscan"][5]["vertical"]["length"] = 900;

    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);
    setViewsCommand["params"]["views"]["cscan"][6]["horizontal"]["orientation"] = "rtl";    //rtl, btt
    setViewsCommand["params"]["views"]["cscan"][6]["horizontal"]["type"] = "index";
    setViewsCommand["params"]["views"]["cscan"][6]["horizontal"]["length"] = 300;
    setViewsCommand["params"]["views"]["cscan"][6]["vertical"]["type"] = "scan";
    setViewsCommand["params"]["views"]["cscan"][6]["vertical"]["length"] = 900;

    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);
    setViewsCommand["params"]["views"]["cscan"][7]["horizontal"]["orientation"] = "rtl";    //rtl, ttb
    setViewsCommand["params"]["views"]["cscan"][7]["vertical"]["orientation"] = "ttb";
    setViewsCommand["params"]["views"]["cscan"][7]["horizontal"]["type"] = "index";
    setViewsCommand["params"]["views"]["cscan"][7]["horizontal"]["length"] = 300;
    setViewsCommand["params"]["views"]["cscan"][7]["vertical"]["type"] = "scan";
    setViewsCommand["params"]["views"]["cscan"][7]["vertical"]["length"] = 900;

    SetViews(setViewsCommand);
    cmdSocket.send(JSON.stringify(setViewsCommand));
    RenderViews(cmdSocket_);
}

function SetLayout2C12A() {
    let groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);

    let setViewsCommand = JSON.parse(JSON.stringify(command_setViews)); //clone
    setViewsCommand = AddAscan(setViewsCommand, groupId, 0);
    setViewsCommand["params"]["views"]["ascan"][0]["horizontal"]["length"] = 1800;
    setViewsCommand["params"]["views"]["ascan"][0]["vertical"]["length"] = 300;

    setViewsCommand = AddCscan(setViewsCommand, groupId, 0);
    setViewsCommand["params"]["views"]["cscan"][0]["horizontal"]["length"] = 1800;
    setViewsCommand["params"]["views"]["cscan"][0]["vertical"]["length"] = 300;
    setViewsCommand = AddCscan(setViewsCommand, groupId, 1);
    setViewsCommand["params"]["views"]["cscan"][1]["horizontal"]["length"] = 1800;
    setViewsCommand["params"]["views"]["cscan"][1]["vertical"]["length"] = 300;

    for (i = 1; i < 13; ++i) {
        setViewsCommand = AddAscan(setViewsCommand, groupId, i);
    };
    
    SetViews(setViewsCommand);
    cmdSocket.send(JSON.stringify(setViewsCommand));
    RenderViews(cmdSocket_);
}

function OnReceivedGroup(objJsonResult_) {

    if (objJsonResult_.hasOwnProperty("paut")) {
        const pautGroup = objJsonResult_["paut"];
        const groupId = objJsonResult_.id;

        if (paramsByGroupId.get(groupId) == null) {
            let newgroupParams = DeepCopy(groupParams);
            paramsByGroupId.set(groupId, newgroupParams);
        }

        if (pautGroup.hasOwnProperty("softwareProcess")) {
            const softwareProcess = pautGroup.softwareProcess;
            if (softwareProcess.hasOwnProperty("gain")) {

                paramsByGroupId.get(groupId).analysis.gain = softwareProcess.gain;

                inputSoftGain.value = softwareProcess.gain;
            }
        }

        if (pautGroup.hasOwnProperty("gain")) {

            paramsByGroupId.get(groupId).acquisition.gain = pautGroup.gain;

            inputAcquisitionGain.value = pautGroup.gain;
        }

        if (pautGroup.hasOwnProperty("gates")) {
            const gates = pautGroup["gates"];

            let gateIStart = gates[0].start;
            let gateAStart = gates[1].start;

            paramsByGroupId.get(groupId).acquisition.gateIstart = gateIStart;
            paramsByGroupId.get(groupId).acquisition.gateAstart = gateAStart;

            inputAcquisitionGateIStart.value = gateIStart;
            inputAcquisitionGateAStart.value = gateAStart;
        }

        if (pautGroup.hasOwnProperty("beams")) {
            const beams = pautGroup["beams"];

            let ascanLength = beams[0].ascanLength;
            let ascanStart = beams[0].ascanStart;

            paramsByGroupId.get(groupId).acquisition.ascanStart = ascanStart;
            paramsByGroupId.get(groupId).acquisition.ascanLength = ascanLength;

            inputAcquisitionAscanLength.value = ascanLength;
            inputAcquisitionAscanStart.value = ascanStart;
        }
    }
}