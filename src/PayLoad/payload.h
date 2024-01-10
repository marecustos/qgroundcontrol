#ifndef PAYLOAD_H
#define PAYLOAD_H

#include <QObject>
#include "QGCLoggingCategory.h"

class  MultiVehicleManager;
class  Vehicle;

Q_DECLARE_LOGGING_CATEGORY(PayloadControllerLog)


class PayloadController : public QObject
{
    Q_OBJECT

public:

    PayloadController(void);
    Q_INVOKABLE void debug(void);
    Q_INVOKABLE void sendKeyboardCommand(int);
private slots:
    void _setActiveVehicle  (Vehicle* vehicle);
    
private:
    Vehicle* _vehicle;

};

#endif // PAYLOAD_H
