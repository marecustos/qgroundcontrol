const LZ4 = require('lz4');
const Buffer = require('buffer').Buffer;
const strContext = 'webgl';
let newData = false;
let thicknessPalette = 0;
let rainbowPalette = 0;
let grayPalette = 0;
let yellowPalette = 0;
let omniscanPalette = 0;
let tfmDark = 0;
let whitePalette = [];
let images = [];                //Array de Array de bytes contenant les amplitudes a passer au shader 1 par vue.
let glContexts = [];
let viewIds = [];

let gateIStart = 0;
let gateAStart = 0;
let ascanLength = 0;
let ascanStart = 0;
let g_jsonDevices = [];
let g_jsonGroups = [];
let deviceMatchContainer = 0;
let missingDeviceRelations = false;

let commonGroupParams = { gain: 0, gateIStart: 0, gateILength: 0, gateAStart: 0, gateALength: 0, gateBStart: 0, gateBLength: 0 };
let groupParams = {
    analysis: {
        ...commonGroupParams
    },
    acquisition: {
        acqRate: 0,
        ascanStart: 0,
        ascanLength: 0,
        ...commonGroupParams
    }
};

let paramsByGroupId = new Map();
let beamsByGroupId = new Map();

let divMenuConnection = document.querySelector('#divMenuConnection');
let divMenuLoad = document.querySelector('#divMenuLoad');
let divMenuGroupDeviceMatch = document.querySelector('#divMenuGroupDeviceMatch');
let divMenu = document.querySelector('#divMenu');

let comboDpuIp = HtmlAddCombo(divMenuConnection, "Dpu Ip: ", ["127.0.0.1", "192.168.2.90", "10.163.161.39", "192.168.56.1", "10.163.161.74", "10.163.161.22"]);
let comboDpuCommandPort = HtmlAddCombo(divMenuConnection, "Dpu COMMAND port: ", ["1333"]);
let comboDpuDataPort = HtmlAddCombo(divMenuConnection, "Dpu DATA port:", ["1233"]);
let comboDpuEventPort = HtmlAddCombo(divMenuConnection, "Dpu Event port:", ["1433"], false);

HtmlAddButton(divMenuConnection, "Connect to DPU", function () { OnApplyNetworkConfig(); });
HtmlAddBr(divMenuConnection);

let comboDevices = HtmlAddCombo(divMenuConnection, "Devices", []);

let dataSocket = 0;
let cmdSocket = 0
let eventSocket = 0

whitePalette[0] = "#000000";
for (let pal = 1; pal < 256; pal++) {
    whitePalette[pal] = "#ffffff";
}

HtmlAddBr(divMenuLoad);
let comboSetupFileNames = HtmlAddCombo(divMenuLoad, "Setup Files", [], false);
HtmlAddButton(divMenuLoad, "Load Setup", function () { OnLoadSetupFiles(); });
let comboDataFileNames = HtmlAddCombo(divMenuLoad, "Data Files", [], false);
HtmlAddButton(divMenuLoad, "Load Data", function () { OnLoadDataFiles(); });
HtmlAddBr(divMenuLoad);

HtmlAddBr(divMenu);
let comboConfigs = HtmlAddCombo(divMenu, "Groups", [], false);
let comboBeams = HtmlAddCombo(divMenu, "Beams", [], false);
let comboGates = HtmlAddCombo(divMenu, "Gates", []);
HtmlAddBr(divMenu);

comboConfigs.addEventListener('change', (event) => {
    const groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);

    const currentGroupParams = paramsByGroupId.get(groupId);
    if (currentGroupParams != null) {
        inputAcquisitionRate.value = currentGroupParams.acquisition.acqRate;
        inputAcquisitionGain.value = currentGroupParams.acquisition.gain;
        inputAcquisitionAscanStart.value = currentGroupParams.acquisition.ascanStart;
        inputAcquisitionAscanLength.value = currentGroupParams.acquisition.ascanLength;
        inputAcquisitionGateAStart = currentGroupParams.acquisition.gateAStart;
        inputAcquisitionGateIStart = currentGroupParams.acquisition.gateIStart;
    }
});


HtmlAddButton(divMenu, "Start Acquisition", function () { OnStartAcquisitionClick(); }, false);
HtmlAddButton(divMenu, "Stop Acquisition", function () { OnStopAcquisitionClick(); }, false);
HtmlAddButton(divMenu, "Clear Acquisition Data", function () { OnClearAcquisitionDataClick(); });
HtmlAddBr(divMenu);

let inputAcquisitionRate = HtmlAddLabelInput(divMenu, "Acq Rate", "number", "input_acq_rate", 5);
inputAcquisitionRate.value = 50.0;
inputAcquisitionRate.onchange = function (e) {
    console.log(e.target.value);
    SetAcquisitionRate(cmdSocket, +e.target.value);
};

let inputAcquisitionGain = HtmlAddLabelInput(divMenu, "Acquisition Gain", "number", "input_gain", 5);
inputAcquisitionGain.value = 25.0;
inputAcquisitionGain.onchange = function (e) {
    console.log(e.target.value);
    SetAcquisitionGain(cmdSocket, parseInt(comboConfigs.options[comboConfigs.selectedIndex].id) , +e.target.value);
};

let inputAcquisitionAscanLength = HtmlAddLabelInput(divMenu, "Acquisition AscanLength", "number", "input_ascan_length", 5);
inputAcquisitionAscanLength.value = ascanLength;
inputAcquisitionAscanLength.onchange = function (e) {
    console.log(e.target.value);
    let selectedGroup = JSON.parse(comboConfigs.value);
    SetAcquisitionAscanLength(cmdSocket, parseInt(comboConfigs.options[comboConfigs.selectedIndex].id), e.target.value, selectedGroup.beamCount);
};

let inputAcquisitionAscanStart = HtmlAddLabelInput(divMenu, "Acquisition AscanStart", "number", "input_ascan_start", 5);
inputAcquisitionAscanStart.value = ascanStart;
inputAcquisitionAscanStart.onchange = function (e) {
    console.log(e.target.value);
    let selectedGroup = JSON.parse(comboConfigs.value);
    SetAcquisitionAscanStart(cmdSocket, parseInt(comboConfigs.options[comboConfigs.selectedIndex].id), +e.target.value, selectedGroup.beamCount);
};

let inputAcquisitionGateIStart = HtmlAddLabelInput(divMenu, "Acquisition GateI start", "number", "input_gateI_start", 5);
inputAcquisitionGateIStart.value = gateIStart;
inputAcquisitionGateIStart.onchange = function (e) {
    console.log(e.target.value);
    SetAcquisitionGateStart(cmdSocket, parseInt(comboConfigs.options[comboConfigs.selectedIndex].id), +e.target.value);
};

let inputAcquisitionGateAStart = HtmlAddLabelInput(divMenu, "Acquisition GateA start", "number", "input_gateA_start", 5);
inputAcquisitionGateAStart.value = gateAStart;
inputAcquisitionGateAStart.onchange = function (e) {
    console.log(e.target.value);
    SetAcquisitionGateStart(cmdSocket, parseInt(comboConfigs.options[comboConfigs.selectedIndex].id), +e.target.value);
};

inputAcquisitionGain.addEventListener('wheel', function (){
    SetAcquisitionGain(cmdSocket, parseInt(comboConfigs.options[comboConfigs.selectedIndex].id), +inputAcquisitionGain.value);
}.bind(this));

let inputSoftGain = HtmlAddLabelInput(divMenu, "Soft Gain", "number", "input_soft_gain", 5, true);
inputSoftGain.value = 1.1;
inputSoftGain.addEventListener('wheel', function () {
    SetAnalysistGain(cmdSocket, parseInt(comboConfigs.options[comboConfigs.selectedIndex].id), +inputSoftGain.value);
}.bind(this));

HtmlAddBr(divMenu);

let groupBoxViews = HtmlAddGroupBox(divMenu, "Views configuration", "views_config_group_box");

