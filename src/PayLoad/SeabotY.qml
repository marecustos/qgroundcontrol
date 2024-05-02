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
            if(!_activeJoystick.inPayloadPage)_activeJoystick.setInPayloadPage(true)
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

            QGCCheckBox {
                id: advancedCheckBoxYRotation
                text: "Advanced"
                anchors.verticalCenter: parent.verticalCenter

            }

            Slider {
                id: sliderYRotation
                minimumValue: 1
                maximumValue: 100
                stepSize: 1
                value: 90
                anchors.verticalCenter: parent.verticalCenter
                visible: advancedCheckBoxYRotation.checked

                // Bind the value of the slider to the speed property of the buttons
                onValueChanged: {
                    yRotationF.speed = 300 - value * 2.99 // Map slider value to speed (1 to 300)
                    yRotationB.speed = 300 - value * 2.99
                }
            }

            SpinBox {
                id: spinBoxYRotation
                minimumValue: sliderYRotation.minimumValue
                maximumValue: sliderYRotation.maximumValue
                stepSize: 1
                width: 50
                value: sliderYRotation.value // Initialize the spin box value with the slider value
                anchors.verticalCenter: parent.verticalCenter
                visible: advancedCheckBoxYRotation.checked

                // Bind the value of the spin box to the slider value
                onValueChanged: {
                    sliderYRotation.value = value
                }
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

            QGCCheckBox {
                id: advancedCheckBoxCamera
                text: "Advanced"
                anchors.verticalCenter: parent.verticalCenter

            }

            Slider {
                id: sliderCamera
                minimumValue: 1
                maximumValue: 100
                stepSize: 1
                value: 90
                anchors.verticalCenter: parent.verticalCenter
                visible: advancedCheckBoxCamera.checked

                // Bind the value of the slider to the speed property of the buttons
                onValueChanged: {
                    cameraRotationRelativeF.speed = 300 - value * 2.99 // Map slider value to speed (1 to 300)
                    cameraRotationRelativeB.speed = 300 - value * 2.99
                }
            }

            SpinBox {
                id: spinBoxCamera
                minimumValue: sliderCamera.minimumValue
                maximumValue: sliderCamera.maximumValue
                stepSize: 1
                width: 50
                value: sliderCamera.value // Initialize the spin box value with the slider value
                anchors.verticalCenter: parent.verticalCenter
                visible: advancedCheckBoxCamera.checked

                // Bind the value of the spin box to the slider value
                onValueChanged: {
                    sliderCamera.value = value
                }
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