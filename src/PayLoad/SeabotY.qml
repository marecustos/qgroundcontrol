import QtQuick          2.3
import QtQuick.Window   2.2
import QtQuick.Controls 1.2

import QGroundControl               1.0
import QGroundControl.Palette       1.0
import QGroundControl.Controls      1.0
import QGroundControl.Controllers   1.0
import QGroundControl.ScreenTools   1.0
import QtQuick.Layouts  1.2

Rectangle {
    id : keyboardControlSpace
    height:         controlKeysColoumn.height + (ScreenTools.defaultFontPixelHeight * 2)
    width:          setupViewPayload.width * 0.8
    color:          qgcPal.windowShade
    anchors.margins: ScreenTools.defaultFontPixelWidth
    anchors.horizontalCenter: parent.horizontalCenter
    focus: true // Ensure this item can receive focus
    property var buttonMap: {"0": yRotationB ,3: yRotationF,20 : cameraRotationRelativeB , 19 : cameraRotationRelativeF}
    property var switches : {9:magnetSwitch}
    property real status_width:          ScreenTools.defaultFontPixelWidth * 6

    Connections {
        target:     _activeJoystick
        onRawButtonPressedChanged: {
            console.log("button "+index+" preesed"+pressed)
            console.log(joystickSettingsWindow)
            if(joystickSettingsWindow == null){
                if(buttonMap.hasOwnProperty(index))buttonMap[index].joystickClicked(pressed)
                else if(switches.hasOwnProperty(index) && pressed){
                    switches[index].checked = !switches[index].checked
                    switches[index].clicked()
                }
            }
        }
    }

    Column {
        anchors.centerIn: parent
        id : controlKeysColoumn     
        spacing:    _columnSpacing 

        // Rows with labels, buttons, and values
        Row {
            spacing:    ScreenTools.defaultFontPixelWidth

            QGCLabel {
                anchors.verticalCenter: parent.verticalCenter
                text: qsTr("Y Rotation                                  ")
            }
            ControlButton {
                id : yRotationF
                targetCommand: "yRotationRelative"
                valueCommand: +1
                onControlButtonPressed: {
                    payload_controller.sendControlCommand(targetCommand,valueCommand)
                }

            }
            ControlButton {
                id : yRotationB
                targetCommand: "yRotationRelative"
                valueCommand: -1
                onControlButtonPressed: {
                    payload_controller.sendControlCommand(targetCommand,valueCommand)
                }

            }
            QGCTextField {
                id: yRotationValueLabel
                readOnly : true
                width : status_width
                anchors.verticalCenter: parent.verticalCenter
                font.pointSize: ScreenTools.largeFontPointSize
                horizontalAlignment: Qt.AlignHCenter
                verticalAlignment: TextInput.AlignVCenter
                text: payload_controller.payloadStatus.yRotationRelative.toString()
            }
        }     

        Row {
            spacing:    ScreenTools.defaultFontPixelWidth

            QGCLabel {
                anchors.verticalCenter: parent.verticalCenter
                text: qsTr("Camera Rotation                       ")
            }
            ControlButton {
                id : cameraRotationRelativeF
                targetCommand: "cameraRotationRelative"
                valueCommand: +1
                onControlButtonPressed: {
                    payload_controller.sendControlCommand(targetCommand,valueCommand)
                }

            }
            ControlButton {
                id : cameraRotationRelativeB
                targetCommand: "cameraRotationRelative"
                valueCommand: -1
                onControlButtonPressed: {
                    payload_controller.sendControlCommand(targetCommand,valueCommand)
                }

            }
            QGCTextField {
                id: cameraRotValueLabel
                readOnly : true
                width : status_width
                anchors.verticalCenter: parent.verticalCenter
                font.pointSize: ScreenTools.largeFontPointSize
                horizontalAlignment: Qt.AlignHCenter
                verticalAlignment: TextInput.AlignVCenter
                text: payload_controller.payloadStatus.cameraRotationRelative.toString()
            }
        }

        Row {
            spacing: ScreenTools.defaultFontPixelWidth

            QGCLabel {
                anchors.verticalCenter: parent.verticalCenter
                text:  qsTr("Magnet                                          ")
            }

            Switch {
                id: magnetSwitch
                onClicked: {
                    if (!checked) {
                        payload_controller.sendControlCommand("electroMagnet",0)
                    }
                    else {
                        payload_controller.sendControlCommand("electroMagnet",1)
                    }
                }
            }
        } 

    }
}