let inputViewId = HtmlAddLabelInput(groupBoxViews, "Id", "number", "input_view_id", 5);
let inputWidth = HtmlAddLabelInput(groupBoxViews, "Width", "number", "input_width", 5);
let inputHeight = HtmlAddLabelInput(groupBoxViews, "Height", "number", "input_height", 5);
let comboPalettes = HtmlAddCombo(groupBoxViews, "Palettes", GetPalettes(), false);
let comboCscanData = HtmlAddCombo(groupBoxViews, "Cscan data", GetCScanDataTypes(), false);
let inputMaxed = HtmlAddLabelInput(groupBoxViews, "Maxed", "checkbox", "input_maxed");
let comboHorizontalDir = HtmlAddCombo(groupBoxViews, "Horizontal Dir", ["ltr", "rtl"], false);
let comboVerticalDir = HtmlAddCombo(groupBoxViews, "Vertical Dir", ["btt", "ttb"]);

let comboAscanDataSources = HtmlAddCombo(groupBoxViews, "Ascan Data Source", [], false);
let buttonAddAscanView = HtmlAddButton(groupBoxViews, "Add Ascan view", function () { OnAddAscanView(); }, false);
let comboBscanDataSources = HtmlAddCombo(groupBoxViews, "Bscan Data Source", [], false);
let buttonAddBscanView = HtmlAddButton(groupBoxViews, "Add Bscan view", function () { OnAddBscanView(); }, false);
let comboCscanDataSources = HtmlAddCombo(groupBoxViews, "Cscan Data Source", [], false);
let buttonAddCscanView = HtmlAddButton(groupBoxViews, "Add Cscan view", function () { OnAddCscanView(); }, false);
let comboDscanDataSources = HtmlAddCombo(groupBoxViews, "Dscan Data Source", [], false);
let buttonAddDscanView = HtmlAddButton(groupBoxViews, "Add Dscan view", function () { OnAddDscanView(); });

HtmlAddBr(groupBoxViews);
HtmlAddButton(groupBoxViews, "Zoom", function () { SetViewsArea(cmdSocket); });

HtmlAddButton(divMenu, "Add Some AcqReadings", function() {AddSomeAcquisitionReadings(cmdSocket, g_jsonGroups[0].id, 0);})

let renderViewInput = HtmlAddLabelInput(groupBoxViews, "View Id", "number", "render_view_id", 5);
HtmlAddButton(groupBoxViews, "Render", function () { RenderView(cmdSocket, +renderViewInput.value); });

let inputOverlayVisibility = HtmlAddLabelInput(groupBoxViews, "Overlay", "checkbox", "input_overlay-1");
inputOverlayVisibility.checked = true;
inputOverlayVisibility.addEventListener('change', (event) => {
    ToggleOverlayVisibility();
});

FillDefaultViewsParams("cscan");

inputViewId.value = 200;

let dataCursorX = 0.0;
let dataCursorY = 0.0;

function OnMapDevicesButtonClick() {

    let deviceSerialToGroupIds = new Map();
    
    deviceMatchContainer.childNodes.forEach((element => {
        const matchIds = JSON.parse(element.getAttribute('matchIds'));

        let deviceSerial = matchIds.rightId;
        let groupId = matchIds.leftId;

        if (!deviceSerialToGroupIds.has(deviceSerial))
            deviceSerialToGroupIds.set(deviceSerial, []);
        deviceSerialToGroupIds.get(deviceSerial).push(groupId);
    }));

    let relations = [];

    deviceSerialToGroupIds.forEach(function (value, key) {
        let deviceSerial = key;
        let groupIds = value;
        const intGroupArray = groupIds.map(str => parseInt(str));
        relations.push({ serial: deviceSerial, groupIds: intGroupArray });
    });

    if (relations.length)
        MapDevices(cmdSocket, relations);
}

function ToggleOverlayVisibility() {

    const divCanvasItems = document.querySelectorAll('[id^="canvas-overlay"]');
    for (let i = 0; i < divCanvasItems.length; i++) {
        const overlay = divCanvasItems[i];
        if (overlay.style.display === 'none') {
            overlay.style.display = 'block';
        } else {
            overlay.style.display = 'none';
        }
    }
}

function RelocateCanvasOverlay() {
    const divCanvasItems = document.querySelectorAll('[id^="canvas-overlay"]');
    for (let i = 0; i < divCanvasItems.length; i++) {
        const overlay = divCanvasItems[i];
        const viewId = overlay.viewId;
        const canvasId = 'WebGlCanvas' + viewId;
        const divCanvas = overlay.parentElement;
        const canvas = divCanvas.querySelector("[id=" + canvasId + "]");

        setTimeout(() => {
            const canvasRect = canvas.getBoundingClientRect();
            overlay.style.top = `${canvasRect.top}px`;
            overlay.style.left = `${canvasRect.left}px`;
        }, 500);
    }
}

