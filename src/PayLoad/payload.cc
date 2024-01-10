#include "payload.h"
#include "QGCApplication.h"
#include <QDebug>
#include "Vehicle.h"
#include "MultiVehicleManager.h"
#include "seabot.h"

QGC_LOGGING_CATEGORY(PayloadControllerLog, "PayloadControllerLog")

PayloadController::PayloadController(void) 
    :_vehicle(nullptr)
{

    qCDebug(PayloadControllerLog) << "started payload";
    MultiVehicleManager *manager = qgcApp()->toolbox()->multiVehicleManager();
    connect(manager, &MultiVehicleManager::activeVehicleChanged, this, &PayloadController::_setActiveVehicle);
    _setActiveVehicle(manager->activeVehicle());
    
}
void PayloadController::debug(void) {qCDebug(PayloadControllerLog) << "started payload";}
void
PayloadController::_setActiveVehicle(Vehicle* vehicle)
{
    qCDebug(PayloadControllerLog) << "setting Vehicle in Payload Class";
    _vehicle = vehicle;
}
void PayloadController::sendKeyboardCommand(int keyboard_key)
{
    if(_vehicle) {
        mavlink_message_t msg;
        mavlink_msg_keyboard_command_payload_pack_chan(
            qgcApp()->toolbox()->mavlinkProtocol()->getSystemId(),
            qgcApp()->toolbox()->mavlinkProtocol()->getComponentId(),
            _vehicle->priorityLink()->mavlinkChannel(),
            &msg,
            keyboard_key
        );
        _vehicle->sendMessageOnLink(_vehicle->priorityLink(), msg);
        qCDebug(PayloadControllerLog) << "command sent";
    }
}
