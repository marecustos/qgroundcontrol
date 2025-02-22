import QtQuick          2.3
import QtQuick.Window   2.2
import QtQuick.Controls 1.2
import QtQuick.Dialogs 1.3


import QGroundControl               1.0
import QGroundControl.Palette       1.0
import QGroundControl.Controls      1.0
import QGroundControl.Controllers   1.0
import QGroundControl.ScreenTools   1.0
import QtQuick.Layouts  1.2

Rectangle {
    id:     setupViewPayload
    QGCPalette { id: qgcPal }
    color:  qgcPal.window
    property real _columnSpacing:       ScreenTools.defaultFontPixelHeight * 0.25
    property real _labelWidth:          ScreenTools.defaultFontPixelWidth * 35
    property real _valueWidth:          ScreenTools.defaultFontPixelWidth * 24
    property int _rowSpacing:           ScreenTools.defaultFontPixelHeight / 2
    property int _colSpacing:           ScreenTools.defaultFontPixelWidth / 2
    property real   _margins:                   ScreenTools.defaultFontPixelWidth
    property var _currentSelection:     null
    property int _firstColumnWidth:     ScreenTools.defaultFontPixelWidth * 12
    property int _secondColumnWidth:    ScreenTools.defaultFontPixelWidth * 30
    property var editingConfig : QGroundControl.linkManager.payloadConfigExist()? QGroundControl.linkManager.startConfigurationEditingPayload() :  QGroundControl.linkManager.createConfiguration(ScreenTools.isSerialAvailable ? LinkConfiguration.TypeSerial : LinkConfiguration.TypeUdp, "")
    property var  _activeJoystick:          joystickManager.activeJoystick
    property var joystickSettingsWindow: null

    PayloadController {
        id: payload_controller

        onActivePayloadNameChanged: {
            console.log("Active Payload Name changed:", payload_controller.activePayloadName)
            if (payload_controller.activePayloadName != ""){
                payloadNameTimer.stop()
            }
        }
    }

    PayloadLogDownloader{
        id: payloadLogDownloader
        onFilesRefreshed: {
            console.log("updating table view")
            console.log(files)
            tableModel.clear()
            for (var i = 0; i < files.length; ++i) {
                var fileInfo = files[i].split("//")
                tableModel.append({"name": fileInfo[0], "date": fileInfo[1], "size": fileInfo[2]})
            }
        }
    }

    SeabotVersionning{
        id : seabotVersion
        Component.onCompleted:{
            seabotVersion.getQGCVersion()
            seabotVersion.getCompanionVersion()
            seabotVersion.getSonarVersion()
        }
        onQgcVersion:{
            qgcVersionLabel.text = version
        }
        onCompanionVersion:{
            companionVerionLabel.text = version
        }
        onSonarVersion:{
            sonarVersionLabel.text = version
        }
    }

    Component.onCompleted:{
        console.log("payload loaded")
        _activeJoystick.setInPayloadPage(true)
        if (QGroundControl.linkManager.payloadConfigExist()) linksettingsLoader.subEditConfig = editingConfig  
    }

    Component.onDestruction: {
        _activeJoystick.setInPayloadPage(false)
        if (joystickSettingsWindow != null) joystickSettingsWindow.close()
        console.log("quitting payload")
    }

    Connections {
        target: joystickSettingsWindow
        onClosing: {
            joystickSettingsWindow = null;
        }
    }

    Timer {
        id: payloadNameTimer
        interval: 1000  // Adjust the interval as needed
        repeat: true
        running: true

        onTriggered: {
            payload_controller.sendPayloadNameRequest(404,"","",0)
            //console.log("Requesting Payload Name")
        }
    }


    QGCFlickable { 
        clip:               true
        anchors.fill:       parent
        contentHeight:      outerItem.height
        contentWidth:       outerItem.width

        Item {
            id:     outerItem
            width:  Math.max(setupViewPayload.width, payloadMainColoumn.width)
            height: payloadMainColoumn.height

            Column{
                id: payloadMainColoumn
                width:              setupViewPayload.width
                spacing:            ScreenTools.defaultFontPixelHeight * 0.5
                anchors.margins:    ScreenTools.defaultFontPixelWidth

                QGCGroupBox {
                    title: qsTr("Payload Communication Config")
                    anchors.margins: ScreenTools.defaultFontPixelWidth
                    anchors.horizontalCenter: parent.horizontalCenter

                    ColumnLayout {
                        spacing: _rowSpacing

                        GridLayout {
                            columns:        2
                            columnSpacing:  _colSpacing
                            rowSpacing:     _rowSpacing

                            QGCTextField {
                                id:                     nameField
                                visible: false
                                Layout.preferredWidth:  _secondColumnWidth
                                Layout.fillWidth:       true
                                text:                   "Payload Communication (Auto generated by Payload Page)"
                                placeholderText:        qsTr("Enter name")
                            }

                            QGCCheckBox {
                                Layout.columnSpan:  2
                                text:               qsTr("Automatically Connect on Start")
                                checked:            editingConfig.autoConnect
                                onCheckedChanged:   editingConfig.autoConnect = checked
                                enabled:            !editingConfig.link
                            }

                            QGCCheckBox {
                                Layout.columnSpan:  2
                                text:               qsTr("High Latency")
                                checked:            editingConfig.highLatency
                                onCheckedChanged:   editingConfig.highLatency = checked
                                enabled:            !editingConfig.link
                            }

                            QGCLabel { text: qsTr("Type") }
                            QGCComboBox {
                                Layout.preferredWidth:  _secondColumnWidth
                                Layout.fillWidth:       true
                                model:                  QGroundControl.linkManager.linkTypeStrings
                                enabled:            !editingConfig.link
                                currentIndex:           editingConfig.linkType

                                onActivated: {
                                    if (index !== editingConfig.linkType) {
                                        // Save current name
                                        var name = nameField.text
                                        // Create new link configuration
                                        editingConfig = QGroundControl.linkManager.createConfiguration(index, name)
                                        linksettingsLoader.subEditConfig = editingConfig
                                    }
                                }
                            }
                        }

                        Loader {
                            id:     linksettingsLoader
                            source: subEditConfig.settingsURL
                            enabled:            !editingConfig.link

                            property var subEditConfig: editingConfig
                        }
                    }
                }

                //Row layout
                RowLayout {
                    Layout.alignment:   Qt.AlignHCenter
                    anchors.horizontalCenter:   parent.horizontalCenter
                    spacing:            _colSpacing

                    QGCButton {
                        width:      ScreenTools.defaultFontPixelWidth * 10
                        text:       editingConfig.link? qsTr("Disconnect"):qsTr("Connect")
                        enabled:    nameField.text !== ""
                        onClicked: {
                                if (!editingConfig.link)
                                {
                                    // Save editing
                                    linksettingsLoader.item.saveSettings()
                                    editingConfig.name = nameField.text
                                    if (QGroundControl.linkManager.payloadConfigExist()) {
                                        console.log(editingConfig.hostList)
                                        console.log("exist")
                                        QGroundControl.linkManager.endConfigurationEditingPayload(editingConfig)
                                    } else {
                                        console.log("config doesnt exist")
                                        // If it was edited, it's no longer "dynamic"
                                        editingConfig.dynamic = false
                                        QGroundControl.linkManager.endCreateConfigurationPayload(editingConfig)
                                    }
                                    editingConfig = QGroundControl.linkManager.createConnectedLinkPayload()
                                }
                                else {
                                    editingConfig.link.disconnect()
                                    editingConfig.linkChanged()
                                    editingConfig = QGroundControl.linkManager.startConfigurationEditingPayload()
                                    linksettingsLoader.subEditConfig = editingConfig
                                }
                            }
                    }

                }

                //-- Payload Control
                        Item {
                            id:                         payloadControlLabel
                            width:                      setupViewPayload.width * 0.8
                            height:                     controlLabel.height * 3
                            anchors.margins:            ScreenTools.defaultFontPixelWidth*2
                            anchors.horizontalCenter:   parent.horizontalCenter
                            visible:                    true
                            Row {
                                anchors.fill: parent

                                // Empty space to push the image to the right
                                Item {
                                    Layout.fillWidth: true
                                }

                                // Image on the right side with clickable area
                                MouseArea {
                                    width: 35
                                    height: payloadControlLabel.height
                                    anchors.top: parent.top
                                    anchors.right: parent.right
                                    onClicked: {
                                        console.log("joystick setting clicked")
                                        if (joystickSettingsWindow === null ) {
                                            var component = Qt.createComponent("PayloadJoystickSettings.qml");
                                            if (component.status === Component.Ready) {
                                                joystickSettingsWindow = component.createObject(null, { payloadBoard: payload_controller.activePayloadName  });
                                                if (joystickSettingsWindow !== null) {
                                                    joystickSettingsWindow.show();
                                                } else {
                                                    console.error("Failed to create object from component:", component.errorString());
                                                }
                                            } else if (component.status === Component.Error) {
                                                console.error("Error loading component:", component.errorString());
                                            } else {
                                                console.error("Component status:", component.status);
                                            }
                                        }
                                        else {
                                            joystickSettingsWindow.requestActivate();
                                        }
                                    }

                                    Image {
                                        anchors.top: parent.top
                                        anchors.right: parent.right
                                        source: "/qmlimages/Gears.svg"
                                        width: 35
                                        height: payloadControlLabel.height
                                        fillMode: Image.PreserveAspectFit
                                    }
                                }

                                // Label in the middle
                                QGCLabel {
                                    id: controlLabel
                                    text: qsTr("PayLoad Control")
                                    font.family: ScreenTools.demiboldFontFamily
                                    verticalAlignment: Text.AlignBottom
                                    anchors.bottom: parent.bottom
                                }
                            }

                        }
                        QGCTabBar {
                            id:             bar
                            width:          payloadControlLabel.width
                            anchors.margins:            ScreenTools.defaultFontPixelWidth*2
                            anchors.horizontalCenter:   parent.horizontalCenter
                            Component.onCompleted: {
                                currentIndex = 0
                            }
                            anchors.top:    payloadControlLabel.buttom
                            QGCTabButton {
                                text:    payload_controller.activePayloadName != "" ?   qsTr(payload_controller.activePayloadName): qsTr("No Payload is detected")
                            }
                        }
                        Loader{
                            source: payload_controller.activePayloadName === "seabotx" ? "SeabotX.qml" : payload_controller.activePayloadName === "seaboty" ? "SeabotY.qml" :null
                            anchors.margins:            ScreenTools.defaultFontPixelWidth*2
                            anchors.horizontalCenter:   parent.horizontalCenter
                        }

                //-- Software Information
                    Item {
                            id:                         payloadStatusLabel
                            width:                      setupViewPayload.width * 0.8
                            height:                     payloadLabel.height
                            anchors.margins:            ScreenTools.defaultFontPixelWidth*2
                            anchors.horizontalCenter:   parent.horizontalCenter
                            visible:                    true
                            QGCLabel {
                                id:             payloadLabel
                                text:           qsTr("Software Informations")
                                font.family:    ScreenTools.demiboldFontFamily
                            }
                        }
                    Rectangle {
                        id : keyboardControlSpace
                        height:         softwareInfoColoumn.height + (ScreenTools.defaultFontPixelHeight * 2)
                        width:          setupViewPayload.width * 0.8
                        color:          qgcPal.windowShade
                        anchors.margins: ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                    
                        Column {
                            anchors.centerIn: parent
                            id : softwareInfoColoumn     
                            spacing:    _columnSpacing

                            Row {
                                spacing:    ScreenTools.defaultFontPixelWidth
                                anchors.horizontalCenter: parent.horizontalCenter
                                QGCLabel {
                                    width:              _labelWidth
                                    text:               qsTr("QGC Version                                            : ")
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                                QGCLabel {
                                    id: qgcVersionLabel
                                    width:              _valueWidth
                                    text:               ""
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                            }

                            Row {
                                spacing:    ScreenTools.defaultFontPixelWidth
                                anchors.horizontalCenter: parent.horizontalCenter
                                QGCLabel {
                                    width:              _labelWidth
                                    text:               qsTr("Companion Memory Usage                  : ")
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                                QGCLabel {
                                    width:              _valueWidth
                                    text:               payload_controller.payloadStatus.mem_usage != undefined ? payload_controller.payloadStatus.mem_usage+" Mb" :""
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                            }

                            Row {
                                spacing:    ScreenTools.defaultFontPixelWidth
                                anchors.horizontalCenter: parent.horizontalCenter
                                QGCLabel {
                                    width:              _labelWidth
                                    text:               qsTr("Companion CPU Usage                         : ")
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                                QGCLabel {
                                    width:              _valueWidth
                                    text:               payload_controller.payloadStatus.cpu_usage != undefined ? payload_controller.payloadStatus.cpu_usage + " %" : ""
                                }
                            }

                            Row {
                                spacing:    ScreenTools.defaultFontPixelWidth
                                anchors.horizontalCenter: parent.horizontalCenter
                                QGCLabel {
                                    width:              _labelWidth
                                    text:               qsTr("Payload Software Version                     : ")
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                                QGCLabel {
                                    width:              _valueWidth
                                    text:               payload_controller.payloadStatus.payload_soft_version
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                            }

                            Row {
                                spacing:    ScreenTools.defaultFontPixelWidth
                                anchors.horizontalCenter: parent.horizontalCenter
                                QGCLabel {
                                    width:              _labelWidth
                                    text:               qsTr("Companion Software Version              : ")
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                                QGCLabel {
                                    id: companionVerionLabel
                                    width:              _valueWidth
                                    text:               ""
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                            }

                            Row {
                                spacing:    ScreenTools.defaultFontPixelWidth
                                anchors.horizontalCenter: parent.horizontalCenter
                                QGCLabel {
                                    width:              _labelWidth
                                    text:               qsTr("Linux Kernel Version                              : ")
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                                QGCLabel {
                                    width:              _valueWidth
                                    text:               payload_controller.payloadStatus.linux_kernel_version
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                            }

                            Row {
                                spacing:    ScreenTools.defaultFontPixelWidth
                                anchors.horizontalCenter: parent.horizontalCenter
                                QGCLabel {
                                    width:              _labelWidth
                                    text:               qsTr("Sonar Version                                          : ")
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                                QGCLabel {
                                    id: sonarVersionLabel
                                    width:              _valueWidth
                                    text:               ""
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                            }
                            
                        }
                    }

                //-- Companion Log Downloader
                    Item {
                        id:                         companionLogDownloader
                        width:                      setupViewPayload.width * 0.8
                        height:                     companionLogDownloaderLabel.height
                        anchors.margins:            ScreenTools.defaultFontPixelWidth*2
                        anchors.horizontalCenter:   parent.horizontalCenter
                        visible:                    true
                        QGCLabel {
                            id:             companionLogDownloaderLabel
                            text:           qsTr("Companion Log Downloader")
                            font.family:    ScreenTools.demiboldFontFamily
                        }
                    }

                    RowLayout {
                        width:                      setupViewPayload.width * 0.8
                        anchors.margins:            ScreenTools.defaultFontPixelWidth*2
                        anchors.horizontalCenter:   parent.horizontalCenter

                        TableView {
                            id: tableView
                            selectionMode:      SelectionMode.MultiSelection
                            anchors.margins:            ScreenTools.defaultFontPixelWidth*2
                            Layout.preferredWidth: parent.width * 0.9
                            visible: downloadToggleButton.text === ("Live Logs")
                        

                            TableViewColumn {
                                title: qsTr("Name")
                                horizontalAlignment: Text.AlignHCenter
                                delegate : Text  {
                                    color: styleData.textColor
                                    text: model?model.name:null
                                }
                                width: tableView.width * 0.5
                            }

                            TableViewColumn {
                                title: qsTr("Date")
                                horizontalAlignment: Text.AlignHCenter
                                delegate: Text  {
                                    color: styleData.textColor
                                    horizontalAlignment: Text.AlignHCenter
                                    text: model?model.date:null
                                }
                            }

                            TableViewColumn {
                                title: qsTr("Size")
                                horizontalAlignment: Text.AlignHCenter
                                delegate : Text  {
                                    color: styleData.textColor
                                    horizontalAlignment: Text.AlignHCenter
                                    text: model?model.size:null
                                }
                            }

                            TableViewColumn {
                                title: qsTr("Status")
                                horizontalAlignment: Text.AlignHCenter
                                delegate : Text  {
                                    color: styleData.textColor
                                    horizontalAlignment: Text.AlignHCenter
                                }
                            }

                            model: ListModel {
                                id: tableModel
                            }
                        }

                        Rectangle {
                            id:                 liveLogs
                            color:              qgcPal.text
                            Layout.preferredWidth: parent.width * 0.9
                            height: parent.height
                            visible:  downloadToggleButton.text === qsTr("Logs Downloader")
                            ScrollView {
                                anchors.fill: parent
                                id: logScrollView

                                Text {
                                    id: logText
                                    text: "Some text here"
                                    width: parent.width
                                    color: qgcPal.window

                                    Connections {
                                        target: payload_controller
                                        onLogMessageReceived: {
                                            logText.text += logMessage + "\n";
                                            logScrollView.flickableItem.contentY = logScrollView.flickableItem.contentHeight - logScrollView.flickableItem.height;
                                        }
                                    }
                                }
                            }
                        }

                        Column {
                            id: downloadColumn
                            Layout.preferredWidth: parent.width * 0.1
                            anchors.right: parent.right
                            anchors.top: parent.top

                            QGCButton {
                                id: downloadToggleButton
                                text: qsTr("Live Logs")
                                width: downloadColumn.width
                                onClicked: {
                                    if (downloadToggleButton.text === ("Live Logs")) {
                                        refreshButton.enabled = false;
                                        logText.text = ""
                                        downloadToggleButton.text = qsTr("Logs Downloader");
                                    } else {
                                        refreshButton.enabled = true;
                                        logText.text = ""
                                        downloadToggleButton.text = qsTr("Live Logs");
                                    }
                                }
                            }
                            
                            QGCButton {
                                id: refreshButton
                                text:       qsTr("Refresh")
                                width:      downloadColumn.width
                                onClicked:{
                                    payloadLogDownloader.refreshCompanionLog()
                                }
                            }

                            QGCButton {
                                id: downloadButton
                                text: qsTr("Download")
                                width: downloadColumn.width
                                enabled: tableView.selection.count >0 && downloadToggleButton.text === ("Live Logs")
                                onClicked: {
                                    fileDialog.title =          qsTr("Select save directory")
                                    fileDialog.selectExisting = true
                                    fileDialog.folder =         QGroundControl.settingsManager.appSettings.logSavePath
                                    fileDialog.selectFolder =   true
                                    fileDialog.openForLoad()
                                }
                            }

                            QGCFileDialog {
                                id: fileDialog
                                onAcceptedForLoad: {
                                    tableView.selection.forEach(function(rowIndex) {
                                        var item = tableModel.get(rowIndex);
                                        if (item) {
                                            console.log("Selected row name:", item.name);
                                            payloadLogDownloader.downloadLogs(item.name,file)
                                        }
                                    });
                                    close()
                                }
                            }
                            
                            QGCCheckBox{
                                text: qsTr("Enable Logs")
                                checked: true
                                onCheckedChanged: payload_controller.sendControlCommand("enable_logs",checked)
                            }
                        }

                    }

                Item { width: 1; height: _margins }
            }
        }
    }

}
