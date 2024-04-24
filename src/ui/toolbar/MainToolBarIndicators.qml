/****************************************************************************
 *
 * (c) 2009-2020 QGROUNDCONTROL PROJECT <http://www.qgroundcontrol.org>
 *
 * QGroundControl is licensed according to the terms in the file
 * COPYING.md in the root of the source code directory.
 *
 ****************************************************************************/

import QtQuick 2.12

import QGroundControl               1.0
import QGroundControl.ScreenTools   1.0
import QGroundControl.Controls              1.0
import QGroundControl.Controllers           1.0

//-------------------------------------------------------------------------
//-- Toolbar Indicators
Row {
    id:                 indicatorRow
    anchors.top:        parent.top
    anchors.bottom:     parent.bottom
    anchors.margins:    _toolIndicatorMargins
    spacing:            ScreenTools.defaultFontPixelWidth * 1.5

    property var  _activeVehicle:           QGroundControl.multiVehicleManager.activeVehicle
    property real _toolIndicatorMargins:    ScreenTools.defaultFontPixelHeight * 0.66
    property var nvidiaON : null

    NvidiaStateDetector{
        onPingResult : {
            //console.log("saying nvidia is on is ")
            //console.log(success)
            nvidiaON = success
        }
    }

    function dropMessageIndicatorTool() {
        toolIndicatorsRepeater.dropMessageIndicatorTool();
    }

    Repeater {
        id:     appRepeater
        model:  QGroundControl.corePlugin.toolBarIndicators
        Loader {
            anchors.top:        parent.top
            anchors.bottom:     parent.bottom
            source:             modelData
            visible:            item.showIndicator
        }
    }

    Repeater {
        id:     toolIndicatorsRepeater
        model:  _activeVehicle ? _activeVehicle.toolIndicators : []

        function dropMessageIndicatorTool() {
            for (var i=0; i<count; i++) {
                var thisTool = itemAt(i);
                if (thisTool.item.dropMessageIndicator) {
                    thisTool.item.dropMessageIndicator();
                }
            }
        }

        Loader {
            anchors.top:        parent.top
            anchors.bottom:     parent.bottom
            source:             modelData
            visible:            item.showIndicator
        }
    }

    Repeater {
        model: _activeVehicle ? _activeVehicle.modeIndicators : []
        Loader {
            anchors.top:        parent.top
            anchors.bottom:     parent.bottom
            source:             modelData
            visible:            item.showIndicator
        }
    }

    QGCLabel {
        anchors.margins:    _margin
        anchors.top:        parent.top
        anchors.bottom:     parent.bottom
        text:               qsTr("Companion")
        font: ScreenTools.defaultFontPointSize
        property real _margin: ScreenTools.defaultFontPixelWidth 
    }

    Rectangle {
        anchors.verticalCenter: parent.verticalCenter
        width:                  ScreenTools.defaultFontPixelWidth * 3 
        height:                 width
        radius:                 width / 2
        color:                  nvidiaON == true? "green": "red"
    }

}
