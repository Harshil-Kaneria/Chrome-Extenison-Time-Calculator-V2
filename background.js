chrome.alarms.onAlarm.addListener(
    () => {
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
    },
)