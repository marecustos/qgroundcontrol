#ifndef PAYLOAD_H
#define PAYLOAD_H

#include <QObject>
#include "QGCLoggingCategory.h"
#include <QVariantMap>
#include "QGCMAVLink.h"

class  MultiVehicleManager;
class  Vehicle;

Q_DECLARE_LOGGING_CATEGORY(PayloadControllerLog)


class PayloadController : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QVariantMap payloadStatus READ payloadStatus NOTIFY payloadStatusChanged)

public:

    PayloadController(void);
    Q_INVOKABLE void debug(void);
    Q_INVOKABLE void sendKeyboardCommand(int);
    QVariantMap payloadStatus() const;
private slots:
    void _setActiveVehicle  (Vehicle* vehicle);
    void handlePayloadStatusChanged(const mavlink_payload_status_t &payloadStatus);

signals:
    void payloadStatusChanged();
    
private:
    Vehicle* _vehicle;
    QVariantMap m_payloadStatus;

};

#endif // PAYLOAD_H