#ifndef PAYLOAD_H
#define PAYLOAD_H

#include <QObject>
#include "QGCLoggingCategory.h"
#include <QVariantMap>
#include "QGCMAVLink.h"
#include "QGCToolbox.h"
#include <QThread>

#include <QGuiApplication>
#include <QScreen>


class  MultiVehicleManager;
class  Vehicle;
class LinkInterface;

Q_DECLARE_LOGGING_CATEGORY(PayloadControllerLog)


class MonitorManager : public QObject
{
    Q_OBJECT

public:
    explicit MonitorManager(QObject *parent = nullptr);

    Q_INVOKABLE int targetScreenIndexForWindow(QWindow *window);

private:
    int findScreenIndexOtherThan(const QPoint &currentScreenCenter);
};

class PingThread : public QThread
{
    Q_OBJECT
public:
    PingThread(const QString& ipAddress);
signals:
    void pingResult(bool success);
protected:
    void run() override;
private:
    QString ipAddress;
};

class PayloadLogDownloaderThread : public QThread
{
    Q_OBJECT
public:
    explicit PayloadLogDownloaderThread(int command, QObject *parent = nullptr);
    explicit PayloadLogDownloaderThread(int command,QString fileName , QString destination , QObject *parent = nullptr);
    void run() override;
signals:
    void filesRefreshed(QStringList files);
private:
    int m_command ; // 0 for refresh and 1 for Download 
    QString m_host = "seabot-companion.local";
    QString m_remoteDir = "/home/seabot/seabotxcompanion-ros2/log/";//.ros/log
    QString m_username = "seabot";
    QString m_password = "seabot758400";
    QString m_file_name = "";
    QString m_destination = "./";
};

class PayloadLogDownloader : public QObject
{
    Q_OBJECT

public:
    PayloadLogDownloader(void);
    Q_INVOKABLE void refreshCompanionLog();
    Q_INVOKABLE void downloadLogs(const QString& fileName , const QString& destination);
signals:
    void filesRefreshed(QStringList files);
};
class SeabotVersionningThread : public QThread
{
    Q_OBJECT
public:
    explicit SeabotVersionningThread(int command, QObject *parent = nullptr);
    explicit SeabotVersionningThread(int command,QString debFilePath, QObject *parent = nullptr);
    void run() override;
signals:
    void qgcVersion(QString version);
    void companionVersion(QString version);
    void installationComplete(bool success, QString message);
private:
    int m_command ;
    QString m_host = "seabot-companion.local";
    QString m_username = "seabot";
    QString m_password = "seabot758400";
    QString m_deb_file_path ="";
};

class SeabotVersionning : public QObject
{
    Q_OBJECT

public:
    SeabotVersionning(void);
    Q_INVOKABLE void getQGCVersion();
    Q_INVOKABLE void getCompanionVersion();
    Q_INVOKABLE void installDebPackage(const QString& debFilePath);
    static void broadcastCompanionVersion(QString version);
signals:
    void qgcVersion(QString version);
    void companionVersion(QString version);
    void installationComplete(bool success, QString message);
private:
    static QList<SeabotVersionning*> instances;
};

class PayloadController : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QVariantMap payloadStatus READ payloadStatus NOTIFY payloadStatusChanged)
    Q_PROPERTY(QString activePayloadName READ activePayloadName NOTIFY activePayloadNameChanged)

public:

    PayloadController(void);
    Q_INVOKABLE void debug(void);
    Q_INVOKABLE void sendControlCommand(const QString& target , int value);
    Q_INVOKABLE void sendPayloadNameRequest(int payload_id , const QString& payload_name , const QString& payload_state , int result  );
    QVariantMap payloadStatus() const;
    bool sendPayloadMessageOnLinkThreadSafe(LinkInterface* link, mavlink_message_t message);
    QString activePayloadName() const { return _activePayloadName; }
private slots:
    void _setActiveVehicle  (Vehicle* vehicle);
    void handlePayloadStatusChanged(const mavlink_custom_payload_control_t &payloadStatus);
    void handleConnectedPayloadChanged(const mavlink_connected_payload_t &connectedPayload);
    void handleLogMessageChanged(const mavlink_play_tune_v2_t &loggingMessage);

signals:
    void payloadStatusChanged();
    void activePayloadNameChanged();
    void logMessageReceived(const QString& logMessage);
    
private:
    Vehicle* _vehicle;
    QVariantMap m_payloadStatus;
    QGCToolbox* _toolbox = nullptr;
    LinkManager*  _link_manager = nullptr;
    QString _activePayloadName;

};

class NvidiaStateDetector : public QObject
{
    Q_OBJECT

public:

    NvidiaStateDetector(void);

private slots:
    void onPingResult(bool success);

signals:
    void pingResult(bool success);

private:
    PingThread* pingThread;

};

#endif // PAYLOAD_H