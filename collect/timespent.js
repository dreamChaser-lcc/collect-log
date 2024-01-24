/**
 * 页面停留
 */

var timeSpent = 0,
    timeSpentStep = 5,
    timeSpentDelay = timeSpentStep,

    timeSpentTimer,
    timeSpentCount,

    timeSpentId,
    timeSpentPageInfo;

function onTimeSpent() {
    timeSpent += timeSpentDelay;
    timeSpentCount++;
    timeSpentDelay = timeSpentStep * Math.ceil(timeSpentCount / 10);

    event(extend({
            ts_id: timeSpentId,
            category: 'time_spent',
            action: 'spend',
            label: 'time',
            value: timeSpent
        }, timeSpentPageInfo));

    clearTimeout(timeSpentTimer);
    timeSpentTimer = setTimeout(onTimeSpent, timeSpentDelay * 1000);
}

var resetTimeSpent = api.resetTimeSpent = function (pageInfo) {
    timeSpentPageInfo = pageInfo;

    timeSpentId = rand(16);
    timeSpentCount = 0;
    timeSpent = 0;

    clearTimeout(timeSpentTimer);
    timeSpentTimer = setTimeout(onTimeSpent, timeSpentDelay * 1000);
};