function OnApplyNetworkConfig() {

    window.addEventListener("on_paletes_loaded", (ev) => {
        console.log("Palettes loaded");
        //console.log(ev.detail);
    })

    window.addEventListener("on_file_loaded", (ev) => {
        console.log("File loaded");
        console.log(ev.detail);

        let getDevices = true;

        const configurations = ev.detail.configurations;

        UpdateGroupCombo(configurations);
        configurations.forEach((configuration => {
            const groupId = configuration.id;

            if (groupId < 1000) {
                if (getDevices == true) {
                    GetDevices(cmdSocket);
                    GetMechanicalSettings(cmdSocket, groupId);
                    getDevices = false; //On get les device une seule fois si on a un setup d'aquisition.
                }
            }
            g_jsonGroups.push({ id: groupId, name: configuration.name, type: configuration.type, beamCount: configuration.beamCount });
        }));

        g_jsonGroups.forEach((group => {
            let ev = new CustomEvent("on_get_group", { detail: { groupId: group.id } });
            window.dispatchEvent(ev);
        }));

        TestToolGetDataSources(cmdSocket);        

        if (!missingDeviceRelations)
            ApplySetup(cmdSocket);
    })

    window.addEventListener("on_get_group", (ev) => {
        console.log("Got Group: " + ev.detail.groupId);
        //console.log(ev.detail);
        GetGroup(cmdSocket, +ev.detail.groupId);
    })

    window.addEventListener('resize', () => {
        RelocateCanvasOverlay()
    });

    let divCanvas = document.querySelector('#divCanvas');
    divCanvas.addEventListener('resize', () => {
        RelocateCanvasOverlay()
    });

    //cmdSocket = new WebSocket("ws://" + comboDpuCommandIp.value 127.0.0.1:1333");
    //let url = "ws://" + comboDpuIp.value + ":" + comboDpuCommandPort.value + "?clientId=10001&clientGuid=AABBCCDDEEFF1234";
    let url = "ws://" + comboDpuIp.value + ":" + comboDpuCommandPort.value;
    cmdSocket = new WebSocket(url);

    // Connection opened
    cmdSocket.addEventListener('open', function (event) {

        GetClientId(cmdSocket);
        LoadPalettes(cmdSocket);
        GetFileNames(cmdSocket);
    });

    // Connection error
    cmdSocket.addEventListener('error', function (event_) {
        console.log(event.data);
    });
    cmdSocket.addEventListener('close', function (event_) {
        console.log(event.data);
    });


    cmdSocket.addEventListener('message', function (event) {
        console.log(event.data);

        //messagesTextArea.value = messagesTextArea.value + "\t" + event.data;

        let obj = JSON.parse(event.data);

        if (obj.id == 111)
        {
            let clientId = obj.result.clientId;
            dataSocket = new WebSocket("ws://" + comboDpuIp.value + ":" + comboDpuDataPort.value + "?clientId=" + clientId);
            dataSocket.binaryType = "arraybuffer";

            eventSocket = new WebSocket("ws://" + comboDpuIp.value + ":" + comboDpuEventPort.value + "?clientId=" + clientId)
            eventSocket.addEventListener('message', function(event) {
                let response = JSON.parse(event.data);

                if (response.hasOwnProperty("result")) {
                    if (response.result.hasOwnProperty("readings")) {
                        response.result.readings.forEach(reading => {
                            let pHtmlElement = document.querySelector(`#reading${reading.id}`);
                            pHtmlElement.innerHTML = `${reading.name} : ${reading.value}`;
                        });
                    }
                }
            });

            dataSocket.addEventListener('message', function (event) {
                let now = performance.now();
                now *= 0.001;                                                   // convert to seconds
                const deltaTime = now - data_then;                              // compute time since last frame
                data_then = now;                                                // remember time for next frame
                const fps = 1 / deltaTime;                                      // compute frames per second
                data_fpsElem.textContent = fps.toFixed(1);                      // update fps display
                data_totalFPS += fps - (data_frameTimes[data_frameCursor] || 0);
                data_frameTimes[data_frameCursor++] = fps;
                data_numFrames = Math.max(data_numFrames, data_frameCursor);
                data_frameCursor %= data_maxFrames;
                const averageFPS = data_totalFPS / data_numFrames;
                data_avgElem.textContent = averageFPS.toFixed(1);               // update avg display

                var receivedData = new Buffer(event.data);

                var header = receivedData.slice(0, 32);

                let viewIdbytes = [header[0], header[1], header[2], header[3], header[4], header[5], header[6], header[7]];
                let viewUint8bytes = Uint8Array.from(viewIdbytes);
                let viewIdDataview = new DataView(viewUint8bytes.buffer);
                let viewId = viewIdDataview.getBigUint64(0, true);

                let isCompressed = header[8];

                let requestIdbytes = [header[9], header[10], header[11], header[12]];
                let requestUint8bytes = Uint8Array.from(requestIdbytes);
                let requestIdDataview = new DataView(requestUint8bytes.buffer);
                let requestId = requestIdDataview.getUint32(0, true);

                receivedData = receivedData.slice(32);
                var uncompressedData = receivedData;
                if (isCompressed) {
                    let uncompressedDataSizeInt32Array = new Uint32Array(header);
                    let uncompressedDataSizebytes = [header[13], header[14], header[15], header[16]];
                    let uncompressedDataSizeUint8bytes = Uint8Array.from(uncompressedDataSizebytes);
                    let dataview = new DataView(uncompressedDataSizeUint8bytes.buffer);
                    let uncompressedDataSizeint32le = dataview.getUint32(0, true); // second parameter truethy == want little endian

                    uncompressedData = new Buffer(uncompressedDataSizeint32le)
                    var uncompressedSize = LZ4.decodeBlock(receivedData, uncompressedData)
                }

                images[viewId] = uncompressedData;

                newData = true;
            });

        }
        if (obj.id == 888) {
            rainbowPalette = obj.result.palettes[0].colors;
            grayPalette = obj.result.palettes[1].colors;
            thicknessPalette = obj.result.palettes[2].colors;
            omniscanPalette = obj.result.palettes[3].colors;
            tfmDark = obj.result.palettes[4].colors;
            yellowPalette = obj.result.palettes[5].colors;

            let ev = new CustomEvent("on_paletes_loaded", { detail: { a: 1 } });
            window.dispatchEvent(ev);
        }
        if (obj.id == 72) {
            if (obj.hasOwnProperty("result") && obj["result"].hasOwnProperty("configurations")) {

                const configurations = obj.result.configurations;

                missingDeviceRelations = false;
                if (obj.hasOwnProperty("warnings") && obj["warnings"][0]["code"] == 3050)   //"missingDeviceRelations"
                    missingDeviceRelations = true;

                let ev = new CustomEvent("on_file_loaded", { detail: { configurations: configurations } });
                window.dispatchEvent(ev);
            }
        }
        if (obj.id == 899) {
            if (obj.hasOwnProperty("result")) {
                OnReceivedGroup(obj["result"]);
            }
        }
        if (obj.id == 999) {
            if (obj.hasOwnProperty("result") && obj["result"].hasOwnProperty("fileNames")) {
                let jsonFileNamesObject = obj.result.fileNames;
                FillOptionsWithFilter(comboSetupFileNames, jsonFileNamesObject, ".json");
                FillOptionsWithFilter(comboSetupFileNames, jsonFileNamesObject, ".oset");
            }
        }
        if (obj.id == 999) {
            if (obj.hasOwnProperty("result") && obj["result"].hasOwnProperty("fileNames")) {
                jsonFileNamesObject = obj.result.fileNames;
                FillOptionsWithFilter(comboDataFileNames, jsonFileNamesObject, ".nde");
            }
        }
        if (obj.id == 3011) {
            if (obj.hasOwnProperty("result") && obj["result"].hasOwnProperty("devices")) {
                g_jsonDevices = obj.result.devices;
                let deviceDescriptions = [];
                let i = 0;
                const rightList = [];
                g_jsonDevices.forEach((e => {
                    deviceDescriptions[i++] = "name: " + e.name + ", serial: " + e.serial + ", ip: " + e.ip + ", command: " + e.commandPort + ", data: " + e.dataPort + ", event: " + e.eventPort;
                    rightList.push({ id: e.serial, name: e.name + ", serial: " + e.serial });
                }));

                FillOptions(comboDevices, deviceDescriptions);

                const leftList = [];
                g_jsonGroups.forEach((group => {
                    const nameDescription = "Id: " + group.id + " Name: " + group.name + " Type: " + group.type + " Beam count: " + group.beamCount;
                    if (group.id < 1000) {
                        leftList.push({ id: group.id, name: nameDescription });
                    }
                }));

                HtmlRemoveAllChildren(divMenuGroupDeviceMatch);
                if (missingDeviceRelations) {
                    deviceMatchContainer = HtmlCreateMatchLists(divMenuGroupDeviceMatch, leftList, rightList);
                    HtmlAddButton(divMenuGroupDeviceMatch, "Map devices", function () { OnMapDevicesButtonClick(); });
                }
            }
        }
        if (obj.id == 8888) {
            console.log(obj);

            if (obj.hasOwnProperty("relations") && obj["relations"].isArray()) {
                //const relations = obj["relations"];
                //relations.forEach((relation) => {
                //});
            }
        }
        if (obj.id == 1577) {
            if (obj.hasOwnProperty("result") && obj["result"].hasOwnProperty("id")) {
                const groupId = obj.result.id;

                let currentGroupParams = paramsByGroupId.get(groupId);
                if (currentGroupParams != null)

                if (obj.hasOwnProperty("result") && obj["result"].hasOwnProperty("paut")) {
                    const pautGroup = obj["result"]["paut"];
                    if (pautGroup.hasOwnProperty("gain")) {
                        inputAcquisitionGain.value = pautGroup.gain;
                        currentGroupParams.acquisition.gain = pautGroup.gain;
                    }
                    if (pautGroup.hasOwnProperty("gates")) {
                        const gates = pautGroup["gates"]
                        gates.forEach((gate) => {
                            const gateId = gate.id;
                            if (gate.hasOwnProperty("start") && gateId == 0) {
                                inputAcquisitionGateIStart.value = gate.start;
                                currentGroupParams.acquisition.gateIStart = gate.start;
                            }
                            if (gate.hasOwnProperty("start") && gateId == 1) {
                                inputAcquisitionGateAStart.value = gate.start;
                                currentGroupParams.acquisition.gateAStart = gate.start;
                            }
                        });
                    }
                    if (pautGroup.hasOwnProperty("beams")) {
                        const beams = pautGroup["beams"]
                        beams.forEach((beam) => {
                            const beamId = beam.id;
                            if (beam.hasOwnProperty("ascanStart") && beamId == 0) {
                                inputAcquisitionAscanStart.value = beam.ascanStart;
                                currentGroupParams.acquisition.ascanStart = beam.ascanStart;
                            }
                            if (beam.hasOwnProperty("ascanLength") && beamId == 0) {
                                inputAcquisitionAscanLength.value = beam.ascanLength;
                                currentGroupParams.acquisition.ascanLength = beam.ascanlength;
                            }
                        });
                    }
                    if (pautGroup.hasOwnProperty("softwareProcess")) {
                        const softwareProcess = pautGroup["softwareProcess"];
                        if (softwareProcess.hasOwnProperty("gain"))
                            inputSoftGain.value != softwareProcess.gain;
                    }
                }
            }
        }
        if (obj.id == 2023) {
            if (obj.hasOwnProperty("result")) {
                FillDataSources(obj["result"]);
            }
        }
        if (obj.id == 69420) {
            if (obj.hasOwnProperty("result")) {
                SetReadings(obj["result"]);
            }
        }
    });
}

