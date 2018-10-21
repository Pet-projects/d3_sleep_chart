import * as d3 from "d3";
import {default as DataIntervalTree, IntervalTree} from "node-interval-tree";


export type TransitionCoordinator = d3.Transition<any, any, any, any>
export type UpdatableSelection = d3.Transition<any, any, any, any>
// noinspection JSAnnotator
export type AppendableSelection = d3.Selection<any, any, any, any>

export enum PositionWithinSelectionRange  {
    FASTER,
    WITHIN,
    SLOWER
}

export class DataRow implements d3.DSVRowAny {
    // Injected context
    _showRounds: boolean;
    _selectedCandidate: boolean;
    _selectedBenchmark: boolean;
    _positionWithinSelectionRange: PositionWithinSelectionRange;
    _previousPositionWithinSelectionRange: PositionWithinSelectionRange;
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
    FEED,
}

export class Activity {
    constructor(startTimeEpoch: number, endTimeEpoch: number, type: ActivityType) {
        this.startTimeEpoch = startTimeEpoch;
        this.endTimeEpoch = endTimeEpoch;
        this.type = type;
    }

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
    }

    dayLabel: string;
    dayStartEpoch: number;
    dayEndEpoch: number;
}

export type DataArray = Array<DataRow>
export type DaysDataArray = Array<DayDataRow>
export type ActivityTree = DataIntervalTree<Activity>
