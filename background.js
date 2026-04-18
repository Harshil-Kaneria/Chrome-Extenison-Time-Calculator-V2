chrome.alarms.onAlarm.addListener(
    (alarm) => {
        if(alarm.name=="time_is_over"){
            chrome.notifications.create(
                "time_is_over",
                {
                    type: "basic",
                    iconUrl: "../icon.png",
                    title: "Time Calculator",
                    message: "Your planned work session time is up.",
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
                    message: "Time for a quick water break.",
                    silent: false
                }
            )
        }
    },
)