function SetReadings(registeredReadings) {
    let divReadings = document.querySelector('#divReadings');

    //Remove old readings
    while (divReadings.firstChild) {
        divReadings.removeChild(divReadings.firstChild);
    }

    registeredReadings["registeredReadings"].forEach(reading => {
        let pHtmlElement = document.createElement('p');
        pHtmlElement.id = `reading${reading["id"]}`;
        divReadings.appendChild(pHtmlElement);
    });
}

function FillDataSources(objResultJson_) {
    FillAscanDataSources(objResultJson_);
    FillBscanDataSources(objResultJson_);
    FillCscanDataSources(objResultJson_);
    FillDscanDataSources(objResultJson_);
}

function FillAscanDataSources(objResultJson_) {
    RemoveOptions(comboAscanDataSources);
    objResultJson_["ascanDataSources"].forEach((elem) => {
        let option = document.createElement('option');
        option.value = JSON.stringify(elem);
        let gateLabel = GetGateLabel(elem.gateId);
        option.text = "GroupId: " + elem.groupId + " BeamId: " + elem.beamId;
        option.id = elem.index;
        comboAscanDataSources.appendChild(option);
    });
}

function FillBscanDataSources(objResultJson_) {
    RemoveOptions(comboBscanDataSources);
    objResultJson_["bscanDataSources"].forEach((elem) => {
        let option = document.createElement('option');
        option.value = JSON.stringify(elem);
        let gateLabel = GetGateLabel(elem.gateId);
        option.text = "GroupId: " + elem.groupId;
        option.id = elem.index;
        comboBscanDataSources.appendChild(option);
    });
}

function FillCscanDataSources(objResultJson_) {
    RemoveOptions(comboCscanDataSources);
    objResultJson_["cscanDataSources"].forEach((elem) => {
        let option = document.createElement('option');
        option.value = JSON.stringify(elem);
        let gateLabel = GetGateLabel(elem.gateId);
        option.text = "GroupId: " + elem.groupId + " GateId: " + elem.gateId;
        option.id = elem.index;
        comboCscanDataSources.appendChild(option);
    });
}

function FillDscanDataSources(objResultJson_) {
    RemoveOptions(comboDscanDataSources);
    objResultJson_["dscanDataSources"].forEach((elem) => {
        let option = document.createElement('option');
        option.value = JSON.stringify(elem);
        let gateLabel = GetGateLabel(elem.gateId);
        option.text = "GroupId: " + elem.groupId;
        option.id = elem.index;
        comboDscanDataSources.appendChild(option);
    });
}

function FillDefaultViewsParams(viewType_) {
    let defaultParam = GetDefaultViewParams(viewType_);
    inputWidth.value = defaultParam.width;
    inputHeight.value = defaultParam.height;
    comboCscanData.value = defaultParam.data;
    comboBeams.value = defaultParam.beams;
    comboPalettes.value = defaultParam.paletteName;
}

function UpdateGroupCombo(configurations_) {

    configurations_.forEach((elem) => {
        const groupId = elem.id;
        let option = document.createElement('option');
        option.value = JSON.stringify(elem);
        option.text = "Id: " + groupId + " Name: " + elem.name + " Type: " + elem.type + " Beam count: " + elem.beamCount;
        option.id = groupId;
        comboConfigs.appendChild(option);

        let contexts = [];
        for (let i = 0; i < elem.beamCount; ++i) {
            contexts.push(i);
        }
        beamsByGroupId.set(elem.id, contexts);
    });
}

function ApplyViewsToDpu() {

    let viewsObject = {};
    let viewTypes = GetViewTypes();
    viewTypes.forEach(viewType => {
        if (jsonViewObjects[viewType].length > 0) {
            viewsObject[viewType] = jsonViewObjects[viewType];
            jsonViewObjects[viewType] = []; //On vide les vues pour pas les reappliquer a nouveau au prochain apply.
        }
    });

    let setViewsCommand =
    {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "addViews",
        "params": {
        }
    };

    setViewsCommand.params.views = viewsObject;

    let jsonString = JSON.stringify(setViewsCommand);
    console.log(jsonString);
    cmdSocket.send(jsonString);

    RenderViews(cmdSocket);
}

function UpdateBeamCombo(groupId_) {

    let selectedGroup = JSON.parse(comboConfigs.value);

    RemoveOptions(comboBeams);

    for (let beamItr = 0; beamItr < selectedGroup.beamCount; beamItr++) {
        let beamOption = document.createElement('option');
        beamOption.value = beamItr;
        beamOption.text = beamItr;
        comboBeams.appendChild(beamOption);
    }
}

function UpdateGateCombo(groupId_) {

    let selectedGroup = JSON.parse(comboConfigs.value);

    RemoveOptions(comboGates);

    //TODO[SVC][Lire les gate qui on des data.]
    for (let gateItr = 0; beamItr < 5; gateItr++) {
        let gateOption = document.createElement('option');
        beamOption.value = gateItr;
        beamOption.text = gateItr;
        comboBeams.appendChild(beamOption);
    }
}

//function UpdateConfigGates(configName_) {
//    let currentJsonConfig = FindJsonObject(jsonConfigsObject, "name", configName_);

//    RemoveOptions(comboBeams);
//    RemoveOptions(comboGates);

//    let gatesToAdd = [];
//    let gatesToAddItr = 0;

//    //if (currentJsonConfig.hasOwnProperty("beams")) {
//    //    let gatesToAdd = [];
//    //    let gatesToAddItr = 0;

//    //    for (beamItr = 0; beamItr < currentJsonConfig["beams"].length; beamItr++) {
//    //        let beamJsonObject = currentJsonConfig["beams"][beamItr];
//    //        let beamOption = document.createElement('option');
//    //        beamOption.value = beamJsonObject.contextId;
//    //        //beamOption.text = beamJsonObject.contextId;
//    //        beamOption.text = beamItr;
//    //        beamOption.contextId = beamJsonObject.contextId;
//    //        comboBeams.appendChild(beamOption);
//    //    }
//    //}

//    if (currentJsonConfig.hasOwnProperty("gates")) {
//        for (gateItr = 0; gateItr < currentJsonConfig["gates"].length; gateItr++) {
//            let gateJsonObject = currentJsonConfig["gates"][gateItr];
//            gatesToAdd[gatesToAddItr++] = gateJsonObject.name;
//        }
//    }

//    gatesToAdd = uniq(gatesToAdd);
//    gatesToAdd.forEach((elem) => {
//        let gateOption = document.createElement('option');
//        gateOption.value = elem;
//        gateOption.text = elem;
//        gateOption.id = GetGateId(elem);
//        comboGates.appendChild(gateOption);
//    });
//}

//function UpdateBeamsGates(configName_) {
//    let currentJsonConfig = FindJsonObject(jsonConfigsObject, "name", configName_);

//    RemoveOptions(comboBeams);
//    RemoveOptions(comboGates);

//    if (currentJsonConfig.hasOwnProperty("beams")) {
//        let gatesToAdd = [];
//        let gatesToAddItr = 0;

//        for (beamItr = 0; beamItr < currentJsonConfig["beams"].length; beamItr++) {
//            let beamJsonObject = currentJsonConfig["beams"][beamItr];
//            let beamOption = document.createElement('option');
//            beamOption.value = beamJsonObject.contextId;
//            beamOption.text = beamJsonObject.contextId;
//            beamOption.contextId = beamJsonObject.contextId;
//            comboBeams.appendChild(beamOption);

//            if (beamJsonObject.hasOwnProperty("gates")) {
//                for (gateItr = 0; gateItr < beamJsonObject["gates"].length; gateItr++) {
//                    let gateJsonObject = beamJsonObject["gates"][gateItr];
//                    gatesToAdd[gatesToAddItr++] = gateJsonObject.name;
//                }
//            }
//        }

//        gatesToAdd = uniq(gatesToAdd);
//        gatesToAdd.forEach((elem) => {
//            let gateOption = document.createElement('option');
//            gateOption.value = elem;
//            gateOption.text = elem;
//            gateOption.id = GetGateId(elem);
//            comboGates.appendChild(gateOption);
//        });
//    }
//}

