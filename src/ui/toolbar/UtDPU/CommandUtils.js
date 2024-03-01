function ApplySetup(cmdSocket_) {
    let json = {
        "jsonrpc": "2.0",
        "method": "applySetup",
        "id": 9999999
    };

    cmdSocket_.send(JSON.stringify(json));
}

function ClearAcquisitionData(cmdSocket_) {
    let json = {
        "jsonrpc": "2.0",
        "method": "clearAcquisitionData",
        "id": 90
    };

    cmdSocket_.send(JSON.stringify(json));
}

function GetClientId(cmdSocket_) {
    let json = {
        "jsonrpc": "2.0",
        "method": "getClientId",
        "id": 111
    };

    cmdSocket_.send(JSON.stringify(json));
}

function GetDevices(cmdSocket_) {
    let json = {
        "jsonrpc": "2.0",
        "method": "getDevices",
        "id": 3011
    };
    cmdSocket_.send(JSON.stringify(json));
}

function GetFileNames(cmdSocket_) {
    let commandGetFileNames = {
        jsonrpc: "2.0",
        id: 999,
        method: "getFileNames"
    };

    cmdSocket_.send(JSON.stringify(commandGetFileNames));
}

function GetGroup(cmdSocket_, groupId_) {
    let getGroupCommand =
    {
        "jsonrpc": "2.0",
        "id": 899,
        "method": "getGroup",
        "params": {
            "groupId": groupId_
        }
    };

    let jsonString = JSON.stringify(getGroupCommand);
    console.log(jsonString);
    cmdSocket_.send(jsonString);
}

function GetGroups(cmdSocket_, groupIds_) {
    let getGroupsCommand =
    {
        "jsonrpc": "2.0",
        "id": 899,
        "method": "getGroups",
        "params": {
            "groupIds": [groupIds_]
        }
    };

    let jsonString = JSON.stringify(getGroupsCommand);
    console.log(jsonString);
    cmdSocket_.send(jsonString);
}

function GetMechanicalSettings(cmdSocket_, groupIds_) {

    var command =
    {
        "jsonrpc": "2.0",
        "id": 8888,
        "method": "getMechanicalSettings",
        "params": {
            "groupIds": [groupIds_]
        }
    }

    cmdSocket_.send(JSON.stringify(command));
}

function LoadDataFile(cmdSocket_, pathFileName_) {

    var commandLoadFiles =
    {
        jsonrpc: "2.0",
        id: 72,
        method: "loadFile",
        params: {
            "pathFileName": pathFileName_
        }
    };
    cmdSocket_.send(JSON.stringify(commandLoadFiles));
}

function LoadPalettes(cmdSocket_) {
    var commandGetPalettes =
    {
        jsonrpc: "2.0",
        id: 888,
        method: "getColorPalettes",
        params: {
            palettes: [
                {
                    id: 1,
                    name: "rainbow",
                    format: "exa"
                },
                {
                    id: 2,
                    name: "gray"
                },
                {
                    id: 3,
                    name: "thickness"
                },
                {
                    id: 4,
                    name: "omniscan-t"
                },
                {
                    id: 5,
                    name: "tfm-dark"
                },
                {
                    id: 6,
                    name: "yellow"
                }
            ]
        }
    };
    cmdSocket_.send(JSON.stringify(commandGetPalettes));
}

function LoadSetupFile(cmdSocket_, pathFileName_) {

    var commandLoadFiles =
    {
        jsonrpc: "2.0",
        id: 72,
        method: "loadFile",
        params: {
            "pathFileName": pathFileName_
        }
    };
    cmdSocket_.send(JSON.stringify(commandLoadFiles));
}

function MapDevices(cmdSocket_, relations_) {
    var command =
    {
        jsonrpc: "2.0",
        id: 2222,
        method: "mapDevices",
        params: {
            "relations": [...relations_]
        }
    };
    cmdSocket_.send(JSON.stringify(command));
}

function MouseDown(cmdSocket_, event_) {
    var mouseDownCommand =
    {
        jsonrpc: "2.0",
        id: 1100,
        method: "mouseDown",
        params: {
            "viewId": +this.viewId,
            "buttons": +event_.buttons,
            "x": +event_.offsetX,
            "y": +event_.offsetY,
            "altKey": +event_.altKey,
            "ctrlKey": +event_.ctrlKey,
            "shiftKey": +event_.shiftKey
        }
    };
    cmdSocket_.send(JSON.stringify(mouseDownCommand));
}

