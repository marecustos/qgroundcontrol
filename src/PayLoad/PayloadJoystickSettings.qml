import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtQuick.Window   2.2
import QGroundControl               1.0
import QGroundControl.Palette       1.0
import QGroundControl.Controls      1.0
import QGroundControl.Controllers   1.0
import QGroundControl.ScreenTools   1.0

Window {
    id: settingsWindow
    width: Screen.width * 0.8
    height: Screen.height * 0.8
    visible: true
    modality: Qt.NonModal
    flags: Qt.Window
    color: qgcPal.window
    title: "Payload Joystick Settings"

    readonly property real  _maxButtons:         64
    property var payloadBoard : ""
    property var  _activeJoystick:          joystickManager.activeJoystick
    property var buttonNames : { 0 : 'A' , 1 : 'B' , 2 :'X' , 3 : 'Y' , 4 : 'Back' , 5 : 'Logitech' , 6 : 'Start' , 7 : 'L3' , 8 : 'R3' , 9 : 'LB' , 10 : 'RB' , 11 : 'UP' , 12 : 'DOWN' , 13:'LEFT' , 14 : 'RIGHT' , 19 : 'LT' , 20 : 'RT'}
    property var buttonFunctionnalities : payloadBoard == "SeabotX"? ["Y Rotation -1", "Docking -1" , "Docking +1", "Y Rotation +1" , "deployTransition +1" , "Light" , "deployTransition -1" , "Prob Z Transition +1" , "Prob Z Transition -1" , "Magnet" , "Brush" , "Prob Y Transition +1" , "Prob Y Transition -1", "Prob X Transition +1" , "Prob X Transition -1" , "Camera Rotation +1" , "Camera Rotation -1"]: payloadBoard=="SeabotY" ? ["Y Rotation -1", "" , "", "Y Rotation +1" , "" , "" , "" , "" , "" , "Magnet" , "" , "" , "", "" , "" , "Camera Rotation +1" , "Camera Rotation -1"] : []

    Connections {
        target: _activeJoystick
        onRawButtonPressedChanged: {
            if(index == 19 || index ==20 )index-=4
            if (buttonActionRepeater.itemAt(index)) {
                buttonActionRepeater.itemAt(index).pressed = pressed
            }
        }
    }

    RowLayout {
        anchors.fill: parent

        Image {
            source: "/qmlimages/joystickButtons"
            fillMode: Image.PreserveAspectFit
            height: settingsWindow.height
            width: settingsWindow.width * 0.7  // Take 70% of the width
        }

        Column {
            id:         buttonCol
            width:      settingsWindow.width * 0.4
            spacing:    ScreenTools.defaultFontPixelHeight / 3
            anchors.verticalCenter: parent.verticalCenter

            Row {
                spacing: ScreenTools.defaultFontPixelWidth
                QGCLabel {
                    horizontalAlignment:    Text.AlignHCenter
                    width:                  ScreenTools.defaultFontPixelHeight * 3.5
                    text:                   qsTr("Button")
                }
                QGCLabel {
                    width:                  ScreenTools.defaultFontPixelWidth * 26
                    text:                   qsTr("Function: ")
                }
            }
            Repeater {
                id:     buttonActionRepeater
                model:   Object.keys(buttonNames).map(function(key) { return buttonNames[key]; })

                Row {
                    spacing: ScreenTools.defaultFontPixelWidth
                    property bool pressed
                    property int buttonIndex: index

                    Rectangle {
                        anchors.verticalCenter:     parent.verticalCenter
                        height:                     ScreenTools.defaultFontPixelHeight * 1.5
                        width:                      ScreenTools.defaultFontPixelHeight * 3
                        border.width:               1
                        border.color:               qgcPal.text
                        color:                      pressed ? qgcPal.buttonHighlight : qgcPal.button


                        QGCLabel {
                            anchors.fill:           parent
                            color:                  pressed ? qgcPal.buttonHighlightText : qgcPal.buttonText
                            horizontalAlignment:    Text.AlignHCenter
                            verticalAlignment:      Text.AlignVCenter
                            text:                   modelData
                        }  
                    }

                    QGCComboBox {
                        id:                         buttonActionCombo
                        width:                      ScreenTools.defaultFontPixelWidth * 26
                        model:                      [buttonFunctionnalities[buttonIndex]]
                    }

                    Item {
                        width:                      ScreenTools.defaultFontPixelWidth * 2
                        height:                     1
                    }
                }
            }
        }
    }
}
