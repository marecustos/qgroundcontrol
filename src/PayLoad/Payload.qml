import QtQuick          2.3
import QtQuick.Window   2.2
import QtQuick.Controls 1.2

import QGroundControl               1.0
import QGroundControl.Palette       1.0
import QGroundControl.Controls      1.0
import QGroundControl.Controllers   1.0
import QGroundControl.ScreenTools   1.0

Rectangle {
    id:     setupViewPayload
    QGCPalette { id: qgcPal }
    color:  qgcPal.window
    property real _columnSpacing:       ScreenTools.defaultFontPixelHeight * 0.25
    property real _labelWidth:          ScreenTools.defaultFontPixelWidth * 28
    property real _valueWidth:          ScreenTools.defaultFontPixelWidth * 24

    PayloadController {
        id: payload_controller
    }

    Column{
        width:              setupViewPayload.width
        spacing:            ScreenTools.defaultFontPixelHeight * 0.5
        anchors.margins:    ScreenTools.defaultFontPixelWidth

        //-- Payload Control
                Item {
                    id:                         payloadControlLabel
                    width:                      setupViewPayload.width * 0.8
                    height:                     controlLabel.height
                    anchors.margins:            ScreenTools.defaultFontPixelWidth*2
                    anchors.horizontalCenter:   parent.horizontalCenter
                    visible:                    true
                    QGCLabel {
                        id:             controlLabel
                        text:           qsTr("PayLoad Control")
                        font.family:    ScreenTools.demiboldFontFamily
                    }
                }


        Rectangle {
            id : keyboardControlSpace
            height:         controlKeysColoumn.height + (ScreenTools.defaultFontPixelHeight * 2)
            width:          setupViewPayload.width * 0.8
            color:          qgcPal.windowShade
            anchors.margins: ScreenTools.defaultFontPixelWidth
            anchors.horizontalCenter: parent.horizontalCenter
            focus: true // Ensure this item can receive focus

            Column {
                anchors.centerIn: parent
                id : controlKeysColoumn     
                spacing:    _columnSpacing 

                // Rows with labels, buttons, and values
                Row {
                    spacing:    ScreenTools.defaultFontPixelWidth

                    QGCLabel {
                        anchors.verticalCenter: parent.verticalCenter
                        text: qsTr("Y Rotation                                ")
                    }
                    ControlButton {
                        targetCommand: "Y Rotation"
                        valueCommand: +1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                    ControlButton {
                        targetCommand: "Y Rotation"
                        valueCommand: -1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                }     

                Row {
                    spacing:    ScreenTools.defaultFontPixelWidth

                    QGCLabel {
                        anchors.verticalCenter: parent.verticalCenter
                        text: qsTr("Docking                                    ")
                    }
                    ControlButton {
                        targetCommand: "docking"
                        valueCommand: +1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                    ControlButton {
                        targetCommand: "docking"
                        valueCommand: -1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                }  

                Row {
                    spacing:    ScreenTools.defaultFontPixelWidth

                    QGCLabel {
                        anchors.verticalCenter: parent.verticalCenter
                        text: qsTr("probXTransition                     ")
                    }
                    ControlButton {
                        targetCommand: "probXTransition"
                        valueCommand: +1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                    ControlButton {
                        targetCommand: "probXTransition"
                        valueCommand: -1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                }  

                Row {
                    spacing:    ScreenTools.defaultFontPixelWidth

                    QGCLabel {
                        anchors.verticalCenter: parent.verticalCenter
                        text: qsTr("probYTransition                     ")
                    }
                    ControlButton {
                        targetCommand: "probYTransition"
                        valueCommand: +1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                    ControlButton {
                        targetCommand: "probYTransition"
                        valueCommand: -1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                }  

                Row {
                    spacing:    ScreenTools.defaultFontPixelWidth

                    QGCLabel {
                        anchors.verticalCenter: parent.verticalCenter
                        text: qsTr("probZTransition                     ")
                    }
                    ControlButton {
                        targetCommand: "probZTransition"
                        valueCommand: +1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                    ControlButton {
                        targetCommand: "probZTransition"
                        valueCommand: -1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                }  

                Row {
                    spacing:    ScreenTools.defaultFontPixelWidth

                    QGCLabel {
                        anchors.verticalCenter: parent.verticalCenter
                        text: qsTr("deploymentTransition          ")
                    }
                    ControlButton {
                        targetCommand: "deploymentTrans"
                        valueCommand: +1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                    ControlButton {
                        targetCommand: "deploymentTrans"
                        valueCommand: -1
                        onControlButtonPressed: {
                            payload_controller.sendControlCommand(targetCommand,valueCommand)
                        }

                    }
                }

                Row {
                    spacing: ScreenTools.defaultFontPixelWidth

                    QGCLabel {
                        anchors.verticalCenter: parent.verticalCenter
                        text:  qsTr("Magnet                                         ")
                    }

                    Switch {
                        id: magnetSwitch
                        onClicked: {
                            if (!checked) {
                                payload_controller.sendControlCommand("Magnet",0)
                            }
                            else {
                                payload_controller.sendControlCommand("Magnet",1)
                            }
                        }
                    }
                } 


                Row {
                    spacing: ScreenTools.defaultFontPixelWidth

                    QGCLabel {
                        anchors.verticalCenter: parent.verticalCenter
                        text:  qsTr("Gripper                                         ")
                    }

                    Switch {
                        id: gripperSwitch
                        onClicked: {
                            if (!checked) {
                                payload_controller.sendControlCommand("Gripper",0)
                            }
                            else {
                                payload_controller.sendControlCommand("Gripper",1)
                            }
                        }
                    }
                } 

                
            }
        }
        Component.onCompleted: {
            keyboardControlSpace.forceActiveFocus()
            payload_controller.debug()
        }

        //-- Payload Status
                Item {
                    id:                         payloadStatusLabel
                    width:                      setupViewPayload.width * 0.8
                    height:                     payloadLabel.height
                    anchors.margins:            ScreenTools.defaultFontPixelWidth*2
                    anchors.horizontalCenter:   parent.horizontalCenter
                    visible:                    true
                    QGCLabel {
                        id:             payloadLabel
                        text:           qsTr("PayLoad Status")
                        font.family:    ScreenTools.demiboldFontFamily
                    }
                }

                Rectangle {
                height:         payloadStatusColumn.height + (ScreenTools.defaultFontPixelHeight * 2)
                width:          setupViewPayload.width * 0.8
                color:          qgcPal.windowShade
                anchors.margins: ScreenTools.defaultFontPixelWidth
                anchors.horizontalCenter: parent.horizontalCenter
                Column {
                    id:         payloadStatusColumn
                    width:      setupViewPayload.width * 0.8
                    spacing:    _columnSpacing
                    anchors.centerIn: parent
                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Position X                : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.pos_x
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Position Y                : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.pos_y
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Position Z                : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.pos_z
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Linear velocity X     : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.linear_velocity_x
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Linear velocity Y     : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.linear_velocity_y
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Linear velocity Z     : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.linear_velocity_z
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Angular Velocity X  : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.angular_velocity_x
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Angular Velocity Y  : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.angular_velocity_y
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Angular Velocity Z  : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.angular_velocity_z
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Computer Board Status  : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.companion_board_status
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    //-----------------------------------------------------------------
                    Row {
                        spacing:    ScreenTools.defaultFontPixelWidth
                        anchors.horizontalCenter: parent.horizontalCenter
                        QGCLabel {
                            width:              _labelWidth
                            text:               qsTr("Payload Board Status   : ")
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        QGCLabel {
                            width:              _valueWidth
                            text:               payload_controller.payloadStatus.payload_board_status
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }
                    
                }
            }
    }
}