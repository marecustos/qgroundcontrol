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