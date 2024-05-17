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
import QtQuick.Controls.Styles 1.4

SetupPage{
    pageName : qsTr("Companion Maintainance")
    pageComponent:  companionUpdater
    SeabotVersionning{
        id : seabotVersion
        onInstallationComplete:{
            console.log("success ",success)
            console.log("message here    ",message)
            mainWindow.showMessageDialog(success? qsTr("Installation successful") : qsTr("Installation Failed"),qsTr(message) )
            seabotVersion.getCompanionVersion()
        }
    }

    Component {
        id: companionUpdater

        ColumnLayout {
            width:   availableWidth
            height:  availableHeight
            spacing: ScreenTools.defaultFontPixelHeight

            TextArea {
                id:                 statusTextArea
                Layout.preferredWidth:              parent.width
                Layout.fillHeight:  true
                readOnly:           true
                frameVisible:       false
                font.pointSize:     ScreenTools.defaultFontPointSize
                textFormat:         TextEdit.RichText
                text:               "To update the companion's firmware, select the .deb file to install."

                style: TextAreaStyle {
                    textColor:          qgcPal.text
                    backgroundColor:    qgcPal.windowShade
                }
            }

            Button {
                text: "Choose .deb file"
                onClicked: {
                    fileDialog.visible = true
                }
            }

            FileDialog {
                id: fileDialog
                title: "Select .deb file"
                folder: shortcuts.home
                nameFilters: ["Debian Package Files (*.deb)"]

                onAccepted: {
                    var filePath = fileDialog.fileUrl.toString().replace("file://", "");
                    console.log("Selected file:", filePath);
                    seabotVersion.installDebPackage(filePath);
                }
            }
        }
    }
}