function uniq(a) {
    var seen = {};
    return a.filter(function (item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function isArray(ob) {
    return ob.constructor === Array;
}

function FindJsonObject(jsonObject_, key_, value_) {
    if (isArray(jsonObject_)) {
        for (i = 0; i < jsonObject_.length; i++) {
            if (jsonObject_[i].name == value_) {
                return jsonObject_[i];
            }
        }
    }
}

function OnLoadSetupFiles() {
    LoadSetupFile(cmdSocket, comboSetupFileNames.value);
}

function OnLoadDataFiles() {
    LoadDataFile(cmdSocket, comboDataFileNames.value);
}

function OnStartAcquisitionClick() {
    StartAcquisition(cmdSocket);
}
function OnStopAcquisitionClick() {
    StopAcquisition(cmdSocket);
}
function OnClearAcquisitionDataClick()
{
    ClearAcquisitionData(cmdSocket);
}

function GetSelectPalette(paletteName_) {

    let pal = rainbowPalette;
    if (paletteName_ == "gray") {
        pal = grayPalette;
    }
    else if (paletteName_ == "thickness") {
        pal = thicknessPalette;
    }
    else if (paletteName_ == "omniscan-t") {
        pal = omniscanPalette;
    }
    else if (paletteName_ == "white") {
        pal = whitePalette;
    }
    else if (paletteName_ == "tfm-dark") {
        pal = tfmDark;
    }
    else if (paletteName_ == "yellow") {
        pal = yellowPalette;
    }

    return pal;
}

function CreateCanvasOverlayCss(id_) {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '#' + id_ + '{ position: absolute; top: 10px; left: 10px; background-color: rgba(0, 0, 0, 0.5); color: white; font-size: 10px; padding: 10px; }';
    head.appendChild(style);
}

//Canvas pour le tracage des curseur par dessu le canvas webgl.
function CreateCanvas2dCss(id_) {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '#' + id_ + '{ position: absolute; top: 0px; left: 0px; opacity: 0.5; z-index: 1; }';
    //style.innerHTML = '#' + id_ + '{ opacity: 0.5; z-index: 1; }';
    head.appendChild(style);
}

function CreateCanvasWebglCss(id_) {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '#' + id_ + '{ position: absolute; top: 0px; left: 0px;}';
    head.appendChild(style);
}

function CreateDivContainerCss(id_) {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '#' + id_ + '{ position: relative; }';
    head.appendChild(style);
}

function DrawLines(canvas2d_) {

    let horizontalLineY = canvas2d_.height / 2;
    let verticalLineX = canvas2d_.width / 2;

    canvas2d_.addEventListener('mousemove', (event) => {
        const canvas2d = event.target;
        const rect = canvas2d.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (y >= 0 && y <= canvas2d.height) {
            horizontalLineY = y;
        }

        if (x >= 0 && x <= canvas2d.width) {
            verticalLineX = x;
        }

        drawCursor(canvas2d);
    });

    function drawCursor(canvas2d_) {
        const canvas2DContext = canvas2d_.getContext('2d');
        canvas2DContext.clearRect(0, 0, canvas2d_.width, canvas2d_.height);
        canvas2DContext.beginPath();
        canvas2DContext.moveTo(0, horizontalLineY);
        canvas2DContext.lineTo(canvas2d_.width, horizontalLineY);
        canvas2DContext.moveTo(verticalLineX, 0);
        canvas2DContext.lineTo(verticalLineX, canvas2d_.height);
        canvas2DContext.strokeStyle = 'blue';
        canvas2DContext.lineWidth = 2;
        canvas2DContext.stroke();
    }
}

function AddHorizontalDir(overlay_, jsonViewObject_) {

    let newComboHorizontalDir = document.createElement('select');
    FillOptions(newComboHorizontalDir, ["ltr", "rtl"]);
    newComboHorizontalDir.setAttribute('jsonViewObject', JSON.stringify(jsonViewObject_));
    newComboHorizontalDir.value = jsonViewObject_.horizontal.orientation;
    newComboHorizontalDir.addEventListener('change', (event) => {
        let jsonViewObject = JSON.parse(event.target.getAttribute('jsonViewObject'));
        let viewId = parseInt(jsonViewObject.id, 10);
        let viewType = jsonViewObject.type;
        jsonViewObject = jsonViewObjectByViewId.get(viewId);
        jsonViewObject.horizontal.orientation = event.target.value;
        UpdateView(viewType, jsonViewObject);
    });

    HtmlAddBr(overlay_);
    HtmlAddLabel(overlay_, "H");
    overlay_.appendChild(newComboHorizontalDir);
}

function AddVerticalDir(overlay_, jsonViewObject_) {

    let newComboVerticalDir = document.createElement('select');
    FillOptions(newComboVerticalDir, ["btt", "ttb"]);
    newComboVerticalDir.setAttribute('jsonViewObject', JSON.stringify(jsonViewObject_));
    newComboVerticalDir.value = jsonViewObject_.vertical.orientation;
    newComboVerticalDir.addEventListener('change', (event) => {
        let jsonViewObject = JSON.parse(event.target.getAttribute('jsonViewObject'));
        let viewId = parseInt(jsonViewObject.id, 10);
        let viewType = jsonViewObject.type;
        jsonViewObject = jsonViewObjectByViewId.get(viewId);
        jsonViewObject.vertical.orientation = event.target.value;
        UpdateView(viewType, jsonViewObject);
    });

    HtmlAddBr(overlay_);
    HtmlAddLabel(overlay_, "V");
    overlay_.appendChild(newComboVerticalDir);
}

function AddSwapAxis(overlay_, jsonViewObject_) {

    HtmlAddBr(overlay_);

    const checkSwapAxisInputId = "check-swap-axis" + jsonViewObject_.id;
    let checkSwapAxisInput = HtmlAddLabelInput(overlay_, "Swap axis", "checkbox", checkSwapAxisInputId);
    checkSwapAxisInput.setAttribute('jsonViewObject', JSON.stringify(jsonViewObject_));
    checkSwapAxisInput.value = false;   //Pas swapé au depart.
    checkSwapAxisInput.addEventListener('change', (event) => {

        let jsonViewObject = JSON.parse(event.target.getAttribute('jsonViewObject'));
        let viewId = parseInt(jsonViewObject.id, 10);
        let viewType = jsonViewObject.type;
        jsonViewObject = jsonViewObjectByViewId.get(viewId);

        const verticalType = jsonViewObject.vertical.type;
        jsonViewObject.vertical.type = jsonViewObject.horizontal.type;
        jsonViewObject.horizontal.type = verticalType;
        UpdateView(viewType, jsonViewObject);
    });
}

function AddOverlay(jsonViewObject_, divCanvas_, webglCanvas_, groupId_, overlayInfo_) {
    const overlayId = 'canvas-overlay' + jsonViewObject_.id;
    CreateCanvasOverlayCss(overlayId);
    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.viewId = jsonViewObject_.id;
    divCanvas_.appendChild(overlay);

    HtmlAddLabelValue(overlay, "View id", jsonViewObject_.id);
    HtmlAddBr(overlay);
    HtmlAddLabelValue(overlay, "Group id", groupId_);

    overlayInfo_.forEach(pair => {
        HtmlAddBr(overlay);
        HtmlAddLabelValue(overlay, pair.label, pair.value);
    });

    var canvasRect = webglCanvas_.getBoundingClientRect();
    overlay.style.left = (canvasRect.left + 10) + "px";
    overlay.style.top = (canvasRect.top + 10) + "px";

    return overlay;
}

function AddViewHtml(divCanvas_, jsonViewObject_, commonViewParams_, overlayInfo_) {
    let webglCanvas = document.createElement('canvas');
    webglCanvas.width = jsonViewObject_.horizontal.length;
    webglCanvas.height = jsonViewObject_.vertical.length;
    webglCanvas.style = "border: 1px red solid";
    webglCanvas.viewId = jsonViewObject_.id;
    const webglCanvasId = 'WebGlCanvas' + jsonViewObject_.id;
    webglCanvas.id = webglCanvasId;
    //CreateCanvasWebglCss(webglCanvasId);

    let canvas2d = document.createElement('canvas');
    canvas2d.width = jsonViewObject_.horizontal.length;
    canvas2d.height = jsonViewObject_.vertical.length;
    canvas2d.style = "border: 1px red solid";
    canvas2d.viewId = jsonViewObject_.id;
    const canvas2dId = 'canvas-2d' + jsonViewObject_.id;
    canvas2d.id = canvas2dId;
    CreateCanvas2dCss(canvas2dId)

    const groupId = jsonViewObject_['source']['groupId'];

    //Pour que les 2 canvas: 2d et webgl soit une par dessu l<autre en absolut et que le div qui les contien soit en relatif.
    //let divCanvasContainer = document.createElement('div');
    //const canvasContainerId = 'canvas-container' + jsonViewObject_.id;
    //CreateDivContainerCss(canvasContainerId);
    //divCanvasContainer.appendChild(webglCanvas);
    //divCanvasContainer.appendChild(canvas2d);       //Il faut l'ajouter apres car c<est lui qui va recevoir les event de mouse et on veut qu>il soit par dessu le canvas webgl
    //divCanvas_.appendChild(divCanvasContainer);

    divCanvas_.appendChild(webglCanvas);
    //divCanvas_.appendChild(webglCanvas);

    //canvas2d.style.top = webglCanvas.style.top;
    //canvas2d.style.left = webglCanvas.style.left;

    glContexts[jsonViewObject_.id] = webglCanvas.getContext(strContext, { antialias: false, depth: false, alpha: false });
    let gl = glContexts[jsonViewObject_.id];
    images[jsonViewObject_.id] = new Uint8Array(gl.canvas.clientWidth * gl.canvas.clientHeight);

    let overlay = AddOverlay(jsonViewObject_, divCanvas_, webglCanvas, groupId, overlayInfo_);    //Overlay contenant les paramètres dans les vues.

    viewIds.push(jsonViewObject_.id);

    jsonViewObject_.horizontal.orientation = commonViewParams_.horizontalDir;
    jsonViewObject_.vertical.orientation = commonViewParams_.verticalDir;           
    AddHorizontalDir(overlay, jsonViewObject_);
    AddVerticalDir(overlay, jsonViewObject_);
    AddSwapAxis(overlay, jsonViewObject_);

    let currentViewId = jsonViewObject_.id;

    webglCanvas.onmousedown = function (event_) {
        //MouseDown(cmdSocket, event_);
    }

    webglCanvas.onmousemove = function (event_) {
        //MouseMove(cmdSocket, event_);
    }

    webglCanvas.onmouseup = function (event_) {
        //MouseUp(cmdSocket, event_);
    }

    webglCanvas.onmousewheel = function (event_) {
        //MouseWheel(cmdSocket, event_);
    }

    let pal = GetSelectPalette(jsonViewObject_.paletteName);

    InitPaletteTexture(pal, gl, images[webglCanvas.id], [0, 1], gl.canvas.clientWidth, gl.canvas.clientHeight);

    DrawLines(canvas2d);

    return overlay;
}

function SetViews(jsonViews_) {

    let divCanvas = document.querySelector('#divCanvas');

    let jsonViewsObject = jsonViews_["params"]["views"];

    if (jsonViewsObject.hasOwnProperty('elementary_ascan')) {
        for (let viewItr = 0; viewItr < jsonViewsObject.elementary_ascan.length; viewItr++) {
            let view = jsonViewsObject.elementary_ascan[viewItr];
            AddViewHtml(divCanvas, view);
        }
    }
    if (jsonViewsObject.hasOwnProperty('cscan')) {
        for (let viewItr = 0; viewItr < jsonViewsObject.cscan.length; viewItr++) {
            let view = jsonViewsObject.cscan[viewItr];
            AddViewHtml(divCanvas, view);
        }
    }
    if (jsonViewsObject.hasOwnProperty('tfm')) {
        for (let viewItr = 0; viewItr < jsonViewsObject.tfm.length; viewItr++) {
            let view = jsonViewsObject.tfm[viewItr];
            AddViewHtml(divCanvas, view);
        }
    }
    if (jsonViewsObject.hasOwnProperty('pwi')) {
        for (let viewItr = 0; viewItr < jsonViewsObject.pwi.length; viewItr++) {
            let view = jsonViewsObject.pwi[viewItr];
            AddViewHtml(divCanvas, view);
        }
    }
    if (jsonViewsObject.hasOwnProperty('ascan')) {
        for (let viewItr = 0; viewItr < jsonViewsObject.ascan.length; viewItr++) {
            let view = jsonViewsObject.ascan[viewItr];
            AddViewHtml(divCanvas, view);
        }
    }
    if (jsonViewsObject.hasOwnProperty('bscan')) {
        for (let viewItr = 0; viewItr < jsonViewsObject.bscan.length; viewItr++) {
            let view = jsonViewsObject.bscan[viewItr];
            AddViewHtml(divCanvas, view);
        }
    }
    if (jsonViewsObject.hasOwnProperty('dscan')) {
        for (let viewItr = 0; viewItr < jsonViewsObject.dscan.length; viewItr++) {
            let view = jsonViewsObject.dscan[viewItr];
            AddViewHtml(divCanvas, view);
        }
    }
}

function GetDefaultViewParams(viewType_) {
    if (viewType_ == "cscan") {
        let width = 800;
        let height = 200;
        let paletteName = "rainbow";
        let data = "amplitude";
        let beams = 0;
        let beamId = 0;

        return { width, height, paletteName, data, beams };
    }
    else if (viewType_ == "tfm") {
        let width = 512;
        let height = 512;
        let paletteName = "rainbow";
        let data = "amplitude";
        let beams = 0;
        let beamId = 0;

        return { width, height, paletteName, data, beams };
    }
    else if (viewType_ == "pwi") {
        let width = 512;
        let height = 512;
        let paletteName = "rainbow";
        let data = "amplitude";
        let beams = 0;
        let beamId = 0;

        return { width, height, paletteName, data, beams };
    }
    else if (viewType_ == "ascan") {
        let width = 800;
        let height = 200;
        let paletteName = "white";
        let data = "amplitude";
        let groupId = 1;
        let beams = 0;
        let beamId = 0;

        return { width, height, paletteName, data, groupId, beams, beamId };
    }
    else if (viewType_ == "bscan") {
        let width = 800;
        let height = 200;
        let paletteName = "rainbow";
        let groupId = 1;

        return { width, height, paletteName, groupId };
    }
    else if (viewType_ == "dscan") {
        let width = 800;
        let height = 200;
        let paletteName = "rainbow";
        let groupId = 1;

        return { width, height, paletteName, groupId };
    }
}

function GetViewTypes() {
    let viewType = ["cscan", "ascan", "bscan", "dscan", "tfm", "pwi"];
    return viewType;
}

function GetCScanDataTypes() {
    let datas = ["amplitude", "position", "thickness"];
    return datas;
}

function GetPalettes() {
    let palettes = ["rainbow", "gray", "thickness", "omniscan-t", "white", "tfm-dark", "yellow"];
    return palettes;
}

//ajouter des options: pour un select ou un datalist.
function FillOptions(object_, contents_) {
    contents_.forEach((e => {
        let option = document.createElement('option');
        option.value = e;
        option.text = e;
        option.id = e;
        object_.appendChild(option);
    }));
}

function FillOptionsWithFilter(object_, contents_, filter_) {
    contents_.forEach((e => {
        if (e.length >= filter_.length && e.includes(filter_)) {
            let option = document.createElement('option');
            option.value = e;
            option.text = e;
            option.id = e;
            object_.appendChild(option);
        }
    }));
}

function GetGateId(gateName_) {
    let gateNameToId = new Map();
    gateNameToId['Gate I'] = 0;
    gateNameToId['Gate A'] = 1;
    gateNameToId['Gate B'] = 2;
    gateNameToId['Gate C'] = 3;
    gateNameToId['Gate D'] = 4;

    let gateId = gateNameToId[gateName_];

    return gateId;
}

function GetGateLabel(gateId_) {
    let gateIdToLabel = new Map();
    gateIdToLabel[0] = 'I';
    gateIdToLabel[1] = 'A';
    gateIdToLabel[2] = 'B';
    gateIdToLabel[3] = 'C';
    gateIdToLabel[4] = 'D';

    let gateLabel = gateIdToLabel[gateId_];

    return gateLabel;
}

function GetUiViewParams(viewType_) {
    let divCanvas = document.querySelector('#divCanvas');
    let id = parseInt(document.getElementById("input_view_id").value, 10);
    let width = parseInt(document.getElementById("input_width").value, 10);
    let height = parseInt(document.getElementById("input_height").value, 10);
    let paletteName = comboPalettes.value;
    let beams = parseInt(comboBeams.value, 10);
    let data = comboCscanData;
    let horizontalDir = comboHorizontalDir.value;
    let verticalDir = comboVerticalDir.value;
    let viewType = viewType_;
    return { viewType, divCanvas, id, width, height, paletteName, beams, data, horizontalDir, verticalDir };
}

function GetAscanDataSourceParams() {
    let groupId = JSON.parse(comboAscanDataSources.value)["groupId"];
    let beamId = JSON.parse(comboAscanDataSources.value)["beamId"];
    return { groupId, beamId };
}

function GetBscanDataSourceParams() {
    let groupId = JSON.parse(comboBscanDataSources.value)["groupId"];
    return { groupId };
}

function GetCscanDataSourceParams() {
    let groupId = JSON.parse(comboCscanDataSources.value)["groupId"];
    let gateId = JSON.parse(comboCscanDataSources.value)["gateId"];
    let data = comboCscanData.options[comboCscanData.selectedIndex].value;
    return { groupId, gateId, data };
}

function GetDscanDataSourceParams() {
    let groupId = JSON.parse(comboDscanDataSources.value)["groupId"];
    return { groupId };
}

let jsonViewObjects = {};
GetViewTypes().forEach((e => { jsonViewObjects[e] = [] })); //Initialise une Map de array vide.

function SelectNextItem(element_) {
    if (element_.selectedIndex == element_.length - 1) {
        element_.selectedIndex = 0;
    }
    else {
        element_.selectedIndex = element_.selectedIndex + 1;
    }
}

function OnAddAscanView() {
    let viewParams = GetUiViewParams("ascan");
    let viewObject = AddAScanView(divCanvas, viewParams);
    jsonViewObjects["ascan"].push(viewObject);

    inputViewId.value = parseInt(inputViewId.value, 10) + 1;

    ApplyViewsToDpu();

    SelectNextItem(comboAscanDataSources);
}

function OnAddBscanView() {
    let viewParams = GetUiViewParams("bascan");
    let viewObject = AddBScanView(divCanvas, viewParams);
    jsonViewObjects["bscan"].push(viewObject);

    inputViewId.value = parseInt(inputViewId.value, 10) + 1;

    ApplyViewsToDpu();

    SelectNextItem(comboBscanDataSources);
}

function OnAddCscanView() {
    let viewParams = GetUiViewParams("cscan");
    let viewObject = AddCScanView(divCanvas, viewParams);
    jsonViewObjects["cscan"].push(viewObject);

    inputViewId.value = parseInt(inputViewId.value, 10) + 1;

    ApplyViewsToDpu();

    SelectNextItem(comboCscanDataSources);
}

function OnAddDscanView() {
    let viewParams = GetUiViewParams("dscan");
    let viewObject = AddDScanView(divCanvas, viewParams);
    jsonViewObjects["dscan"].push(viewObject);

    inputViewId.value = parseInt(inputViewId.value, 10) + 1;

    ApplyViewsToDpu();

    SelectNextItem(comboDscanDataSources);
}

function UpdateCScanViewPalette(viewParams_, paletteName_) {
    viewParams_.paletteName = paletteName_;  //La palette n'est pas pri en charge par le dpu mais ca va declanger un refresh.
    //cmdSocket.send(JSON.stringify(commandUpdateView));
    let gl = glContexts[viewParams_.id];
    let canvaId = "WebGlCanvas" + viewParams_.id;
    let pal = GetSelectPalette(viewParams_.paletteName);

    InitPaletteTexture(pal, gl, images[canvaId], [0, 1], gl.canvas.clientWidth, gl.canvas.clientHeight);
    Draw();
}

function AddPwiView(div_, viewParams_) {
    return AddTfmView(viewParams_);
}

function AddTfmView(div_, viewParams_) {

    let groupId = parseInt(comboConfigs.options[comboConfigs.selectedIndex].id);

    let jsonViewObject = {
        "id": viewParams_.id,
        "horizontal": {
            "type": "scan",
            "orientation": "ltr",
            "length": viewParams_.width
        },
        "vertical": {
            "type": "index",
            "orientation": "btt",
            "length": viewParams_.height,
        },
        "paletteName": viewParams_.paletteName,
        "source": {
            "groupId": groupId
        }
    };

    AddViewHtml(div_, jsonViewObject, viewParams_, []);

    return jsonViewObject;
}

function AddAScanView(div_, viewParams_) {
    return AddElementaryAScanView(div_, viewParams_);
}

let jsonViewObjectByViewId = new Map();

function AddElementaryAScanView(div_, viewParams_) {

    let groupId = GetAscanDataSourceParams().groupId;
    let beamId = GetAscanDataSourceParams().beamId;

    let jsonViewObject = {
        "id": viewParams_.id,
        "horizontal": {
            "type": "ultrasound",
            "orientation": viewParams_.horizontalDir,
            "length": viewParams_.width
        },
        "vertical": {
            "type": "amplitude",
            "orientation": viewParams_.verticalDir,
            "length": viewParams_.height,
        },
        "paletteName": "yellow",
        "source": {
            "groupId": groupId,
            "beamIndex": beamId
        }
    };
    jsonViewObject.type = "ascan";
    jsonViewObjectByViewId.set(viewParams_.id, jsonViewObject);

    AddViewHtml(div_, jsonViewObject, viewParams_, []);

    let newComboBeamId = document.createElement('select');
    FillOptions(newComboBeamId, beamsByGroupId.get(groupId));
    newComboBeamId.setAttribute('jsonViewObject', JSON.stringify(jsonViewObject));
    newComboBeamId.value = beamId;
    newComboBeamId.addEventListener('change', (event) => {
        let jsonViewObject = JSON.parse(event.target.getAttribute('jsonViewObject'));
        let viewId = parseInt(jsonViewObject.id, 10);
        jsonViewObject = jsonViewObjectByViewId.get(viewId);
        jsonViewObject.source.beamIndex = +event.target.value;
        UpdateView("ascan", jsonViewObject);
    });

    const overlayId = 'canvas-overlay' + viewParams_.id;
    let overlay = document.getElementById(overlayId);

    HtmlAddBr(overlay);
    HtmlAddLabel(overlay, "Beam id");
    overlay.appendChild(newComboBeamId);

    return jsonViewObject;
}

function AddBScanView(div_, viewParams_) {
    let groupId = GetBscanDataSourceParams().groupId;
    let maxed = document.getElementById("input_maxed").checked;

    let jsonViewObject = {
        "id": viewParams_.id,
        "maxed": maxed,
        "horizontal": {
            "type": "scan",
            "orientation": viewParams_.horizontalDir,
            "length": viewParams_.width
        },
        "vertical": {
            "type": "ultrasound",
            "orientation": viewParams_.verticalDir,
            "length": viewParams_.height,
        },
        "paletteName": viewParams_.paletteName,
        "source": {
            "groupId": groupId
        }
    };
    jsonViewObject.type = "bscan";
    jsonViewObjectByViewId.set(viewParams_.id, jsonViewObject);

    AddViewHtml(div_, jsonViewObject, viewParams_, []);

    return jsonViewObject;
}

function AddCScanView(div_, viewParams_) {
    const groupId = GetCscanDataSourceParams().groupId;
    const gateId = GetCscanDataSourceParams().gateId;
    const data = GetCscanDataSourceParams().data;

    let jsonViewObject = {
        "id": viewParams_.id,
        "horizontal": {
            "type": "scan",
            "orientation": viewParams_.horizontalDir,
            "length": viewParams_.width
        },
        "vertical": {
            "type": "index",
            "orientation": viewParams_.verticalDir,
            "length": viewParams_.height,
        },
        "paletteName": viewParams_.paletteName,
        "source": {
            "data": data,
            "groupId": groupId,
            "gateIds": gateId,
        }
    };
    jsonViewObject.type = "cscan";
    jsonViewObjectByViewId.set(viewParams_.id, jsonViewObject);

    const overlayInfo = [{ label: "Gate id", value: gateId }];

    AddViewHtml(div_, jsonViewObject, viewParams_, overlayInfo);

    const overlayId = 'canvas-overlay' + viewParams_.id;
    let overlay = document.getElementById(overlayId);

    //Ajouter un combo pour pouvoir changer le data affiche.
    let newComboCscanData = document.createElement('select');
    FillOptions(newComboCscanData, GetCScanDataTypes());
    newComboCscanData.setAttribute('jsonViewObject', JSON.stringify(jsonViewObject));
    newComboCscanData.value = data;
    newComboCscanData.addEventListener('change', (event) => {
        let jsonViewObject = JSON.parse(event.target.getAttribute('jsonViewObject'));
        let viewId = parseInt(jsonViewObject.id, 10);
        jsonViewObject = jsonViewObjectByViewId.get(viewId);
        jsonViewObject.source.data = event.target.value;
        UpdateView("cscan", jsonViewObject);
    });
    HtmlAddBr(overlay);
    overlay.appendChild(newComboCscanData);

    let newComboPalettes = document.createElement('select');
    FillOptions(newComboPalettes, GetPalettes());
    newComboPalettes.setAttribute('jsonViewObject', JSON.stringify(jsonViewObject));
    newComboPalettes.value = viewParams_.paletteName;
    newComboPalettes.addEventListener('change', (event) => {
        let jsonViewObject = JSON.parse(event.target.getAttribute('jsonViewObject'));
        UpdateCScanViewPalette(jsonViewObject, event.target.value);
    });

    HtmlAddBr(overlay);
    overlay.appendChild(newComboPalettes);


    return jsonViewObject;
}

function AddDScanView(div_, viewParams_) {
    let groupId = GetDscanDataSourceParams().groupId;
    let maxed = document.getElementById("input_maxed").checked;

    let jsonViewObject = {
        "id": viewParams_.id,
        "maxed": maxed,
        "horizontal": {
            "type": "index",
            "orientation": viewParams_.horizontalDir,
            "length": viewParams_.width
        },
        "vertical": {
            "type": "ultrasound",
            "orientation": viewParams_.verticalDir,
            "length": viewParams_.height,
        },
        "paletteName": viewParams_.paletteName,
        "source": {
            "groupId": groupId
        }
    };
    jsonViewObject.type = "dscan";
    jsonViewObjectByViewId.set(viewParams_.id, jsonViewObject);

    AddViewHtml(div_, jsonViewObject, viewParams_, []);

    return jsonViewObject;
}

function UpdateView(viewTypeName_, jsonViewObject_) {

    let commandUpdateView = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "updateViews",
        "params": {
            "views": {
                [viewTypeName_]: []
            }
        }
    };
    commandUpdateView["params"]["views"][viewTypeName_][0] = jsonViewObject_;

    cmdSocket.send(JSON.stringify(commandUpdateView));
}

// sleep time expects milliseconds
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

let then = 0;
const data_fpsElem = document.querySelector("#data_fps");
const data_avgElem = document.querySelector("#data_avg");
const data_frameTimes = [];
let data_frameCursor = 0;
let data_numFrames = 0;
const data_maxFrames = 20;
let data_totalFPS = 0;
let data_then = 0;

function buildShaderProgram(gl, shaderInfo) {
    let program = gl.createProgram();

    shaderInfo.forEach(function (desc) {
        let shader = compileShader(gl, desc.id, desc.type);

        if (shader) {
            gl.attachShader(program, shader);
        }
    });

    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Error linking shader program:");
        console.log(gl.getProgramInfoLog(program));
    }

    return program;
}

function compileShader(gl, id, type) {
    let code = document.getElementById(id).firstChild.nodeValue;
    let shader = gl.createShader(type);

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
        console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function GetShaderSet(gl) {
    const shaderSet = [
        {
            type: gl.VERTEX_SHADER,
            id: "2d-vertex-shader"
        },
        {
            type: gl.FRAGMENT_SHADER,
            id: "2d-fragment-shader"
        }
    ];
    return shaderSet;
}

//------------------------------------------------------------------------
var translation = [0, 0];
var translationLocation;

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return { r: r + r, g: g + g, b: b + b };
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function GenPalette(srcPalette, palette) {
    var colorItr = 0;
    srcPalette.forEach(function (colorHex_) {

        let rgbColor = hexToRgb(colorHex_);

        setPalette(colorItr, rgbColor.r, rgbColor.g, rgbColor.b, 255, palette);
        ++colorItr;
    });
}

function setPalette(index, r, g, b, a, palette) {
    palette[index * 4 + 0] = r;
    palette[index * 4 + 1] = g;
    palette[index * 4 + 2] = b;
    palette[index * 4 + 3] = a;
}

function InitPaletteTexture(palette_, gl, image_, rotation_, viewportWidth_, viewportHeight_) {
    let shaderProgram = buildShaderProgram(gl, GetShaderSet(gl));

    gl.useProgram(shaderProgram);

    // Setup a unit quad
    var positions = [
        1, 1,
        -1, 1,
        -1, -1,
        1, 1,
        -1, -1,
        1, -1,
    ];
    var vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    var imageLoc = gl.getUniformLocation(shaderProgram, "u_image");
    var paletteLoc = gl.getUniformLocation(shaderProgram, "u_palette");

    // tell it to use texture units 0 and 1 for the image and palette
    gl.uniform1i(imageLoc, 0);
    gl.uniform1i(paletteLoc, 1);

    var palette = new Uint8Array(256 * 4);
    var rand = Math.floor((Math.random() * 256));
    GenPalette(palette_, palette);


    // make palette texture and upload palette
    gl.activeTexture(gl.TEXTURE1);
    var paletteTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, paletteTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, palette);

    //InitializeCanvas(gl, image, viewportHeight_);
    gl.activeTexture(gl.TEXTURE0);
    var imageTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, imageTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, viewportWidth_, viewportHeight_, 0, gl.ALPHA, gl.UNSIGNED_BYTE, image_);

    let rotationLocation = gl.getUniformLocation(shaderProgram, "u_rotation");
    gl.uniform2fv(rotationLocation, rotation_);

    translationLocation = gl.getUniformLocation(shaderProgram, "u_translation");
    //gl.uniform2fv(translationLocation, [0,0]);

    var resolutionLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
    gl.uniform2f(resolutionLocation, gl.canvas.width, /*viewportHeight_*/ gl.canvas.height);

    gl.viewport(0, 0, viewportWidth_, viewportHeight_);

    return shaderProgram;
}