function MouseMove(cmdSocket_, event_) {
    var mouseMoveCommand =
    {
        jsonrpc: "2.0",
        id: 1102,
        method: "mouseMove",
        params: {
            "viewId": +this.viewId,
            "buttons": +event_.buttons,
            "x": +event_.offsetX,
            "y": +event_.offsetY,
            "altKey": +event_.altKey,
            "ctrlKey": +event_.ctrlKey,
            "shiftKey": +event_.shiftKey
        }
    };
    cmdSocket_.send(JSON.stringify(mouseMoveCommand));
}

function MouseUp(cmdSocket_, event_){
    var mouseUpCommand =
    {
        jsonrpc: "2.0",
        id: 1102,
        method: "mouseUp",
        params: {
            "viewId": +this.viewId,
            "buttons": +event_.buttons,
            "x": +event_.offsetX,
            "y": +event_.offsetY,
            "altKey": +event_.altKey,
            "ctrlKey": +event_.ctrlKey,
            "shiftKey": +event_.shiftKey
        }
    };
    cmdSocket_.send(JSON.stringify(mouseUpCommand));
}

function MouseWheel(cmdSocket_, event_){
    var mouseWheelCommand =
    {
        jsonrpc: "2.0",
        id: 1102,
        method: "mouseWheel",
        params: {
            "viewId": +this.viewId,
            "buttons": +event_.buttons,
            "x": +event_.offsetX,
            "y": +event_.offsetY,
            "altKey": +event_.altKey,
            "ctrlKey": +event_.ctrlKey,
            "shiftKey": +event_.shiftKey,
            "deltaX": event_.wheelDeltaX,
            "deltaY": event_.wheelDeltaY,
        }
    };
    cmdSocket_.send(JSON.stringify(mouseWheelCommand));
}

function RenderView(cmdSocket_, id_) {
    var commandTestToolUpdateViews =
    {
        jsonrpc: "2.0",
        id: 10277,
        method: "renderViews",
        params: {
            ids: [id_]
        }
    };
    cmdSocket_.send(JSON.stringify(commandTestToolUpdateViews));
}

function RenderViews(cmdSocket_) {
    var commandTestToolUpdateViews =
    {
        jsonrpc: "2.0",
        id: 10277,
        method: "renderViews"
    };
    cmdSocket_.send(JSON.stringify(commandTestToolUpdateViews));
}

function SetAcquisitionAscanLength(cmdSocket_, groupId_, ascanLength_, beamCount_) {

    var command =
    {
        "jsonrpc": "2.0",
        "id": 1577,
        "method": "updateGroup",
        "params": {
            "groupId": groupId_,
            "paut": {
                "beams": []
            }
        }
    }

    for (let i = 0; i < beamCount_; ++i) {
        let jsonBeams = command["params"]["paut"]["beams"];
        jsonBeams.push({ "ascanLength": +ascanLength_ });
    }

    cmdSocket_.send(JSON.stringify(command));
}

function SetAcquisitionAscanStart(cmdSocket_, groupId_, ascanStart_, beamCount_) {

    var command =
    {
        "jsonrpc": "2.0",
        "id": 1577,
        "method": "updateGroup",
        "params": {
            "groupId": groupId_,
            "paut": {
                "beams": []
            }
        }
    }

    for (i = 0; i < beamCount_; ++i) {
        let jsonBeams = command["params"]["paut"]["beams"];
        jsonBeams.push({ "ascanStart": ascanStart_ });
    }

    cmdSocket_.send(JSON.stringify(command));
}

function SetAcquisitionGain(cmdSocket_, groupId_, gain_) {
    var command =
    {
        jsonrpc: "2.0",
        id: 1577,
        method: "updateGroup",
        params: {
            groupId: groupId_,
            paut:
            {
                gain: gain_
            }
        }
    };

    cmdSocket_.send(JSON.stringify(command));
}

function SetAcquisitionGateStart(cmdSocket_, gateId_, start_) {
    let command;
    if (gateId_ == 0) {
        command =
        {
            jsonrpc: "2.0",
            id: 1577,
            method: "updateGroup",
            params: {
                groupId: 0,
                paut:
                {
                    gates: [
                        {
                            start: start_
                        }
                    ]
                }
            }
        };
    }
    else if (gateId_ == 1) {
        command =
        {
            jsonrpc: "2.0",
            id: 1577,
            method: "updateGroup",
            params: {
                groupId: 0,
                paut:
                {
                    gates: [
                        null,
                        {
                            start: start_
                        }
                    ]
                }
            }
        };
    }

    cmdSocket_.send(JSON.stringify(command));
}

