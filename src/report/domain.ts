import * as d3 from "d3";
import {default as DataIntervalTree, IntervalTree} from "node-interval-tree";
import {epochToDateTime} from "./utils/time";


export type TransitionCoordinator = d3.Transition<any, any, any, any>
export type UpdatableSelection = d3.Transition<any, any, any, any>
// noinspection JSAnnotator
export type AppendableSelection = d3.Selection<any, any, any, any>


export class DataRow implements d3.DSVRowAny {
    // Injected context
    _showRounds: boolean;
    _selectedCandidate: boolean;
    _selectedBenchmark: boolean;
    _showOnlyMatchingCategory: boolean;
    _selectedLanguage: boolean;

    // Present in the data set
    Challenge: string;
    Group: string;
    Participant: string;
    DateStarted: string;
    Est: number;
    TClockTime: number;
    TPenalties: number;
    Total: number;
    Screencast: string;
    ScreencastType: string;
    SourceCode: string;
    Language: string;

    // Computed from data
    overallTestCoverage: number; // from 0 to 100

    // Helper render variable
    _y0: number;
}


export enum ActivityType {
    SLEEP,
    FEED
}

export class Activity {
    constructor(startTimeEpoch: number, endTimeEpoch: number, type: ActivityType) {
        this.startTimeEpoch = startTimeEpoch;
        this.endTimeEpoch = endTimeEpoch;
        this.type = type;

        let activityName = ActivityType[this.type];
        this.asString = activityName+" from "+epochToDateTime(this.startTimeEpoch)+" to "+epochToDateTime(this.endTimeEpoch)
    }

    readonly asString: string;
    readonly startTimeEpoch: number;
    readonly endTimeEpoch: number;
    readonly type: ActivityType;
}

export class DaysDataSource {
    constructor() {
        this.activityTree = new DataIntervalTree<Activity>();
        this.daysData = [];
    }

    activityTree: ActivityTree;
    daysData: Array<DayDataRow>;
}

export class DayDataRow {

    constructor(dayLabel: string, dayStartEpoch: number, dayEndEpoch: number) {
        this.dayLabel = dayLabel;
        this.dayStartEpoch = dayStartEpoch;
        this.dayEndEpoch = dayEndEpoch;

        this._activities = [];
        this._y0 = 0;
    }

    // The day represented as String (eq 13-Aug-2018)
    dayLabel: string;

    // The start of the day represented as timestamp
    dayStartEpoch: number;
    // The end of the day represented as timestamp
    dayEndEpoch: number;

    // Day activities - will refresh based on the controls
    _activities: Activity[];

    // Keep track of the render Y
    _y0: number;
}

export type DataArray = Array<DataRow>
export type DaysDataArray = Array<DayDataRow>
export type ActivityTree = DataIntervalTree<Activity>
