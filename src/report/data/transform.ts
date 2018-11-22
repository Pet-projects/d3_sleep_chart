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
            "TimeEnd" in rawDataRow  && rawDataRow["TimeEnd"] != "") {
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

/**
 * Converts a CSV of type:
 *   Date,Day,ActivityId,ActivityName,TimeStart,TimeEnd
 *   6-Aug-2018,Mon,0,SLEEP,00:00,05:40
 *   6-Aug-2018,Mon,1,FEED,05:40,06:00
 *   6-Aug-2018,Mon,0,SLEEP,06:00,06:00
 *
 */
export function toActivityTree(rawData: d3.DSVParsedArray<any>): ActivityTree {
    let activityTree = new DataIntervalTree<Activity>();

    for (let rawDataRow of rawData) {
        let currentDate:string = rawDataRow["Date"];
        let activityType:ActivityType = +rawDataRow["ActivityId"];

        let timeStart:number = dateTimeToEpoch(currentDate, rawDataRow["TimeStart"]);
        let timeEnd:number = dateTimeToEpoch(currentDate, rawDataRow["TimeEnd"]);

        if (timeEnd < timeStart) {
            // Assume the time end refers to the next day and we adjust accordingly
            timeEnd += ONE_DAY;
        }
        activityTree.insert(timeStart, timeEnd, new Activity(timeStart, timeEnd, activityType));
    }

    return activityTree;
}
