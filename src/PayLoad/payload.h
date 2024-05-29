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
#include <QMouseEvent>
#include <QWidget>
#include <QPushButton>
#include <QVBoxLayout>
#include <QLabel>
#include <QProcess>

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
    ~SeabotVersionning(); 
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


class CommandExecutorThread : public QThread {
    Q_OBJECT
public:
    explicit CommandExecutorThread(const QString &command, QObject *parent = nullptr);
    explicit CommandExecutorThread(const QStringList &commands, QObject *parent = nullptr);
    CommandExecutorThread(bool restartWeldSightFlag, QObject *parent = nullptr);
    void run() override;

signals:
    void commandOutput(QString output);
    void commandError(QString error);
    void allCommandsFinished();

private:
    QString m_command;
    QStringList m_commands;
    bool m_multipleCommands = false;
    bool m_restartWeldSight = false; 
};


class CommandExecutor : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool parentWindowOpen READ isParentWindowOpen NOTIFY parentWindowOpenChanged)
public:
    explicit CommandExecutor(QObject *parent = nullptr);
    Q_INVOKABLE void runCommand(const QString &command);
    Q_INVOKABLE void runMultipleCommands(const QStringList &commands);
    Q_INVOKABLE void restartWeldSight();
    Q_INVOKABLE QWidget* reparentWindow(const QString &windowId);
    Q_INVOKABLE QString getOculusWindowId();

signals:
    void commandOutput(QString output);
    void commandError(QString error);
    void allCommandsFinished();
    void parentWindowOpenChanged();

private slots:
    void handleCommandOutput(QString output);
    void handleCommandError(QString error);
    void toggleMask();
    void closeOculus();

private:
    void connectSignals(CommandExecutorThread *thread);
    QWidget *parentWindow = nullptr;
    QRegion originalMaskRegion;
    bool maskApplied = true;
    bool m_parentWindowOpen;
    bool isParentWindowOpen() const { return m_parentWindowOpen; }
};


class CustomTitleBar : public QWidget
{
    Q_OBJECT
public:
    CustomTitleBar(QWidget *parent = nullptr) : QWidget(parent), parentWindow(qobject_cast<QWidget*>(parent))
    {
        setFixedHeight(25);
        setFixedWidth(700);
        QHBoxLayout *layout = new QHBoxLayout(this);
        layout->setContentsMargins(0, 0, 0, 0);

        layout->addStretch();
        layout->addStretch();
        QLabel *titleLabel = new QLabel("Sonar");
        layout->addWidget(titleLabel);
        layout->addStretch();

        toggleMaskButton = new QPushButton("Extend Settings");
        toggleMaskButton->setFixedSize(120, 20);
        connect(toggleMaskButton, &QPushButton::clicked, this, &CustomTitleBar::requestToggleMask);
        layout->addWidget(toggleMaskButton);

        QPushButton *closeButton = new QPushButton("X");
        closeButton->setFixedSize(20, 20);
        connect(closeButton, &QPushButton::clicked, this, &CustomTitleBar::closeWindow);
        layout->addWidget(closeButton);
    }

signals:
    void closeRequested();
    void toggleMaskRequested();

private slots:
    void closeWindow()
    {
        QProcess process;
        process.start("killall", QStringList() << "Oculus-ViewPoint");
        process.waitForFinished(-1);
        emit closeRequested();
    }
    void requestToggleMask()
    {
        emit toggleMaskRequested();
        if (toggleMaskButton->text() == "Extend Settings") {
            toggleMaskButton->setText("Hide Settings");
        } else {
            toggleMaskButton->setText("Extend Settings");
        }
    }

protected:
    void mousePressEvent(QMouseEvent *event) override
    {
        if (event->button() == Qt::LeftButton) {
            dragging = true;
            dragStartPosition = event->globalPos();
        }
    }

    void mouseMoveEvent(QMouseEvent *event) override
    {
        if (dragging && (event->buttons() & Qt::LeftButton)) {
            QPoint delta = event->globalPos() - dragStartPosition;
            if (parentWindow) {
                parentWindow->move(parentWindow->pos() + delta);
                dragStartPosition = event->globalPos();
            }
        }
    }

    void mouseReleaseEvent(QMouseEvent *event) override
    {
        if (event->button() == Qt::LeftButton) {
            dragging = false;
        }
    }

private:
    bool dragging = false;
    QPoint dragStartPosition;
    QWidget *parentWindow = nullptr;
    QPushButton *toggleMaskButton;
};



#endif // PAYLOAD_H