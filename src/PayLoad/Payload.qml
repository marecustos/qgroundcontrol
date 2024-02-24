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
        Rectangle {
            id : keyboardControlSpace
            anchors.horizontalCenter: parent.horizontalCenter
            color: "transparent"
            focus: true // Ensure this item can receive focus
            height : 300
            width: setupViewPayload.width

            MouseArea {
                anchors.fill: parent
                onClicked: {
                    keyboardControlSpace.forceActiveFocus()
                }
            }

            Keys.onPressed: {
                console.log("Key pressed:", event.key)
                var keyNumber = parseInt(event.key)
                if (!isNaN(keyNumber)) {
                    // Use keyNumber as an integer
                    payload_controller.sendKeyboardCommand(keyNumber)
                    if (event.key === Qt.Key_Up) up_arrow.color = qgcPal.windowShade
                    if (event.key === Qt.Key_Down) down_arrow.color = qgcPal.windowShade
                    if (event.key === Qt.Key_Right) right_arrow.color = qgcPal.windowShade
                    if (event.key === Qt.Key_Left) left_arrow.color = qgcPal.windowShade
                    if (event.key === Qt.Key_Space) space_button.color = qgcPal.windowShade

                } else {
                    console.log("Invalid key number:", event.key)
                }
            }
            Keys.onReleased: {
                if (event.key === Qt.Key_Up) up_arrow.color = "lightgrey";
                if (event.key === Qt.Key_Down) down_arrow.color = "lightgrey";
                if (event.key === Qt.Key_Right) right_arrow.color = "lightgrey";
                if (event.key === Qt.Key_Left) left_arrow.color = "lightgrey";
                if (event.key === Qt.Key_Space) space_button.color = "lightgrey";
            }
            Column {
                spacing: 10
                anchors.centerIn: parent                
                // Up arrow button
                Row {
                    spacing: 10
                    Rectangle {
                        width: 50
                        height: 50
                        color: "transparent"
                        border.color: "transparent"
                        border.width: 1
                    }
                    Rectangle {
                        id: up_arrow
                        width: 50
                        height: 50
                        color: "lightgrey"
                        border.color: "black"
                        border.width: 1
                        Text {
                            anchors.centerIn: parent
                            text: "↑"
                        }
                    }
                }

                // Left and Right arrow buttons
                Row {
                    spacing: 10
                    Rectangle {
                        id: left_arrow
                        width: 50
                        height: 50
                        color: "lightgrey"
                        border.color: "black"
                        border.width: 1
                        Text {
                            anchors.centerIn: parent
                            text: "←"
                        }
                    }
                    Rectangle {
                        id: down_arrow
                        width: 50
                        height: 50
                        color: "lightgrey"
                        border.color: "black"
                        border.width: 1
                        Text {
                            anchors.centerIn: parent
                            text: "↓"
                        }
                    }
                    Rectangle {
                        id: right_arrow
                        width: 50
                        height: 50
                        color: "lightgrey"
                        border.color: "black"
                        border.width: 1
                        Text {
                            anchors.centerIn: parent
                            text: "→"
                        }
                    }
                }

                // Space button
                Rectangle {
                    id: space_button
                    width: 170
                    height: 50
                    color: "lightgrey"
                    border.color: "black"
                    border.width: 1
                    Text {
                        anchors.centerIn: parent
                        text: "Space"
                    }
                }
            }
        }
        Component.onCompleted: {
            keyboardControlSpace.forceActiveFocus()
            console.log("Rectangle completed")
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