function RenderScene(gl, image_, viewportWidth_, viewportHeight_) {
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, viewportWidth_, viewportHeight_, 0, gl.ALPHA, gl.UNSIGNED_BYTE, image_);

    gl.drawArrays(gl.TRIANGLES, 0, 12 / 2); //2 triangles formant un carr�.
}

const frameTimes = [];
let frameCursor = 0;
let numFrames = 0;
const maxFrames = 20;
let totalFPS = 0;
const fpsElem = document.querySelector("#fps");
const avgElem = document.querySelector("#avg");

function drawScene(now) {
    now *= 0.001;                          // convert to seconds
    const deltaTime = now - then;          // compute time since last frame
    then = now;                            // remember time for next frame
    const fps = 1 / deltaTime;             // compute frames per second
    fpsElem.textContent = fps.toFixed(1);  // update fps display
    totalFPS += fps - (frameTimes[frameCursor] || 0);
    frameTimes[frameCursor++] = fps;
    numFrames = Math.max(numFrames, frameCursor);
    frameCursor %= maxFrames;
    const averageFPS = totalFPS / numFrames;
    avgElem.textContent = averageFPS.toFixed(1);  // update avg display

    if (newData == false) {
        requestAnimationFrame(drawScene);
        return;
    }

    Draw();

    newData = false;
}

function Draw() {
    for (i = 0; i < glContexts.length; i++) {
        gl = glContexts[i];
        if (gl) {
            RenderScene(gl, images[i], gl.canvas.clientWidth, gl.canvas.clientHeight);
        }
    }

    requestAnimationFrame(drawScene);
}

requestAnimationFrame(drawScene);
