chrome.alarms.onAlarm.addListener(
    (alarm) => {
        if(alarm.name=="time_is_over"){
            chrome.notifications.create(
                "time_is_over",
                {
                    type: "basic",
                    iconUrl: "../icon.png",
                    title: "Time Calculator",
                    message: "Hello there, it looks like you don't see the current time.",
                    silent: false
                },
                () => {
                    chrome.alarms.clear("time_is_over")
                }
            )
        }else if(alarm.name=="water_reminder"){
            chrome.notifications.create(
                "water_reminder",
                {
                    type: "basic",
                    iconUrl: "../icon.png",
                    title: "Water reminder",
                    message: "Take sip of water please.",
                    silent: false
                }
            )
        }
    },
)