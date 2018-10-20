import * as d3 from "d3";

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

export type DataArray = Array<DataRow>
