import * as d3 from "d3";
import DataIntervalTree from 'node-interval-tree'
import {Activity, ActivityTree, ActivityType, DayDataRow, DaysDataArray} from "../domain";
import {dateTimeToEpoch} from "../utils/time";

const ONE_DAY = 1000 * 60 * 60 * 24;

export function toDaysArray(rawData: d3.DSVParsedArray<any>): DaysDataArray {
    let daysDataMap = new Map<string, DayDataRow>();

    // Identify all the days in the data-set
    for (let rawDataRow of rawData) {
        if ("Date" in rawDataRow && rawDataRow["Date"] != "" &&
            "TimeStart" in rawDataRow && rawDataRow["TimeStart"] != "" &&
            "TimeEnd" in rawDataRow  && rawDataRow["TimeEnd"] != "" &&
            "ActivePct" in rawDataRow  && rawDataRow["ActivePct"] != "") {
            let dayLabel = rawDataRow["Date"];
            let dayStartEpoch = dateTimeToEpoch(dayLabel, "00:00");
            let dayEndEpoch = dayStartEpoch + ONE_DAY;

            daysDataMap.set(dayLabel, new DayDataRow(dayLabel, dayStartEpoch, dayEndEpoch))
        }
    }

    // Extract the unique values for days sorted in descending order
    return Array.from(daysDataMap, tuple => tuple[1])
        .sort((a, b) => b.dayStartEpoch - a.dayStartEpoch);
}

export function toActivityTree(rawData: d3.DSVParsedArray<any>): ActivityTree {
    let activityTree = new DataIntervalTree<Activity>();

    let lastFeedEndTime:number = 0;
    for (let rawDataRow of rawData) {
        let currentDate = rawDataRow["Date"];

        if (lastFeedEndTime == 0) {
            lastFeedEndTime = dateTimeToEpoch(currentDate, "00:00")
        }

        // Parse CSV entry
        let timeStart:number = dateTimeToEpoch(currentDate, rawDataRow["TimeStart"]);
        let timeEnd:number = dateTimeToEpoch(currentDate, rawDataRow["TimeEnd"]);
        let activePct:number = +rawDataRow["ActivePct"].replace("%","");

        // Add any sleeps
        let sleepPct = 100 - activePct;
        if (sleepPct > 0) {
            // The sleep is usually in the middle of the interval between lastFeedEndTime and timeStart
            // Say if the lastFeedEndTime is 30 and timeStart is 130, with a 50% sleep time
            // Then the sleep interval is [55, 105]
            let lengthOfEntireInterval = timeStart - lastFeedEndTime;
            let lengthOfSleepInterval = (lengthOfEntireInterval) * (sleepPct/100);
            let sleepIntervalOffset = (lengthOfEntireInterval - lengthOfSleepInterval)/2;

            let sleepStartTime = lastFeedEndTime + sleepIntervalOffset;
            let sleepEndTime = timeStart - sleepIntervalOffset;
            activityTree.insert(sleepStartTime, sleepEndTime, new Activity(sleepStartTime, sleepEndTime, ActivityType.SLEEP));
        }

        // Add the feed
        activityTree.insert(timeStart, timeEnd, new Activity(timeStart, timeEnd, ActivityType.FEED));
        lastFeedEndTime = timeEnd;
    }
    return activityTree
}