function SetAcquisitionRate(cmdSocket_, value_) {
    let groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);
    var commandSetAcquisitionRate =
    {
        "jsonrpc": "2.0",
        "id": 8765,
        "method": "setAcquisitionRate",
        "params": {
            "groupId": groupId,
            "acquisitionRate": value_ /// 12 //0.42  divise par 12 pour demo a cause bug firmware.
        }
    };
    cmdSocket_.send(JSON.stringify(commandSetAcquisitionRate));
}

function SetAnalysistGain(cmdSocket_, groupId_, analysisGain_) {

    var command =
    {
        "jsonrpc": "2.0",
        "id": 1577,
        "method": "updateGroup",
        "params": {
            "groupId": groupId_,
            "paut": {
                "softwareProcess": {
                    "gain": analysisGain_
                }
            }
        }
    };
    cmdSocket_.send(JSON.stringify(command));
}

async function SetViewsArea(cmdSocket_) {

    //var keepCalling = true;
    //setTimeout(function () {
    //    keepCalling = false;
    //}, 600000);

    //while (keepCalling) {

    for (i = 0; i < 2/*1250*/; i++) {

        let x1 = Math.floor(Math.random() * 399);
        let x2 = x1 + Math.floor(Math.random() * 399) + 2
        let y1 = Math.floor(Math.random() * 199);
        let y2 = y1 + Math.floor(Math.random() * 199) + 2;

        let commandSetViewsArea = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "setViewsArea",
            "params": {
                "views": [
                    {
                        "id": 1,
                        "x1": x1,
                        "x2": x2,
                        "y1": y1,
                        "y2": y2
                    }//,
                    //{
                    //    "id": 2,
                    //    "x1": x1,
                    //    "x2": x2,
                    //    "y1": y1,
                    //    "y2": y2,
                    //    "xUnit": "mm",
                    //    "yUnit": "mm"
                    //},
                    //{
                    //    "id": 6,
                    //    "x1": x1,
                    //    "x2": x2,
                    //    "y1": y1,
                    //    "y2": y2,
                    //    "xUnit": "mm",
                    //    "yUnit": "mm"
                    //}
                    //,
                    //{
                    //    "id": 200,
                    //    "x1": x1,
                    //    "x2": x2,
                    //    "y1": y1,
                    //    "y2": y2,
                    //    "xUnit": "mm",
                    //    "yUnit": "mm"
                    //},
                    //{
                    //    "id": 201,
                    //    "x1": x1,
                    //    "x2": x2,
                    //    "y1": y1,
                    //    "y2": y2,
                    //    "xUnit": "mm",
                    //    "yUnit": "mm"
                    //}
                ]
            }
        };

        cmdSocket_.send(JSON.stringify(commandSetViewsArea));
    }

    //await sleep(4000);
    //}

}

function StartAcquisition(cmdSocket_) {

    var command = {
        jsonrpc: "2.0",
        id: 3,
        method: "startAcquisition"
    };
    cmdSocket_.send(JSON.stringify(command));
}

function StopAcquisition(cmdSocket_) {

    var command = {
        jsonrpc: "2.0",
        id: 4,
        method: "stopAcquisition"
    };
    cmdSocket_.send(JSON.stringify(command));
}

function TestToolGetDataSources(cmdSocket_) {
    let cmd =
    {
        "jsonrpc": "2.0",
        "id": 2023,
        "method": "testToolGetDataSources"
    };

    let jsonString = JSON.stringify(cmd);
    console.log(jsonString);
    cmdSocket_.send(jsonString);
}

function AddSomeAcquisitionReadings(cmdSocket_, groupId_, beamIndex_) {
    let cmd =
    {
        "jsonrpc": "2.0",
        "id": 69420,
        "method": "addReadings",
        "params":
        {
            "readings":
            [
                {
                    "id":0,
                    "readingType": "gatePositionA",
                    "params":
                    {
                        "groupId": groupId_,
                        "beamIndex": beamIndex_
                    }
                },
                {
                    "id":1,
                    "readingType": "gateAmplitudeA",
                    "params":
                    {
                        "groupId": groupId_,
                        "beamIndex": beamIndex_
                    }
                },
                {
                    "id":2,
                    "readingType": "scanReferenceCursor"
                },
                {
                    "id":3,
                    "readingType": "scanDataCursor"
                }
            ]
        }
    };

    cmdSocket_.send(JSON.stringify(cmd));
}
